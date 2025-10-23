const child_process = require("child_process");
const os = require("os");
const si = require("systeminformation");
const osu = require("node-os-utils");
const config = require("../../../config/computer.json");
const Katheryne = require("../Katheryne");
const isAdmin = require("is-admin");
const nircmd = require("nircmd");
const pty = require("@lydell/node-pty");

var Computer = {
    _inputLockInterval: null,
    _inputLockProcess: null,
    _brightnessLockInterval: null,
    _brightnessAmount: null,
    username: "",
    userId: -1,
    hostname: "",
    xdgSessionType: "",
    currentDesktop: "",
    /**
     * Return the session environment setting.
     */
    sessionEnv: function() {
        return ``;
    },
    /**
     * Check if the BOT process is running as root.
     */
    isRoot: function() {
        try {
            fs.accessSync('C:\\', fs.constants.R_OK);
            return true;
        } catch (err) {
            return false;
        }
    },
    /**
     * Execute a command in the target computer.
     * @param {string} command
     */
    exec: async function (command) {
        return new Promise((resolve, reject) => {
            Katheryne.debug(`Computer.exec(): Executing ${command}`);
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
        Katheryne.debug(`Computer.execSync(): Executing ${command}`);
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
            options.stdio = "ignore";
        }
        Katheryne.debug(`Computer.spawn(): Executing ${command} ${args.join(" ")}, detach = ${detach}`);
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
        Katheryne.debug(`Computer.spawnSync(): Executing ${command} ${args.join(" ")}`);
        return child_process.spawnSync(command, args, {encoding: "utf-8"});
    },
    /**
     * Spawn a process as the main user in the target computer.
     * @param {string} command 
     * @param {string[]} args 
     * @param {boolean} detach 
     * @param {child_process.SpawnOptionsWithoutStdio} options
     */
    spawnAsUser: function(command, args, detach = false, options = {}) {
        if (detach) {
            options.detached = true;
            options.stdio = "ignore";
        }
        Katheryne.debug(`Computer.spawnAsUser(): Requesting ${command} ${args.join(" ")} as user ${this.username}, detach = ${detach}`);
        var child = child_process.spawn(command, args, options);
        if (detach) child.unref();
        return child;
    },
    /**
     * Spawn a process as the main user in the target computer (synchronous).
     * @param {string} command 
     * @param {string[]} args 
     */
    spawnSyncAsUser: function(command, args) {
        Katheryne.debug(`Computer.spawnSyncAsUser(): Requesting ${command} ${args.join(" ")} as user ${this.username}`);
        return child_process.spawnSync(command, args, {encoding: "utf-8"});
    },
    /**
     * Execute a command as the main user in the target computer.
     * @param {string} command
     */
    execAsUser: async function (command) {
        Katheryne.debug(`Computer.execAsUser(): Requesting ${command} as user ${this.username}`);
        return new Promise((resolve, reject) => {
            child_process.exec(command, (error, stdout, stderr) => {
                if (error) reject(error);
                resolve({stdout, stderr});
            })
        });
    },
    /**
     * Execute a command as the main user in the target computer (synchronous).
     * @param {string} command
     */
    execSyncAsUser: function(command) {
        Katheryne.debug(`Computer.execSyncAsUser(): Requesting ${command} as user ${this.username}`);
        return child_process.execSync(command);
    },
    /**
     * Lock the computer's physical input devices.
     * Will take effect until the BOT is stopped.
     */
    lockInput: function() {
        
    },
    /**
     * Unlock the computer's physical input devices.
     */
    unlockInput: function() {

    },
    /**
     * Set the computer's display brightness.
     * @param {number} pc % of the brightness you want to set
     */
    setBrightness: async function(pc) {
        if (pc > 0) {
            await nircmd(`monitor on`);
            await nircmd(`setbrightness ${pc}`);
        }
        else await nircmd(`monitor off`);
        if (config.lock_timer) {
            this._brightnessAmount = pc;
            if (!this._brightnessLockInterval) this.setBrightnessInterval();
        }
    },
    /**
     * Set the brightness lock interval.
     */
    setBrightnessInterval: function() {
        this._brightnessLockInterval = setInterval((function() {
            this.setBrightness(this._brightnessAmount);
        }).bind(this), 10000);
    },
    setVolume: async function(value) {
        await nircmd(`setsysvolume ${parseInt(value * 655.35)}`);
    },
    /**
     * Get the detailed GPU info
     * @param {si.Systeminformation.GraphicsControllerData} gpu The GPU info from systeminformation
     */
    gpuInfo: function(gpu) {
        try {
            // For NVIDIA dGPU
            if (gpu.vendor.includes("NVIDIA")) {
                const result = this.spawnSync("nvidia-smi",  ["--query-gpu=utilization.gpu,temperature.gpu,memory.used", "--format=csv,noheader,nounits"]);
                if (result.error || result.stderr.split("\n")[0].toString()) return null;
                var [usage, temperature, vram] = result.stdout.split(", ").map(Number);
                vram = Number(vram) * 1048576;
                if (usage != undefined && temperature != undefined && vram != undefined) return {usage, temperature, vram};
                return null;
            }
            // For AMD iGPU/dGPU
            else if (gpu.vendor.includes("AMD")) {
                // I don't have any AMD computers so I don't know how to. I'm very welcome to all of you to do this one for me.
                return null;
            }
            // For Intel iGPU/dGPU
            else if (gpu.vendor.includes("Intel")) {
                // I don't know how to get the GPU usage for Intel GPus on Windows yet
                return null;
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
        Katheryne.debug(`Computer.stats(): Requesting computer status information`);
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
                name: `${cpu.manufacturer} ${cpu.brand} @ ${cpu.speed.toFixed(2)} GHz`,
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
                    vendor: gpu.vendor,
                    model: gpu.model,
                    modelShort: (gpu.model.indexOf("[") != -1) ? gpu.model.substring(0, gpu.model.indexOf("[") - 1) : gpu.model,
                    vram: gpu.vram * 1048576,
                    data: Computer.gpuInfo(gpu)
                }
            }),
            os: `${os.distro} ${os.release} (${os.arch})`
        };
        if (battery.hasBattery) stats.battery = {
            percent: battery.percent,
            charging: battery.acConnected || (battery.percent == 100),
            remaining: battery.timeRemaining
        };
        Katheryne.debug(`Computer.stats(): ${JSON.stringify(stats)}`);
        return stats;
    },
    temperature: async function() {
        Katheryne.debug(`Computer.temperature(): Requesting computer temperature information`);
        var cpuTemp = await si.cpuTemperature(),
            graphics = await si.graphics(),
            response = {
                cpu: cpuTemp.main,
                gpu: graphics.controllers.map(gpu => {
                    return Computer.gpuInfo(gpu)?.temperature;
                }).filter(temp => temp != null)
            };
        Katheryne.debug(`Computer.temperature(): ${JSON.stringify(response)}`);
        return response;
    },
    /**
     * Get detailed battery information
     */
    battery: async function() {
        Katheryne.debug(`Computer.battery(): Requesting computer battery information`);
        const battery = await si.battery();
        if (!battery.hasBattery) return null;
        var response = {
            charging: battery.acConnected,
            maxMwh: battery.maxCapacity,
            currentMwh: battery.currentCapacity,
            percent: battery.percent
        };
        Katheryne.debug(`Computer.battery(): ${JSON.stringify(response)}`);
        return response;
    },
    /**
     * Take a screenshot on the computer.
     * @param {string} outPath The screenshot output path
     */
    screenshot: async function(outPath) {
        return await nircmd(`savescreenshot "${outPath}"`);
    },
    /**
     * 
     * @param {string} process Process name
     */
    killProcess: function(process) {
        return this.exec(`taskkill /f ${isNaN(process) ? `/im "${process}.exe"` : `/pid ${process}`}`);
    },
    /**
     * Check if a process is running
     * @param {string} name Process name
     */
    isProcessRunning: function(name) {
        try {
            this.execSync(`tasklist | findstr /I "${name}" > NUL`);
            return true;
        }
        catch (err) {
            return false;
        }
    },
    /**
     * Send a notification to the computer
     * @param {string} description Notification description
     * @param {string} title Notification title
     * @param {number} time Notification timeout in miliseconds. Default is 15000.
     */
    sendNotification: async function(description, title = "", time = 15000) {
        return await nircmd(`trayballoon "${title.replaceAll("\"", "\\\"")}" "${description.replaceAll("\"", "\\\"")}" "" ${time}`);
    },
    /**
     * Focus on a window with specific title.
     * @param {string} windowTitle Window title (not process name)
     */
    focus: function(windowTitle) {
        return this.spawn(`powershell`, [`-Command`, `(New-Object -ComObject WScript.Shell).AppActivate('${windowTitle}')`]);
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
        // Windows doesn't support that kind of task.
        return true;
    },
    /**
     * Set the bluetooth to be enabled or disabled.
     * @param {boolean} enabled
     */
    setBluetooth: function(enabled) {
        const command = enabled ? 'Enable-PnpDevice' : 'Disable-PnpDevice';
        return this.exec(`powershell -Command "Get-PnpDevice -Class Bluetooth | ${command} -Confirm:$false"`);
    },
    /**
     * Initialize functions
     */
    initialize: function() {
        this.hostname = os.hostname();
        try {
            const quserOutput = this.execSync('quser').toString();
            const activeUserLine = quserOutput.split('\r\n').find(line => line.includes(' Active'));
            this.username = activeUserLine.trim().split(/\s+/)[0].replace('>', '');
        } catch (e) {
            this.username = process.env.USERNAME;
        }
        this.xdgSessionType = "win32";
        this.currentDesktop = null;
    },
    /**
     * Spawn a PTY terminal session.
     * @param {string} command
     */
    spawnTerminal: function(command) {
        return pty.spawn("C:\\Windows\\System32\\cmd.exe", ["/k", command], {
            name: "xterm",
            cols: 80,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
        });
    }
}

module.exports = Computer;