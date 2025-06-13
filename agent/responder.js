import { Agent } from '@openai/agents';
import { getTelegramServer } from './mcps/telegram.js';
import { getAgentPrompt } from './templates/index.js';
import { sanitizeTool } from './tools/sanitize.js';

let instance = null;

export async function getResponderAgent() {
  if (!instance) {
    instance = new Agent({
      name: 'Telegram Responder',
      instructions: async ({ context }) => {
        const message = context.bot.message;
        const ctx = {
          messageId: message.message_id,
          fromId: message.from.id,
          chatId: message.chat.id,
          chatType: message.chat.type,
          replyTo: message.reply_to_message
            ? {
                messageId: message.reply_to_message.message_id,
                fromId: message.reply_to_message.from.id,
                text: message.reply_to_message.text,
              }
            : undefined,
        };
        return getAgentPrompt('responder', { ctx: JSON.stringify(ctx) });
      },
      tools: [sanitizeTool],
      mcpServers: [await getTelegramServer()],
      // modelSettings: {
      //   toolChoice: 'required',
      // },
    });
  }
  return instance;
}
