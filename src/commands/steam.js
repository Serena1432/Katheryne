const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const BeforeStartHook = require("../hooks/BeforeStart");
const AfterEndHook = require("../hooks/AfterEnd");
const CheckBeforeStartHook = require("../hooks/CheckBeforeStart");
const Steam = require("../classes/Steam");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const SessionManager = require("../classes/SessionManager");

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
    var user = args[0];
    if (user == "exit") {
        if (!Steam.isRunning()) return Katheryne.reply(message, {content: Language.strings.steam.notRunning});
        var currentUser = SessionManager.get("currentUser");
        if (currentUser && currentUser != Katheryne.author(message).id && client.config.owner_id != Katheryne.author(message).id) return Katheryne.reply(message, {content: Language.strings.occupied});
        var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
        try {
            await Katheryne.addLog(msg, Language.strings.steam.stopping);
            Steam.stop();
            await AfterEndHook(msg, client);
            SessionManager.delete("currentUser");
            await Katheryne.addLog(msg, Language.strings.logs.stopSuccess);
        }
        catch (err) {
            console.error(err);
            Katheryne.addLog(msg, err.stack);
        }
        return;
    }
    if (Steam.isRunning() || (await WhitelistedApps.running()).length) return Katheryne.reply(message, {content: Language.strings.logs.alreadyRunning});
    if (user && Katheryne.author(message).id != client.config.owner_id) return Katheryne.reply(message, {content: Language.strings.steam.noSufficientPermission});
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        if (!await CheckBeforeStartHook(message, client)) return Katheryne.addLog(msg, Language.strings.logs.checkFailed);
        await BeforeStartHook(msg, client);
        await Katheryne.addLog(msg, Language.strings.steam.starting);
        SessionManager.set("currentUser", Katheryne.author(message).id);
        Steam.start(user);
        await Katheryne.addLog(msg, Language.strings.logs.startSuccess);
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.stack);
    }
}