const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const Language = require("../../classes/Language");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription(Language.strings.volume.description)
    .addStringOption(option => option
        .setName("amount")
        .setDescription(Language.strings.volume.amount)
        .setRequired(true)
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
        var amount = interaction.options.getString("amount") || "";
        await client.commands.get("volume").run(client, interaction, amount.split(" "));
    }
}