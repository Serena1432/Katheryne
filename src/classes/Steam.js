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
        var args = ["-debug", "-console"];
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
    },
    checkSteamLinkConnection: async function() {
        try {
            return (await Computer.exec(`ss -tunap | grep -E "192.*.0.0.0.0:\\*.*steam"`))?.stdout?.toString()?.split("\n")[0]?.includes("steam");
        }
        catch {
            return false;
        }
    },
    parseSteamPacketInfo: function(str) {
        const pingMatch = str.match(/Ping:\s*(\d+)ms/);
        const bitrateMatch = str.match(/IN:\s*([\d.]+)kbit/);
        const qualityMatch = str.match(/qual\s*([\d.]+)%$/);
        const ping = pingMatch ? parseInt(pingMatch[1], 10) : null;
        const bitrate = bitrateMatch ? parseFloat(bitrateMatch[1]) : null;
        const quality = qualityMatch ? parseFloat(qualityMatch[1]) : null;
        return {ping, bitrate, quality};
    }
};

module.exports = Steam;