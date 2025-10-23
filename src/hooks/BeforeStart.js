/**
 * This is the hook script to be started before starting a whitelisted app.
 * You can edit it freely as you want.
 */

const { BaseInteraction, Message, Client } = require("discord.js");
const { WhitelistedApp, WhitelistedAppManager } = require("../classes/WhitelistedApps");
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
    if (client.config.computer.auto_lock_input) {
        await Katheryne.addLog(message, Language.strings.logs.lockingInput);
        Computer.lockInput();
    }
    await Katheryne.addLog(message, Language.strings.logs.closingApps);
    for (var process of client.config.computer.close_processes) try {await Computer.killProcess(process)} catch {}
    if (client.config.computer.auto_mute) {
        await Katheryne.addLog(message, Language.strings.logs.muteAudio);
        await Computer.setVolume(0);
    }
    if (client.config.computer.auto_bluetooth_off) {
        await Katheryne.addLog(message, Language.strings.logs.disablingBluetooth);
        await Computer.setBluetooth(false);
    }
    if (client.config.computer.auto_performance_governor) {
        await Katheryne.addLog(message, Language.strings.logs.settingGovernor);
        try {await Computer.setCpuGovernor("performance")} catch (err) {await Katheryne.addLog(message, err.message)}
    }
    if (client.config.computer.auto_max_fan_speed) {
        await Katheryne.addLog(message, Language.strings.logs.settingFanSpeed);
        try {await Computer.setFanSpeed(100)} catch (err) {await Katheryne.addLog(message, err.message)}
    }
    await Katheryne.addLog(message, Language.strings.logs.startMonitoring);
    ScreenshotMonitor.start(WhitelistedAppManager.toJSON());
}