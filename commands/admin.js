const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'admin',
  description: 'Admin komutları',
  aliases: ['yönet'],
  adminOnly: true, 
  async execute(message, args) {
    const subCommand = args[0]?.toLowerCase();
    
    if (!subCommand) {
      return message.reply(`Kullanım: 
\`${message.client.prefix}admin ban <@kullanıcı> <sebep>\` - Kullanıcıyı yasaklar
\`${message.client.prefix}admin unban <kullanıcıID>\` - Yasağı kaldırır
\`${message.client.prefix}admin paraekle <@kullanıcı> <miktar>\` - Bakiye ekler`);
    }

    try {
      switch(subCommand) {
        case 'ban':
          if (args.length < 2) {
            return message.reply('Lütfen bir kullanıcı etiketleyin ve sebep belirtin!');
          }
          
          const target = message.mentions.users.first();
          if (!target) {
            return message.reply('Geçerli bir kullanıcı etiketleyin!');
          }
          
          if (target.id === message.author.id) {
            return message.reply('Kendinizi yasaklayamazsınız!');
          }
          
          if (target.id === message.client.ownerId) {
            return message.reply('Bot sahibini yasaklayamazsınız!');
          }
          
          const reason = args.slice(2).join(' ') || 'Sebep belirtilmedi';
          await User.findOneAndUpdate(
            { userId: target.id },
            { isBanned: true, banReason: reason, bannedBy: message.author.id }
          );
          
          message.reply(`✅ ${target.tag} kullanıcısı başarıyla yasaklandı. Sebep: ${reason}`);
          break;
          
        case 'unban':
          if (args.length < 2) {
            return message.reply('Lütfen bir kullanıcı IDsi girin!');
          }
          
          const userId = args[1];
          const unbannedUser = await User.findOneAndUpdate(
            { userId },
            { isBanned: false, banReason: null, bannedBy: null }
          );
          
          if (!unbannedUser) {
            return message.reply('Bu IDye ait yasaklı kullanıcı bulunamadı!');
          }
          
          message.reply(`✅ ${userId} IDli kullanıcının yasağı kaldırıldı.`);
          break;
          
        case 'paraekle':
          if (args.length < 3) {
            return message.reply('Lütfen bir kullanıcı etiketleyin ve miktar belirtin!');
          }
          
          const userToAdd = message.mentions.users.first();
          if (!userToAdd) {
            return message.reply('Geçerli bir kullanıcı etiketleyin!');
          }
          
          const amount = parseInt(args[2]);
          if (isNaN(amount) || amount <= 0) {
            return message.reply('Geçerli bir miktar girin!');
          }
          
          await User.findOneAndUpdate(
            { userId: userToAdd.id },
            { $inc: { balance: amount } },
            { upsert: true, new: true }
          );
          
          message.reply(`✅ ${userToAdd.tag} kullanıcısına ${amount} eklendi.`);
          break;
          
        default:
          message.reply('Geçersiz alt komut!');
      }
    } catch (error) {
      console.error('Admin komut hatası:', error);
      message.reply('Komut işlenirken bir hata oluştu!');
    }
  }
};