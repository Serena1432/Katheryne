const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const Computer = require("../classes/Computer");
const Steam = require("../classes/Steam");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const path = require("path");
const fs = require("fs");

module.exports.config = {
    name: "screenshot",
    usage: "screenshot",
    description: Language.strings.screenshot.description,
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
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        var time = new Date(), screenshotPath = path.resolve(`./database/${time.getTime()}.png`);
        await Computer.screenshot(screenshotPath);
        await Katheryne.editMessage(msg, {
            content: Language.strings.screenshot.success.format(Computer.hostname, time.toLocaleString()),
            files: [{
                attachment: screenshotPath,
                name: `${time.getTime()}.png`
            }]
        });
        fs.rmSync(screenshotPath);
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.message);
    }
}