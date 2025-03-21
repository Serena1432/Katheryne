const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const Computer = require("../classes/Computer");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;

module.exports.config = {
    name: "focus",
    usage: "focus",
    description: Language.strings.focus.description,
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
    var runningApps = await WhitelistedApps.running();
    if (!runningApps.length) return Katheryne.reply(message, {content: Language.strings.noRunningPermissions});
    var app = runningApps[0];
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        Computer.focus(app.name);
        Katheryne.editMessage(msg, {content: Language.strings.focus.success.format(app.name)});
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.stack);
    }
}