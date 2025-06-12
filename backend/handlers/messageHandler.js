import { processMessage } from '../services/llmService.js';
import { uploadTelegramPhotoToS3 } from '../services/s3Service.js';

/**
 *
 * @param {import('telegraf').Context} ctx
 */
export async function messageHandler(ctx) {
  const message = ctx.message;
  const userId = ctx.from.id;
  console.log(
    `📨 Message from user ${userId}: ${message.text || message.caption || '[No Text]'}`
  );
  try {
    await ctx.react('👀');
    //TODO: Upload photo only when necessary via custom tool
    let photoUrls = [];
    if (message.photo) {
      // Get the highest quality photo (last in the array)
      const photo = message.photo[message.photo.length - 1];
      const file = await ctx.telegram.getFile(photo.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_API_TOKEN}/${file.file_path}`;
      const s3Url = await uploadTelegramPhotoToS3(fileUrl);
      photoUrls.push(s3Url);
    }
    // Process the message using LLM
    const result = await processMessage(message.text || message.caption || '', {
      messageId: message.message_id,
      fromId: message.from.id,
      chatId: message.chat.id,
      chatType: message.chat.type,
      photoUrls,
      replyTo: message.reply_to_message
        ? {
            messageId: message.reply_to_message.message_id,
            fromId: message.reply_to_message.from.id,
            text: message.reply_to_message.text,
          }
        : undefined,
    });
    console.log('🤖 Agent response:', result);
  } catch (error) {
    console.error('❌ Error processing message:', error);
    await ctx.react('😭');
    await ctx.reply(
      'Sorry, I encountered an error processing your message. Please try again.'
    );
  }
}
