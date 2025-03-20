const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, messageLink, ButtonInteraction } = require("discord.js");
const Katheryne = require("../../classes/Katheryne");
const Language = require("../../classes/Language");

module.exports = {
    config: {
        nodm: false,
        memberPermissions: [],
        botPermissions: [],
        ownerOnly: false
    },
    /**
     * 
     * @param {Client} client 
     * @param {ButtonInteraction} interaction 
     * @returns 
     */
    run: async (client, interaction) => {
        var messageId = interaction.customId.split(".")[2], isDM = interaction.customId.split(".")[3];
        interaction.response = 1;
        Katheryne.sendEvent(`${messageId}.approve`, interaction);
        if (isDM) interaction.update({content: Language.strings.request.approved, components: [], embeds: []});
    }
}