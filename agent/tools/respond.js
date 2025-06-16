import { tool } from '@openai/agents';
import { z } from 'zod';

export const respondTool = tool({
  name: 'respond_in_telegram',
  description: 'Respond in Telegram to the message.',
  parameters: z.object({
    message: z.string().describe('HTML message to send'),
  }),
  execute: async (input, { context }) => {
    const { bot } = context;
    await bot.reply(input);
    return 'Message sent';
  },
});
