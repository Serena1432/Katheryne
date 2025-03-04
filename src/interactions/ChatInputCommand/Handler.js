const { PermissionFlagsBits, ChannelType } = require("discord.js");

/**
 * 
 * @param {Client} client 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
module.exports = (client, interaction) => {
    var command = client.interactions.ChatInputCommand.get(interaction.commandName);
    if (!command || !command.data || !command.config || !command.run) return interaction.reply({content: "Không thể tìm thấy câu lệnh này!", ephemeral: true});
    if (command.config.nodm && (interaction.channel.type == ChannelType.DM || interaction.channel.type == ChannelType.GroupDM)) return interaction.reply({content: "Câu lệnh này không thể sử dụng ở kênh Tin nhắn trực tiếp!", ephemeral: true});
    if (command.config.memberPermissions && command.config.memberPermissions.length) {
        if (interaction.channel.type == ChannelType.DM || interaction.channel.type == ChannelType.GroupDM) return interaction.reply({content: "Câu lệnh này không thể sử dụng ở kênh Tin nhắn trực tiếp!", ephemeral: true});
        for (var i = 0; i < command.config.memberPermissions.length; i++) {
            if (!interaction.member.permissions.has(PermissionFlagsBits[command.config.memberPermissions[i]])) return interaction.reply({content: "Bạn không có quyền để thực hiện lệnh này.\nLệnh này yêu cầu bạn cần có những quyền sau đây:\n`" + command.config.memberPermissions.join(", ") + "`", ephemeral: true});
        }
    }
    if (command.config.botPermissions && command.config.botPermissions.length) {
        if (interaction.channel.type == ChannelType.DM || interaction.channel.type == ChannelType.GroupDM) return interaction.reply({content: "Câu lệnh này không thể sử dụng ở kênh Tin nhắn trực tiếp!", ephemeral: true});
        for (var i = 0; i < command.config.botPermissions.length; i++) {
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits[command.config.botPermissions[i]])) return interaction.reply({content: "BOT không có quyền để thực hiện lệnh này.\nLệnh này yêu cầu BOT cần có những quyền sau đây:\n`" + command.config.botPermissions.join(", ") + "`", ephemeral: true});
        }
    }
    if (command.config.ownerOnly && interaction.user.id != client.config.owner_id) return interaction.reply({content: "Chỉ có chủ sở hữu BOT mới có thể sử dụng lệnh này.", ephemeral: true});
    command.run(client, interaction);
}