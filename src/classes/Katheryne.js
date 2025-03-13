const { Client, EmbedBuilder, Message, BaseInteraction } = require("discord.js");

module.exports = {
    _logs: {},
    /**
     * Create an embed based on the preset.
     * @param {Client} client Discord client
     */
    embed: function(client) {
        return new EmbedBuilder()
        .setAuthor({name: client.user.username, iconURL: client.user.avatarURL({size: 128})})
        .setThumbnail(client.user.avatarURL({size: 128}))
        .setColor("Random")
        .setTimestamp(new Date());
    },
    /**
     * Edit a message or interaction.
     * @param {Message|BaseInteraction} message Discord message or interaction object
     * @param {import("discord.js").MessageEditOptions} options Message edit options
     * @returns {Promise<any>}
     */
    editMessage: function(message, options) {
        if (message.constructor.name.toLowerCase().includes("message")) {
            return message.edit(options);
        }
        return message.editReply(options);
    },
    /**
     * Add a new log to a message.
     * @param {Message|BaseInteraction} message Discord message or interaction object
     * @param {string} log The log info
     */
    addLog: async function(message, log) {
        if (!this._logs[message.id]) this._logs[message.id] = [];
        var logs = this._logs[message.id];
        if (logs.length >= 10) logs.splice(0, 1);
        logs.push(log);
        await this.editMessage(message, {content: `\`\`\`\n${logs.join("\n")}\n\`\`\``});
    },
};