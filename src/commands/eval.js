const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const Computer = require('../classes/Computer');
const ScreenshotMonitor = require('../classes/ScreenshotMonitor');
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const Steam = require("../classes/Steam");

module.exports.config = {
    name: "eval",
    usage: "eval <script>",
    description: Language.strings.eval.description,
    nodm: true,
    memberPermissions: [],
    botPermissions: [],
    ownerOnly: true
}

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 */
module.exports.run = async function(client, message, args) {
    if (!args[0]) return Katheryne.reply(message, Language.strings.noArguments.format(Language.strings.command));
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        await eval(args.join(" "));
        Katheryne.editMessage(msg, {content: Language.strings.eval.success});
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.message);
    }
}