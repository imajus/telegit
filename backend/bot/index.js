import { Telegraf } from 'telegraf';
import { messageHandler } from '../handlers/messageHandler.js';

const ALLOWED_TELEGRAM_GROUPS = process.env.ALLOWED_TELEGRAM_GROUPS?.trim();
const ALLOWED_TELEGRAM_USERS = process.env.ALLOWED_TELEGRAM_USERS?.trim();

function skipBotMessages(ctx, next) {
  if (ctx.from?.is_bot) {
    console.log('🤖 Skipping message from bot');
    return;
  }
  return next();
}

function checkAllowedSender(ctx, next) {
  if (ALLOWED_TELEGRAM_GROUPS) {
    const chatId = ctx.chat.id.toString();
    const allowedGroups = ALLOWED_TELEGRAM_GROUPS.split(',').map((id) =>
      id.trim()
    );
    const isGroupChat = ['group', 'supergroup'].includes(ctx.chat.type);
    if (isGroupChat && !allowedGroups.includes(chatId)) {
      console.log(`❌ Message from unauthorized group ${chatId}`);
      return;
    }
  }
  if (ALLOWED_TELEGRAM_USERS) {
    const allowedUsers = ALLOWED_TELEGRAM_USERS.split(',').map((id) =>
      id.trim()
    );
    const userId = ctx.from.id.toString();
    if (!allowedUsers.includes(userId)) {
      console.log(`❌ Message from unauthorized user ${userId}`);
      return;
    }
  }
  return next();
}

export class TeleGitBot {
  constructor(telegramBotToken) {
    this.bot = new Telegraf(telegramBotToken);
    this.setupHandlers();
  }

  setupHandlers() {
    this.bot.start((ctx) => {
      ctx.reply(
        '🤖 Welcome to TeleGit! I help turn your messages into GitHub issues.\n\n' +
          "Just send me your ideas, bugs, or tasks and I'll process them with AI magic! ✨"
      );
    });

    this.bot.help((ctx) => {
      ctx.reply(
        '📋 How to use TeleGit:\n\n' +
          "1. Send any message with an idea, bug report, or task. I'll analyze it and create a GitHub issue.\n" +
          '2. I can update existing GitHub issues. Reply to a message used to create the issue and request changes.\n' +
          '3. You may reply to the message used to create the issue and ask for its status.\n' +
          '4. Generic analytics: query for how many open issues there are, how many are assigned to you, etc.\n\n' +
          'Status reactions:\n' +
          '🤔 Processing...\n' +
          '👾 Bug recorded\n' +
          '🫡 Task issued\n' +
          '🦄 Idea logged\n' +
          '👌 No action needed\n' +
          '😭 Something went wrong...'
      );
    });

    this.bot.use(skipBotMessages);
    this.bot.use(checkAllowedSender);
    this.bot.on('message', messageHandler);
  }

  async launch() {
    try {
      await this.bot.launch();
      console.log('🚀 TeleGit bot is running...');
    } catch (error) {
      console.error('❌ Failed to launch bot:', error);
      throw error;
    }
  }

  stop(signal) {
    console.log(`🛑 Stopping bot on ${signal}`);
    this.bot.stop(signal);
  }
}
