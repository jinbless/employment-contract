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

async function test_ocr() {
    try {
        console.log('Testing GPT-5.2 OCR...');
        const completion = await openai.chat.completions.create({
            model: "gpt-5.2",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What is this image?" },
                        { type: "image_url", image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Grasland_bij_Abcoude.jpg/1200px-Grasland_bij_Abcoude.jpg" } }
                    ]
                }
            ],
            max_tokens: 100
        });
        console.log('Response:', completion.choices[0].message.content);
    } catch (error) {
        console.error('Error during OCR test:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

test_ocr();
