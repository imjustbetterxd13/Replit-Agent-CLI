# Replit Agent

A fancy Terminal User Interface (TUI) that connects to OpenRouter AI for interactive chat sessions.

## Features

- 🎨 Beautiful ASCII art banner on startup
- 🔄 Animated loading sequences
- 🤖 Chat with AI through OpenRouter API
- 🛠️ Environment configuration support
- 🎯 Global CLI installation

## Installation

Install globally via npm:

```bash
npm install -g replit-agent
```

## Setup

1. Get an API key from [OpenRouter](https://openrouter.ai)

2. Create a `.env` file in one of these locations:
   - Current directory: `./.env`
   - Home directory: `~/.replit-agent.env` 
   - Home directory: `~/.env`

3. Add your API key to the `.env` file:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

## Usage

Run the command from anywhere:

```bash
replit-agent
```

The application will:
1. Display a fancy welcome banner
2. Load your environment configuration
3. Test connection to OpenRouter API
4. Launch interactive chat mode (if connected successfully)

### Chat Commands

- Type any message to chat with the AI
- Type `exit` to quit the application
- Use `Ctrl+C` to force quit at any time

## Requirements

- Node.js >= 14.0.0
- Valid OpenRouter API key

## License

MIT
