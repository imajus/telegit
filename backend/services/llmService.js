import { run } from '@openai/agents';
import { getProcessorAgent } from '../../agent/agent.js';

/**
 * @typedef {Object} MessageContext
 * @prop {string} context.messageId
 * @prop {string} context.fromId
 * @prop {string} context.chatId
 * @prop {string} context.chatType
 * @prop {string[]} [context.photoUrls]
 * @prop {object} [context.replyTo]
 * @prop {string} context.replyTo.messageId
 * @prop {string} context.replyTo.fromId
 * @prop {string} context.replyTo.text
 */

/**
 *
 * @param {string} message
 * @param {Context} context
 * @returns
 */
export async function processMessage(message, context) {
  const result = await run(await getProcessorAgent(), message, { context });
  return result.finalOutput;
}
