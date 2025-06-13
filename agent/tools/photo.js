import { tool } from '@openai/agents';
import { z } from 'zod';
import { uploadTelegramPhotoToS3 } from '../../backend/services/s3Service.js';
import { TeleGitBot } from '../../backend/bot/index.js';

export const extractPhotoTool = tool({
  name: 'extract_photo',
  description: 'Returns a photo URL.',
  parameters: z.object({}),
  execute: async (params, { context }) => {
    if (context.photoId) {
      try {
        const bot = TeleGitBot.getInstance();
        const filePath = await bot.getFilePath(context.photoId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_API_TOKEN}/${filePath}`;
        return await uploadTelegramPhotoToS3(fileUrl);
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    }
  },
});
