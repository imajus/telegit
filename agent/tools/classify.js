import { tool } from '@openai/agents';
import { z } from 'zod';

function getReactionEmoji(action, type) {
  if (!action) return '';
  if (action === 'create') {
    switch (type) {
      case 'bug':
        return '👾';
      case 'task':
        return '🫡';
      case 'idea':
        return '🦄';
      default:
        return '👌';
    }
  }
  return '👌';
}

export const classifyTool = tool({
  name: 'classify_message',
  description: 'Classify a message and format it for GitHub issue creation',
  parameters: z.object({
    action: z
      .enum(['query', 'create', 'update', 'close'])
      .nullable()
      .describe('The action to perform on the GitHub issue'),
    type: z
      .enum(['bug', 'task', 'idea', 'other'])
      .nullable()
      .describe('The category of the message'),
    title: z
      .string()
      .max(80)
      .describe('Brief descriptive title for the GitHub issue'),
    description: z
      .string()
      .nullable()
      .describe('Detailed description for the GitHub issue'),
    labels: z
      .array(z.string())
      .nullable()
      .describe('Relevant labels for the issue'),
  }),
  execute: async (input, { context }) => {
    const reaction = getReactionEmoji(input.action, input.type);
    await context.bot.react(reaction);
    return {
      action: input.action,
      type: input.type,
      title: input.title,
      description: input.description,
      labels: input.labels,
    };
  },
});
