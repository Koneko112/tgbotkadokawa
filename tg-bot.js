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

// Функция для извлечения текста из любого сообщения
function getMessageText(message) {
    // Текстовое сообщение
    if (message.text) return message.text;
    
    // Сообщение с подписью к медиа
    if (message.caption) return message.caption;
    
    // Разные типы медиа без текста
    if (message.photo) return '📷 Фото';
    if (message.video) return '🎥 Видео';
    if (message.audio) return '🎵 Аудио';
    if (message.document) return '📄 Документ';
    if (message.sticker) return `🖼️ Стикер: ${message.sticker.emoji || ''}`;
    if (message.voice) return '🎙️ Голосовое сообщение';
    if (message.video_note) return '📹 Кружок';
    if (message.poll) return '📊 Опрос';
    if (message.location) return '📍 Геопозиция';
    if (message.contact) return '👤 Контакт';
    
    // Если ничего не подошло
    return '📨 Новое сообщение';
}

bot.on('channel_post', async (ctx) => {
    try {
        const message = ctx.message;
        const channel = ctx.chat;
        
        // Получаем название канала
        const channelName = channel.title || channel.username || 'Telegram канал';
        
        // Получаем текст сообщения (универсально)
        const text = getMessageText(message);
        
        // Получаем ссылку на сообщение
        let link = '';
        if (channel.username) {
            link = `https://t.me/${channel.username}/${message.message_id}`;
        } else {
            link = `https://t.me/c/${channel.id.toString().replace('-100', '')}/${message.message_id}`;
        }
        
        // Отправляем в Discord через вебхук
        await axios.post(DISCORD_WEBHOOK_URL, {
            content: `📢 **${channelName}**\n${text}\n\n🔗 [Открыть в Telegram](${link})`
        });
        
        console.log(`✅ Отправлено сообщение из канала: ${channelName}`);
        
    } catch (error) {
        console.error('❌ Ошибка при отправке:', error.message);
        
        // Дополнительная информация об ошибке
        if (error.response) {
            console.error('Ответ Discord:', error.response.data);
        }
    }
});

// Обработка ошибок бота
bot.catch((err, ctx) => {
    console.error('Ошибка бота:', err);
});

// Запуск бота
bot.launch().then(() => {
    console.log('🤖 Telegram бот запущен!');
}).catch(err => {
    console.error('Ошибка запуска:', err);
});

// Веб-сервер для Render
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(port, () => console.log(`✅ Веб-сервер запущен на порту ${port}`));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
