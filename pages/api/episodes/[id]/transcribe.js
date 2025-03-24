import { supabaseAdmin } from '../../../../lib/supabase';
import { transcribeAudio } from '../../../../lib/transcription';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Episode ID is required' });
    }
    
    // Check if episode exists
    const { data: episode, error } = await supabaseAdmin
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    // Check if transcription already exists
    const { data: existingTranscription } = await supabaseAdmin
      .from('transcriptions')
      .select('*')
      .eq('episode_id', id)
      .not('status', 'eq', 'failed')
      .maybeSingle();
      
    if (existingTranscription) {
      return res.status(200).json({ 
        message: 'Transcription already exists or is in progress',
        transcription: existingTranscription
      });
    }
    
    // Start transcription process
    // For real implementation we would use a queue or background task
    // but for simplicity we'll do it synchronously
    const transcriptionId = await transcribeAudio(episode.audio_url, id);
    
    return res.status(200).json({ 
      message: 'Transcription started',
      transcriptionId 
    });
  } catch (error) {
    console.error('Error starting transcription:', error);
    return res.status(500).json({ error: 'Failed to start transcription' });
  }
} 