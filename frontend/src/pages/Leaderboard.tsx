
import { useEffect, useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { gamificationApi } from '../lib/api';

export function Leaderboard() {
    const { user } = useAuth();
    const [leaders, setLeaders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRank, setUserRank] = useState<number | null>(null);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const { data } = await gamificationApi.getLeaderboard();
            setLeaders(data);

            // Find user rank
            const rank = data.findIndex((u: any) => u.id === user?.id);
            if (rank !== -1) setUserRank(rank + 1);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-400 fill-yellow-400/20" size={24} />;
            case 1: return <Medal className="text-gray-300 fill-gray-300/20" size={24} />;
            case 2: return <Medal className="text-amber-700 fill-amber-700/20" size={24} />;
            default: return <span className="font-bold text-[var(--text-tertiary)] w-6 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Leaderboard</h1>
                    <p className="text-[var(--text-secondary)]">Top scholars this week</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface-1)] rounded-full border border-[var(--border-element)]">
                    <Trophy size={18} className="text-[var(--accent-primary)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                        Your Rank: <span className="text-[var(--accent-primary)] font-bold">{userRank ? `#${userRank}` : '--'}</span>
                    </span>
                </div>
            </div>

            <div className="card-modern overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--bg-surface-2)] border-b border-[var(--border-subtle)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Level</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Coins</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Streak</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-6 w-6 bg-[var(--bg-surface-2)] rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-32 bg-[var(--bg-surface-2)] rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-[var(--bg-surface-2)] rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-[var(--bg-surface-2)] rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : (
                                leaders.map((leader, index) => (
                                    <tr
                                        key={leader.id}
                                        className={`group transition-colors ${leader.id === user?.id ? 'bg-[var(--accent-primary)]/5 hover:bg-[var(--accent-primary)]/10' : 'hover:bg-[var(--bg-surface-1)]'}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] group-hover:border-[var(--border-element)]">
                                                {getRankIcon(index)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {leader.avatarUrl ? <img src={leader.avatarUrl} className="w-full h-full rounded-full object-cover" /> : leader.name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                                                        {leader.name}
                                                        {leader.id === user?.id && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-primary)] text-white">YOU</span>}
                                                    </div>
                                                    <div className="text-xs text-[var(--text-tertiary)]">Student</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                Lvl {Math.floor(Math.sqrt(leader.coins))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm font-bold text-[var(--accent-warning)] flex items-center justify-end gap-1">
                                                <span className="text-lg">🪙</span> {leader.coins.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1 text-sm text-[var(--text-secondary)]">
                                                <Trophy size={20} className={leader.streak > 0 ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
                                                {leader.streak} days
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Badges Section */}
            <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Award className="text-[var(--accent-secondary)]" />
                    Earned Badges
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {/* Mock Badges for now */}
                    {[
                        { name: 'Early Bird', icon: '🌅', desc: 'Study before 6AM' },
                        { name: 'Focus Master', icon: '🧘', desc: '10h of Deep Work' },
                        { name: 'Streak King', icon: '🔥', desc: '7 Day Streak' },
                        { name: 'Night Owl', icon: '🦉', desc: 'Study after 10PM' },
                    ].map((badge, i) => (
                        <div key={i} className="card-modern p-4 flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform">
                            <div className="text-4xl mb-1">{badge.icon}</div>
                            <div className="font-semibold text-sm text-[var(--text-primary)]">{badge.name}</div>
                            <div className="text-xs text-[var(--text-tertiary)]">{badge.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
