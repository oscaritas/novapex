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

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('napx_balance', { ascending: false });

    if (error) throw error;

    const stats = {
      totalUsers: data.length,
      totalNAPX: data.reduce((sum, u) => sum + (u.napx_balance || 0), 0),
      averageNAPX: data.length ? Math.floor(data.reduce((sum, u) => sum + (u.napx_balance || 0), 0) / data.length) : 0,
      highestNAPX: data.length ? Math.max(...data.map(u => u.napx_balance || 0)) : 0
    };

    res.status(200).json({ users: data, stats });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
