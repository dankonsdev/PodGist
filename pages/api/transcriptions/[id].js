import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Transcription ID is required' });
        }

        // Get transcription record
        const { data: transcription, error } = await supabaseAdmin
            .from('transcriptions')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !transcription) {
            return res.status(404).json({ error: 'Transcription not found' });
        }

        // If transcription is completed, get the content from storage
        if (transcription.status === 'completed' && transcription.storage_path) {
            const { data: transcriptionData } = await supabaseAdmin.storage
                .from('podcast-data')
                .download(transcription.storage_path);

            if (transcriptionData) {
                const transcriptionText = await transcriptionData.text();
                transcription.content = transcriptionText;
            }
        }

        return res.status(200).json({ transcription });
    } catch (error) {
        console.error('Error fetching transcription:', error);
        return res.status(500).json({ error: 'Failed to fetch transcription' });
    }
} 