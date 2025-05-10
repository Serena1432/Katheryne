const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const Computer = require("../classes/Computer");
const Steam = require("../classes/Steam");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;

module.exports.config = {
    name: "lock",
    usage: "lock",
    description: Language.strings.lock.description,
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
    if (!Steam.isRunning() && !((await WhitelistedApps.running()).length)) return Katheryne.reply(message, {content: Language.strings.noRunningPermissions});
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        Computer.lockInput();
        Katheryne.editMessage(msg, {content: Language.strings.lock.success.format(Computer.hostname)});
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.message);
    }
}