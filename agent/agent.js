import { Agent } from '@openai/agents';
import { z } from 'zod';
import { classifyTool } from './tools/classify.js';
import { getGitHubServer } from './mcps/github.js';

let instance = null;

export async function getTeleGitAgent() {
  if (!instance) {
    instance = new Agent({
      name: 'TeleGit Message Processor',
      instructions: `
You are a message processor for the TeleGit bot. Your job is to analyze user messages and use the tools to perform appropriate actions.

You will be given a JSON containing all message details according to the following schema:

{
  "messageId": "number",
  "fromId": "number",
  "chatId": "number",
  "chatType": "string", // One of: "private", "group", "supergroup", "channel"
  "text": "string",
  "replyToMessageId": "number", // Optional
  "replyToMessageFromId": "number", // Optional
  "replyToMessageText": "string", // Optional
}

Classification guidelines:
- bug: Error reports, problems, something not working
- task: Action items, improvements, things to do  
- idea: Feature requests, suggestions, brainstorming
- other: Anything else

For each message:
1. Use the classify_message tool to build a structure:
  - GitHub issues action (query/create/update/delete)
  - For create/update actions only:
    - Category (bug/task/idea/other)
    - Concise title (under 80 characters)
    - Clear, actionable description
    - Relevant labels, one or many of: "bug", "documentation", "enhancement", "good first issue", "help wanted", "invalid", "question", "wontfix" 
1. Call the GitHub Server tools for:
  - Searching current issues to prevent duplicates
  - Performing the desired action: create/update
  - If delete is requested, call update_issue with state argument set to "closed"

For the GitHub Server tool calls, use the following data:

- Repository owner: ${process.env.GITHUB_REPOSITORY_OWNER}
- Repository name: ${process.env.GITHUB_REPOSITORY_NAME}

Respond with a status flag and a short summary of performed actions or error details.
If no action has to be taken, consider this as success but set "modified" to false.

If user has requested a response, include it in the "response" field.
      `.trim(),
      outputType: z.object({
        success: z.boolean(),
        modified: z.boolean(),
        message: z.string(),
        response: z.string().nullable(),
      }),
      tools: [classifyTool],
      mcpServers: [await getGitHubServer()],
    });
  }
  return instance;
}
