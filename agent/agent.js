import { Agent, handoff } from '@openai/agents';
import { classifyTool } from './tools/classify.js';
import { getGitHubServer } from './mcps/github.js';
import { getAgentPrompt } from './templates/index.js';
import { getTelegramAgent } from './responder.js';
import { z } from 'zod';

let instance = null;

export async function getProcessorAgent() {
  if (!instance) {
    const instructions = await getAgentPrompt('processor', {
      githubRepositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
      githubRepositoryName: process.env.GITHUB_REPOSITORY_NAME,
    });
    instance = new Agent({
      name: 'Telegram Message Processor',
      instructions,
      tools: [classifyTool],
      mcpServers: [await getGitHubServer()],
      handoffs: [
        handoff(await getTelegramAgent(), {
          onHandoff: () => {}, //XXX: Why this is enforced?
          inputType: z.object({
            messageId: z.number(),
            chatId: z.number(),
            chatType: z.string(),
            response: z.string(),
          }),
        }),
      ],
    });
  }
  return instance;
}
