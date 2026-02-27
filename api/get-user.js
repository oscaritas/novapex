import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { telegram_id } = req.query;

  if (!telegram_id) {
    return res.status(400).json({ error: 'telegram_id required' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegram_id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Kullanıcı yoksa oluştur
      const newUser = {
        telegram_id,
        first_name: req.query.first_name || 'Nova Kaşifi',
        napx_balance: 0,
        total_referrals: 0,
        referral_earnings: 0,
        completed_tasks: [],
        referrals: [],
        active_boost: null,
        boost_end_time: null,
        boost_rights_1: 0,
        boost_rights_2: 0,
        boost_rights_3: 0,
        level: 'Starter'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) throw insertError;
      return res.status(200).json({ user: insertData });
    }

    if (error) throw error;

    res.status(200).json({ user: data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
