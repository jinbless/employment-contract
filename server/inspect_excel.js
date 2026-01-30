import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const targetFile = '임금체불_data_울_250825(노무사회).xlsx';
const filePath = path.join(rootDir, targetFile);

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`--- File: ${targetFile} ---`);
    const keywords = ['3.1.1'];
    const matches = data.filter(row =>
        Object.values(row).some(val =>
            typeof val === 'string' && keywords.some(k => val.includes(k))
        )
    );

    console.log(`Found ${matches.length} matches for keywords: ${keywords.join(', ')}`);
    console.log('Sample matches (first 1):');
    console.log(JSON.stringify(matches.slice(0, 1), null, 2));
} catch (error) {
    console.error('Error reading excel:', error);
}
