import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function test_ocr_base64() {
    try {
        console.log('Testing GPT-5.2 OCR with placeholder base64...');
        // Small 1x1 transparent PNG
        const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

        const completion = await openai.chat.completions.create({
            model: "gpt-5.2",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What is in this image?" },
                        { type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}` } }
                    ]
                }
            ],
            max_completion_tokens: 100
        });
        console.log('Response:', completion.choices[0].message.content);
    } catch (error) {
        console.error('Error during OCR test:', error.message);
        if (error.status) console.error('Status:', error.status);
    }
}

test_ocr_base64();
