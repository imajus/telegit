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
    });
    console.log(`🏷️ Result:`, result);
    // Submit a reaction
    if (result.classification) {
      const emoji = getReactionEmoji(result.classification.type);
      if (emoji) {
        await ctx.react(emoji);
      } else {
        // Fallback to a neutral emoji
        await ctx.react('😴');
      }
    } else {
      // Remove previously added reaction
      await ctx.react('');
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
      return null
  }
}
