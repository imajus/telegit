import { GitHubService } from '../services/githubService.js';

export async function reactionHandler(ctx, config) {
  const reaction = ctx.messageReaction;
  const userId = ctx.from.id;
  
  // Only process reactions from the original message author
  if (reaction.user.id !== userId) {
    return;
  }

  const emoji = reaction.new_reaction?.[0]?.emoji;
  
  if (!emoji) {
    return;
  }

  console.log(`👆 User ${userId} reacted with: ${emoji}`);

  try {
    switch (emoji) {
      case '👍':
        await handleApproval(ctx, reaction);
        break;
      case '👎':
        await handleRejection(ctx, reaction);
        break;
      case '💩':
        await handleCancellation(ctx, reaction);
        break;
    }
  } catch (error) {
    console.error('❌ Error handling reaction:', error);
  }
}

async function handleApproval(ctx, reaction) {
  console.log('✅ User approved the GitHub issue');
  // TODO: Mark issue as approved, delete the original message
  // For now, just log the approval
}

async function handleRejection(ctx, reaction) {
  console.log('❌ User rejected the GitHub issue');
  // TODO: Delete the GitHub issue and retry with better analysis
  // const githubService = new GitHubService();
  // await githubService.deleteIssue(issueNumber);
}

async function handleCancellation(ctx, reaction) {
  console.log('🛑 User cancelled the action');
  // TODO: Delete the GitHub issue and stop retrying
  // const githubService = new GitHubService();
  // await githubService.deleteIssue(issueNumber);
}