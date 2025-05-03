require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const User = require('./models/User');

const spamMap = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

const prefix = 'c!'; //prefix config line
const ownerId = 'OWNER DISCORD ID'; 
const SPAM_LIMIT = 5;
client.prefix = prefix;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

client.commands = new Map();
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

function isSpamming(userId) {
  const now = Date.now();
  const timestamps = spamMap.get(userId) || [];
  
  const validTimestamps = timestamps.filter(timestamp => now - timestamp < 5000);
  validTimestamps.push(now);
  spamMap.set(userId, validTimestamps);
  
  return validTimestamps.length > SPAM_LIMIT;
}

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  if (isSpamming(message.author.id)) {
    return message.reply('Çok hızlı komut gönderiyorsunuz! Lütfen bekleyin.').then(msg => {
      setTimeout(() => msg.delete(), 3000);
    });
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || 
    Array.from(client.commands.values()).find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.adminOnly && message.author.id !== ownerId) {
    return message.reply('Bu komutu sadece bot sahibi kullanabilir!');
  }

  if (command.requiresAccount) {
    const user = await User.findOne({ userId: message.author.id });
    if (!user) {
      return message.reply(`Oyun oynamak için önce kayıt olmalısınız: \`${prefix}kayit\``);
    }
    if (user.isBanned) {
      return message.reply('Yasaklı kullanıcılar oyun oynayamaz!');
    }
  }

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('Komut çalıştırılırken bir hata oluştu!');
  }
});

client.login(process.env.TOKEN);