import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function EpisodeDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [episode, setEpisode] = useState(null);
    const [podcast, setPodcast] = useState(null);
    const [transcription, setTranscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isTranscribing, setIsTranscribing] = useState(false);

    useEffect(() => {
        async function getUser() {
            const { data } = await supabase.auth.getUser();
            setUser(data?.user || null);
        }

        getUser();
    }, []);

    useEffect(() => {
        async function fetchEpisodeData() {
            if (!id) return;

            try {
                // Use a custom endpoint to get episode with podcast data
                const res = await fetch(`/api/episodes/${id}`);

                if (!res.ok) {
                    throw new Error('Failed to fetch episode');
                }

                const data = await res.json();

                if (data.episode) {
                    setEpisode(data.episode);
                    setPodcast(data.podcast);

                    // Check if transcription exists
                    if (data.transcription) {
                        setTranscription(data.transcription);
                    }
                }
            } catch (error) {
                console.error('Error fetching episode data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchEpisodeData();
    }, [id]);

    async function handleTranscribe() {
        if (isTranscribing) return;

        setIsTranscribing(true);

        try {
            const res = await fetch(`/api/episodes/${id}/transcribe`, {
                method: 'POST',
            });

            const data = await res.json();

            if (data.transcription) {
                setTranscription(data.transcription);
            }

            alert('Transcription process started! It may take a few minutes to complete.');
        } catch (error) {
            console.error('Error starting transcription:', error);
            alert('Failed to start transcription process.');
        } finally {
            setIsTranscribing(false);
        }
    }

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    if (!episode) {
        return <div className="p-8">Episode not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Link href={`/podcasts/${episode.podcast_id}`} className="inline-block mb-6 text-blue-500 hover:underline">
                &larr; Back to Podcast
            </Link>

            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    {podcast && podcast.image_url && (
                        <img
                            src={podcast.image_url}
                            alt={podcast.title}
                            className="w-16 h-16 rounded"
                        />
                    )}
                    <div>
                        <h2 className="text-sm text-gray-600">{podcast?.title}</h2>
                        <h1 className="text-2xl font-bold">{episode.title}</h1>
                    </div>
                </div>

                <div className="flex gap-3 mb-6">
                    <a
                        href={episode.audio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Play Episode
                    </a>

                    {!transcription && user && (
                        <button
                            onClick={handleTranscribe}
                            disabled={isTranscribing}
                            className={`px-4 py-2 rounded ${isTranscribing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                        >
                            {isTranscribing ? 'Processing...' : 'Transcribe Episode'}
                        </button>
                    )}
                </div>

                <div className="prose max-w-none mb-8">
                    <h3 className="text-xl font-semibold mb-2">Description</h3>
                    <p>{episode.description}</p>
                </div>

                {transcription && (
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4">Transcription</h3>

                        {transcription.status === 'completed' ? (
                            <div>
                                <div className="bg-gray-50 p-4 rounded border mb-4 whitespace-pre-wrap font-mono text-sm">
                                    {transcription.content || 'Transcription content unavailable.'}
                                </div>

                                <button
                                    onClick={async () => {
                                        try {
                                            await fetch(`/api/transcriptions/${transcription.id}/summarize`, {
                                                method: 'POST'
                                            });
                                            alert('Summary generation started!');
                                        } catch (error) {
                                            console.error('Error generating summary:', error);
                                        }
                                    }}
                                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                                >
                                    Generate Summary
                                </button>
                            </div>
                        ) : (
                            <div className="text-gray-600">
                                Transcription status: {transcription.status}
                                {transcription.status === 'processing' && (
                                    <p className="mt-2">This may take a few minutes. Please check back later.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 