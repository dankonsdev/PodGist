import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Episode ID is required' });
        }

        // Get episode with podcast info
        const { data: episode, error } = await supabaseAdmin
            .from('episodes')
            .select(`
        *,
        podcast:podcast_id (*)
      `)
            .eq('id', id)
            .single();

        if (error || !episode) {
            return res.status(404).json({ error: 'Episode not found' });
        }

        // Check if transcription exists
        const { data: transcription } = await supabaseAdmin
            .from('transcriptions')
            .select('*')
            .eq('episode_id', id)
            .maybeSingle();

        // If transcription is completed, get the content
        if (transcription && transcription.status === 'completed' && transcription.storage_path) {
            const { data: transcriptionData } = await supabaseAdmin.storage
                .from('podcast-data')
                .download(transcription.storage_path);

            if (transcriptionData) {
                const transcriptionText = await transcriptionData.text();
                transcription.content = transcriptionText;
            }
        }

        return res.status(200).json({
            episode,
            podcast: episode.podcast,
            transcription
        });
    } catch (error) {
        console.error('Error fetching episode:', error);
        return res.status(500).json({ error: 'Failed to fetch episode details' });
    }
} 