const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const Language = require("../../classes/Language");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("exec")
    .setDescription(Language.strings.exec.description)
    .addStringOption(option => option
        .setName("command")
        .setDescription(Language.strings.exec.command)
        .setRequired(true)
    ),
    config: {
        nodm: true,
        memberPermissions: [],
        botPermissions: [],
        ownerOnly: true
    },
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns 
     */
    run: async (client, interaction) => {
        await interaction.deferReply();
        var command = interaction.options.getString("command") || "";
        await client.commands.get("exec").run(client, interaction, command.split(" "));
    }
}