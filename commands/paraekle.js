const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'paraekle',
  description: 'Kullanıcıya bakiye ekler',
  usage: '<@kullanıcı> <miktar>',
  adminOnly: true,
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply(`Kullanım: \`${message.client.prefix}paraekle <@kullanıcı> <miktar>\``);
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('Geçerli bir kullanıcı etiketleyin!');
    }

    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) {
      return message.reply('Geçerli bir miktar girin!');
    }

    try {
      const user = await User.findOneAndUpdate(
        { userId: target.id },
        { $inc: { balance: amount } },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('💰 Bakiye Eklendi')
        .setDescription(`${target.tag} kullanıcısına ${amount} eklendi`)
        .addFields(
          { name: 'Yeni Bakiye', value: user.balance.toString(), inline: true },
          { name: 'Ekleyen', value: message.author.tag, inline: true },
          { name: 'Tarih', value: new Date().toLocaleString(), inline: true }
        );

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Para ekleme hatası:', error);
      message.reply('Bakiye eklenirken bir hata oluştu!');
    }
  }
};