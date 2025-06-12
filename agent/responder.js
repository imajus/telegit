import { Agent } from '@openai/agents';
import { getTelegramServer } from './mcps/telegram.js';
import { getAgentPrompt } from './templates/index.js';
import { sanitizeTool } from './tools/sanitize.js';

let instance = null;

export async function getTelegramAgent() {
  if (!instance) {
    const instructions = await getAgentPrompt('responder', {});
    instance = new Agent({
      name: 'Telegram Responder',
      instructions,
      tools: [sanitizeTool],
      mcpServers: [await getTelegramServer()],
    });
  }
  return instance;
}
