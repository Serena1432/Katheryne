const { PermissionFlagsBits, ChannelType, ChatInputCommandInteraction } = require("discord.js");
const Language = require("../../classes/Language");

/**
 * 
 * @param {Client} client 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
module.exports = (client, interaction) => {
    var command = client.interactions.ChatInputCommand.get(interaction.commandName);
    if (!command || !command.data || !command.config || !command.run) return interaction.reply({content: Language.strings.commandNotFound, ephemeral: true});
    if (command.config.nodm && (interaction.channel.type == ChannelType.DM || interaction.channel.type == ChannelType.GroupDM)) return interaction.reply({content: Language.strings.noDM, ephemeral: true});
    if (command.config.memberPermissions && command.config.memberPermissions.length) {
        if (interaction.channel.type == ChannelType.DM || interaction.channel.type == ChannelType.GroupDM) return interaction.reply({content: Language.strings.noDM, ephemeral: true});
        for (var i = 0; i < command.config.memberPermissions.length; i++) {
            if (!interaction.member.permissions.has(PermissionFlagsBits[command.config.memberPermissions[i]])) return interaction.reply({content: Language.strings.noUserPermissions.format(commandInfo.config.memberPermissions.join(", ")), ephemeral: true});
        }
    }
    if (command.config.botPermissions && command.config.botPermissions.length) {
        if (interaction.channel.type == ChannelType.DM || interaction.channel.type == ChannelType.GroupDM) return interaction.reply({content: Language.strings.noDM, ephemeral: true});
        for (var i = 0; i < command.config.botPermissions.length; i++) {
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits[command.config.botPermissions[i]])) return interaction.reply({content: Language.strings.noBOTPermissions.format(commandInfo.config.botPermissions.join(", ")), ephemeral: true});
        }
    }
    if (command.config.ownerOnly && interaction.user.id != client.config.owner_id) return interaction.reply({content: Language.strings.ownerOnly, ephemeral: true});
    if (interaction.user.id != client.config.owner_id && !Object.keys(client.config.whitelist).includes(interaction.user.id)) return interaction.reply({content: Language.strings.notInWhitelist});
    command.run(client, interaction);
}