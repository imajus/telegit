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

function skipMessagesWithoutTextOrPhoto(ctx, next) {
  const hasText = ctx.message?.text;
  const hasPhoto = ctx.message?.photo;
  if (!hasText && !hasPhoto) {
    console.log('📎 Skipping message without text or photo');
    return;
  }
  return next();
}

function filterRelevantMessages(ctx, next) {
  const isPrivateChat = ctx.chat.type === 'private';
  if (isPrivateChat) {
    console.log('💬 Private message - processing');
    return next();
  }
  const isGroupChat = ['group', 'supergroup'].includes(ctx.chat.type);
  if (isGroupChat) {
    const messageText = ctx.message?.text || ctx.message?.caption || '';
    const botUsername = ctx.botInfo?.username;
    const isBotMentioned =
      ctx.message?.entities?.some(
        (entity) =>
          entity.type === 'mention' &&
          messageText.substring(
            entity.offset,
            entity.offset + entity.length
          ) === `@${botUsername}`
      ) || messageText.includes(`@${botUsername}`);
    const relevantHashtags = ['#idea', '#bug', '#todo', '#plan', '#act'];
    const hasRelevantHashtag = relevantHashtags.some((hashtag) =>
      messageText.toLowerCase().includes(hashtag)
    );
    const isReplyToBotMessage =
      ctx.message?.reply_to_message?.from?.id === ctx.botInfo?.id;
    if (isBotMentioned || hasRelevantHashtag || isReplyToBotMessage) {
      console.log('🎯 Relevant group message - processing');
      return next();
    }
    console.log('🔇 Ignoring irrelevant group message');
    return;
  }
  console.log('🔇 Ignoring message from unknown chat type');
  return;
}

export class TeleGitBot {
  static #instance = null;

  constructor(telegramBotToken) {
    this.bot = new Telegraf(telegramBotToken);
    this.setupHandlers();
  }

  static getInstance() {
    if (!TeleGitBot.#instance) {
      TeleGitBot.#instance = new TeleGitBot(process.env.TELEGRAM_BOT_API_TOKEN);
    }
    return TeleGitBot.#instance;
  }

  setupHandlers() {
    this.bot.start((ctx) => {
      ctx.reply(
        '🤖 Welcome to TeleGit! I help turn your messages into GitHub issues.\n\n' +
          'What I can do:\n' +
          '1. Analyze your messages and create GitHub issues\n' +
          '2. Update existing issues when you reply to my messages\n' +
          '3. Provide status updates on existing issues\n' +
          '4. Answer analytics queries about your GitHub repository\n\n' +
          "Just send me your ideas, bugs, or tasks and I'll process them with AI magic! ✨\n\n" +
          'Type /help for detailed instructions on how to use me.'
      );
    });

    this.bot.help((ctx) => {
      ctx.reply(
        '📋 How to use TeleGit:\n\n' +
          "I'll process your messages and create GitHub issues when you:\n" +
          '• Send me a private message\n' +
          '• Mention me (@' +
          ctx.botInfo?.username +
          ') in a group\n' +
          '• Use hashtags: #idea, #bug, #todo, #plan, or #act in a group\n' +
          '• Reply to any of my messages in a group\n\n' +
          'Status reactions:\n' +
          '👀 Processing...\n' +
          '👾 Bug recorded\n' +
          '🫡 Task issued\n' +
          '🦄 Idea logged\n' +
          '👌 Done something else'
      );
    });

    this.bot.use(skipBotMessages);
    this.bot.use(checkAllowedSender);
    this.bot.use(skipMessagesWithoutTextOrPhoto);
    this.bot.use(filterRelevantMessages);
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

  async getFilePath(fileId) {
    const file = await this.bot.telegram.getFile(fileId);
    return file.file_path;
  }
}
