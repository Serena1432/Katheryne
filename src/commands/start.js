const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const BeforeStartHook = require("../hooks/BeforeStart");
const Computer = require("../classes/Computer");

module.exports.config = {
    name: "start",
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
    if (!args[0]) {
        var apps = WhitelistedApps.toJSON().map(app => {
            return `* \`${app.alias}\` - **${app.name}**`;
        });
        return message.reply({embeds: [
            Katheryne.embed(client)
            .setTitle(Language.strings.start.embedTitle)
            .setDescription(Language.strings.start.embedDescription.format(apps.join("\n"), client.config.prefix))
        ]});
    }
    if (Steam.isRunning() || (await WhitelistedApps.running()).length) return message.reply({content: Language.strings.logs.alreadyRunning});
    var app = WhitelistedApps.get(args.join(" "));
    if (!app) return message.reply({content: Language.strings.start.appNotFound.format(args.join(" "))});
    var msg = await message.reply({content: Language.strings.logs.preparing});
    try {
        await BeforeStartHook(msg, client, app);
        await Katheryne.addLog(msg, Language.strings.logs.startingApp.format(app.name));
        Computer.exec(app.command);
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.stack);
    }
}