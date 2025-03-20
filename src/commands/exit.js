const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const AfterEndHook = require("../hooks/AfterEnd");
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

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 */
module.exports.run = async function(client, message, args) {
    var runningApps = await WhitelistedApps.running(), author = Katheryne.author(message);
    if (!Steam.isRunning() && !runningApps.length) return Katheryne.reply(message, {content: Language.strings.exit.notRunning});
    var currentUser = SessionManager.get("currentUser");
    if (currentUser && currentUser != author.id && client.config.owner_id != author.id) return Katheryne.reply(message, {content: Language.strings.occupied});
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        Computer.sendNotification(Language.strings.notifications.stopping.format(author.displayName), client.user.displayName);
        await Katheryne.addLog(msg, Language.strings.steam.stopping);
        Steam.stop();
        for (var i = 0; i < runningApps.length; i++) {
            var app = runningApps[i];
            await Katheryne.addLog(msg, Language.strings.exit.stopping.format(app.name));
            await Computer.killProcess(app.process);
        }
        await AfterEndHook(msg, client);
        SessionManager.delete("currentUser");
        await Katheryne.addLog(msg, Language.strings.logs.stopSuccess);
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.stack);
    }
}