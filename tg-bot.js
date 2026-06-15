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

// Простой обработчик всех сообщений в канале
bot.on('channel_post', async (ctx) => {
    try {
        // Проверяем, что сообщение существует
        if (!ctx.message) {
            console.log('Нет сообщения');
            return;
        }

        const msg = ctx.message;
        const channel = ctx.chat;
        
        // Получаем название канала
        let channelName = 'Telegram канал';
        if (channel && channel.title) {
            channelName = channel.title;
        } else if (channel && channel.username) {
            channelName = `@${channel.username}`;
        }
        
        // Получаем текст сообщения разными способами
        let text = '';
        
        if (msg.text) {
            text = msg.text;
        } else if (msg.caption) {
            text = msg.caption;
        } else if (msg.photo) {
            text = '📷 Отправлено фото';
        } else if (msg.video) {
            text = '🎥 Отправлено видео';
        } else if (msg.audio) {
            text = '🎵 Отправлена аудиозапись';
        } else if (msg.document) {
            text = '📄 Отправлен документ';
        } else if (msg.sticker) {
            text = `🖼️ Стикер${msg.sticker.emoji ? `: ${msg.sticker.emoji}` : ''}`;
        } else if (msg.voice) {
            text = '🎙️ Голосовое сообщение';
        } else if (msg.video_note) {
            text = '📹 Видеосообщение (кружок)';
        } else {
            text = '📨 Новое сообщение в канале';
        }
        
        // Создаём ссылку на сообщение
        let messageLink = '';
        if (channel && channel.username) {
            messageLink = `https://t.me/${channel.username}/${msg.message_id}`;
        } else if (channel && channel.id) {
            const chatId = String(channel.id).replace('-100', '');
            messageLink = `https://t.me/c/${chatId}/${msg.message_id}`;
        }
        
        // Формируем сообщение для Discord
        let discordMessage = `📢 **${channelName}**\n${text}`;
        if (messageLink) {
            discordMessage += `\n\n🔗 [Открыть в Telegram](${messageLink})`;
        }
        
        // Отправляем в Discord
        await axios.post(DISCORD_WEBHOOK_URL, {
            content: discordMessage
        });
        
        console.log(`✅ Отправлено в Discord: ${channelName} - ${text.substring(0, 50)}`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        if (error.response) {
            console.error('Ответ Discord:', error.response.data);
        }
    }
});

// Запуск бота
bot.launch();
console.log('🤖 Telegram бот запущен и слушает каналы!');

// Веб-сервер для Render
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('🤖 Bot is running!'));
app.listen(port, () => console.log(`✅ Веб-сервер на порту ${port}`));

// Обработка остановки
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
