const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const Language = require("../../classes/Language");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("send")
    .setDescription(Language.strings.send.description)
    .addStringOption(option => option
        .setName("message")
        .setDescription(Language.strings.send.message)
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
        const message = interaction.options.getString("message") || "";
        await interaction.deferReply();
        await client.commands.get("send").run(client, interaction, message.split(" "));
    }
}