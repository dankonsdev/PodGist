import { searchPodcasts } from '../../../lib/podcastIndex';
import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const results = await searchPodcasts(query);
    
    // Save results to database if they don't exist
    if (results && results.length > 0) {
      for (const podcast of results) {
        const { data: existingPodcast } = await supabaseAdmin
          .from('podcasts')
          .select('id')
          .eq('podcast_index_id', podcast.id)
          .single();
          
        if (!existingPodcast) {
          await supabaseAdmin.from('podcasts').insert({
            podcast_index_id: podcast.id.toString(),
            title: podcast.title,
            author: podcast.author,
            description: podcast.description,
            image_url: podcast.image,
            feed_url: podcast.url
          });
        }
      }
    }
    
    return res.status(200).json({ podcasts: results });
  } catch (error) {
    console.error('Error searching podcasts:', error);
    return res.status(500).json({ error: 'Failed to search podcasts' });
  }
} 