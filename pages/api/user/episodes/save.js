import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get user from auth token
        const { user } = await supabaseAdmin.auth.getUser(req.headers.authorization?.split(' ')[1]);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { episodeId } = req.body;

        if (!episodeId) {
            return res.status(400).json({ error: 'Episode ID is required' });
        }

        // Check if episode exists
        const { data: episode, error: episodeError } = await supabaseAdmin
            .from('episodes')
            .select('id')
            .eq('id', episodeId)
            .single();

        if (episodeError || !episode) {
            return res.status(404).json({ error: 'Episode not found' });
        }

        // Save episode for user
        const { data, error } = await supabaseAdmin
            .from('user_episodes')
            .upsert({
                user_id: user.id,
                episode_id: episodeId,
                saved_at: new Date().toISOString()
            })
            .select();

        if (error) {
            throw error;
        }

        return res.status(200).json({
            message: 'Episode saved successfully',
            userEpisode: data[0]
        });
    } catch (error) {
        console.error('Error saving episode:', error);
        return res.status(500).json({ error: 'Failed to save episode' });
    }
} 