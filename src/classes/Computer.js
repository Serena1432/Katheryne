const child_process = require("child_process");
const os = require("os");

var Computer = {
    _inputLockInterval: null,
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
            const match = line.toString().match(/⎜?\s*(.+?)\s+id=(\d+).*?\[(slave|master)\s+(keyboard|pointer)/i);
            if (match) {
                const [, name, id, , type] = match;
                devices.push({id: Number(id), name: name.substring(2), type: type === "keyboard" ? "keyboard" : "mouse"});
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
        return `sudo evtest --grab /dev/input/event2 >/dev/null`
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
    initialize: function() {
        this.isReady = false;
        this.hostname = os.hostname();
        this.xdgSessionType = process.env.XDG_SESSION_TYPE;
        if (!this.xdgSessionType) throw new Error(`XDG_SESSION_TYPE not found. If you're running this process as root using sudo, please also pass the variable using "sudo -E" instead of just "sudo"`);
    }
}

module.exports = Computer;