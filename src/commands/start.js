const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const BeforeStartHook = require("../hooks/BeforeStart");
const Computer = require("../classes/Computer");
const Steam = require("../classes/Steam");
const CheckBeforeStartHook = require("../hooks/CheckBeforeStart");
const SessionManager = require("../classes/SessionManager");

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
        return Katheryne.reply({message, embeds: [
            Katheryne.embed(client)
            .setTitle(Language.strings.start.embedTitle)
            .setDescription(Language.strings.start.embedDescription.format(apps.join("\n"), client.config.prefix))
        ]});
    }
    if (Steam.isRunning() || (await WhitelistedApps.running()).length) return Katheryne.reply(message, {content: Language.strings.logs.alreadyRunning});
    var app = WhitelistedApps.get(args.join(" "));
    if (!app) return Katheryne.reply(message, {content: Language.strings.start.appNotFound.format(args.join(" "))});
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing}), author = Katheryne.author(message);
    try {
        if (!await CheckBeforeStartHook(message, client, app)) return Katheryne.addLog(msg, Language.strings.logs.checkFailed);
        Computer.sendNotification(Language.strings.notifications.starting.format(author.displayName, app.name), client.user.displayName);
        await BeforeStartHook(msg, client, app);
        await Katheryne.addLog(msg, Language.strings.logs.startingApp.format(app.name));
        SessionManager.set("currentUser", author.id);
        Computer.exec(app.command);
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.stack);
    }
}