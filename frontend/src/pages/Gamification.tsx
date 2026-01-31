import { useState, useEffect } from 'react';
import { gamificationApi } from '../lib/api';
import { Trophy, Coins, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Gamification() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [badges, setBadges] = useState<{ all: any[], earned: any[] }>({ all: [], earned: [] });
    const [stats, setStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'LEADERBOARD' | 'BADGES'>('LEADERBOARD');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [lbRes, badgesRes, statsRes] = await Promise.all([
                gamificationApi.getLeaderboard(),
                gamificationApi.getBadges(),
                gamificationApi.getStats()
            ]);
            setLeaderboard(lbRes.data);
            setBadges(badgesRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-[var(--bg-surface-1)] to-[var(--bg-surface-2)] p-8 rounded-2xl border border-[var(--border-subtle)] relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Rewards Center</h1>
                    <p className="text-[var(--text-secondary)]">Earn coins, collect badges, and climb the ranks!</p>
                </div>

                <div className="flex gap-6 mt-6 md:mt-0 relative z-10">
                    <div className="flex items-center gap-3 bg-[var(--bg-canvas)]/50 p-4 rounded-xl border border-[var(--border-subtle)] backdrop-blur-sm">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                            <Coins size={24} />
                        </div>
                        <div>
                            <span className="block text-2xl font-bold text-white">{stats?.coins || 0}</span>
                            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Coins</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-[var(--bg-canvas)]/50 p-4 rounded-xl border border-[var(--border-subtle)] backdrop-blur-sm">
                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                            <FlameIcon />
                        </div>
                        <div>
                            <span className="block text-2xl font-bold text-white">{stats?.streak || 0}</span>
                            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Day Streak</span>
                        </div>
                    </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--accent-primary)]/10 blur-[100px] rounded-full pointer-events-none" />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-[var(--border-subtle)] pb-1">
                <button
                    onClick={() => setActiveTab('LEADERBOARD')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'LEADERBOARD' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
                >
                    Leaderboard
                    {activeTab === 'LEADERBOARD' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[var(--accent-primary)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('BADGES')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'BADGES' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
                >
                    Badges & Achievements
                    {activeTab === 'BADGES' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[var(--accent-primary)]" />}
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'LEADERBOARD' ? (
                    <div className="bg-[var(--bg-surface-1)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[var(--bg-surface-2)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Coins</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Streak</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-subtle)]">
                                {leaderboard.map((student, index) => (
                                    <tr key={student.id} className={`hover:bg-[var(--bg-surface-2)] transition-colors ${student.id === user?.id ? 'bg-[var(--accent-primary)]/5' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold
                                                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                        index === 2 ? 'bg-amber-600/20 text-amber-600' :
                                                            'text-[var(--text-tertiary)]'
                                                }`}
                                            >
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-xs font-bold text-white">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className={`font-medium ${student.id === user?.id ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                                                    {student.name} {student.id === user?.id && '(You)'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-medium text-[var(--text-primary)]">
                                            {student.coins}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)]">
                                            {student.streak} days
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Use real badges if available, else mocks */}
                        {(badges.all && badges.all.length > 0 ? badges.all : [
                            { name: 'Early Bird', desc: 'Complete a task before 8 AM', icon: <Zap size={24} />, earned: true },
                            { name: 'Task Master', desc: 'Complete 100 tasks', icon: <Trophy size={24} />, earned: true },
                            { name: 'Study Sage', desc: 'Log 50 hours of focus', icon: <BookIcon />, earned: false },
                            { name: 'Socialite', desc: 'Join 3 study groups', icon: <UsersIcon />, earned: false },
                        ]).map((badge, i) => (
                            <div key={i} className={`p-6 rounded-xl border flex flex-col items-center text-center transition-all ${badge.earned ? 'bg-[var(--bg-surface-1)] border-[var(--accent-primary)]/30' : 'bg-[var(--bg-surface-0)] border-[var(--border-subtle)] opacity-50 grayscale'}`}>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${badge.earned ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' : 'bg-[var(--bg-surface-2)] text-[var(--text-tertiary)]'}`}>
                                    {badge.icon}
                                </div>
                                <h3 className="font-bold text-[var(--text-primary)] mb-1">{badge.name}</h3>
                                <p className="text-xs text-[var(--text-secondary)]">{badge.desc}</p>
                                {badge.earned && <div className="mt-4 text-xs font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-1 rounded-full">Earned</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function FlameIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.243-2.143.702-3.084C5.068 11.233 4.5 10 4.5 10c0 4.5 9 3.5 4 4.5Z"></path>
        </svg>
    )
}

function BookIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> }
function UsersIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> }
