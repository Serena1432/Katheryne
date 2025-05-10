const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const Computer = require("../classes/Computer");
const Steam = require("../classes/Steam");
const SessionManager = require("../classes/SessionManager");

module.exports.config = {
    name: "exit",
    usage: "exit",
    description: Language.strings.exit.description,
    nodm: true,
    memberPermissions: [],
    botPermissions: [],
    ownerOnly: false
}

var sessions = {};

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 */
module.exports.run = async function(client, message, args) {
    var runningApps = await WhitelistedApps.running(), author = Katheryne.author(message);
    if (sessions[author.id]) {
        var session = sessions[author.id];
        clearInterval(session.interval);
        Computer.exec(`pkill -P ${session.pid}`);
        delete sessions[author.id];
        return Katheryne.reply(message, {content: Language.strings.steamping.stopped});
    }
    if (!Steam.isRunning()) return Katheryne.reply(message, {content: Language.strings.noRunningPermissions});
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        if (!SessionManager.get("logging.steam")) return Katheryne.editMessage(msg, {content: Language.strings.steamping.notConnected});
        var session = sessions[author.id] = Computer.spawn(`bash`, [`-c`, `journalctl -f | grep --line-buffered SteamNetworkingSockets`]),
            time = new Date().getTime();
        await Katheryne.editMessage(msg, {content: Language.strings.steamping.success});
        session.stdout.on("data", (data) => {
            try {
                if (data.includes("SteamNetworkingSockets connection")) {
                    var stats = Steam.parseSteamPacketInfo(data.toString());
                    time = new Date().getTime();
                    Katheryne.editMessage(msg, {content: `${Language.strings.steamping.success}\n${Language.strings.steamping.status.format(stats.ping, stats.bitrate?.toFixed(1), stats.quality?.toFixed(1))}`});
                }
            }
            catch (err) {
                console.error(err);
            }
        });
        session.interval = setInterval(function() {
            if (new Date().getTime() - time >= 30000) {
                clearInterval(session.interval);
                Computer.exec(`pkill -P ${session.pid}`);
                Katheryne.editMessage(msg, {content: Language.strings.steamping.timeout});
                delete sessions[author.id];
            }
        }, 500);
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.message);
    }
}