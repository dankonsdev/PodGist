import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { supabaseAdmin } from './supabase';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function transcribeAudio(audioUrl, episodeId) {
  try {
    // Update transcription status
    const { data: transcription } = await supabaseAdmin
      .from('transcriptions')
      .insert({ episode_id: episodeId, status: 'processing' })
      .select()
      .single();

    // Download audio file
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save temporarily
    const tempFilePath = path.join('/tmp', `audio-${episodeId}.mp3`);
    await writeFile(tempFilePath, buffer);
    
    // Transcribe with OpenAI Whisper
    const transcriptionResponse = await openai.createTranscription(
      fs.createReadStream(tempFilePath),
      'whisper-1'
    );
    
    // Delete temp file
    await unlink(tempFilePath);
    
    // Save transcription to Supabase Storage
    const transcriptionText = transcriptionResponse.data.text;
    const filePath = `transcriptions/${episodeId}.txt`;
    
    await supabaseAdmin.storage
      .from('podcast-data')
      .upload(filePath, transcriptionText, {
        contentType: 'text/plain',
        upsert: true,
      });
    
    // Update transcription record
    await supabaseAdmin
      .from('transcriptions')
      .update({ 
        storage_path: filePath,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', transcription.id);
      
    return transcription.id;
  } catch (error) {
    console.error('Transcription error:', error);
    
    // Update status to failed
    await supabaseAdmin
      .from('transcriptions')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('episode_id', episodeId);
      
    throw error;
  }
} 