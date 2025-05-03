# 🎰 Discord Kumar Botu

Bu bot, Node.js ve Discord.js v14.18.0 ile geliştirilmiş, sadece eğlence amaçlı bir Discord kumar botudur.

---

## 🛠️ Kurulum

### 1. Depoyu Klonla

```bash
git clone https://github.com/corspolicy/discord_bot.git
cd discord_bot
```

### 2. Bağımlılıkları Kur

Bu bot `discord.js@^14.18.0` sürümünü kullanır. Gerekli paketleri yüklemek için:

```bash
npm install
```

---

## ⚙️ Yapılandırma

Proje dizininde `.env` dosyası oluşturun ve aşağıdaki bilgileri girin:

```env
TOKEN=DISCORD_BOT_TOKEN
MONGODB_URI=MONGODB_URI
```

- `TOKEN`: Discord botunuzun token'ı
- `PREFIX`: Botun komutlarını algılayacağı ön ek
- `MONGODB_URI`: Veritabanı bağlantınız

Bu değerler `index.js` dosyası içinde otomatik olarak işlenir. Prefix ve sahip ID'ler oradan alınacaktır.

---

## 🚀 Başlatma

Botu çalıştırmak için:

```bash
node index.js
```

---

## ⚖️ Yasal Uyarı

Bu bot yalnızca **eğlence amaçlı** geliştirilmiştir. Gerçek para veya herhangi bir finansal işlem içermez. Geliştiriciler, botun yasa dışı kullanımı durumunda sorumluluk kabul etmez. Bulunduğunuz ülkenin ve Discord'un kullanım koşullarına uymanız gerekmektedir.
