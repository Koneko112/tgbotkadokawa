const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.TG_BOT_TOKEN;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!TOKEN || !WEBHOOK_URL) {
    console.error('❌ Укажите TG_BOT_TOKEN и DISCORD_WEBHOOK_URL в .env');
    process.exit(1);
}

const bot = new Telegraf(TOKEN);

// Обработка сообщений из группы
bot.on('message', async (ctx) => {
    try {
        const chat = ctx.chat;
        const message = ctx.message;
        
        // Игнорируем сообщения от самого бота
        if (message.from.id === ctx.botInfo.id) return;
        
        const chatName = chat.title || chat.username || 'Telegram';
        let text = message.text || message.caption || '📨 Новое сообщение';
        
        console.log(`📩 Получено сообщение из ${chatName}: ${text.substring(0, 50)}`);
        
        await axios.post(WEBHOOK_URL, {
            content: `📢 **${chatName}**\n${text}\n\n🔗 [Ответить в Telegram](https://t.me/${chat.username}/${message.message_id})`
        });
        
        console.log('✅ Отправлено в Discord');
    } catch (err) {
        console.error('❌ Ошибка:', err.message);
    }
});

bot.launch();
console.log('🤖 Telegram бот запущен! Слушает группу...');

const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(process.env.PORT || 3000);
