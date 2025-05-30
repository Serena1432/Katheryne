const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const Computer = require("../classes/Computer");
const Steam = require("../classes/Steam");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;

module.exports.config = {
    name: "display",
    usage: "display <on/off/amount>",
    description: Language.strings.display.description,
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
    var amount = args[0];
    if (["on", "off"].includes(amount?.toLowerCase())) amount = (amount?.toLowerCase() == "on") ? 100 : 0;
    if (isNaN(amount)) return Katheryne.reply(message, {content: Language.strings.display.invalidAmount});
    amount = Number(amount);
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        Computer.setBrightness(amount);
        Katheryne.editMessage(msg, {content: Language.strings.display.success.format(Computer.hostname, amount.toString())});
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.message);
    }
}