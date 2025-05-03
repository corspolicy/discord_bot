const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

const choices = ['taş', 'kağıt', 'makas'];
const emojis = {
  'taş': '✊',
  'kağıt': '✋',
  'makas': '✌'
};

module.exports = {
  name: 'rps',
  description: 'Taş kağıt makas oyunu',
  aliases: ['tkm'],
  requiresAccount: true,
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply(`Kullanım: \`${message.client.prefix}rps <miktar> <taş/kağıt/makas>\``);
    }

    const amount = parseInt(args[0]);
    const playerChoice = args[1].toLowerCase();

    if (isNaN(amount) || amount <= 0) {
      return message.reply('Geçerli bir miktar girin!');
    }

    if (!choices.includes(playerChoice)) {
      return message.reply('Sadece `taş`, `kağıt` veya `makas` seçebilirsiniz!');
    }

    try {
      const user = await User.findOne({ userId: message.author.id });
      if (user.balance < amount) {
        return message.reply('Yeterli bakiyeniz yok!');
      }

      const botChoice = choices[Math.floor(Math.random() * choices.length)];
      let result;

      if (playerChoice === botChoice) {
        result = 'berabere';
      } else if (
        (playerChoice === 'taş' && botChoice === 'makas') ||
        (playerChoice === 'kağıt' && botChoice === 'taş') ||
        (playerChoice === 'makas' && botChoice === 'kağıt')
      ) {
        result = 'kazandınız';
        user.balance += amount;
        user.wins += 1;
      } else {
        result = 'kaybettiniz';
        user.balance -= amount;
        user.losses += 1;
      }

      user.gamesPlayed += 1;
      await user.save();

      const embed = new EmbedBuilder()
        .setTitle('✊✋✌ Taş Kağıt Makas')
        .setDescription(`
          **Sizin Seçiminiz:** ${emojis[playerChoice]} ${playerChoice}
          **Botun Seçimi:** ${emojis[botChoice]} ${botChoice}
          **Sonuç:** ${result === 'berabere' ? '🟢 Berabere!' : result === 'kazandınız' ? '🎉 Kazandınız!' : '❌ Kaybettiniz!'}
          ${result !== 'berabere' ? `\n${result === 'kazandınız' ? `+${amount}` : `-${amount}`} | Yeni bakiye: ${user.balance}` : ''}
        `)
        .setColor(result === 'berabere' ? 0xFFFF00 : result === 'kazandınız' ? 0x00FF00 : 0xFF0000);

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('Bir hata oluştu!');
    }
  }
};