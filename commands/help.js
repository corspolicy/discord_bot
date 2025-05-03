const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Tüm komutları gösterir',
  aliases: ['yardım', 'komutlar'],
  execute(message, args, client) {
    const helpEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🎲 ${client.user.username} Bot Yardım Menüsü 🎲`)
      .setDescription(`Prefix: \`${client.prefix}\`\n**Yapımcı:** corspolicy`)
      .addFields(
        { name: '📝 Kayıt Sistemi', value: '----------------------------' },
        { name: `\`${client.prefix}kayit\``, value: 'Sisteme kayıt olursunuz', inline: true },
        { name: `\`${client.prefix}profil\``, value: 'Profilinizi gösterir', inline: true },
        { name: `\`${client.prefix}bakiye\``, value: 'Bakiyenizi gösterir', inline: true },
        
        { name: '💰 Para Oyunları', value: '----------------------------' },
        { name: `\`${client.prefix}coinflip <miktar> <yazı/tura>\``, value: 'Yazı tura oyunu', inline: true },
        { name: `\`${client.prefix}blackjack <miktar>\``, value: 'Blackjack oyunu', inline: true },
        { name: `\`${client.prefix}rps <miktar> <taş/kağıt/makas>\``, value: 'Taş-kağıt-makas', inline: true },
        { name: `\`${client.prefix}upordown <miktar> <up/down>\``, value: 'Yukarı mı aşağı mı tahmini', inline: true },
        { name: `\`${client.prefix}sweetbonanza <miktar>\``, value: 'Slot oyunu', inline: true },
        { name: `\`${client.prefix}gatesofolympus <miktar>\``, value: 'Yüksek ödüllü slot', inline: true },
        
        { name: '⚙️ Admin Komutları', value: '----------------------------' },
        { name: `\`${client.prefix}ban <@kullanıcı> <sebep>\``, value: 'Kullanıcıyı yasaklar', inline: true },
        { name: `\`${client.prefix}unban <kullanıcıID>\``, value: 'Yasağı kaldırır', inline: true },
        { name: `\`${client.prefix}paraekle <@kullanıcı> <miktar>\``, value: 'Bakiye ekler', inline: true }
      )
      .setFooter({ text: `${client.user.username} • Sadece eğlence amaçlıdır` });

    message.channel.send({ embeds: [helpEmbed] });
  }
};