import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [podcasts, setPodcasts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth');
                return;
            }

            setUser(user);
            setLoading(false);
        }

        getUser();
    }, [router]);

    async function handleSearch(e) {
        e.preventDefault();

        if (!searchQuery.trim()) return;

        try {
            const res = await fetch(`/api/podcasts/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (data.podcasts) {
                setPodcasts(data.podcasts);
            }
        } catch (error) {
            console.error('Error searching podcasts:', error);
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push('/auth');
    }

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Podcast App</h1>
                <div className="flex items-center">
                    <p className="mr-4">{user.email}</p>
                    <button
                        onClick={handleSignOut}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <div className="mb-8">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search podcasts..."
                        className="flex-1 p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Search
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {podcasts.map((podcast) => (
                    <Link
                        href={`/podcasts/${podcast.id}`}
                        key={podcast.id}
                        className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="aspect-square overflow-hidden bg-gray-100">
                            {podcast.image && (
                                <img
                                    src={podcast.image}
                                    alt={podcast.title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="p-4">
                            <h2 className="font-bold text-lg mb-1">{podcast.title}</h2>
                            <p className="text-gray-600 text-sm">{podcast.author}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {podcasts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Search for podcasts to see results
                </div>
            )}
        </div>
    );
} 