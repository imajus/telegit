import dotenv from 'dotenv';
import { setDefaultOpenAIKey } from '@openai/agents';
import { TeleGitBot } from './bot/index.js';

// Load environment variables first
dotenv.config();

async function main() {
  console.log('🚀 Starting TeleGit backend...');

  // Validate environment variables
  const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'OPENAI_API_KEY',
    'GITHUB_ACCESS_TOKEN',
    'GITHUB_REPOSITORY_OWNER',
    'GITHUB_REPOSITORY_NAME',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    process.exit(1);
  }

  // Initialize OpenAI agents globally
  setDefaultOpenAIKey(process.env.OPENAI_API_KEY);

  try {
    const bot = new TeleGitBot(process.env.TELEGRAM_BOT_TOKEN);
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
