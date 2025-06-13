import { run } from '@openai/agents';
import { getProcessorAgent } from '../../agent/processor.js';

export async function processMessage(message, context) {
  const result = await run(await getProcessorAgent(), message, { context });
  return result.finalOutput;
}
