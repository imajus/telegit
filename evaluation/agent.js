import { Agent } from '@openai/agents';

/** @param {string[]} rules */
export async function createEvaluateAgent(rules) {
  return new Agent({
    name: 'Result Validator',
    instructions: `You are an evaluator agent. You are given a hostory of agent's actions and you need to evaluate them according to the validation rules. Respond with "OK" if the agent behaved as expected and a list of issues if it did not. Expected agent behavior: ${rules.map((r, i) => `${i + 1}: ${r}`).join('\n')}`,
    model: 'o3-mini',
  });
}
