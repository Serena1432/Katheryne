const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const AfterEndHook = require("../hooks/AfterEnd");
const OwnerApprovalHook = require("../hooks/OwnerApproval");
const Computer = require("../classes/Computer");
const Steam = require("../classes/Steam");
const SessionManager = require("../classes/SessionManager");
const Confirmation = require("../hooks/Confirmation");

module.exports.config = {
    name: "shutdown",
    usage: "shutdown",
    description: Language.strings.shutdown.description,
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
    if (!Steam.isRunning() && !runningApps.length) return Katheryne.reply(message, {content: Language.strings.noRunningPermissions});
    var currentUser = SessionManager.get("currentUser"), steamUser = SessionManager.get("steamUser");
    if (currentUser && currentUser != author.id && client.config.owner_id != author.id) return Katheryne.reply(message, {content: Language.strings.occupied});
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        if (!await Confirmation(Language.strings.shutdown.confirmation, msg, client, author, false)) return Katheryne.editMessage(msg, {content: Language.strings.logs.cancelled});
        if (!await OwnerApprovalHook(msg, client, "shutdown", author, true)) return Katheryne.editMessage(msg, {content: Language.strings.logs.ownerDeclined});
        Computer.sendNotification(Language.strings.notifications.shutdown.format(author.displayName), client.user.displayName);
        await Katheryne.addLog(msg, Language.strings.steam.stopping);
        Steam.stop();
        for (var i = 0; i < runningApps.length; i++) {
            var app = runningApps[i];
            await Katheryne.addLog(msg, Language.strings.exit.stopping.format(app.name));
            try {await Computer.killProcess(app.process)} catch {}
        }
        await Katheryne.addLog(msg, Language.strings.logs.saveUserLS.format(steamUser));
        await WhitelistedApps.saveLocalStorage(steamUser);
        await Katheryne.addLog(msg, Language.strings.logs.loadOriginalLS);
        await WhitelistedApps.loadLocalStorage();
        await AfterEndHook(msg, client);
        SessionManager.delete("currentUser");
        SessionManager.delete("steamUser");
        await Katheryne.addLog(msg, Language.strings.logs.beginShutdown);
        Computer.shutdown();
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.message);
    }
}