const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const BeforeStartHook = require("../hooks/BeforeStart");
const AfterEndHook = require("../hooks/AfterEnd");
const CheckBeforeStartHook = require("../hooks/CheckBeforeStart");
const Steam = require("../classes/Steam");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const SessionManager = require("../classes/SessionManager");
const OwnerApprovalHook = require("../hooks/OwnerApproval");
const Computer = require("../classes/Computer");

module.exports.config = {
    name: "steam",
    usage: "steam <user/exit>",
    description: Language.strings.start.description,
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
    var permissive = false, tags = ["permissive"];
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        if (args.includes(`-${tag}`)) {
            eval(`${tag} = true`);
            args.splice(args.findIndex(arg => arg == `-${tag}`), 1);
        }
    }
    var user = args[0], author = Katheryne.author(message);
    if (user == "exit") {
        if (!Steam.isRunning()) return Katheryne.reply(message, {content: Language.strings.steam.notRunning});
        var currentUser = SessionManager.get("currentUser");
        if (currentUser && currentUser != author.id && client.config.owner_id != author.id) return Katheryne.reply(message, {content: Language.strings.occupied});
        var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
        try {
            Computer.sendNotification(Language.strings.notifications.stopping.format(author.displayName), client.user.displayName);
            await Katheryne.addLog(msg, Language.strings.steam.stopping);
            Steam.stop();
            await AfterEndHook(msg, client);
            SessionManager.delete("currentUser");
            await Katheryne.addLog(msg, Language.strings.logs.stopSuccess);
        }
        catch (err) {
            console.error(err);
            Katheryne.addLog(msg, err.message);
        }
        return;
    }
    if (Steam.isRunning() || (await WhitelistedApps.running()).length) return Katheryne.reply(message, {content: Language.strings.logs.alreadyRunning});
    if (user && author.id != client.config.owner_id) return Katheryne.reply(message, {content: Language.strings.steam.noSufficientPermission});
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {        
        if (!await CheckBeforeStartHook(msg, client, author)) return Katheryne.editMessage(msg, {content: Language.strings.logs.checkFailed});
        if (!await OwnerApprovalHook(msg, client, "start", author, true)) return Katheryne.editMessage(msg, {content: Language.strings.logs.ownerDeclined});
        Computer.sendNotification(Language.strings.notifications.starting.format(author.displayName, "Steam"), client.user.displayName);
        if (permissive) await Katheryne.addLog(msg, Language.strings.logs.permissive);
        await BeforeStartHook(msg, client);
        await Katheryne.addLog(msg, Language.strings.steam.starting);
        Steam.start(user);
        if (!permissive) SessionManager.set("currentUser", author.id);
        await Katheryne.addLog(msg, Language.strings.logs.startSuccess);
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.message);
    }
}