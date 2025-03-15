const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");

module.exports.config = {
    name: "ping",
    usage: "ping",
    description: Language.strings.ping.description,
    nodm: false,
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
module.exports.run = function(client, message, args) {
    Katheryne.reply(message, {content: Language.strings.responseTime.format(new Date().getTime() - message.createdTimestamp)});
}