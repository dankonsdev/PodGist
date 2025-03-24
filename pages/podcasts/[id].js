import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function PodcastDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [podcast, setPodcast] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPodcastData() {
            if (!id) return;

            try {
                // Fetch podcast details
                const podcastRes = await fetch(`/api/podcasts/${id}`);
                const podcastData = await podcastRes.json();

                if (podcastData.podcast) {
                    setPodcast(podcastData.podcast);
                }

                // Fetch episodes
                const episodesRes = await fetch(`/api/podcasts/${id}/episodes`);
                const episodesData = await episodesRes.json();

                if (episodesData.episodes) {
                    setEpisodes(episodesData.episodes);
                }
            } catch (error) {
                console.error('Error fetching podcast data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPodcastData();
    }, [id]);

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    if (!podcast) {
        return <div className="p-8">Podcast not found</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <Link href="/dashboard" className="inline-block mb-6 text-blue-500 hover:underline">
                &larr; Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="w-full md:w-1/3 lg:w-1/4">
                    {podcast.image_url && (
                        <img
                            src={podcast.image_url}
                            alt={podcast.title}
                            className="w-full rounded-lg"
                        />
                    )}
                </div>

                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{podcast.title}</h1>
                    <p className="text-gray-600 mb-4">{podcast.author}</p>
                    <p className="mb-4">{podcast.description}</p>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Episodes</h2>

            <div className="space-y-4">
                {episodes.map((episode) => (
                    <div key={episode.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-lg">{episode.title}</h3>
                        <div className="flex justify-between items-center my-2">
                            <span className="text-gray-600 text-sm">
                                {new Date(episode.published_at).toLocaleDateString()}
                            </span>
                            <span className="text-gray-600 text-sm">
                                {Math.floor(episode.duration / 60)} min
                            </span>
                        </div>
                        <p className="text-gray-700 mb-3 line-clamp-2">{episode.description}</p>
                        <div className="flex gap-2">
                            <Link
                                href={`/episodes/${episode.id}`}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                            >
                                View Details
                            </Link>
                            <button
                                onClick={() => window.open(episode.audio_url)}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                            >
                                Play
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {episodes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No episodes found
                </div>
            )}
        </div>
    );
} 