import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get user from auth token
        const { user } = await supabaseAdmin.auth.getUser(req.headers.authorization?.split(' ')[1]);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get user's saved episodes
        const { data: userEpisodes, error } = await supabaseAdmin
            .from('user_episodes')
            .select(`
        id,
        saved_at,
        episodes:episode_id (
          id,
          title,
          description,
          image_url,
          audio_url,
          published_at,
          duration,
          podcast:podcast_id (
            id,
            title,
            author,
            image_url
          )
        )
      `)
            .eq('user_id', user.id)
            .order('saved_at', { ascending: false });

        if (error) {
            throw error;
        }

        return res.status(200).json({ userEpisodes });
    } catch (error) {
        console.error('Error fetching user episodes:', error);
        return res.status(500).json({ error: 'Failed to fetch saved episodes' });
    }
} 