const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const Computer = require("../classes/Computer");
const ExecSession = require("../classes/ExecSession");

module.exports.config = {
    name: "exec",
    usage: "exec <command> (-interactive) (-stderr)",
    description: Language.strings.exec.description,
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
    if (!args[0]) return message.reply(Language.strings.noArguments.format(Language.strings.command));
    var interactive = false;
    var interactiveIndex = args.findIndex(arg => arg == "-interactive");
    if (interactiveIndex != -1) {
        args.splice(interactiveIndex, 1);
        interactive = true;
    }
    var options = [];
    if (interactive) options.push(Language.strings.exec.interactive);
    var msg = await message.reply({content: Language.strings.logs.preparing});
    try {
        if (options.length) await Katheryne.addLog(msg, Language.strings.exec.additionalOptions.format(options.join(Language.strings.and)));
        var session = new ExecSession(msg, args.join(" "), message.author);
        session.interactive = interactive;
        session.execute();
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.stack);
    }
}