import { Agent } from '@openai/agents';
import { getAgentPrompt } from './templates/index.js';
import { sanitizeTool } from './tools/sanitize.js';
import { respondTool } from './tools/respond.js';

let instance = null;

export async function getResponderAgent() {
  if (!instance) {
    instance = new Agent({
      name: 'Telegram Responder',
      instructions: () => getAgentPrompt('responder'),
      tools: [sanitizeTool, respondTool],
    });
  }
  return instance;
}
