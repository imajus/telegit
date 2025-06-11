import { Agent } from '@openai/agents';
import { z } from 'zod';
import { classifyTool } from './tools/classify.js';
import { getGitHubServer } from './mcps/github.js';
import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let instance = null;

export async function getTeleGitAgent() {
  if (!instance) {
    const templatePath = join(__dirname, 'templates', 'agent-prompt.hbs');
    const templateContent = await readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    const instructions = template({
      githubRepositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
      githubRepositoryName: process.env.GITHUB_REPOSITORY_NAME
    });
    instance = new Agent({
      name: 'TeleGit Message Processor',
      instructions: instructions.trim(),
      outputType: z.object({
        success: z.boolean(),
        modified: z.boolean(),
        message: z.string(),
      }),
      tools: [classifyTool],
      mcpServers: [await getGitHubServer()],
    });
  }
  return instance;
}
