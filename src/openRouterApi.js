const https = require('https');

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

module.exports = {
    testOpenRouterConnection,
    tryModel,
    sendMessageToOpenRouter
};