const readline = require('readline');

async function startChatMode(sendMessageToOpenRouter, handleFileRead, handleFileCreate) {
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

            let response;
            const trimmedInput = input.trim();

            if (trimmedInput.startsWith('/read ')) {
                const filePath = trimmedInput.substring(6).trim();
                response = await handleFileRead(filePath);
            } else if (trimmedInput.startsWith('/create ')) {
                const parts = trimmedInput.substring(8).trim().split(' ');
                const filePath = parts[0];
                const content = parts.slice(1).join(' ');
                response = await handleFileCreate(filePath, content);
            } else if (trimmedInput) {
                process.stdout.write('\x1b[33m🤔 Thinking...\x1b[0m');
                response = await sendMessageToOpenRouter(trimmedInput);
                process.stdout.write('\r\x1b[K');
            }
            
            if (response) {
                if (response.success) {
                    console.log('\x1b[32m🤖 Agent:\x1b[0m', response.message || response.content);
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

module.exports = {
    startChatMode
};
