const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const BeforeStartHook = require("../hooks/BeforeStart");
const Computer = require("../classes/Computer");
const Steam = require("../classes/Steam");

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
    if (user && message.author.id != client.config.owner_id) return message.reply({content: Language.steam.noSufficientPermission});
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