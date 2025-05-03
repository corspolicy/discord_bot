const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Bot hakkında bilgiler'),
  
  async execute(interaction) {
    const infoEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🤖 KumarciCors Bot Bilgileri')
      .setDescription('Discord için eğlence amaçlı kumar botu')
      .addFields(
        { name: 'Yapımcı', value: 'CorsPolicy', inline: true },
        { name: 'Versiyon', value: '1.0.0', inline: true },
        { name: 'Oluşturulma Tarihi', value: '2023', inline: true }
      )
      .setFooter({ text: `© ${new Date().getFullYear()} KumarciCors Bot` });

    await interaction.reply({ embeds: [infoEmbed] });
  }
};