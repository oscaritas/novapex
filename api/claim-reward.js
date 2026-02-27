// api/claim-reward.js - Ödül verme
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'POST') {
        const { userId, rewardType } = req.body;
        
        // Ödül hesapla
        let reward = 0;
        if (rewardType === 'referral') reward = 500;
        if (rewardType === 'first_tap') reward = 200;
        
        res.status(200).json({
            success: true,
            reward: reward,
            message: 'Ödül verildi'
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
