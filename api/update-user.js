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

  const { telegram_id, first_name, napx_balance, level } = req.body;

  if (!telegram_id) {
    return res.status(400).json({ error: 'telegram_id required' });
  }

  try {
    // Önce mevcut kullanıcıyı bul
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegram_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const updateData = {
      first_name,
      napx_balance,
      level,
      updated_at: new Date().toISOString()
    };

    let result;
    
    if (existingUser) {
      // Güncelle
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('telegram_id', telegram_id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Yeni kullanıcı oluştur
      const newUser = {
        telegram_id,
        first_name,
        napx_balance: napx_balance || 0,
        level: level || 'Starter',
        total_referrals: 0,
        referral_earnings: 0,
        completed_tasks: [],
        referrals: [],
        boost_rights_1: 0,
        boost_rights_2: 0,
        boost_rights_3: 0,
        ...updateData
      };

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.status(200).json({ success: true, user: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
