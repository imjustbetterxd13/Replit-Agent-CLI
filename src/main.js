#!/usr/bin/env node

const { clearScreen, printBanner } = require('./banner');
const { loadEnv } = require('./envLoader');
const { testOpenRouterConnection, sendMessageToOpenRouter } = require('./openRouterApi');
const { animateLoading } = require('./loadingAnimation');
const { handleFileRead, handleFileCreate } = require('./fileOperations');
const { startChatMode } = require('./chatMode');

async function main() {
    try {
        clearScreen();
        
        // Print fancy banner with colors
        console.log('\x1b[36m%s\x1b[0m', printBanner());
        
        // Animate loading and connect to OpenRouter
        const initResult = await animateLoading(loadEnv, testOpenRouterConnection);
        
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
            await startChatMode(sendMessageToOpenRouter, handleFileRead, handleFileCreate);
        } else {
            console.log("\n\x1b[31m❌ Cannot start chat mode without API connection\x1b[0m");
            console.log("   Please check your .env file and ensure OPENROUTER_API_KEY is set correctly.");
            console.log("\n  Press Enter to exit...");
            
            const readline = require('readline'); // Moved here to avoid global import
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