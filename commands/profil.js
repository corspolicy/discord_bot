const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'profil',
  description: 'Kullanıcı profil bilgilerini gösterir',
  aliases: ['profile', 'istatistik'],
  async execute(message, args) {
    try {
      const user = await User.findOne({ userId: message.author.id });
      if (!user) {
        return message.reply(`Profiliniz bulunamadı. Önce kayıt olun: \`${message.client.prefix}kayit\``);
      }

      const winRate = user.gamesPlayed > 0 ? (user.wins / user.gamesPlayed * 100).toFixed(2) : 0;

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${message.author.username} Profili`)
        .setThumbnail(message.author.displayAvatarURL())
        .addFields(
          { name: '💰 Bakiye', value: `${user.balance}`, inline: true },
          { name: '🎮 Oynanan Oyun', value: `${user.gamesPlayed}`, inline: true },
          { name: '🏆 Galibiyet', value: `${user.wins}`, inline: true },
          { name: '💀 Mağlubiyet', value: `${user.losses}`, inline: true },
          { name: '📊 Galibiyet Oranı', value: `${winRate}%`, inline: true },
          { name: '📅 Kayıt Tarihi', value: `<t:${Math.floor(user.registeredAt.getTime() / 1000)}:D>`, inline: true }
        )
        .setFooter({ text: 'KumarciCors Profil Sistemi' });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('Profil bilgileri alınırken bir hata oluştu!');
    }
  }
};