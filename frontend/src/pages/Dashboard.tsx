import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
    Clock,
    CheckCircle,
    Flame,
    Target,
    ArrowUpRight,
    Play,
    CheckCircle2,
    StickyNote,
    Quote,
    Save
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    ReferenceLine
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { analyticsApi } from '../lib/api';
import { useData } from '../contexts/DataContext';
import { StudySuggestions } from '../components/ai/StudySuggestions';
import { FocusOverlay } from '../components/focus/FocusOverlay';

export function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const {
        tasks,
        analytics,
        completeTask
    } = useData();

    // Weekly Data State (Still fetching locally as it's specific to this chart)
    const [weeklyData, setWeeklyData] = useState<any[]>([]);

    useEffect(() => {
        const loadWeeklyActivity = async () => {
            try {
                const res = await analyticsApi.getActivity();
                if (res.data?.weekData) setWeeklyData(res.data.weekData);
            } catch (e) {
                console.error(e);
            }
        };
        loadWeeklyActivity();
    }, []);

    // Quick Note State
    const [note, setNote] = useState(() => localStorage.getItem('quick_note') || '');
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Focus Mode State
    const [isFocusOpen, setIsFocusOpen] = useState(false);
    const [focusType, setFocusType] = useState<'POMODORO' | 'DEEP_WORK'>('DEEP_WORK');

    const handleSaveNote = () => {
        setIsSavingNote(true);
        localStorage.setItem('quick_note', note);
        setTimeout(() => setIsSavingNote(false), 1000);
    };

    // Daily Motivation
    const quote = {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
    };

    const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

    // Derived State
    const stats = {
        totalFocusTime: (analytics.weeklyFocusHours || 0) * 60,
        tasksCompleted: analytics.tasksCompleted || 0,
        streakDays: analytics.streakDays || 0,
        weeklyGoalProgress: analytics.totalStudyHours > 0 ? 100 : 0 // Simplified
    };

    const subjectData = analytics.subjectProgress?.length > 0
        ? analytics.subjectProgress
        : [{ name: 'No Data', hours: 1 }];



    const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
    const prevCompletedCount = useRef(completedTasksCount);

    useEffect(() => {
        if (completedTasksCount > prevCompletedCount.current) {
            try {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B']
                });
            } catch (e) {
                console.warn("Confetti failed:", e);
            }
        }
        prevCompletedCount.current = completedTasksCount;
    }, [completedTasksCount]);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };



    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in pb-10">
            {/* AI Suggestion Banner */}
            <StudySuggestions />

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                        {greeting()}, <span className="text-gradient-brand">{user?.name || 'Scholar'}</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg">
                        Ready to focus? You have <span className="text-white font-medium">{pendingTasks.length} tasks</span> scheduled for today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setFocusType('POMODORO');
                            setIsFocusOpen(true);
                        }}
                        className="btn-secondary"
                    >
                        <Clock size={18} className="mr-2" />
                        Pomodoro
                    </button>
                    <button
                        onClick={() => {
                            setFocusType('DEEP_WORK');
                            setIsFocusOpen(true);
                        }}
                        className="btn-primary"
                    >
                        <Play size={18} fill="currentColor" />
                        Start Deep Work
                    </button>
                </div>
            </div>

            <FocusOverlay
                isOpen={isFocusOpen}
                onClose={() => setIsFocusOpen(false)}
                sessionType={focusType}
                subject={pendingTasks[0]?.subject || 'General Study'}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    icon={<Clock size={20} />}
                    label="Focus Time"
                    value={`${(stats.totalFocusTime / 60).toFixed(1)}h`}
                    change="+12%"
                    trend="up"
                    color="blue"
                />
                <StatCard
                    icon={<CheckCircle size={20} />}
                    label="Tasks Done"
                    value={completedTasksCount}
                    change="85%"
                    trend="up"
                    color="green"
                />
                <StatCard
                    icon={<Flame size={20} />}
                    label="Day Streak"
                    value={stats.streakDays}
                    change="On fire!"
                    trend="up"
                    color="orange"
                />
                <StatCard
                    icon={<Target size={20} />}
                    label="Weekly Goal"
                    value={`${stats.weeklyGoalProgress}%`}
                    change="+5%"
                    trend="up"
                    color="violet"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Activity Chart */}
                <div className="lg:col-span-2 card-modern p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Study Activity</h3>
                            <p className="text-sm text-[var(--text-tertiary)]">Hours focused per day</p>
                        </div>
                        <select className="bg-[var(--bg-surface-2)] border border-[var(--border-element)] text-xs text-[var(--text-secondary)] rounded-md px-2 py-1 outline-none">
                            <option>This Week</option>
                            <option>Last Week</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="var(--text-tertiary)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="var(--text-tertiary)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-surface-1)',
                                        borderColor: 'var(--border-element)',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="var(--accent-primary)"
                                    strokeWidth={3}
                                    fill="url(#colorGradient)"
                                />
                                <ReferenceLine y={5} stroke="var(--accent-ai)" strokeDasharray="3 3" label={{ position: 'top', value: 'Goal: 5h', fill: 'var(--accent-ai)', fontSize: 10 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Distribution */}
                <div className="card-modern p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Subject Breakdown</h3>
                    <p className="text-sm text-[var(--text-tertiary)] mb-6">Time distribution</p>

                    <div className="h-[220px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={subjectData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="hours"
                                    nameKey="name"
                                    stroke="none"
                                >
                                    {subjectData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-surface-1)',
                                        borderColor: 'var(--border-element)',
                                        borderRadius: '8px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-white">
                                {(stats.totalFocusTime / 60).toFixed(0)}
                            </span>
                            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Hours</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {subjectData?.map((subject, index) => (
                            <div key={subject.name || index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-[var(--text-secondary)]">{subject.name}</span>
                                </div>
                                <span className="font-medium text-white">
                                    {(subject as any)?.hours ? (subject as any).hours + 'h' : '0%'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Tasks & Widgets */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Priority Tasks (Takes 2 columns) */}
                <div className="lg:col-span-2 card-modern h-full">
                    <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Priority Tasks</h3>
                            <p className="text-sm text-[var(--text-tertiary)]">High priority items for today</p>
                        </div>
                        <button
                            onClick={() => navigate('/tasks')}
                            className="btn-secondary text-xs"
                        >
                            View All
                        </button>
                    </div>
                    <div className="p-2">
                        {pendingTasks.slice(0, 4).map(task => (
                            <div
                                key={task.id}
                                onClick={() => navigate('/tasks')}
                                className="group flex items-center justify-between p-4 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            completeTask(task.id);
                                        }}
                                        className="w-5 h-5 rounded-full border-2 border-[var(--text-tertiary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 transition-all"
                                    />
                                    <div>
                                        <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-white transition-colors">
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${task.priority === 'HIGH' || task.priority === 'URGENT'
                                                ? 'bg-red-500/10 text-red-500'
                                                : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            <span className="text-xs text-[var(--text-tertiary)]">• {task.subject || 'General'}</span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowUpRight size={16} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </div>
                        ))}
                        {pendingTasks.length === 0 && (
                            <div className="p-8 text-center text-[var(--text-secondary)]">
                                <CheckCircle2 size={32} className="mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
                                <p>No pending tasks</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Widgets Column */}
                <div className="space-y-6">
                    {/* Daily Motivation */}
                    <div className="card-modern p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-purple-500/20">
                        <div className="flex items-center gap-2 mb-4 text-purple-400">
                            <Quote size={20} className="fill-current opacity-50" />
                            <span className="text-xs font-bold uppercase tracking-wider">Daily Inspiration</span>
                        </div>
                        <p className="text-lg font-medium text-white italic mb-4 leading-relaxed">
                            "{quote.text}"
                        </p>
                        <p className="text-sm text-purple-300">— {quote.author}</p>
                    </div>

                    {/* Quick Note */}
                    <div className="card-modern p-0 overflow-hidden flex flex-col h-[250px]">
                        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-2)]">
                            <div className="flex items-center gap-2 text-[var(--text-primary)]">
                                <StickyNote size={18} className="text-yellow-500" />
                                <span className="font-semibold text-sm">Quick Note</span>
                            </div>
                            <button
                                onClick={handleSaveNote}
                                className={`p-1.5 rounded-lg transition-all ${isSavingNote ? 'bg-green-500 text-white' : 'hover:bg-[var(--bg-surface-1)] text-[var(--text-secondary)]'}`}
                            >
                                {isSavingNote ? <CheckCircle2 size={16} /> : <Save size={16} />}
                            </button>
                        </div>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Jot down a quick thought..."
                            className="flex-1 w-full bg-transparent p-4 resize-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, change, trend, color }: any) {
    const colorMap: any = {
        blue: 'text-blue-500 bg-blue-500/10',
        green: 'text-emerald-500 bg-emerald-500/10',
        orange: 'text-amber-500 bg-amber-500/10',
        violet: 'text-violet-500 bg-violet-500/10',
    };

    return (
        <div className="card-modern card-glow p-5">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                    }`}>
                    {change}
                </div>
            </div>
            <div>
                <h4 className="text-2xl font-bold text-white tracking-tight mb-1">{value}</h4>
                <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
            </div>
        </div>
    );
}
