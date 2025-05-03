const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'upordown',
  description: 'Sayının yukarı mı aşağı mı gideceğini tahmin edin',
  aliases: ['ud', 'yukarıasagı'],
  requiresAccount: true,
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply(`Kullanım: \`${message.client.prefix}upordown <miktar> <up/down>\``);
    }

    const amount = parseInt(args[0]);
    const prediction = args[1].toLowerCase();

    if (isNaN(amount) || amount <= 0) {
      return message.reply('Geçerli bir miktar girin!');
    }

    if (!['up', 'down', 'yukarı', 'aşağı'].includes(prediction)) {
      return message.reply('Sadece `up/yukarı` veya `down/aşağı` seçebilirsiniz!');
    }

    try {
      const user = await User.findOne({ userId: message.author.id });
      if (user.balance < amount) {
        return message.reply('Yeterli bakiyeniz yok!');
      }

      // 1-100 arası rastgele sayı üret
      const currentNumber = Math.floor(Math.random() * 100) + 1;
      const nextNumber = Math.floor(Math.random() * 100) + 1;
      
      const isUp = nextNumber > currentNumber;
      const userWins = 
        (prediction === 'up' || prediction === 'yukarı') ? isUp : !isUp;

      const embed = new EmbedBuilder()
        .setTitle('📈 Up or Down 📉')
        .setColor(userWins ? '#00ff00' : '#ff0000')
        .addFields(
          { name: 'Mevcut Sayı', value: currentNumber.toString(), inline: true },
          { name: 'Sonraki Sayı', value: nextNumber.toString(), inline: true },
          { name: 'Tahmininiz', value: prediction, inline: true }
        );

      if (userWins) {
        const winAmount = Math.floor(amount * 1.5); // %50 kar
        user.balance += winAmount;
        user.wins += 1;
        embed.setDescription(`🎉 Kazandınız! +${winAmount}\nYeni bakiye: ${user.balance}`);
      } else {
        user.balance -= amount;
        user.losses += 1;
        embed.setDescription(`❌ Kaybettiniz! -${amount}\nYeni bakiye: ${user.balance}`);
      }

      user.gamesPlayed += 1;
      await user.save();

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('Oyun oynanırken bir hata oluştu!');
    }
  }
};