const { loadEnv } = require('./envLoader');
const { testOpenRouterConnection } = require('./openRouterApi');

async function animateLoading(loadEnv, testOpenRouterConnection) {
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

module.exports = {
    animateLoading
};