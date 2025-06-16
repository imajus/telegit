import dotenv from 'dotenv';
import sinon from 'sinon';
import { afterAll } from 'vitest';
import {
  getGlobalTraceProvider,
  MCPServerStdio,
  run,
  setDefaultOpenAIKey,
} from '@openai/agents';
import { createEvaluateAgent } from './agent.js';
import { getProcessorAgent } from 'agent/processor.js';

dotenv.config();
setDefaultOpenAIKey(process.env.OPENAI_API_KEY);

afterAll(async () => {
  await getGlobalTraceProvider().shutdown();
});

// search_issues
// {\"type\":\"text\",\"text\":\"{\\\"total_count\\\":0,\\\"incomplete_results\\\":false}\"}

// telegram_responder
// Created issue <a href=\"https://github.com/imajus/telegit/issues/82\">#82</a>

function createFakeIssue({ owner, repo, title, body, labels }) {
  const number = Math.floor(Math.random() * 1000000);
  return {
    'id': 1000000 + Math.floor(Math.random() * 1000000),
    'number': number,
    'state': 'open',
    'locked': false,
    'title': title,
    'body': body,
    'author_association': 'OWNER',
    'user': {
      'login': owner,
      // 'id': 1805633,
      // 'node_id': 'MDQ6VXNlcjE4MDU2MzM=',
      // 'avatar_url': 'https://avatars.githubusercontent.com/u/1805633?v=4',
      // 'html_url': 'https://github.com/imajus',
      // 'gravatar_id': '',
      // 'type': 'User',
      // 'site_admin': false,
      // 'url': 'https://api.github.com/users/imajus',
      // 'events_url': 'https://api.github.com/users/imajus/events{/privacy}',
      // 'following_url':
      //   'https://api.github.com/users/imajus/following{/other_user}',
      // 'followers_url': 'https://api.github.com/users/imajus/followers',
      // 'gists_url': 'https://api.github.com/users/imajus/gists{/gist_id}',
      // 'organizations_url': 'https://api.github.com/users/imajus/orgs',
      // 'received_events_url':
      //   'https://api.github.com/users/imajus/received_events',
      // 'repos_url': 'https://api.github.com/users/imajus/repos',
      // 'starred_url': 'https://api.github.com/users/imajus/starred{/owner}{/repo}',
      // 'subscriptions_url': 'https://api.github.com/users/imajus/subscriptions',
    },
    'labels': labels.map((label) => ({
      'id': Math.floor(Math.random() * 1000000),
      'url': `https://api.github.com/repos/${owner}/${repo}/labels/${label}`,
      'name': label,
      'color': 'd73a4a',
      // 'description': "Something isn't working",
      'default': true,
      // 'node_id': 'LA_kwDOO5Foj88AAAACCfyYFQ',
    })),
    'comments': 0,
    'created_at': '2025-06-14T19:10:22Z',
    'updated_at': '2025-06-14T19:10:22Z',
    'url': `https://api.github.com/repos/${owner}/${repo}/issues/${number}`,
    'html_url': `https://github.com/${owner}/${repo}/issues/${number}`,
    'comments_url': `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`,
    'events_url': `https://api.github.com/repos/${owner}/${repo}/issues/${number}/events`,
    'labels_url': `https://api.github.com/repos/${owner}/${repo}/issues/${number}/labels{/name}`,
    'repository_url': `https://api.github.com/repos/${owner}/${repo}`,
    'reactions': {
      'total_count': 0,
      '+1': 0,
      '-1': 0,
      'laugh': 0,
      'confused': 0,
      'heart': 0,
      'hooray': 0,
      'rocket': 0,
      'eyes': 0,
      'url': `https://api.github.com/repos/${owner}/${repo}/issues/${number}/reactions`,
    },
    // 'node_id': 'I_kwDOO5Foj867jTCL',
  };
}

export async function setupStubs() {
  const result = (data) =>
    Promise.resolve([
      {
        type: 'text',
        text: typeof data === 'string' ? data : JSON.stringify(data),
      },
    ]);
  sinon
    .stub(MCPServerStdio.prototype, 'callTool')
    .returns(result('Unsupported'))
    .withArgs('create_issue')
    .callsFake((toolName, args) => result(createFakeIssue(args)))
    .withArgs('send_message')
    .returns(result('Message sent'));
}

export function restoreStubs() {
  sinon.restore();
}

export function createFakeBot(text) {
  return {
    message: { id: '', text },
    reply: sinon.fake(),
    react: sinon.fake(),
  };
}

/** @param {string} input */
/** @param {*} bot */
/** @param {string[]} rules */
export async function evaluateAgent(input, bot, rules) {
  const agent = await getProcessorAgent();
  const { history, finalOutput } = await run(agent, input, {
    context: { bot },
  });
  const calls = history
    .filter((i) => i.type === 'function_call')
    .map((i) => {
      let result = history.find(
        (j) => j.type === 'function_call_result' && j.callId === i.callId
      )?.output;
      do {
        if (!('text' in result)) {
          break;
        }
        try {
          result = JSON.parse(result.text);
        } catch (e) {
          result = result.text;
          break;
        }
      } while (true);
      return {
        name: i.name,
        arguments: JSON.parse(i.arguments),
        result,
      };
    });
  const evaluator = await createEvaluateAgent(rules);
  const { finalOutput: result } = await run(
    evaluator,
    JSON.stringify({ input, calls, output: finalOutput })
  );
  if (result !== 'OK') {
    throw new Error(result);
  }
}
