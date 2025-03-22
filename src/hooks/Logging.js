/**
 * This is the hook script to check the computer frequently and send notifications when something abnormal happened.
 * You can edit it freely as you want.
 */

const { Client, TextChannel } = require("discord.js");
const Language = require("../classes/Language");
const Computer = require("../classes/Computer");
const SessionManager = require("../classes/SessionManager");

/**
 * 
 * @param {Client} client Discord client object
 * @param {TextChannel} logChannel Logging channel
 */
module.exports = async function(client, logChannel) {
    var stats = await Computer.temperature();
    if (stats?.cpu >= 90) {
        if (!SessionManager.get("logging.cpuTemp")) {
            SessionManager.set("logging.cpuTemp", true);
            logChannel.send({content: Language.strings.logs.highTemperature.format("CPU", Computer.hostname, stats.cpu)});
        }
    }
    else {
        if (SessionManager.get("logging.cpuTemp")) SessionManager.set("logging.cpuTemp", false);
    }
    if (stats?.gpu?.find(gpu => gpu >= 90)) {
        if (!SessionManager.get("logging.gpuTemp")) {
            SessionManager.set("logging.gpuTemp", true);
            logChannel.send({content: Language.strings.logs.highTemperature.format("GPU", Computer.hostname, stats.gpu.find(gpu => gpu >= 90))});
        }
    }
    else {
        if (SessionManager.get("logging.gpuTemp")) SessionManager.set("logging.gpuTemp", false);
    }
}