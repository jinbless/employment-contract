
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const apiKey = process.env.OPENAI_API_KEY?.trim();

console.log('Testing API Key with gpt-4o:', apiKey ? apiKey.slice(0, 10) + '...' + apiKey.slice(-5) : 'MISSING');

const openai = new OpenAI({ apiKey });

async function testKey() {
    try {
        console.log('Sending request to OpenAI (gpt-4o)...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: "Test" }],
            max_tokens: 5
        });
        console.log('✅ Success! Response:', completion.choices[0].message.content);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testKey();
