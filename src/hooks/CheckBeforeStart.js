/**
 * This is the hook script to check all of the conditions before starting a whitelisted app.
 * Use "return true" to approve, "return false" to reject.
 * You can edit it freely as you want.
 */

const { BaseInteraction, Message, Client } = require("discord.js");
const { WhitelistedApp } = require("../classes/WhitelistedApps");
const Language = require("../classes/Language");
const Computer = require("../classes/Computer");
const Katheryne = require("../classes/Katheryne");
const ScreenshotMonitor = require("../classes/ScreenshotMonitor");
const Confirmation = require("./Confirmation");

/**
 * 
 * @param {Message|BaseInteraction} message Discord message or interaction
 * @param {Client} client Discord client object
 * @param {User} originalAuthor Original author object
 * @param {WhitelistedApp} app Whitelisted app information
 */
module.exports = async function(message, client, originalAuthor, app) {
    await Katheryne.editMessage(message, {content: Language.strings.logs.checking});
    const stats = await Computer.stats();
    if (!stats.battery.charging) {
        if (!(await Confirmation(Language.strings.confirmation.onBattery.format(Computer.hostname, stats.battery.percent, stats.battery.remaining), message, client, originalAuthor, false))) return false;
    }
    if (stats.gpu.find(gpu => (gpu.vendor?.toLowerCase() == "nvidia" && gpu.data == null))) {
        if (!(await Confirmation(Language.strings.confirmation.nvidiaDriverError.format(Computer.hostname), message, client, originalAuthor, false))) return false;
    }
    if (stats.cpu.temperature >= 90 || stats.gpu.find(gpu => gpu?.data?.temperature >= 80)) {
        if (!(await Confirmation(Language.strings.confirmation.highTemperature(Computer.hostname), message, client, originalAuthor, false))) return false;
    }
    return true;
}