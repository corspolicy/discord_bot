const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Kullanıcıyı bot sisteminden yasaklar',
  usage: '<@kullanıcı> <sebep>',
  adminOnly: true,
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply(`Kullanım: \`${message.client.prefix}ban <@kullanıcı> <sebep>\``);
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('Geçerli bir kullanıcı etiketleyin!');
    }

    if (target.id === message.author.id) {
      return message.reply('Kendinizi yasaklayamazsınız!');
    }

    const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';

    try {
      const user = await User.findOneAndUpdate(
        { userId: target.id },
        { 
          isBanned: true,
          banReason: reason,
          bannedBy: message.author.id,
          bannedAt: new Date()
        },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🚷 Kullanıcı Yasaklandı')
        .setDescription(`${target.tag} artık bot komutlarını kullanamaz`)
        .addFields(
          { name: 'Sebep', value: reason, inline: true },
          { name: 'Yasaklayan', value: message.author.tag, inline: true },
          { name: 'Yasaklanma Tarihi', value: new Date().toLocaleString(), inline: true }
        );

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Ban hatası:', error);
      message.reply('Kullanıcı yasaklanırken bir hata oluştu!');
    }
  }
};