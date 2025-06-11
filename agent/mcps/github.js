import { MCPServerStdio } from '@openai/agents';

let instance = null;

export async function getGitHubServer() {
  if (!instance) {
    instance = new MCPServerStdio({
      name: 'GitHub Server',
      command: 'docker',
      args: [
        'run',
        '-i',
        '--rm',
        '-e',
        `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.GITHUB_ACCESS_TOKEN}`,
        '-e',
        'GITHUB_TOOLSETS=issues',
        'ghcr.io/github/github-mcp-server',
      ],
    });
    await instance.connect();
  }
  return instance;
}
