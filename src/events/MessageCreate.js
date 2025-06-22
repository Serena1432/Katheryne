const {Client, Message, ChannelType} = require("discord.js");
const Language = require("../classes/Language");
const Katheryne = require("../classes/Katheryne");

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @returns 
 */
module.exports = function(client, message) {
    const prefix = client.config.prefix, content = message.content;
    if (!content.startsWith(prefix)) return;
    var args = content.slice(prefix.length).split(/(\s+)/).filter( e => e.trim().length > 0),
        command = args[0];
    args.splice(0, 1);
    var commandInfo = client.commands.get(command.toLowerCase());
    if (!commandInfo || !commandInfo.run || !commandInfo.config) return;
    if (commandInfo.config.nodm && (message.channel.type == ChannelType.DM || message.channel.type == ChannelType.GroupDM)) return message.reply({content: Language.strings.noDM});
    if (commandInfo.config.memberPermissions && commandInfo.config.memberPermissions.length) {
        if (message.channel.type == ChannelType.DM || message.channel.type == ChannelType.GroupDM) return message.reply({content: Language.strings.noDM});
        for (var i = 0; i < commandInfo.config.memberPermissions.length; i++) {
            if (!message.member.permissions.has(PermissionFlagsBits[commandInfo.config.memberPermissions[i]])) return message.reply({content: Language.strings.noUserPermissions.format(commandInfo.config.memberPermissions.join(", "))});
        }
    }
    if (commandInfo.config.botPermissions && commandInfo.config.botPermissions.length) {
        if (message.channel.type == ChannelType.DM || message.channel.type == ChannelType.GroupDM) return message.reply({content: Language.strings.noDM});
        for (var i = 0; i < commandInfo.config.botPermissions.length; i++) {
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits[commandInfo.config.botPermissions[i]])) return message.reply({content: Language.strings.noBOTPermissions.format(commandInfo.config.botPermissions.join(", "))});
        }
    }
    if (commandInfo.config.ownerOnly && message.author.id != client.config.owner_id) return message.reply({content: Language.strings.ownerOnly});
    if (message.author.id != client.config.owner_id && !Object.keys(client.config.whitelist).includes(message.author.id)) return message.reply({content: Language.strings.notInWhitelist});
    Katheryne.debug(`Message: id = ${message.id}, command = ${command}, content = ${message.content}`);
    commandInfo.run(client, message, args);
}