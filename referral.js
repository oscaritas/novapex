// api/referral.js - Davet sistemi backend
export default function handler(req, res) {
    // CORS ayarları (Telegram izin versin)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    
    if (req.method === 'POST') {
        // Davet eden kişiye ödül ver
        const { referrerId, newUserId } = req.body;
        
        // Burada veritabanına kaydedeceğiz
        // Şimdilik basit cevap verelim
        
        res.status(200).json({ 
            success: true, 
            message: 'Referral kaydedildi',
            reward: 500 
        });
    } else {
        // Sadece POST kabul et
        res.status(405).json({ error: 'Method not allowed' });
    }
}