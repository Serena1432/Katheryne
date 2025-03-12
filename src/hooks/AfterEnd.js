/**
 * This is the hook script to be started after stopping a whitelisted app.
 * You can edit it freely as you want.
 */

const { BaseInteraction, Message, Client } = require("discord.js");
const { WhitelistedApp } = require("../classes/WhitelistedApps");
const Language = require("../classes/Language");
const Computer = require("../classes/Computer");
const Katheryne = require("../classes/Katheryne");
const ScreenshotMonitor = require("../classes/ScreenshotMonitor");

/**
 * 
 * @param {Message|BaseInteraction} message Discord message or interaction
 * @param {Client} client Discord client object
 * @param {WhitelistedApp} app Whitelisted app information
 */
module.exports = async function(message, client, app) {
    await Katheryne.addLog(message, Language.strings.logs.stopMonitoring);
    ScreenshotMonitor.stop();
    await Katheryne.addLog(message, Language.strings.logs.restartingApps);
    var apps = client.config.computer.start_processes;
    for (var i = 0; i < apps.length; i++) Computer.spawn(apps[i], [], true);
    if (client.config.computer.auto_bluetooth_off) {
        await Katheryne.addLog(message, Language.strings.logs.enablingBluetooth);
        await Computer.setBluetooth(true);
    }
    if (Computer._kdeConnect) {
        await Katheryne.addLog(message, Language.strings.logs.enablingKDEConnect);
        Computer.spawn("kdeconnectd", [], true);
    }
    if (client.config.computer.auto_lock_input) {
        await Katheryne.addLog(message, Language.strings.logs.lockingInput);
        Computer.lockInput();
    }
}