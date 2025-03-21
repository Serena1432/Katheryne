const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const Computer = require("../classes/Computer");

module.exports.config = {
    name: "send",
    usage: "send <message>",
    description: Language.strings.send.description,
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
    if (!args[0]) await Katheryne.reply(message, {content: Language.strings.send.noArgument});
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        Computer.sendNotification(args.join(" "), Language.strings.send.title.format(Katheryne.author(message).displayName, client.user.displayName));
        await Katheryne.editMessage(msg, {content: Language.strings.send.success});
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.stack);
    }
}