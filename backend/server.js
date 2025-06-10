import dotenv from 'dotenv';
import { TeleGitBot } from './bot/index.js';

// Load environment variables first
dotenv.config();

async function main() {
  console.log('🚀 Starting TeleGit backend...');

  // Validate environment variables
  const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'OPENAI_API_KEY',
    'GITHUB_PERSONAL_ACCESS_TOKEN',
    'GITHUB_REPOSITORY',
    'MCP_SERVER_HOST'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    process.exit(1);
  }

  try {
    // Extract environment variables
    const config = {
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
      openaiApiKey: process.env.OPENAI_API_KEY,
      githubToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      githubRepository: process.env.GITHUB_REPOSITORY,
      mcpServerHost: process.env.MCP_SERVER_HOST,
      allowedGroups: process.env.ALLOWED_TELEGRAM_GROUPS?.split(',').filter(Boolean) || [],
      allowedUsers: process.env.ALLOWED_TELEGRAM_USERS?.split(',').filter(Boolean) || [],
    };

    const bot = new TeleGitBot(config);
    await bot.launch();

    // Graceful shutdown
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

  } catch (error) {
    console.error('❌ Failed to start TeleGit bot:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});