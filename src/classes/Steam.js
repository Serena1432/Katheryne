const config = require("../../config/steam.json");
const loggingConfig = require("../../config/logging.json");
const Computer = require("./Computer");
const child_process = require("child_process");

var Steam = {
    /**
     * @type {child_process.ChildProcessWithoutNullStreams?} process
     */
    process: null,
    _handlers: {},
    /**
     * @type {child_process.ChildProcessWithoutNullStreams?} _monitorProcess
     */
    _monitorProcess: null,
    /**
     * Start a Steam session
     * @param {string} user Auto login as a specific user (usable for multi-user support)
     */
    start: async function(user = config.default_user) {
        var args = ["-debug", "-console"];
        if (user) args.push(`-login`, user);
        if (config.wayland_enable_pipewire && Computer.xdgSessionType == "wayland") args.push("-pipewire");
        this.process = Computer.spawnAsUser(`steam`, args, config.detach);
        this.startMonitor();
    },
    stop: function() {
        this.stopMonitor();
        Computer.exec(`killall steam`);
        this.process = null;
    },
    isRunning: function() {
        return Computer.isProcessRunning("steam");
    },
    /**
     * Register an event listener.
     * @param {string} eventName Register event name
     * @param {function(...any)} callback Register event callback
     */
    on: function(eventName, callback) {
        if (!this._handlers[eventName]) this._handlers[eventName] = [];
        this._handlers[eventName].push(callback);
    },
    /**
     * Emit a registered event.
     * @param {string} eventName Emit event name
     * @param  {...any} args Emit event arguments
     */
    emit: function(eventName, ...args) {
        var handlers = this._handlers[eventName];
        if (!handlers) return;
        for (var i = 0; i < handlers.length; i++) handlers[i](...args);
    },
    /**
     * Start monitoring Steam Remote Play connection.
     */
    startMonitor: function() {
        if (!loggingConfig.steam_connection) return;
        var process = this._monitorProcess = Computer.spawn(`bash`, [`-c`, `journalctl -f | grep --line-buffered -E "st.*eam.*desktop stream"`]);
        process.stdout.on("data", (data) => {
            if (data?.toString()?.includes("Starting desktop stream")) Steam.emit("connect", data.toString());
            else if (data?.toString()?.includes("Stopped desktop stream")) Steam.emit("disconnect", data.toString());
        });
    },
    /**
     * Stop monitoring Steam Remote Play connection.
     */
    stopMonitor: function() {
        if (!loggingConfig.steam_connection) return;
        if (this._monitorProcess) {
            Computer.exec(`pkill -P ${this._monitorProcess.pid}`);
            this._monitorProcess = null;
        }
    },
    /**
     * Parse the ping, bitrate and quality from SteamNetworkSockets string.
     * @param {string} str Steam packet info string
     * @returns Parsed information
     */
    parseSteamPacketInfo: function(str) {
        const pingMatch = str.match(/Ping:\s*(\d+)ms/);
        const bitrateMatch = str.match(/IN:\s*([\d.]+)kbit/);
        const qualityMatch = str.match(/qual\s*([\d.]+)%/);
        const ping = pingMatch ? parseInt(pingMatch[1], 10) : null;
        const bitrate = bitrateMatch ? parseFloat(bitrateMatch[1]) : null;
        const quality = qualityMatch ? parseFloat(qualityMatch[1]) : null;
        return {ping, bitrate, quality};
    }
};

module.exports = Steam;