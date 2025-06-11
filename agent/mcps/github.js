import { MCPServerStdio } from '@openai/agents';

let instance = null;

export async function getGitHubServer() {
  if (!instance) {
    const options = { name: 'GitHub Server' };
    if (process.env.NODE_ENV === 'production') {
      options.command = 'github-mcp-server';
      options.args = ['stdio'];
      options.env = {
        'GITHUB_PERSONAL_ACCESS_TOKEN': process.env.GITHUB_ACCESS_TOKEN,
        'GITHUB_TOOLSETS': 'issues',
      };
    } else {
      options.command = 'docker';
      options.args = [
        'run',
        '-i',
        '--rm',
        '-e',
        `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.GITHUB_ACCESS_TOKEN}`,
        '-e',
        'GITHUB_TOOLSETS=issues',
        'ghcr.io/github/github-mcp-server',
      ];
    }
    instance = new MCPServerStdio(options);
    await instance.connect();
  }
  return instance;
}
