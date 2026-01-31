
import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, LineChart, Line,
    ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Activity, Clock, Zap } from 'lucide-react';
import { analyticsApi } from '../lib/api';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export function Analytics() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [activityData, setActivityData] = useState<any[]>([]);
    const [subjectData, setSubjectData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [dash, act, sub] = await Promise.all([
                    analyticsApi.getDashboard(),
                    analyticsApi.getActivity(),
                    analyticsApi.getSubjects()
                ]);
                setDashboardData(dash.data);
                setActivityData(act.data);
                setSubjectData(sub.data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="p-8 text-[var(--accent-primary)] animate-pulse">Loading Analytics...</div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Analytics Hub</h1>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-modern p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-[var(--text-tertiary)]">Total Focus Time</div>
                        <div className="text-2xl font-bold text-white">{(dashboardData?.totalMinutes / 60).toFixed(1)}h</div>
                    </div>
                </div>
                <div className="card-modern p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-[var(--text-tertiary)]">Weekly Activity</div>
                        <div className="text-2xl font-bold text-white">{(dashboardData?.weeklyMinutes / 60).toFixed(1)}h</div>
                    </div>
                </div>
                <div className="card-modern p-6 flex items-center gap-4">
                    <div className="p-3 bg-pink-500/20 rounded-xl text-pink-400">
                        <Zap size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-[var(--text-tertiary)]">Avg Focus Quality</div>
                        <div className="text-2xl font-bold text-white">{dashboardData?.avgFocusScore || 0}%</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Subject Distribution */}
                <div className="card-modern p-6 h-[400px]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Subject Breakdown</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={subjectData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {subjectData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 flex-wrap text-sm text-[var(--text-secondary)]">
                        {subjectData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Focus Trend (Using Activity Data as proxy for weekly trend for now) */}
                <div className="card-modern p-6 h-[400px]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Activity Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activityData.slice(-7)}> {/* Last 7 days */}
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="date" stroke="#666" fontSize={12} tickFormatter={(d: string) => d.slice(5)} /> {/* MM-DD */}
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Heatmap Section */}
            <div className="card-modern p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Consistency Heatmap (Yearly)</h3>
                <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                    {/* Simplified visual representation - In production use robust library or complex grid */}
                    {activityData.slice(-60).map((day, i) => (
                        <div key={i} className="flex flex-col gap-1 items-center group relative">
                            <div
                                className={`w-4 h-4 rounded-sm transition-all hover:scale-125 cursor-pointer
                                    ${day.level === 0 ? 'bg-[var(--bg-surface-3)]' : ''}
                                    ${day.level === 1 ? 'bg-green-900' : ''}
                                    ${day.level === 2 ? 'bg-green-700' : ''}
                                    ${day.level === 3 ? 'bg-green-500' : ''}
                                    ${day.level === 4 ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : ''}
                                `}
                            ></div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-1 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                {day.date}: {day.count}m
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
