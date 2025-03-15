const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const Language = require("../../classes/Language");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("start")
    .setDescription(Language.strings.start.description)
    .addStringOption(option => option
        .setName("alias")
        .setDescription(Language.strings.start.alias)
    ),
    config: {
        nodm: true,
        memberPermissions: [],
        botPermissions: [],
        ownerOnly: false
    },
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns 
     */
    run: async (client, interaction) => {
        const alias = interaction.options.getString("alias") || "";
        await interaction.deferReply();
        await client.commands.get("start").run(client, interaction, alias.split(" "));
    }
}