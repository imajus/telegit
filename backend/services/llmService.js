import OpenAI from 'openai';

export class LLMService {
  constructor(config) {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  async classifyMessage(message) {
    const prompt = `
Analyze the following message and classify it as either a 'bug', 'task', or 'idea'.
Also extract a suitable title and description for a GitHub issue.

Message: "${message}"

Respond with a JSON object in this format:
{
  "type": "bug|task|idea",
  "title": "Brief descriptive title",
  "description": "Detailed description for the issue",
  "labels": ["relevant", "labels"]
}

Classification guidelines:
- bug: Error reports, problems, something not working
- task: Action items, improvements, things to do
- idea: Feature requests, suggestions, brainstorming

Keep the title concise (under 80 characters) and make the description clear and actionable.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ LLM classification error:', error);
      
      // Fallback classification
      return {
        type: 'idea',
        title: 'User Message',
        description: message,
        labels: ['user-input'],
      };
    }
  }
}