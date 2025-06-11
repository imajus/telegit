import { run } from '@openai/agents';
import { getProcessorAgent } from '../../agent/agent.js';

/** 
 * @typedef {object} ProcessMessageResult
 * @prop {boolean} success
 * @prop {boolean} modified
 * @prop {object} classification
 * @prop {string} classification.type
 * @prop {string} classification.title
 * @prop {string} classification.description
 * @prop {string[]} classification.labels
 * @prop {string} message
 * @prop {string} [response]
 */

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
  const result = await run(await getProcessorAgent(), JSON.stringify(message));
  return result.finalOutput;
  // const classification = result.output.find(item => item.type === 'function_call_result' && item.name === 'classify_message');
  // return {
  //   ...result.finalOutput,
  //   classification: classification ? JSON.parse(classification.output.text) : null,
  // };
}
