import { processMessage } from '../services/llmService.js';
import { uploadTelegramPhotoToS3 } from '../services/s3Service.js';

/**
 * 
 * @param {import('telegraf').Context} ctx 
 */
export async function messageHandler(ctx) {
  const message = ctx.message;
  const userId = ctx.from.id;
  // const chatId = ctx.chat.id;
  console.log(`📨 Message from user ${userId}: ${message.text || message.caption ||'[No Text]'}`);
  try {
    // React with processing emoji
    await ctx.react('🤔');
    
    // Handle photo message
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
    const result = await processMessage({
      messageId: message.message_id,
      fromId: message.from.id,
      chatId: message.chat.id,
      chatType: message.chat.type,
      text: message.text || message.caption || '',
      photoUrls,
      ...(message.reply_to_message && {
        replyToMessageId: message.reply_to_message.message_id,
        replyToMessageFromId: message.reply_to_message.from.id,
        replyToMessageText: message.reply_to_message.text,
      }),
    });
    console.error('🤖 Agent response:', result);
    // Submit a reaction
    // if (result.success) {
    //   console.error('✅ Successfully processed message:', result.message);
    //   if (result.modified) {
    //     if (result.classification?.action === 'create') {
    //       const emoji = getReactionEmoji(result.classification.type);
    //       await ctx.react(emoji);
    //     } else {
    //       await ctx.react('👌');
    //     }
    //   } else {
    //     await ctx.react('');
    //   }
    //   await ctx.reply(result.message);
    // } else {
    //   console.error('❌ Error processing message:', result.message);
    //   await ctx.react('😭');
    // }
  } catch (error) {
    console.error('❌ Error processing message:', error);
    await ctx.react('😭');
    await ctx.reply(
      'Sorry, I encountered an error processing your message. Please try again.'
    );
  }
}

// Supported: 
// "👍" | "👎" | "❤" | "🔥" | "🥰" | "👏" | "😁" | "🤔" | "🤯" | "😱" | "🤬" | "😢" | "🎉" | "🤩" | "🤮" | "💩" | "🙏" | "👌" | "🕊" | "🤡" | "🥱" | "🥴" | "😍" | "🐳" | "❤‍🔥" | "🌚" | "🌭" | "💯" | "🤣" | "⚡" | "🍌" | "🏆" | "💔" | "🤨" | "😐" | "🍓" | "🍾" | "💋" | "🖕" | "😈" | "😴" | "😭" | "🤓" | "👻" | "👨‍💻" | "👀" | "🎃" | "🙈" | "😇" | "😨" | "🤝" | "✍" | "🤗" | "🫡" | "🎅" | "🎄" | "☃" | "💅" | "🤪" | "🗿" | "🆒" | "💘" | "🙉" | "🦄" | "😘" | "💊" | "🙊" | "😎" | "👾" | "🤷‍♂" | "🤷" | "🤷‍♀" | "😡"

function getReactionEmoji(type) {
  switch (type) {
    case 'bug':
      return '👾';
    case 'task':
      return '🫡';
    case 'idea':
      return '🦄';
    default:
      // Fallback to a neutral emoji
      return '👌';
  }
}
