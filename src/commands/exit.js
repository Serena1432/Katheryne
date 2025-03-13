const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;
const AfterEndHook = require("../hooks/AfterEnd");
const Computer = require("../classes/Computer");
const Steam = require("../classes/Steam");

module.exports.config = {
    name: "exit",
    usage: "exit",
    description: "Thoát Steam và toàn bộ ứng dụng trong danh sách trắng khác đang chạy.",
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
    if (!Steam.isRunning() && !runningApps.length) return message.reply({content: Language.strings.exit.notRunning});
    var msg = await message.reply({content: Language.strings.logs.preparing});
    try {
        await Katheryne.addLog(msg, Language.strings.steam.stopping);
        Steam.stop();
        for (var i = 0; i < runningApps.length; i++) {
            var app = runningApps[i];
            await Katheryne.addLog(msg, Language.strings.exit.stopping.format(app.name));
            await Computer.killProcess(app.process);
        }
        await AfterEndHook(msg, client);
        await Katheryne.addLog(msg, Language.strings.logs.stopSuccess);
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.stack);
    }
}