const fs = require('fs').promises;

async function handleFileRead(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return { success: true, content: 'Content of ' + filePath + ':\n```\n' + content + '\n```\n' };
    } catch (error) {
        return { success: false, error: 'Error reading file ' + filePath + ': ' + error.message };
    }
}

async function handleFileCreate(filePath, content) {
    try {
        await fs.writeFile(filePath, content);
        return { success: true, message: `Successfully created/overwrote file: ${filePath}` };
    } catch (error) {
        return { success: false, error: `Error creating/writing to file ${filePath}: ${error.message}` };
    }
}

module.exports = {
    handleFileRead,
    handleFileCreate
};