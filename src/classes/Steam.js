const config = require("../../config/steam.json");
const Computer = require("./Computer");
const child_process = require("child_process");

var Steam = {
    /**
     * @type {child_process.ChildProcessWithoutNullStreams?} process
     */
    process: null,
    /**
     * Start a Steam session
     * @param {string} user Auto login as a specific user (usable for multi-user support)
     */
    start: async function(user = config.default_user) {
        var args = [];
        if (user) args.push(`-login`, user);
        if (config.wayland_enable_pipewire && Computer.xdgSessionType == "wayland") args.push("-pipewire");
        this.process = Computer.spawnAsUser(`steam`, args, config.detach);
    },
    stop: function() {
        Computer.exec(`killall steam`);
        this.process = null;
    },
    isRunning: function() {
        return Computer.isProcessRunning("steam");
    }
};

module.exports = Steam;