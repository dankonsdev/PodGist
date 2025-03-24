import { Configuration, OpenAIApi } from 'openai';
import { supabaseAdmin } from '../../../../lib/supabase';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Transcription ID is required' });
        }

        // Check if transcription exists and is complete
        const { data: transcription, error } = await supabaseAdmin
            .from('transcriptions')
            .select('*')
            .eq('id', id)
            .eq('status', 'completed')
            .single();

        if (error || !transcription) {
            return res.status(404).json({ error: 'Completed transcription not found' });
        }

        // Check if summary already exists
        const { data: existingSummary } = await supabaseAdmin
            .from('summaries')
            .select('*')
            .eq('transcription_id', id)
            .maybeSingle();

        if (existingSummary) {
            return res.status(200).json({
                message: 'Summary already exists',
                summary: existingSummary
            });
        }

        // Get the transcription text from storage
        const { data: transcriptionData } = await supabaseAdmin.storage
            .from('podcast-data')
            .download(transcription.storage_path);

        if (!transcriptionData) {
            return res.status(404).json({ error: 'Transcription file not found' });
        }

        // Convert blob to text
        const transcriptionText = await transcriptionData.text();

        // Generate summary with OpenAI GPT
        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that summarizes podcast transcripts. Create a concise summary of the main points discussed in the podcast. Include key insights and takeaways in bullet points.',
                },
                {
                    role: 'user',
                    content: `Summarize this podcast transcript: ${transcriptionText}`,
                },
            ],
        });

        const summaryContent = completion.data.choices[0].message.content;

        // Save summary to database
        const { data: summary } = await supabaseAdmin
            .from('summaries')
            .insert({ transcription_id: id, content: summaryContent })
            .select()
            .single();

        return res.status(200).json({
            message: 'Summary generated successfully',
            summary
        });
    } catch (error) {
        console.error('Error generating summary:', error);
        return res.status(500).json({ error: 'Failed to generate summary' });
    }
} 