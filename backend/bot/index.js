import { Telegraf } from 'telegraf';
import { messageHandler } from '../handlers/messageHandler.js';
import { reactionHandler } from '../handlers/reactionHandler.js';

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
          '1. Send any message with an idea, bug report, or task\n' +
          "2. I'll analyze it and create a GitHub issue\n" +
          '3. React with 👍 to approve or 👎 to reject\n' +
          '4. Use 💩 to cancel and stop retrying\n\n' +
          'Status reactions:\n' +
          '🤔 Processing...\n' +
          '👾 Bug recorded\n' +
          '🫡 Task updated\n' +
          '🦄 Idea logged'
      );
    });

    this.bot.on('message', messageHandler);
    this.bot.on('message_reaction', reactionHandler);
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
