const User = require('../models/User');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'blackjack',
  description: 'Blackjack oyunu',
  aliases: ['bj'],
  requiresAccount: true,
  async execute(message, args) {
    const amount = parseInt(args[0]);
    
    if (isNaN(amount) || amount <= 0) {
      return message.reply(`Kullanım: \`${message.client.prefix}blackjack <miktar>\``);
    }

    try {
      const user = await User.findOne({ userId: message.author.id });
      if (user.balance < amount) {
        return message.reply('Yeterli bakiyeniz yok!');
      }

      // Kartları oluştur
      const suits = ['♠', '♥', '♦', '♣'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      const deck = [];
      
      for (const suit of suits) {
        for (const value of values) {
          deck.push({ suit, value });
        }
      }

      // Karıştır
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      // Dağıt
      const playerHand = [deck.pop(), deck.pop()];
      const dealerHand = [deck.pop(), deck.pop()];

      // Puan hesapla
      function calculateHand(hand) {
        let total = 0;
        let aces = 0;
        
        for (const card of hand) {
          if (card.value === 'A') {
            total += 11;
            aces++;
          } else if (['K', 'Q', 'J'].includes(card.value)) {
            total += 10;
          } else {
            total += parseInt(card.value);
          }
        }
        
        while (total > 21 && aces > 0) {
          total -= 10;
          aces--;
        }
        
        return total;
      }

      const playerTotal = calculateHand(playerHand);
      const dealerTotal = calculateHand(dealerHand);

      // Oyun durumu
      const gameState = {
        deck,
        playerHand,
        dealerHand,
        playerTotal,
        dealerTotal,
        amount,
        user,
        message,
        ended: false
      };

      // Butonlar
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('hit')
            .setLabel('Kart Çek')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('stand')
            .setLabel('Kal')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('double')
            .setLabel('2x Artır')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(user.balance < amount * 2)
        );

      // Gömülü mesaj oluştur
      const embed = createBlackjackEmbed(gameState);
      const reply = await message.channel.send({ 
        embeds: [embed],
        components: [row] 
      });

      // Buton toplayıcı
      const collector = reply.createMessageComponentCollector({ time: 60000 });

      collector.on('collect', async i => {
        if (i.user.id !== message.author.id) {
          return i.reply({ content: 'Bu oyun sizin değil!', ephemeral: true });
        }

        if (gameState.ended) {
          return i.reply({ content: 'Bu oyun zaten bitti!', ephemeral: true });
        }

        switch (i.customId) {
          case 'hit':
            gameState.playerHand.push(gameState.deck.pop());
            gameState.playerTotal = calculateHand(gameState.playerHand);
            
            if (gameState.playerTotal > 21) {
              endGame(gameState, 'bust');
            }
            break;
            
          case 'stand':
            dealerPlay(gameState);
            break;
            
          case 'double':
            if (gameState.user.balance >= gameState.amount * 2) {
              gameState.amount *= 2;
              gameState.playerHand.push(gameState.deck.pop());
              gameState.playerTotal = calculateHand(gameState.playerHand);
              dealerPlay(gameState);
            }
            break;
        }

        await i.update({
          embeds: [createBlackjackEmbed(gameState)],
          components: gameState.ended ? [] : [row]
        });
      });

      collector.on('end', () => {
        if (!gameState.ended) {
          reply.edit({ components: [] });
        }
      });

    } catch (error) {
      console.error(error);
      message.reply('Bir hata oluştu!');
    }
  }
};

function createBlackjackEmbed(gameState) {
  const embed = new EmbedBuilder()
    .setTitle('♠️♥️ Blackjack ♣️♦️')
    .setColor(0x0099FF);
  
  // Oyuncu kartları
  embed.addFields({
    name: `Senin Kartların (${gameState.playerTotal})`,
    value: gameState.playerHand.map(c => `${c.suit}${c.value}`).join(' | '),
    inline: false
  });
  
  // Dağıtıcı kartları
  if (gameState.ended) {
    embed.addFields({
      name: `Dağıtıcının Kartları (${gameState.dealerTotal})`,
      value: gameState.dealerHand.map(c => `${c.suit}${c.value}`).join(' | '),
      inline: false
    });
  } else {
    embed.addFields({
      name: 'Dağıtıcının Kartları',
      value: `${gameState.dealerHand[0].suit}${gameState.dealerHand[0].value} | ??`,
      inline: false
    });
  }
  
  // Bahis
  embed.addFields({
    name: 'Bahis',
    value: `${gameState.amount}`,
    inline: true
  });
  
  // Bakiye
  embed.addFields({
    name: 'Bakiye',
    value: `${gameState.user.balance}`,
    inline: true
  });
  
  // Sonuç
  if (gameState.ended) {
    embed.addFields({
      name: 'Sonuç',
      value: gameState.result,
      inline: false
    });
  }
  
  return embed;
}

function dealerPlay(gameState) {
  while (gameState.dealerTotal < 17) {
    gameState.dealerHand.push(gameState.deck.pop());
    gameState.dealerTotal = calculateHand(gameState.dealerHand);
  }
  
  if (gameState.dealerTotal > 21) {
    endGame(gameState, 'dealer_bust');
  } else if (gameState.dealerTotal > gameState.playerTotal) {
    endGame(gameState, 'lose');
  } else if (gameState.dealerTotal < gameState.playerTotal) {
    endGame(gameState, 'win');
  } else {
    endGame(gameState, 'push');
  }
}

function endGame(gameState, result) {
  gameState.ended = true;
  
  switch (result) {
    case 'bust':
      gameState.result = '❌ Bust! 21\'i geçtiniz. Kaybettiniz.';
      gameState.user.balance -= gameState.amount;
      gameState.user.losses += 1;
      break;
      
    case 'dealer_bust':
      gameState.result = `🎉 Dağıtıcı bust oldu! ${gameState.dealerTotal} ile. Kazandınız!`;
      gameState.user.balance += gameState.amount;
      gameState.user.wins += 1;
      break;
      
    case 'win':
      gameState.result = `🎉 Kazandınız! ${gameState.playerTotal} vs ${gameState.dealerTotal}`;
      gameState.user.balance += gameState.amount;
      gameState.user.wins += 1;
      break;
      
    case 'lose':
      gameState.result = `❌ Kaybettiniz! ${gameState.playerTotal} vs ${gameState.dealerTotal}`;
      gameState.user.balance -= gameState.amount;
      gameState.user.losses += 1;
      break;
      
    case 'push':
      gameState.result = `🟢 Berabere! ${gameState.playerTotal} vs ${gameState.dealerTotal}`;
      break;
  }
  
  gameState.user.gamesPlayed += 1;
  gameState.user.save();
}

function calculateHand(hand) {
  let total = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.value === 'A') {
      total += 11;
      aces++;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      total += 10;
    } else {
      total += parseInt(card.value);
    }
  }
  
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  return total;
}