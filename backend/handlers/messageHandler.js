import { processMessage } from '../services/llmService.js';

/**
 * 
 * @param {import('telegraf').Context} ctx 
 */
export async function messageHandler(ctx) {
  const message = ctx.message;
  const userId = ctx.from.id;
  // const chatId = ctx.chat.id;
  console.log(`📨 Message from user ${userId}: ${message.text}`);
  try {
    // React with processing emoji
    await ctx.react('🤔');
    // Process the message using LLM
    const result = await processMessage({
      messageId: message.message_id,
      fromId: message.from.id,
      chatId: message.chat.id,
      chatType: message.chat.type,
      text: message.text,
      ...(message.reply_to_message && {
        replyToMessageId: message.reply_to_message.message_id,
        replyToMessageFromId: message.reply_to_message.from.id,
        replyToMessageText: message.reply_to_message.text,
      }),
    });
    // console.log(`🏷️  Agent result:`, result);
    // Submit a reaction
    if (result.success) {
      console.error('✅ Successfully processed message:', result.message);
      if (result.modified) {
        if (result.classification.action === 'create') {
          const emoji = getReactionEmoji(result.classification.type);
          await ctx.react(emoji);
        } else {
          await ctx.react('👌');
        }
      } else {
        await ctx.react('');
      }
      if (result.response) {
        await ctx.reply(result.response);
      }
    } else {
      console.error('❌ Error processing message:', result.message);
      await ctx.react('😭');
    }
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
