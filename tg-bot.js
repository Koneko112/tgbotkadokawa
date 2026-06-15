const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.TG_BOT_TOKEN;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!TOKEN || !DISCORD_WEBHOOK_URL) {
    console.error('❌ Ошибка: Укажите TG_BOT_TOKEN и DISCORD_WEBHOOK_URL в .env');
    process.exit(1);
}

const bot = new Telegraf(TOKEN);

// Отслеживаем все сообщения в каналах, где бот администратор
bot.on('channel_post', async (ctx) => {
    try {
        const message = ctx.message;
        const channel = ctx.chat;
        
        // Получаем информацию о канале
        const channelInfo = await ctx.telegram.getChat(channel.id);
        const channelName = channelInfo.title || channel.username || 'Unknown';
        
        let text = '';
        
        // Текстовое сообщение
        if (message.text) {
            text = message.text;
        }
        // Сообщение с подписью к медиа
        else if (message.caption) {
            text = message.caption;
        }
        // Если нет текста
        else {
            text = '(Медиафайл без подписи)';
        }
        
        // Отправляем в Discord через вебхук
        await axios.post(DISCORD_WEBHOOK_URL, {
            content: `📢 **Новое сообщение в Telegram!**\n📱 Канал: **${channelName}**\n\n${text}\n\n🔗 [Открыть в Telegram](https://t.me/${channel.username || channel.id}/${message.message_id})`
        });
        
        console.log(`✅ Отправлено сообщение из ${channelName} в Discord`);
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
});

// Команда для проверки работы бота
bot.command('start', (ctx) => {
    ctx.reply('✅ Бот работает! Добавьте меня в ваш канал как администратора.');
});

bot.launch();
console.log('🤖 Telegram бот запущен!');

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));