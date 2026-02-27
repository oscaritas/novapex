import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'POST') {
    const { referrerId, newUserId } = req.body;
    
    try {
      // 1. Referrer'ın bakiyesini güncelle
      const { data: referrer } = await supabase
        .from('users')
        .select('napx_balance')
        .eq('telegram_id', referrerId)
        .single();
      
      if (referrer) {
        await supabase
          .from('users')
          .update({ napx_balance: referrer.napx_balance + 500 })
          .eq('telegram_id', referrerId);
      }
      
      // 2. Referral kaydı oluştur
      await supabase
        .from('referrals')
        .insert([{
          referrer_id: referrerId,
          referred_id: newUserId,
          reward_given: true
        }]);
      
      // 3. Yeni kullanıcıyı kaydet (yoksa)
      const { data: newUser } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', newUserId)
        .single();
      
      if (!newUser) {
        await supabase
          .from('users')
          .insert([{
            telegram_id: newUserId,
            napx_balance: 0
          }]);
      }
      
      res.status(200).json({ success: true, reward: 500 });
      
    } catch (error) {
      console.error('Referral error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
