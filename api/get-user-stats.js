import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'GET') {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('napx_balance', { ascending: false })
        .limit(100)
      
      if (error) throw error
      
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
