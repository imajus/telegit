import { Agent } from '@openai/agents';
import { getTelegramServer } from './mcps/telegram.js';
import { getAgentPrompt } from './templates/index.js';

let instance = null;

export async function getTelegramAgent() {
  if (!instance) {
    const instructions = await getAgentPrompt('responder', {});
    instance = new Agent({
      name: 'Telegram Responder',
      instructions,
      mcpServers: [await getTelegramServer()],
    });
  }
  return instance;
}