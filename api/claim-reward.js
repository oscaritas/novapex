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

  const { telegram_id, amount } = req.body;

  if (!telegram_id || !amount) {
    return res.status(400).json({ error: 'telegram_id and amount required' });
  }

  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('napx_balance')
      .eq('telegram_id', telegram_id)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        napx_balance: (user.napx_balance || 0) + amount,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', telegram_id);

    if (updateError) throw updateError;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
