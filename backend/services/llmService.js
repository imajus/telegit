import { run } from '@openai/agents';
import { getProcessorAgent } from '../../agent/processor.js';

export async function processMessage(message, context) {
  return run(await getProcessorAgent(), message, { context });
}
