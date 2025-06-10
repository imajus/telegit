import { LLMService } from '../services/llmService.js';

export class MessageClassifier {
  constructor(config) {
    this.llmService = new LLMService(config);
  }

  async classify(message) {
    console.log('🤖 Classifying message with LLM...');
    return await this.llmService.classifyMessage(message);
  }

  validateClassification(classification) {
    const validTypes = ['bug', 'task', 'idea'];
    
    return {
      type: validTypes.includes(classification.type) ? classification.type : 'idea',
      title: classification.title || 'User Message',
      description: classification.description || classification.title || 'No description provided',
      labels: Array.isArray(classification.labels) ? classification.labels : ['user-input'],
    };
  }
}