import { run } from '@openai/agents';
import { getTeleGitAgent } from '../../agent/agent.js';

/**
 * 
 * @param {*} message 
 * @param {number} message.messageId
 * @param {number} message.fromId
 * @param {number} message.chatId
 * @param {string} message.chatType - One of: "private", "group", "supergroup", "channel"
 * @param {string} message.text
 * @returns 
 */
export async function processMessage(message) {
  const result = await run(await getTeleGitAgent(), JSON.stringify(message));
  const classifyResult = result.output.find(item => item.type === 'function_call_result' && item.name === 'classify_message');
  return {
    output: result.finalOutput,
    classification: classifyResult
      ? JSON.parse(classifyResult.output.text)
      : null,
  };
}
