const { SlashCommandBuilder, messageLink, EmbedBuilder, channelLink, User, time, ChatInputCommandInteraction } = require("discord.js");
const Language = require("../../classes/Language");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription(Language.strings.eval.description)
    .addStringOption(option => option
        .setName("script")
        .setDescription(Language.strings.eval.script)
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
        var script = interaction.options.getString("script") || "";
        await client.commands.get("eval").run(client, interaction, script.split(" "));
    }
}