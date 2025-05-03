const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '💎', '7️⃣'];
const payouts = {
  '💎💎💎': 50,
  '7️⃣7️⃣7️⃣': 30,
  '🍇🍇🍇': 15,
  '🍉🍉🍉': 10,
  '🍊🍊🍊': 7,
  '🍋🍋🍋': 5,
  '🍒🍒🍒': 3
};

module.exports = {
  name: 'sweetbonanza',
  description: 'Sweet Bonanza slot oyunu',
  aliases: ['sweet', 'bonanza'],
  requiresAccount: true,
  async execute(message, args) {
    const amount = parseInt(args[0]);
    
    if (isNaN(amount) || amount <= 0) {
      return message.reply(`Kullanım: \`${message.client.prefix}sweetbonanza <miktar>\``);
    }

    try {
      const user = await User.findOne({ userId: message.author.id });
      if (user.balance < amount) {
        return message.reply('Yeterli bakiyeniz yok!');
      }

      user.balance -= amount;
      
      // Slotları döndür
      const reels = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      
      // Kazanç hesapla
      const combination = reels.join('');
      let winAmount = 0;
      
      for (const [pattern, payout] of Object.entries(payouts)) {
        if (combination === pattern) {
          winAmount = amount * payout;
          break;
        }
      }
      
      // Bonus ödül (rastgele)
      if (Math.random() < 0.05) { // %5 şans
        winAmount += amount * 10;
      }
      
      if (winAmount > 0) {
        user.balance += winAmount;
        user.wins += 1;
      } else {
        user.losses += 1;
      }
      
      user.gamesPlayed += 1;
      await user.save();
      
      // Embed oluştur
      const embed = new EmbedBuilder()
        .setTitle('🎰 Sweet Bonanza')
        .setDescription(`
          **Sonuç:** ${reels.join(' | ')}
          ${winAmount > 0 ? `🎉 **Kazandınız:** ${winAmount}` : '❌ Kaybettiniz'}
          **Yeni Bakiye:** ${user.balance}
        `)
        .setColor(winAmount > 0 ? 0x00FF00 : 0xFF0000)
        .setFooter({ text: 'Sweet Bonanza Slot Makinesi' });
        
      message.channel.send({ embeds: [embed] });
      
    } catch (error) {
      console.error(error);
      message.reply('Bir hata oluştu!');
    }
  }
};