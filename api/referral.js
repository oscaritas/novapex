import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { referrerId, newUserId } = req.body;

  if (!referrerId || !newUserId) {
    return res.status(400).json({ error: 'referrerId and newUserId required' });
  }

  if (referrerId === newUserId) {
    return res.status(400).json({ error: 'Cannot refer yourself' });
  }

  try {
    // Referans veren kullanıcıyı bul
    const { data: referrer, error: refError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', referrerId)
      .single();

    if (refError) {
      return res.status(404).json({ error: 'Referrer not found' });
    }

    const referrals = referrer.referrals || [];
    if (referrals.includes(newUserId)) {
      return res.status(400).json({ error: 'Already referred' });
    }

    // Yeni kullanıcıyı kontrol et/oluştur
    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', newUserId)
      .single();

    if (newUserError && newUserError.code !== 'PGRST116') {
      throw newUserError;
    }

    if (!newUser) {
      // Yeni kullanıcıyı oluştur
      await supabase
        .from('users')
        .insert([{
          telegram_id: newUserId,
          first_name: 'Nova Kaşifi',
          napx_balance: 0,
          total_referrals: 0,
          referral_earnings: 0,
          completed_tasks: [],
          referrals: [],
          level: 'Starter'
        }]);
    }

    // Referans veren kullanıcıyı güncelle
    const { error: updateError } = await supabase
      .from('users')
      .update({
        referrals: [...referrals, newUserId],
        total_referrals: (referrer.total_referrals || 0) + 1,
        referral_earnings: (referrer.referral_earnings || 0) + 500,
        napx_balance: (referrer.napx_balance || 0) + 500,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', referrerId);

    if (updateError) throw updateError;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
