const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const BeforeStartHook = require("../hooks/BeforeStart");
const AfterEndHook = require("../hooks/AfterEnd");
const Steam = require("../classes/Steam");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;

module.exports.config = {
    name: "steam",
    usage: "start (alias)",
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
        if (!Steam.isRunning()) return message.reply({content: Language.strings.steam.notRunning});
        var msg = await message.reply({content: Language.strings.logs.preparing});
        try {
            await Katheryne.addLog(msg, Language.strings.steam.stopping);
            Steam.stop();
            await AfterEndHook(msg, client);
            await Katheryne.addLog(msg, Language.strings.logs.stopSuccess);
        }
        catch (err) {
            console.error(err);
            Katheryne.addLog(msg, err.stack);
        }
        return;
    }
    if (Steam.isRunning() || (await WhitelistedApps.running()).length) return message.reply({content: Language.strings.logs.alreadyRunning});
    if (user && message.author.id != client.config.owner_id) return message.reply({content: Language.strings.steam.noSufficientPermission});
    var msg = await message.reply({content: Language.strings.logs.preparing});
    try {
        await BeforeStartHook(msg, client);
        await Katheryne.addLog(msg, Language.strings.steam.starting);
        Steam.start(user);
        await Katheryne.addLog(msg, Language.strings.logs.startSuccess);
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.stack);
    }
}