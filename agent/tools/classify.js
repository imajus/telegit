import { tool } from '@openai/agents';
import { z } from 'zod';

export const classifyTool = tool({
  name: 'classify_message',
  description: 'Classify a message and format it for GitHub issue creation',
  parameters: z.object({
    type: z
      .enum(['bug', 'task', 'idea'])
      .describe('The category of the message'),
    title: z
      .string()
      .max(80)
      .describe('Brief descriptive title for the GitHub issue'),
    description: z
      .string()
      .describe('Detailed description for the GitHub issue'),
    labels: z.array(z.string()).describe('Relevant labels for the issue'),
  }),
  execute: async (input) => {
    return {
      type: input.type,
      title: input.title,
      description: input.description,
      labels: input.labels,
    };
  },
});