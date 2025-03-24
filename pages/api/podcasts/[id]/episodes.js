import { getPodcastEpisodes } from '../../../../lib/podcastIndex';
import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Podcast ID is required' });
    }
    
    // Get podcast from database
    const { data: podcast, error } = await supabaseAdmin
      .from('podcasts')
      .select('podcast_index_id')
      .eq('id', id)
      .single();
      
    if (error || !podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    
    // Fetch episodes from PodcastIndex
    const episodes = await getPodcastEpisodes(podcast.podcast_index_id);
    
    // Store episodes in database
    if (episodes && episodes.length > 0) {
      for (const episode of episodes) {
        const { data: existingEpisode } = await supabaseAdmin
          .from('episodes')
          .select('id')
          .eq('episode_guid', episode.guid)
          .single();
          
        if (!existingEpisode) {
          await supabaseAdmin.from('episodes').insert({
            podcast_id: id,
            episode_guid: episode.guid,
            title: episode.title,
            description: episode.description,
            audio_url: episode.enclosureUrl,
            image_url: episode.image || podcast.image_url,
            published_at: episode.datePublished ? new Date(episode.datePublished * 1000).toISOString() : null,
            duration: episode.duration
          });
        }
      }
    }
    
    // Get episodes from database to return
    const { data: dbEpisodes } = await supabaseAdmin
      .from('episodes')
      .select('*')
      .eq('podcast_id', id)
      .order('published_at', { ascending: false });
    
    return res.status(200).json({ episodes: dbEpisodes });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return res.status(500).json({ error: 'Failed to fetch podcast episodes' });
  }
} 