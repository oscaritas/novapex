// api/get-user.js - Kullanıcı bilgilerini al
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://senin-proje-url.supabase.co',
  'senin-anon-key'
)

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'GET') {
        const { telegramId } = req.query;
        
        try {
            const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .single();
            
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
