const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const BeforeStartHook = require("../hooks/BeforeStart");
const Computer = require("../classes/Computer");
const Steam = require("../classes/Steam");
const CheckBeforeStartHook = require("../hooks/CheckBeforeStart");
const OwnerApprovalHook = require("../hooks/OwnerApproval");
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
    var permissive = false, tags = ["permissive"];
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        if (args.includes(`-${tag}`)) {
            eval(`${tag} = true`);
            args.splice(args.findIndex(arg => arg == `-${tag}`), 1);
        }
    }
    if (!args[0]) {
        var apps = WhitelistedApps.toJSON().map(app => {
            return `* \`${app.alias}\` - **${app.name}**`;
        });
        return Katheryne.reply(message, {embeds: [
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
        if (!await CheckBeforeStartHook(msg, client, author, app)) return Katheryne.editMessage(msg, {content: Language.strings.logs.checkFailed});
        if (!await OwnerApprovalHook(msg, client, "start", author, true)) return Katheryne.editMessage(msg, {content: Language.strings.logs.ownerDeclined});
        Computer.sendNotification(Language.strings.notifications.starting.format(author.displayName, app.name), client.user.displayName);
        if (permissive) await Katheryne.addLog(msg, Language.strings.logs.permissive);
        await BeforeStartHook(msg, client, app);
        await Katheryne.addLog(msg, Language.strings.logs.startingApp.format(app.name));
        if (!permissive) SessionManager.set("currentUser", author.id);
        Computer.spawnAsUser("bash", ["-c", app.command], true);
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.message);
    }
}