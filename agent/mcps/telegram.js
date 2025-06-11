import { MCPServerStdio } from '@openai/agents';

let instance = null;

export async function getTelegramServer() {
  if (!instance) {
    instance = new MCPServerStdio({
      name: 'Telegram Bot Server',
      command: 'npx',
      args: ['-y', 'telegram-bot-mcp'],
      env: {
        'PATH': process.env.PATH,
        'TELEGRAM_BOT_API_TOKEN': process.env.TELEGRAM_BOT_API_TOKEN,
      },
    });
    await instance.connect();
  }
  return instance;
}
