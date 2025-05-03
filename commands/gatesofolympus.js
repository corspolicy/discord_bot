const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

const gods = ['⚡', '🔥', '🌊', '🌪️', '🏛️', '🔱', '🦅'];
const multipliers = [2, 3, 5, 10, 20, 50, 100];

module.exports = {
  name: 'gatesofolympus',
  description: 'Gates of Olympus slot oyunu',
  aliases: ['gates', 'olympus'],
  requiresAccount: true,
  async execute(message, args) {
    const amount = parseInt(args[0]);
    
    if (isNaN(amount) || amount <= 0) {
      return message.reply(`Kullanım: \`${message.client.prefix}gatesofolympus <miktar>\``);
    }

    try {
      const user = await User.findOne({ userId: message.author.id });
      if (user.balance < amount) {
        return message.reply('Yeterli bakiyeniz yok!');
      }

      user.balance -= amount;
      
      // 5x5 grid oluştur
      const grid = [];
      for (let i = 0; i < 25; i++) {
        grid.push(gods[Math.floor(Math.random() * gods.length)]);
      }
      
      // Kazanç hesapla (basitleştirilmiş)
      let winAmount = 0;
      const matches = {};
      
      // Yatay eşleşmeleri kontrol et
      for (let row = 0; row < 5; row++) {
        const line = grid.slice(row * 5, row * 5 + 5);
        const counts = {};
        
        for (const god of line) {
          counts[god] = (counts[god] || 0) + 1;
        }
        
        for (const [god, count] of Object.entries(counts)) {
          if (count >= 3) {
            const multiplier = multipliers[gods.indexOf(god)] || 1;
            const win = amount * multiplier * (count - 2);
            winAmount += win;
            matches[god] = (matches[god] || 0) + count;
          }
        }
      }
      
      // Bonus ödül (rastgele)
      if (Math.random() < 0.02) { // %2 şans
        const bonus = amount * 100;
        winAmount += bonus;
      }
      
      if (winAmount > 0) {
        user.balance += winAmount;
        user.wins += 1;
      } else {
        user.losses += 1;
      }
      
      user.gamesPlayed += 1;
      await user.save();
      
      // Grid'i formatla
      let gridDisplay = '';
      for (let row = 0; row < 5; row++) {
        gridDisplay += grid.slice(row * 5, row * 5 + 5).join(' ') + '\n';
      }
      
      // Embed oluştur
      const embed = new EmbedBuilder()
        .setTitle('🏛️ Gates of Olympus')
        .setDescription(`
          **Oyun Gridi:**\n${gridDisplay}
          ${winAmount > 0 ? `🎉 **Kazandınız:** ${winAmount}` : '❌ Kaybettiniz'}
          **Yeni Bakiye:** ${user.balance}
          ${Object.keys(matches).length > 0 ? `\nEşleşen semboller: ${Object.entries(matches).map(([g, c]) => `${g} x${c}`).join(', ')}` : ''}
        `)
        .setColor(winAmount > 0 ? 0xFFD700 : 0xFF0000)
        .setFooter({ text: 'Gates of Olympus Slot Makinesi' });
        
      message.channel.send({ embeds: [embed] });
      
    } catch (error) {
      console.error(error);
      message.reply('Bir hata oluştu!');
    }
  }
};