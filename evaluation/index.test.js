import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  setupStubs,
  createFakeBot,
  evaluateAgent,
  restoreStubs,
} from './utils.js';

describe('AI Agent Evaluation', () => {
  beforeEach(async () => {
    await setupStubs();
  });

  afterEach(async () => {
    restoreStubs();
  });

  test('should not use tools for unrelated inputs', async () => {
    const text = 'Hello, can you help me understand how this AI agent works?';
    const bot = createFakeBot(text);
    await evaluateAgent(text, bot, [
      'responded that the action is not resolved',
      'did not call create_issue tool',
      'did not call respond_to_message tool',
    ]);
  });

  test('should handle simple bug report', async () => {
    const text = 'Fix the button bug';
    const bot = createFakeBot(text);
    await evaluateAgent(text, bot, [
      'called create_issue tool',
      'create_issue call "title" attribute contains "button"',
      'create_issue call "body" attribute contains "button"',
      'create_issue call "labels" attribute contains "bug"',
      'create_issue call did not return error',
      'called respond_to_message tool',
      'respond_to_message call input contains "Created issue" and the issue number',
      'respond_to_message call did not return error',
    ]);
  });

  test('should handle simple feature request', async () => {
    const text = 'Add a progress bar';
    const bot = createFakeBot(text);
    await evaluateAgent(text, bot, [
      'called create_issue tool',
      'create_issue call "title" attribute contains "progress bar"',
      'create_issue call "body" attribute contains "progress bar"',
      'create_issue call "labels" attribute contains "enhancement"',
      'create_issue call did not return error',
      'called respond_to_message tool',
      'respond_to_message call input contains "Created issue" and the issue number',
      'respond_to_message call did not return error',
    ]);
  });

  test('should handle idea recording when hasgtag is used', async () => {
    const text = 'Introduce stress testing #idea';
    const bot = createFakeBot(text);
    await evaluateAgent(text, bot, [
      'called create_issue tool',
      'create_issue call "title" attribute contains "stress testing"',
      'create_issue call "body" attribute contains "stress testing"',
      'create_issue call "labels" attribute contains "enhancement" and "idea"',
      'create_issue call did not return error',
      'called respond_to_message tool',
      'respond_to_message call input contains "Created issue" and the issue number',
      'respond_to_message call did not return error',
    ]);
  });
});
