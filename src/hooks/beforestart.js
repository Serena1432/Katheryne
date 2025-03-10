/**
 * This is the hook script to be started before starting a whitelisted app.
 * You can edit it freely as you want.
 */

const { BaseInteraction, Message, Client } = require("discord.js");
const { WhitelistedApp } = require("../classes/WhitelistedApps");
const Language = require("../classes/Language");
const Computer = require("../classes/Computer");
const Katheryne = require("../classes/Katheryne");

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
        Computer.setVolume(0);
    }
    if (client.config.computer.auto_bluetooth_off) {
        await Katheryne.addLog(message, Language.strings.logs.disablingBluetooth);
        await Computer.setBluetooth(false);
    }
    if (client.config.auto_performance_governor) {
        await Katheryne.addLog(message, Language.strings.logs.settingGovernor);
        await Computer.setCpuGovernor("performance");
    }
    if (client.config.auto_max_fan) {
        await Katheryne.addLog(message, Language.strings.logs.settingFanSpeed);
        await Computer.setFanSpeed(100);
    }
    if (Computer.checkServiceActive("warp-svc", false)) {
        await Katheryne.addLog(message, Language.strings.logs.disablingWARP);
        try {await Computer.exec(`warp-cli disconnect`)} catch (err) {
            await Katheryne.addLog(message, err.stack);
        }
    }
    if (await Computer.isProcessRunning("kdeconnectd")) {
        Computer._kdeConnect = true;
        await Katheryne.addLog(message, Language.strings.logs.disablingKDEConnect);
        await Computer.killProcess("kdeconnectd");
    }
}