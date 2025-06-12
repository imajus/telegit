import { Agent } from '@openai/agents';
import { getTelegramServer } from './mcps/telegram.js';
import { getAgentPrompt } from './templates/index.js';
import { sanitizeTool } from './tools/sanitize.js';

let instance = null;

export async function getTelegramAgent() {
  if (!instance) {
    instance = new Agent({
      name: 'Telegram Responder',
      /**
       *
       * @param {import('@openai/agents').RunContext<import('../backend/services/llmService.js').MessageContext>} context
       * @returns
       */
      instructions: async ({ context }) =>
        getAgentPrompt('responder', {
          ctx: JSON.stringify(context),
        }),
      tools: [sanitizeTool],
      mcpServers: [await getTelegramServer()],
    });
  }
  return instance;
}
