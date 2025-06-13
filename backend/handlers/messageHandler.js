import { processMessage } from '../services/llmService.js';

/**
 *
 * @param {import('telegraf').Context} ctx
 */
export async function messageHandler(ctx) {
  const text = ctx.message.text || ctx.message.caption;
  const userId = ctx.from.id;
  console.log(`📨 Message from user ${userId}: ${text || '[No Text]'}`);
  try {
    await ctx.react('👀');
    // Process the message using LLM
    const result = await processMessage(text || '', {
      bot: ctx,
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
