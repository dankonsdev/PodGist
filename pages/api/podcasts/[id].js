import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Podcast ID is required' });
    }
    
    const { data: podcast, error } = await supabaseAdmin
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    
    return res.status(200).json({ podcast });
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return res.status(500).json({ error: 'Failed to fetch podcast details' });
  }
} 