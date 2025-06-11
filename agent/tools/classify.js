import { tool } from '@openai/agents';
import { z } from 'zod';

export const classifyTool = tool({
  name: 'classify_message',
  description: 'Classify a message and format it for GitHub issue creation',
  parameters: z.object({
    action: z
      .enum(['query', 'create', 'update', 'close'])
      .describe('The action to perform on the GitHub issue'),
    type: z
      .enum(['bug', 'task', 'idea', 'other'])
      .describe('The category of the message'),
    title: z
      .string()
      .max(80)
      .describe('Brief descriptive title for the GitHub issue'),
    description: z
      .string()
      .describe('Detailed description for the GitHub issue')
      .nullable(),
    labels: z.array(z.string()).describe('Relevant labels for the issue').nullable(),
  }),
  execute: async (input) => {
    return {
      action: input.action,
      type: input.type,
      title: input.title,
      description: input.description,
      labels: input.labels,
    };
  },
});