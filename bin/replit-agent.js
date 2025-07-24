#!/usr/bin/env node

const readline = require('readline');
const https = require('https');
const fs = require('fs');
const path = require('path');

function clearScreen() {
    process.stdout.write('\x1b[2J\x1b[0f');
}

function printBanner() {
    const banner = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ███████╗██████╗ ██╗     ██╗████████╗               ║
║   ██╔══██╗██╔════╝██╔══██╗██║     ██║╚══██╔══╝               ║
║   ██████╔╝█████╗  ██████╔╝██║     ██║   ██║                  ║
║   ██╔══██╗██╔══╝  ██╔═══╝ ██║     ██║   ██║                  ║
║   ██║  ██║███████╗██║     ███████╗██║   ██║                  ║
║   ╚═╝  ╚═╝╚══════╝╚═╝     ╚══════╝╚═╝   ╚═╝                  ║
║                                                               ║
║              █████╗  █████╗  ██████╗ ███████╗███╗   ██╗████████╗║
║             ██╔══██╗██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝║
║             ███████║███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ║
║             ██╔══██║██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ║
║             ██║  ██║██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ║
║             ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ║
║                                                               ║
║                        🚀 Welcome to the                      ║
║                      REPLIT AGENT SYSTEM                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;
    return banner;
}

function loadEnv() {
    const envPaths = [
        path.join(process.cwd(), '.env'),
        path.join(require('os').homedir(), '.replit-agent.env'),
        path.join(require('os').homedir(), '.env')
    ];
    
    for (const envPath of envPaths) {
        try {
            if (fs.existsSync(envPath)) {
                const envFile = fs.readFileSync(envPath, 'utf8');
                const envLines = envFile.split('\n');
                for (const line of envLines) {
                    if (line.trim() && !line.startsWith('#')) {
                        const [key, ...valueParts] = line.split('=');
                        if (key && valueParts.length > 0) {
                            process.env[key.trim()] = valueParts.join('=').trim();
                        }
                    }
                }
                console.log(`\x1b[32m  Loaded config from: ${envPath}\x1b[0m`);
                return;
            }
        } catch (error) {
            continue;
        }
    }
    
    console.log('\x1b[33m  No .env file found. Create one with OPENROUTER_API_KEY=your_key\x1b[0m');
    console.log('\x1b[33m  Locations checked: current directory, ~/.replit-agent.env, ~/.env\x1b[0m');
}

async function testOpenRouterConnection() {
    const models = [
        "deepseek/deepseek-r1",
        "deepseek/deepseek-r1-distill-llama-70b", 
        "deepseek/deepseek-r1-distill-qwen-32b",
        "deepseek/deepseek-chat",
        "google/gemini-flash-1.5",
        "qwen/qwen-2.5-7b-instruct:free",
        "meta-llama/llama-3.2-3b-instruct:free",  
        "microsoft/phi-3-mini-128k-instruct:free",
        "qwen/qwen-2.5-72b-instruct"
    ];
    
    for (const model of models) {
        const result = await tryModel(model);
        if (result.success) {
            global.selectedModel = model;
            console.log(`\x1b[32m  Using model: ${model}\x1b[0m`);
            return { success: true, model };
        }
    }
    
    return { success: false, error: 'No working models found' };
}

async function tryModel(modelName) {
    return new Promise((resolve) => {
        const apiKey = process.env.OPENROUTER_API_KEY;
        
        if (!apiKey || apiKey === 'your_api_key_here') {
            resolve({ success: false, error: 'No API key found in .env' });
            return;
        }

        const postData = JSON.stringify({
            model: modelName,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 5
        });

        const options = {
            hostname: 'openrouter.ai',
            port: 443,
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://localhost',
                'X-Title': 'Replit Agent'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        resolve({ success: true, response });
                    } catch {
                        resolve({ success: false });
                    }
                } else {
                    resolve({ success: false, statusCode: res.statusCode, data });
                }
            });
        });

        req.on('error', (error) => {
            resolve({ success: false, error: error.message });
        });

        req.setTimeout(5000, () => {
            req.destroy();
            resolve({ success: false, error: 'timeout' });
        });

        req.write(postData);
        req.end();
    });
}

async function animateLoading() {
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    
    // Step 1: Load environment
    process.stdout.write("\n" + " ".repeat(20) + "Loading environment");
    for (let i = 0; i < 5; i++) {
        for (const frame of frames) {
            process.stdout.write(`\r${" ".repeat(20)}Loading environment ${frame}`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    process.stdout.write(`\r${" ".repeat(20)}Loading environment ✓\n`);
    
    loadEnv();
    
    // Step 2: Connect to OpenRouter
    process.stdout.write(" ".repeat(20) + "Connecting to OpenRouter");
    for (let i = 0; i < 10; i++) {
        for (const frame of frames) {
            process.stdout.write(`\r${" ".repeat(20)}Connecting to OpenRouter ${frame}`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    const connectionResult = await testOpenRouterConnection();
    
    if (connectionResult.success) {
        process.stdout.write(`\r${" ".repeat(20)}Connecting to OpenRouter ✓\n`);
        return { connected: true };
    } else {
        process.stdout.write(`\r${" ".repeat(20)}Connecting to OpenRouter ✗\n`);
        console.log(`\x1b[31m  Error: ${connectionResult.error || 'Connection failed'}\x1b[0m`);
        return { connected: false, error: connectionResult.error };
    }
}

async function sendMessageToOpenRouter(message) {
    return new Promise((resolve) => {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = global.selectedModel || "deepseek/deepseek-r1";
        
        const postData = JSON.stringify({
            model: model,
            messages: [{ role: "user", content: message }],
            max_tokens: 1000,
            temperature: 0.7
        });

        const options = {
            hostname: 'openrouter.ai',
            port: 443,
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://localhost',
                'X-Title': 'Replit Agent',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.choices && response.choices[0]) {
                        resolve({ success: true, message: response.choices[0].message.content });
                    } else {
                        resolve({ success: false, error: 'No response from AI' });
                    }
                } catch (error) {
                    resolve({ success: false, error: 'Failed to parse response' });
                }
            });
        });

        req.on('error', (error) => {
            resolve({ success: false, error: error.message });
        });

        req.write(postData);
        req.end();
    });
}

async function startChatMode() {
    console.log('\n🤖 \x1b[32mReplit Agent is ready! Type your messages below (type "exit" to quit)\x1b[0m\n');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = () => {
        rl.question('\x1b[34m> \x1b[0m', async (input) => {
            if (input.toLowerCase() === 'exit') {
                console.log('\n👋 \x1b[36mGoodbye from Replit Agent!\x1b[0m');
                rl.close();
                return;
            }

            if (input.trim()) {
                process.stdout.write('\x1b[33m🤔 Thinking...\x1b[0m');
                
                const response = await sendMessageToOpenRouter(input);
                
                process.stdout.write('\r\x1b[K');
                
                if (response.success) {
                    console.log('\x1b[32m🤖 Agent:\x1b[0m', response.message);
                } else {
                    console.log('\x1b[31m❌ Error:\x1b[0m', response.error);
                }
            }
            
            console.log();
            askQuestion();
        });
    };

    askQuestion();
}

async function main() {
    try {
        clearScreen();
        
        // Print fancy banner with colors
        console.log('\x1b[36m%s\x1b[0m', printBanner());
        
        // Animate loading and connect to OpenRouter
        const initResult = await animateLoading();
        
        // Show system info
        console.log("\n" + "=".repeat(65));
        if (initResult.connected) {
            console.log("  STATUS: \x1b[32mOnline and Ready ✓\x1b[0m");
            console.log("  API: \x1b[32mOpenRouter Connected ✓\x1b[0m");
        } else {
            console.log("  STATUS: \x1b[31mOffline - API Connection Failed ✗\x1b[0m");
            console.log("  API: \x1b[31mOpenRouter Disconnected ✗\x1b[0m");
        }
        console.log("  MODE: Interactive AI Assistant");  
        console.log("  VERSION: 2.0.0");
        console.log("=".repeat(65));
        
        if (initResult.connected) {
            // Start chat mode
            await startChatMode();
        } else {
            console.log("\n\x1b[31m❌ Cannot start chat mode without API connection\x1b[0m");
            console.log("   Please check your .env file and ensure OPENROUTER_API_KEY is set correctly.");
            console.log("\n  Press Enter to exit...");
            
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.question('', () => {
                rl.close();
                process.exit(1);
            });
        }
        
    } catch (error) {
        if (error.code === 'SIGINT') {
            console.log("\n\n  👋 Goodbye from Replit Agent!");
            process.exit(0);
        }
        console.error("Unexpected error:", error);
        process.exit(1);
    }
}

process.on('SIGINT', () => {
    console.log("\n\n  👋 Goodbye from Replit Agent!");
    process.exit(0);
});

main();