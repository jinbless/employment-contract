
import { Router } from 'express';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import XLSX from 'xlsx';
import { laborLawTips } from '../data/laborLawTips.js';

const router = Router();

// 팁 생성 라우트
router.get('/random', async (req, res) => {
    res.set('Cache-Control', 'no-store');

    try {
        const randomTip = laborLawTips[Math.floor(Math.random() * laborLawTips.length)];
        // Add emoji if missing
        const tip = randomTip.startsWith('💡') ? randomTip : `💡 ${randomTip}`;
        res.json({ tip });
    } catch (error) {
        console.error('팁 생성 실패:', error);
        res.json({ tip: "💡 2026년 최저임금은 시간급 10,320원이에요." });
    }
});

export default router;
