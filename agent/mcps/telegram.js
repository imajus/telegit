import { MCPServerStdio } from '@openai/agents';

let instance = null;

export async function getTelegramServer() {
  if (!instance) {
    instance = new MCPServerStdio({
      name: 'Telegram Bot Server',
      command: 'npx',
      args: ['-y', 'telegram-bot-mcp'],
    });
    await instance.connect();
  }
  return instance;
}
