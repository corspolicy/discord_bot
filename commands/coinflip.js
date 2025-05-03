const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'coinflip',
  description: 'Yazı tura oyunu',
  aliases: ['yazitura', 'flip'],
  requiresAccount: true,
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply(`Kullanım: \`${message.client.prefix}coinflip <miktar> <yazı/tura>\``);
    }

    const amount = parseInt(args[0]);
    const guess = args[1].toLowerCase();

    if (isNaN(amount) || amount <= 0) {
      return message.reply('Geçerli bir miktar girin!');
    }

    if (!['yazı', 'tura'].includes(guess)) {
      return message.reply('Sadece `yazı` veya `tura` seçebilirsiniz!');
    }

    try {
      const user = await User.findOne({ userId: message.author.id });
      if (user.isBanned) {
        return message.reply('Yasaklı kullanıcılar oyun oynayamaz!');
      }

      if (user.balance < amount) {
        return message.reply('Yeterli bakiyeniz yok!');
      }

      const result = Math.random() < 0.5 ? 'yazı' : 'tura';
      const win = result === guess;

      const embed = new EmbedBuilder()
        .setTitle('🎲 Yazı Tura Oyunu')
        .setDescription(`Sonuç: **${result.toUpperCase()}**`)
        .setColor(win ? '#00ff00' : '#ff0000');

      if (win) {
        user.balance += amount;
        embed.addFields(
          { name: 'Durum', value: '🎉 Kazandınız!', inline: true },
          { name: 'Kazanç', value: `+${amount}`, inline: true },
          { name: 'Yeni Bakiye', value: user.balance.toString(), inline: true }
        );
        user.wins += 1;
      } else {
        user.balance -= amount;
        embed.addFields(
          { name: 'Durum', value: '❌ Kaybettiniz!', inline: true },
          { name: 'Kayıp', value: `-${amount}`, inline: true },
          { name: 'Yeni Bakiye', value: user.balance.toString(), inline: true }
        );
        user.losses += 1;
      }

      user.gamesPlayed += 1;
      await user.save();

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('Bir hata oluştu!');
    }
  }
};