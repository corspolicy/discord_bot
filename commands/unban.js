const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Kullanıcının yasağını kaldırır',
  usage: '<kullanıcıID>',
  adminOnly: true,
  async execute(message, args) {
    if (!args[0]) {
      return message.reply(`Kullanım: \`${message.client.prefix}unban <kullanıcıID>\``);
    }

    const userId = args[0];

    try {
      const user = await User.findOneAndUpdate(
        { userId, isBanned: true },
        { 
          isBanned: false,
          banReason: null,
          bannedBy: null,
          bannedAt: null
        }
      );

      if (!user) {
        return message.reply('Bu IDye ait yasaklı kullanıcı bulunamadı!');
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Yasağı Kaldırıldı')
        .setDescription(`${userId} IDli kullanıcının yasağı kaldırıldı`)
        .addFields(
          { name: 'Kaldıran', value: message.author.tag, inline: true },
          { name: 'Tarih', value: new Date().toLocaleString(), inline: true }
        );

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Unban hatası:', error);
      message.reply('Yasak kaldırılırken bir hata oluştu!');
    }
  }
};