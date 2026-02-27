import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'POST') {
    const { userId, type } = req.body;
    
    try {
      let reward = 0;
      
      if (type === 'first_tap' || type === 'first_claim') {
        reward = 200;
        
        // Referral kaydını bul
        const { data: referral } = await supabase
          .from('referrals')
          .select('*')
          .eq('referred_id', userId)
          .single();
        
        if (referral && !referral.first_tap_bonus) {
          // Davet edene bonus ver
          const { data: referrer } = await supabase
            .from('users')
            .select('napx_balance')
            .eq('telegram_id', referral.referrer_id)
            .single();
          
          if (referrer) {
            await supabase
              .from('users')
              .update({ napx_balance: referrer.napx_balance + 200 })
              .eq('telegram_id', referral.referrer_id);
            
            await supabase
              .from('referrals')
              .update({ first_tap_bonus: true })
              .eq('id', referral.id);
          }
        }
      }
      
      res.status(200).json({ success: true, reward: reward });
      
    } catch (error) {
      console.error('Claim reward error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
