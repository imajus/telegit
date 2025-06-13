import { Agent /* , handoff */ } from '@openai/agents';
import { classifyTool } from './tools/classify.js';
import { extractPhotoTool } from './tools/photo.js';
import { getGitHubServer } from './mcps/github.js';
import { getAgentPrompt } from './templates/index.js';
import { getTelegramAgent } from './responder.js';

let instance = null;

export async function getProcessorAgent() {
  if (!instance) {
    instance = new Agent({
      name: 'Telegram Message Processor',
      instructions: async ({ context }) =>
        getAgentPrompt('processor', {
          githubRepositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
          githubRepositoryName: process.env.GITHUB_REPOSITORY_NAME,
          photoId: context.photoId ?? 'N/A',
        }),
      tools: [
        classifyTool,
        extractPhotoTool,
        (await getTelegramAgent()).asTool({
          toolName: 'telegram_responder',
          toolDescription: 'Respond or react to the user messages in Telegram.',
        }),
      ],
      mcpServers: [await getGitHubServer()],
    });
  }
  return instance;
}
