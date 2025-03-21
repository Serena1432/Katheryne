const { Client, Message } = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");
const Computer = require("../classes/Computer");
const Steam = require("../classes/Steam");
const WhitelistedApps = require("../classes/WhitelistedApps").WhitelistedAppManager;

module.exports.config = {
    name: "stats",
    usage: "stats",
    description: Language.strings.stats.description,
    nodm: true,
    memberPermissions: [],
    botPermissions: [],
    ownerOnly: false
}

function sanitize(str) {
    str = str?.toString();
    return str || Language.strings.undefined;
}

function bytesToString(bytes) {
    var tables = [
        [1073741824, "GB"],
        [1048576, "MB"],
        [1024, "KB"],
    ];
    for (var i = 0; i < tables.length; i++) {
        var val = tables[i][0], text = tables[i][1];
        if (bytes >= val) return `${(bytes / val).toFixed(2)} ${text}`;
    }
    return `${bytes} B`;
}

function usage(used, total) {
    return `${bytesToString(used)} / ${bytesToString(total)} (${(used / total * 100).toFixed(2)}%)`;
}

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 */
module.exports.run = async function(client, message, args) {
    var msg = await Katheryne.reply(message, {content: Language.strings.logs.preparing});
    try {
        var stats = await Computer.stats();
        var embed = Katheryne.embed(client)
        .setTitle(Language.strings.stats.title.format(Computer.hostname))
        .addFields(
            {name: Language.strings.stats.nodeJSVersion, value: sanitize(process.version), inline: true},
            {name: Language.strings.stats.discordJSVersion, value: sanitize(require("discord.js").version), inline: true},
            {name: Language.strings.stats.model, value: sanitize(stats.model), inline: false},
            {name: Language.strings.stats.os, value: sanitize(stats.os), inline: false},
            {name: Language.strings.stats.battery, value: sanitize(`${stats.battery.percent}%${stats.battery.charging ? ` (${Language.stats.charging})` : ""}`), inline: false},
            {name: Language.strings.stats.cpu, value: sanitize(`${stats.cpu.name} (${stats.cpu.cores} ${Language.strings.cores} ${stats.cpu.threads} ${Language.strings.threads})\n${Language.strings.stats.governor.format(Language.strings.stats.governors[stats.cpu.governor])}`), inline: false},
            {name: Language.strings.stats.cpuUsage, value: sanitize(`${stats.cpu.usage.toFixed(2)}%`), inline: true},
            {name: Language.strings.stats.cpuTemp, value: sanitize(`${stats.cpu.temperature}°C`), inline: true},
            {name: Language.strings.stats.gpu, value: sanitize(stats.gpu.map(gpu => {
                return `${gpu.vendor} ${gpu.model} (${bytesToString(gpu.vram)})`
            }).join("\n")), inline: false},
            {name: Language.strings.stats.gpuUsage, value: sanitize(stats.gpu.filter(gpu => gpu?.data?.usage != null).map(gpu => {
                return `${gpu.data.usage}% [${gpu.modelShort}]`
            }).join("\n")), inline: true},
            {name: Language.strings.stats.gpuTemp, value: sanitize(stats.gpu.filter(gpu => gpu?.data?.temperature != null).map(gpu => {
                return `${gpu.data.temperature}°C [${gpu.modelShort}]`
            }).join("\n")), inline: true},
            {name: Language.strings.stats.ramUsage, value: sanitize(usage(stats.memory.used, stats.memory.total)), inline: false},
            {name: Language.strings.stats.vramUsage, value: sanitize(stats.gpu.filter(gpu => gpu?.data?.vram != null).map(gpu => {
                return `${usage(gpu.data.vram, gpu.vram)} [${gpu.modelShort}]`
            }).join("\n")), inline: false},
            {name: "Steam:", value: Steam.isRunning() ? Language.strings.on : Language.strings.off, inline: true},
            {name: "TeamViewer:", value: Computer.isProcessRunning("teamviewer") ? Language.strings.on : Language.strings.off, inline: true},
            {name: "AnyDesk:", value: Computer.isProcessRunning("anydesk") ? Language.strings.on : Language.strings.off, inline: true},
            {name: Language.strings.stats.runningApp, value: sanitize((await WhitelistedApps.running())[0]?.name || "Không có"), inline: false}
        );
        Katheryne.editMessage(msg, {embeds: [embed]});
    }
    catch (err) {
        console.error(err);
        Katheryne.addLog(msg, err.stack);
    }
}