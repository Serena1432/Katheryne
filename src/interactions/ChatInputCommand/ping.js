const { SlashCommandBuilder, messageLink, EmbedBuilder, channelLink, User, time, ChatInputCommandInteraction } = require("discord.js");
const Language = require("../../classes/Language");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription(Language.strings.ping.description),
    config: {
        nodm: false,
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
        await client.commands.get("ping").run(client, interaction, []);
    }
}