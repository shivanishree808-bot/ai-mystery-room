require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is missing from .env');
        process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

    try {
        const response = await ai.models.generateContent({
            model,
            contents: 'Write one sentence that starts a detective mystery about a missing diamond.',
        });
        console.log('Model used:', model);
        console.log('Gemini says:', response.text);
    } catch (error) {
        console.error('Gemini request failed:', error.message);
        process.exit(1);
    }
}

main();