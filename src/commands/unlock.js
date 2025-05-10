const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const Computer = require("../classes/Computer");

module.exports.config = {
    name: "unlock",
    usage: "unlock",
    description: Language.strings.unlock.description,
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
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        Computer.unlockInput();
        Katheryne.editMessage(msg, {content: Language.strings.unlock.success.format(Computer.hostname)});
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.message);
    }
}