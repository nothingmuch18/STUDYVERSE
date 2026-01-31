import { useState } from 'react';
import { Music as MusicIcon, Headphones } from 'lucide-react';

interface Station {
    id: string;
    name: string;
    genre: string;
    color: string;
    uri: string; // Spotify Embed URI
}

const stations: Station[] = [
    {
        id: 'lofi-girl',
        name: 'Lofi Girl - beats to relax/study to',
        genre: 'Lofi Hip Hop',
        color: 'from-orange-500 to-rose-500',
        uri: 'https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator',
    },
    {
        id: 'intense-studying',
        name: 'Intense Studying',
        genre: 'Piano & Classical',
        color: 'from-blue-600 to-indigo-800',
        uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator',
    },
    {
        id: 'brown-noise',
        name: 'Brown Noise',
        genre: 'Ambient',
        color: 'from-stone-600 to-stone-800',
        uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX2pSTOxoPbx9?utm_source=generator', // Noise
    },
    {
        id: 'synthwave',
        name: 'Synthwave Focus',
        genre: 'Electronic',
        color: 'from-purple-500 to-cyan-500',
        uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator',
    }
];

export function Music() {
    const [currentStation, setCurrentStation] = useState<Station | null>(null);

    // Spotify manages its own playback state internally via iframe

    const playStation = (station: Station) => {
        setCurrentStation(station);
    };

    return (
        <div className="p-8 h-screen overflow-hidden flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[var(--accent-primary)]/10 rounded-xl text-[var(--accent-primary)]">
                    <Headphones size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Focus Music</h1>
                    <p className="text-[var(--text-secondary)]">Curated stations to boost your productivity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stations.map((station) => (
                    <div
                        key={station.id}
                        onClick={() => playStation(station)}
                        className={`
                            relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 group
                            ${currentStation?.id === station.id ? 'ring-2 ring-[var(--accent-primary)] scale-[1.02]' : 'hover:scale-[1.02]'}
                            bg-[var(--bg-surface-1)] border border-[var(--border-subtle)]
                        `}
                    >
                        {/* Gradient Background Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${station.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-full bg-white/10 backdrop-blur-md text-${station.color.split('-')[1]}-400`}>
                                    <MusicIcon size={24} />
                                </div>
                                {currentStation?.id === station.id && (
                                    <div className="flex items-end gap-1 h-6">
                                        <div className="w-1 bg-[var(--accent-primary)] animate-music-bar-1 h-3" />
                                        <div className="w-1 bg-[var(--accent-primary)] animate-music-bar-2 h-6" />
                                        <div className="w-1 bg-[var(--accent-primary)] animate-music-bar-3 h-4" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{station.name}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">{station.genre}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Player Area */}
            <div className="flex-1 bg-[var(--bg-surface-1)] rounded-3xl border border-[var(--border-subtle)] overflow-hidden relative shadow-2xl p-4">
                {!currentStation ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-tertiary)] bg-[var(--bg-surface-0)]/50 backdrop-blur-sm">
                        <MusicIcon size={64} className="mb-4 opacity-20" />
                        <p className="text-lg">Select a station to start listening on Spotify</p>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden">
                        <iframe
                            style={{ borderRadius: '12px' }}
                            src={currentStation.uri}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        ></iframe>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes music-bar-1 { 0%, 100% { height: 30%; } 50% { height: 100%; } }
                @keyframes music-bar-2 { 0%, 100% { height: 50%; } 50% { height: 20%; } }
                @keyframes music-bar-3 { 0%, 100% { height: 80%; } 50% { height: 40%; } }
                .animate-music-bar-1 { animation: music-bar-1 0.8s ease-in-out infinite; }
                .animate-music-bar-2 { animation: music-bar-2 1.1s ease-in-out infinite; }
                .animate-music-bar-3 { animation: music-bar-3 0.9s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
