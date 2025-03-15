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

/**
 * 
 * @param {Message|BaseInteraction} message Discord message or interaction
 * @param {Client} client Discord client object
 * @param {WhitelistedApp} app Whitelisted app information
 */
module.exports = async function(message, client, app) {
    return true;
}