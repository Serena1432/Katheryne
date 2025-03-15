const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const Language = require("../../classes/Language");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("steam")
    .setDescription(Language.strings.steam.description)
    .addStringOption(option => option
        .setName("user")
        .setDescription(Language.strings.steam.user)
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
        await interaction.deferReply();
        var user = interaction.options.getString("user") || "";
        await client.commands.get("steam").run(client, interaction, user.split(" "));
    }
}