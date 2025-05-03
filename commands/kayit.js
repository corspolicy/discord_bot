const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'kayit',
  description: 'Sisteme kayıt olmanızı sağlar',
  aliases: ['register', 'kaydol'],
  async execute(message, args) {
    const existingUser = await User.findOne({ userId: message.author.id });
    if (existingUser) {
      return message.reply('Zaten kayıtlısınız!');
    }

    try {
      const newUser = await User.create({
        userId: message.author.id,
        username: message.author.username,
        balance: 1000
      });

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🎉 Kayıt Başarılı!')
        .setDescription(`Hoş geldiniz ${message.author.username}!`)
        .addFields(
          { name: 'Başlangıç Bakiyesi', value: '1000', inline: true },
          { name: 'ID', value: message.author.id, inline: true }
        )
        .setFooter({ text: 'KumarciCors - Keyifli Oyunlar!' });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('Kayıt sırasında bir hata oluştu!');
    }
  }
};