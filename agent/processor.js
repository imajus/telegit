import { Agent } from '@openai/agents';
import { classifyTool } from './tools/classify.js';
import { getGitHubServer } from './mcps/github.js';
import { getAgentPrompt } from './templates/index.js';
import { getResponderAgent } from './responder.js';
import { TeleGitBot } from '../backend/bot/index.js';
import { uploadTelegramPhotoToS3 } from '../backend/services/s3Service.js';

let instance = null;

function getBestImage(message) {
  if (message.photo) {
    return message.photo[message.photo.length - 1];
  }
  return null;
}

async function extractImageUrl(message) {
  const imageId = getBestImage(message)?.file_id;
  //TODO: Think of how to handle replyTo images
  // getBestPhoto(message.reply_to_message)?.file_id,
  if (imageId) {
    try {
      const bot = TeleGitBot.getInstance();
      const filePath = await bot.getFilePath(imageId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_API_TOKEN}/${filePath}`;
      return await uploadTelegramPhotoToS3(fileUrl);
    } catch (error) {
      console.error('❌ Error uploading photo:', error);
    }
  }
}

export async function getProcessorAgent() {
  if (!instance) {
    instance = new Agent({
      name: 'Telegram Message Processor',
      instructions: async ({ context }) =>
        getAgentPrompt('processor', {
          githubRepositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
          githubRepositoryName: process.env.GITHUB_REPOSITORY_NAME,
          image: await extractImageUrl(context.bot.message),
        }),
      tools: [
        classifyTool,
        (await getResponderAgent()).asTool({
          toolName: 'telegram_responder',
          toolDescription: 'Respond to messages in Telegram.',
        }),
      ],
      mcpServers: [await getGitHubServer()],
      // modelSettings: {},
    });
  }
  return instance;
}
