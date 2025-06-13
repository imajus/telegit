import { processMessage } from '../services/llmService.js';

function getBestPhoto(message) {
  if (message.photo) {
    return message.photo[message.photo.length - 1];
  }
  return null;
}

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
    // Process the message using LLM
    const result = await processMessage(message.text || message.caption || '', {
      messageId: message.message_id,
      fromId: message.from.id,
      chatId: message.chat.id,
      chatType: message.chat.type,
      photoId: getBestPhoto(message)?.file_id,
      replyTo: message.reply_to_message
        ? {
            messageId: message.reply_to_message.message_id,
            fromId: message.reply_to_message.from.id,
            text: message.reply_to_message.text,
            //TODO: Think of how to handle replyTo photo files
            // photoId: getBestPhoto(message.reply_to_message)?.file_id,
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
