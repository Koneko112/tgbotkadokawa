const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.TG_BOT_TOKEN;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!TOKEN || !DISCORD_WEBHOOK_URL) {
    console.error('❌ Укажите TG_BOT_TOKEN и DISCORD_WEBHOOK_URL в .env');
    process.exit(1);
}

const bot = new Telegraf(TOKEN);

// --- Логика бота (полностью без изменений) ---
bot.on('channel_post', async (ctx) => {
    try {
        const message = ctx.message;
        const channel = ctx.chat;
        const channelName = channel.title || channel.username || 'Telegram';
        const text = message.text || message.caption || '(Новое сообщение)';
        const link = `https://t.me/${channel.username}/${message.message_id}`;

        await axios.post(DISCORD_WEBHOOK_URL, {
            content: `📢 **${channelName}**\n${text}\n🔗 [Открыть](${link})`
        });
        console.log(`✅ Отправлено: ${channelName}`);
    } catch (err) {
        console.error('Ошибка:', err.message);
    }
});

bot.launch();
console.log('🤖 Telegram бот запущен!');

// --- ЭТИ 4 СТРОКИ КОДА РЕШАЮТ ПРОБЛЕМУ! ---
// Они создают простой веб-сервер, который ничего не делает,
// но Render сможет запустить его как бесплатный "веб-сервис".
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(port, () => console.log(`✅ Веб-сервер запущен на порту ${port}`));
