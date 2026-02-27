import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'POST') {
    const { telegram_id, first_name, napx_balance, total_taps, level } = req.body
    
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({ 
          telegram_id, 
          first_name,
          napx_balance, 
          total_taps, 
          level,
          updated_at: new Date()
        })
      
      if (error) throw error
      
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Update user error:', error)
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
