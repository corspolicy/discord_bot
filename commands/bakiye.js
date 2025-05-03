const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'bakiye',
  description: 'Kullanıcı bakiyesini gösterir',
  aliases: ['balance', 'para'],
  async execute(message, args) {
    try {
      const targetUser = message.mentions.users.first() || message.author;
      const user = await User.findOne({ userId: targetUser.id });

      if (!user) {
        return message.reply(`${targetUser.id === message.author.id ? 'Kayıtlı değilsiniz' : 'Kullanıcı bulunamadı'}. Önce kayıt olun: \`${message.client.prefix}kayit\``);
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`${targetUser.username} Bakiyesi`)
        .setDescription(`💰 **Mevcut Bakiye:** ${user.balance}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .setFooter({ text: 'KumarciCors Bakiye Sistemi' });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('Bakiye bilgisi alınırken bir hata oluştu!');
    }
  }
};