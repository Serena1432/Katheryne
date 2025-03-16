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
const SessionManager = require("../classes/SessionManager");

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
    for (var i = 0; i < apps.length; i++) try {Computer.spawnAsUser(apps[i], [], true)} catch {}
    if (client.config.computer.auto_bluetooth_off) {
        await Katheryne.addLog(message, Language.strings.logs.enablingBluetooth);
        await Computer.setBluetooth(true);
    }
    if (SessionManager.get("kdeConnect")) {
        await Katheryne.addLog(message, Language.strings.logs.enablingKDEConnect);
        Computer.spawnAsUser("kdeconnectd", [], true);
        SessionManager.delete("kdeConnect");
    }
    if (client.config.computer.auto_lock_input) {
        await Katheryne.addLog(message, Language.strings.logs.unlockingInput);
        Computer.unlockInput();
    }
}