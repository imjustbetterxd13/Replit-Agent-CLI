const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPaths = [
        path.join(__dirname, '..', '.env'), // Look for .env in the parent directory (project root)
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

module.exports = {
    loadEnv
};
