import { tool } from '@openai/agents';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

export const sanitizeTool = tool({
  name: 'sanitize_message',
  description:
    'Sanitize HTML message by removing all tags except whitelisted ones.',
  parameters: z.object({
    message: z.string().describe('The HTML message to sanitize'),
  }),
  execute: async (input) => {
    const { message } = input;
    const messageWithLineBreaks = message.replace(/<br\s*\/?>/gi, '\n');
    const sanitized = sanitizeHtml(messageWithLineBreaks, {
      allowedTags: ['b', 'i', 'u', 's', 'a'],
      allowedAttributes: {
        'a': ['href', 'title'],
      },
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    });
    return {
      original: message,
      sanitized: sanitized,
    };
  },
});
