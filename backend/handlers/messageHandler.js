import { LLMService } from '../services/llmService.js';
import { GitHubService } from '../services/githubService.js';
import { MessageClassifier } from '../utils/messageClassifier.js';

export async function messageHandler(ctx, config) {
  const message = ctx.message.text;
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  console.log(`📨 Message from user ${userId}: ${message}`);

  try {
    // React with processing emoji
    await ctx.react('🤔');

    // Classify the message using LLM
    const classifier = new MessageClassifier(config);
    const classification = await classifier.classify(message);

    console.log(`🏷️ Classification:`, classification);

    // Create GitHub issue
    const githubService = new GitHubService(config);
    const issue = await githubService.createIssue(classification);

    // React with appropriate emoji based on classification
    const reactionEmoji = getReactionEmoji(classification.type);
    await ctx.react(reactionEmoji);

    // Store the issue reference for potential user feedback
    // TODO: Implement temporary storage for user reactions
    console.log(`✅ Created GitHub issue: ${issue.html_url}`);

  } catch (error) {
    console.error('❌ Error processing message:', error);
    await ctx.react('❌');
    await ctx.reply('Sorry, I encountered an error processing your message. Please try again.');
  }
}

function getReactionEmoji(type) {
  switch (type) {
    case 'bug':
      return '👾';
    case 'task':
      return '🫡';
    case 'idea':
      return '🦄';
    default:
      return '✅';
  }
}