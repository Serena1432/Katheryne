const child_process = require("child_process");
const os = require("os");
const si = require("systeminformation");
const osu = require("node-os-utils");

var Computer = {
    _inputLockInterval: null,
    username: "",
    hostname: "",
    xdgSessionType: "",
    /**
     * Check if the BOT process is running as root.
     */
    isRoot: function() {
        return (process.getuid() == 0);
    },
    /**
     * Execute a command in the target computer.
     * @param {string} command
     */
    exec: async function (command) {
        return new Promise((resolve, reject) => {
            child_process.exec(command, (error, stdout, stderr) => {
                if (error) reject(error);
                resolve({stdout, stderr});
            })
        });
    },
    /**
     * Execute a command in the target computer (synchronous).
     * @param {string} command
     */
    execSync: function(command) {
        return child_process.execSync(command);
    },
    /**
     * Spawn a process in the target computer.
     * @param {string} command 
     * @param {string[]} args 
     * @param {boolean} detach 
     * @param {child_process.SpawnOptionsWithoutStdio} options
     */
    spawn: function(command, args, detach = false, options = {}) {
        if (detach) {
            options.detached = true;
            options.stdio = ignore;
        }
        var child = child_process.spawn(command, args, options);
        if (detach) child.unref();
        return child;
    },
    /**
     * Spawn a process in the target computer (synchronous).
     * @param {string} command 
     * @param {string[]} args 
     */
    spawnSync: function(command, args) {
        return child_process.spawnSync(command, args, {encoding: "utf-8"});
    },
    /**
     * Get all xinput devices (for X11)
     */
    getXinputDevices: function() {
        var xinput = this.spawnSync("xinput", ["list"]),
            devices = [];
        if (xinput.error || xinput.stderr.toString().split("\n")[0]) throw new Error(`"xinput list" command threw an unexpected error:\n${xinput.error || xinput.stderr.toString()}`);
        var lines = xinput.stdout.toString().split("\n");
        for (var line of lines) {
            const match = line.toString().match(/⎜?\s*(.+?)\s+id=(\d+).*?\[(slave|master|floating)\s+(keyboard|pointer|slave)/i);
            if (match) {
                const [, name, id, status, type] = match;
                devices.push({id: Number(id), name: name.substring(2), type: status == "floating" ? "floating" : (type === "keyboard" ? "keyboard" : "mouse")});
            }
        }
        return devices;
    },
    /**
     * Get the device node (/dev/input/event*)
     * @param {number} id 
     */
    getXinputDeviceNode: function(id) {
        var xinput = this.spawnSync("xinput", ["list-props", id.toString()]);
        if (xinput.error || xinput.stderr.toString().split("\n")[0]) throw new Error(`"xinput list-props ${id}" command threw an unexpected error:\n${xinput.error || xinput.stderr.toString()}`);
        const match = xinput.stdout.toString().match(/Device Node \(\d+\):\s+"(\/dev\/input\/event\d+)"/);
        return match ? Number(match[1].substring(match[1].indexOf("event") + 5)) : null;
    },
    /**
     * Get libinput devices (work with both X11 + Wayland but requires root permissions)
     */
    getLibInputDevices: function() {
        const libinput = this.spawnSync("libinput", ["list-devices"]);
        if (libinput.error || libinput.stderr.toString().split("\n")[0]) throw new Error(`"xinput list" command threw an unexpected error:\n${libinput.error || libinput.stderr.toString()}`);
        var devices = [],
            blocks = libinput.stdout.split("\n\n");
        for (const block of blocks) {
            const lines = block.split("\n");
            let name, id, type = "unknown";
            for (const line of lines) {
                if (line.startsWith("Device:")) name = line.split("Device:")[1].trim();
                if (line.includes("Kernel:")) {
                    const match = line.match(/Kernel:\s+(\S+)/);
                    if (match) id = Number(match[1].substring(match[1].indexOf("event") + 5));
                }
                if (line.includes("Capabilities:")) {
                    if (line.includes("pointer")) type = "mouse";
                    else if (line.includes("keyboard")) type = "keyboard";
                }
            }
            if (name && id && type != "unknown") devices.push({ name, id, type });
        }
        return devices;
    },
    /**
     * List all input devices. Requires root permissions if using Wayland.
     */
    inputDevices: function() {
        switch (this.xdgSessionType.toLowerCase()) {
            case "x11": {
                var devices = this.getXinputDevices();
                for (var device of devices) {
                    device.xinputId = device.id;
                    device.id = this.getXinputDeviceNode(device.xinputId);
                }
                return devices;
                break;
            }
            case "wayland": {
                return this.getLibInputDevices();
                break;
            }
        }
        return null;
    },
    /**
     * Return the lockX11Input command syntax.
     * @param {number} xinputId xinput ID of the device (not eventId)
     */
    lockX11InputCmd: function(xinputId) {
        return `xinput --disable ${xinputId}`;
    },
    /**
     * Return the unlockX11Input command syntax.
     * @param {number} xinputId xinput ID of the device (not eventId)
     */
    unlockX11InputCmd: function(xinputId) {
        return `xinput --enable ${xinputId}`;
    },
    /**
     * Return the lockWaylandInput command syntax.
     * @param {number} id event ID of the device (/dev/input/event*)
     */
    lockWaylandInputCmd: function(id) {
        return `evtest --grab /dev/input/event${id} >/dev/null`;
    },
    /**
     * Lock the computer's physical input devices. Requires root permissions if using Wayland.
     * Will take effect until the BOT is stopped.
     */
    lockInput: function() {
        var devices = this.inputDevices(), commands = [], parallel = false;
        for (var device of devices) {
            if (!device.id) continue;
            if (device.xinputId) {
                commands.push(this.lockX11InputCmd(device.xinputId));
                continue;
            }
            commands.push(this.lockWaylandInputCmd(device.id));
            parallel = true;
        }
        var command = commands.join(parallel ? " & " : " && ");
        this.exec(command);
        if (!parallel) {
            this._inputLockInterval = setInterval((function(command) {
                this.exec(command);
            }).bind(this, command), 10000);
        }
    },
    /**
     * Unlock the computer's physical input devices.
     */
    unlockInput: function() {
        if (!this._inputLockInterval) clearInterval(this._inputLockInterval);
        switch (this.xdgSessionType) {
            case "x11": {
                var devices = this.inputDevices(), commands = [];
                for (var device of devices) {
                    if (!device.id || !device.xinputId) continue;
                    commands.push(this.unlockX11InputCmd(device.xinputId));
                }
                this.exec(commands.join(" && "));
                break;
            }
            case "wayland": {
                this.exec(`killall evtest`);
                break;
            }
        }
    },
    /**
     * Set the computer's display brightness.
     * @param {number} pc % of the brightness you want to set
     */
    setBrightness: function(pc) {
        this.execSync(`brightnessctl set ${pc}%`);
    },
    /**
     * Check if a service is active.
     * @param {string} name The service name
     */
    checkServiceActive: function(name) {
        var result = this.spawnSync(`sudo`, ["-u", this.user, "-E", "systemctl", "--user", "is-active", "--quiet", name]);
        return (result.status == 0);
    },
    /**
     * Check the audio system the computer is using. This function is not thoroughly tested.
     */
    audioSystem: function() {
        var services = ["pipewire", "pulseaudio"];
        for (var service of services) {
            if (this.checkServiceActive(service)) return service;
        }
        return "alsa";
    },
    setVolume: function(value) {
        var command = `wpctl set-volume @DEFAULT_AUDIO_SINK@ ${value}%`;
        switch (this.audioSystem()) {
            case "pulseaudio": {
                command = `pactl set-sink-volume @DEFAULT_SINK@ ${value}%`;
                break;
            }
            case "alsa": {
                command = `amixer set Master ${value}%`;
                break;
            }
        }
        this.execSync(command);
    },
    /**
     * Get the detailed GPU info
     * @param {si.Systeminformation.GraphicsControllerData} gpu The GPU info from systeminformation
     */
    gpuInfo: function(gpu) {
        try {
            // For NVIDIA dGPU
            if (gpu.vendor.includes("NVIDIA")) {
                const result = this.spawnSync("nvidia-smi",  ["--query-gpu=utilization.gpu,temperature.gpu", "--format=csv,noheader,nounits"]);
                if (result.error || result.stderr.split("\n")[0].toString()) return null;
                const [usage, temperature] = result.stdout.split(", ").map(Number);
                return {usage, temperature};
            }
            // For AMD iGPU/dGPU
            else if (gpu.vendor.includes("AMD")) {
                // I don't have any AMD computers so I don't know how to. I'm very welcome to all of you to do this one for me.
                return null;
            }
            // For Intel iGPU/dGPU
            else if (gpu.vendor.includes("Intel")) {
                const result = this.spawnSync(`timeout`, ["0.5", "intel_gpu_top", "-J", "-s", "2000"]);
                var data = JSON.parse(result.stdout.toString().slice(1));
                return {usage: data.engines["Render/3D"].busy, temperature: null};
            }
        }
        catch (err) {
            console.error(err);
            return null;
        }
        return null;
    },
    /**
     * Get computer statictics
     */
    stats: async function() {
        var system = await si.system(),
            cpu = await si.cpu(),
            cpuTemp = await si.cpuTemperature(),
            memory = await si.mem(),
            battery = await si.battery(),
            graphics = await si.graphics(),
            os = await si.osInfo();
        var stats = {
            model: `${system.manufacturer} ${system.model}`,
            cpu: {
                name: `${cpu.manufacturer} ${cpu.brand} @ ${cpu.speed} GHz`,
                cores: cpu.physicalCores,
                threads: cpu.cores,
                temperature: cpuTemp.main,
                governor: cpu.governor,
                usage: await osu.cpu.usage()
            },
            memory: {
                total: memory.total,
                used: memory.active
            },
            gpu: graphics.controllers.map(gpu => {
                return {
                    model: `${gpu.vendor} ${gpu.model}`,
                    vram: gpu.vram,
                    data: Computer.gpuInfo(gpu)
                }
            }),
            os: `${os.distro} ${os.release} (${os.arch})`
        };
        if (battery.hasBattery) stats.battery = {
            percent: battery.percent,
            charging: battery.acConnected
        };
        return stats;
    },
    /**
     * Get detailed battery information
     */
    battery: async function() {
        const battery = await si.battery();
        if (!battery.hasBattery) return null;
        return {
            charging: battery.acConnected,
            maxMwh: battery.maxCapacity,
            currentMwh: battery.currentCapacity,
            percent: battery.percent
        }
    },
    /**
     * Take a screenshot on the computer.
     * @param {string} outPath The screenshot output path
     */
    screenshot: function(outPath) {
        switch (this.xdgSessionType.toLowerCase()) {
            case "x11": {
                const result = this.spawnSync("scrot", [outPath]);
                return (result.status == 0);
            }
            case "wayland": {
                const result = this.spawnSync("grim", [outPath]);
                return (result.status == 0);
            }
        }
        return false;
    },
    /**
     * 
     * @param {string} process Process name
     */
    killProcess: function(process) {
        return this.exec(`killall -9 ${process}`);
    },
    /**
     * Check if a process is running
     * @param {string} name Process name
     */
    isProcessRunning: async function(name) {
        try {
            return !!((await this.exec(`pgrep -f "${name}"`)).toString().split("\n")[0]);
        }
        catch {
            return false;
        }
    },
    /**
     * Send a notification to the computer
     * @param {string} description Notification description
     * @param {string} title Notification title
     */
    sendNotification: function(description, title = "") {
        return this.spawn(`notify-send`, [title, description]);
    },
    /**
     * Focus on a window with specific title.
     * @param {string} windowTitle Window title (not process name)
     */
    focus: function(windowTitle) {
        return this.spawn(`wmctrl`, [`-a`, windowTitle]);
    },
    /**
     * Control the fan speed on the computer.
     * @param {number} pc The fan speed percent you want to set. Will set to auto if left empty.
     * @returns 
     */
    setFanSpeed: function(pc = "-a") {
        if (!isNaN(pc)) pc = `-s ${pc}`;
        return this.exec(`nbfc set ${pc}`);
    },
    /**
     * Set the computer CPU governor.
     * @param {string} governor The CPU governor (performance, powersave, schedutil, ondemand, conservative)
     */
    setCpuGovernor: function(governor) {
        return this.exec(`echo "${governor}" | tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`);
    },
    /**
     * Initialize functions
     */
    initialize: function() {
        this.hostname = os.hostname();
        this.user = process.env.SUDO_USER || process.env.USER;
        this.xdgSessionType = process.env.XDG_SESSION_TYPE;
        if (!this.xdgSessionType) throw new Error(`XDG_SESSION_TYPE not found. If you're running this process as root using sudo, please also pass the variable using "sudo -E" instead of just "sudo"`);
    }
}

module.exports = Computer;