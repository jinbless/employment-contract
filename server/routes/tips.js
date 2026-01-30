import { Router } from 'express';
import { asyncHandler } from '../utils/errorHandler.js';
import { laborLawTips } from '../data/laborLawTips.js';

const router = Router();

// 랜덤 팁 제공
router.get('/random', asyncHandler(async (req, res) => {
    res.set('Cache-Control', 'no-store');

    const randomTip = laborLawTips[Math.floor(Math.random() * laborLawTips.length)];
    // Add emoji if missing
    const tip = randomTip.startsWith('💡') ? randomTip : `💡 ${randomTip}`;
    res.json({ tip });
}));

export default router;
