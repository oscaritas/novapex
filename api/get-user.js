// api/get-user.js - Kullanıcı bilgilerini al
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'GET') {
        const { telegramId } = req.query;
        
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .single();
            
            if (error && error.code === 'PGRST116') {
                // Kayıt bulunamadı
                return res.status(404).json({ error: 'User not found' });
            }
            
            if (error) throw error;
            
            res.status(200).json(user);
            
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
