# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TeleGit is an AI-powered Telegram bot that converts chat messages into GitHub issues using LLM intent extraction and MCP (Model Context Protocol) for GitHub integration. The bot processes natural language from Telegram group chats, classifies messages as bugs/tasks/ideas, and creates corresponding GitHub issues with user approval via reactions.

## Development Environment

- **Node.js**: Requires version 22+ (specified in package.json engines and .nvmrc)
- **Module System**: ES Modules (package.json has `"type": "module"`)
- **Code Quality**: ESLint + Prettier configured with ES module support

## Common Development Commands

```bash
# Install dependencies
npm install

# Code quality
npm run lint          # Check code style
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier

# Run the bot
node index.js         # Start the application
```

## Architecture Overview

The project follows a three-layer architecture:

1. **Telegram Bot Layer**: Handles incoming messages and user reactions
2. **LLM Processing Layer**: Classifies messages and extracts intent (bugs/tasks/ideas)
3. **GitHub Integration Layer**: Uses MCP server to create/manage GitHub issues

### Key Integration Points

- **MCP Server**: Docker-based GitHub MCP server for issue management
- **LLM API**: OpenAI API (or compatible) for natural language processing
- **Telegram Bot API**: For message handling and reaction monitoring

### Expected Directory Structure

Based on README references, the codebase will likely organize as:
- `/src/backend/` - Bot logic and service handlers
- `/src/llm/` - Prompt templates and LLM interaction logic

## Environment Variables

Required for runtime:
- `TELEGRAM_BOT_TOKEN`
- `OPENAI_API_KEY` 
- `MCP_SERVER_HOST`
- `GITHUB_REPOSITORY`

Optional:
- `ALLOWED_TELEGRAM_GROUPS`
- `ALLOWED_TELEGRAM_USERS`

## Development Notes

- All secrets must be environment variables, never committed to code
- The bot processes free-form text with optional hashtag support
- User feedback loop uses Telegram reactions (👍/👎/💩) for approval/rejection
- MCP server runs in Docker and requires GitHub Personal Access Token