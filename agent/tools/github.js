import { MCPServerStdio } from '@openai/agents';

export const gitHubTool = new MCPServerStdio({
  name: 'github_tool',
  command: 'docker',
  args: [
    'run',
    '-i',
    '--rm',
    '-e',
    `GITHUB_PERSONAL_ACCESS_TOKEN="${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}"`,
    //TODO: Uncomment once this issue is resolved: https://github.com/github/github-mcp-server/issues/396
    // '-e',
    // 'GITHUB_TOOLSETS="issues"',
    'ghcr.io/github/github-mcp-server',
  ],
});

await gitHubTool.connect();
