import { useState, useEffect } from 'react';
import {
    Plus,
    Calendar,
    Book,
    Brain,
    Sparkles,
    ChevronRight,
    Play,
    Pause,
    RotateCcw,
    CheckCircle,
    Edit2,
    Clock,
    Coffee,
    Maximize2,
    Minimize2
} from 'lucide-react';


export function StudyPlanner() {
    const [isPomodoroActive, setIsPomodoroActive] = useState(false);
    const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
    const [isBreak, setIsBreak] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPomodoroActive && pomodoroTime > 0) {
            interval = setInterval(() => {
                setPomodoroTime((prev) => prev - 1);
            }, 1000);
        } else if (pomodoroTime === 0) {
            setIsPomodoroActive(false);
            // Play notification sound here
        }
        return () => clearInterval(interval);
    }, [isPomodoroActive, pomodoroTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsPomodoroActive(!isPomodoroActive);
    const resetTimer = () => {
        setIsPomodoroActive(false);
        setPomodoroTime(isBreak ? 5 * 60 : 25 * 60);
    };

    const subjects = [
        { id: '1', name: 'Mathematics', topics: ['Calculus', 'Linear Algebra', 'Statistics'], progress: 75, color: '#8b5cf6' },
        { id: '2', name: 'Physics', topics: ['Mechanics', 'Thermodynamics', 'Optics'], progress: 60, color: '#06b6d4' },
        { id: '3', name: 'Computer Science', topics: ['Data Structures', 'Algorithms', 'Databases'], progress: 85, color: '#22c55e' },
        { id: '4', name: 'English', topics: ['Grammar', 'Essays', 'Literature'], progress: 40, color: '#f59e0b' },
    ];

    const todaySchedule = [
        { time: '09:00', subject: 'Mathematics', topic: 'Differential Equations', duration: 90, status: 'completed' },
        { time: '11:00', subject: 'Physics', topic: 'Thermodynamics Laws', duration: 60, status: 'current' },
        { time: '14:00', subject: 'Computer Science', topic: 'Binary Trees', duration: 90, status: 'upcoming' },
        { time: '16:00', subject: 'English', topic: 'Essay Structure', duration: 60, status: 'upcoming' },
    ];

    return (
        <div className={`space-y-6 animate-fade-in ${isFullscreen ? 'fixed inset-0 z-50 bg-[var(--bg-primary)] p-6 overflow-auto' : ''}`}>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        Study Planner 📚
                        {isFullscreen && <span className="text-sm font-normal px-2 py-1 bg-red-500/10 text-red-500 rounded-full">Focus Mode Active</span>}
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        AI-powered study schedules tailored to your goals
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="btn btn-secondary"
                        title="Toggle Focus Mode"
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button className="btn btn-primary group">
                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                        Auto-Schedule with AI
                    </button>
                </div>
            </div>

            {/* Top Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Pomodoro Timer */}
                <div className={`card relative overflow-hidden transition-all ${isPomodoroActive ? 'ring-2 ring-[var(--primary-500)] shadow-[0_0_30px_rgba(139,92,246,0.2)]' : ''}`}>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-500)] opacity-5 rounded-bl-full pointer-events-none" />

                    <div className="text-center relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            {isBreak ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">
                                    <Coffee size={16} /> Break Time
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-500)]/10 text-[var(--primary-500)] font-medium">
                                    <Clock size={16} /> Focus Mode
                                </span>
                            )}
                        </div>

                        <div className="relative w-56 h-56 mx-auto mb-8 group cursor-pointer" onClick={toggleTimer}>
                            {/* Timer Circle */}
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
                                <circle
                                    cx="112"
                                    cy="112"
                                    r="100"
                                    fill="none"
                                    stroke="var(--bg-tertiary)"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="112"
                                    cy="112"
                                    r="100"
                                    fill="none"
                                    stroke={isBreak ? '#22c55e' : '#8b5cf6'}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 100}
                                    strokeDashoffset={2 * Math.PI * 100 * (1 - pomodoroTime / (isBreak ? 5 * 60 : 25 * 60))}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                    {formatTime(pomodoroTime)}
                                </span>
                                <span className="text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                                    {isPomodoroActive ? 'Click to Pause' : 'Click to Start'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={toggleTimer}
                                className={`btn w-32 ${isPomodoroActive ? 'btn-secondary' : 'btn-primary'}`}
                            >
                                {isPomodoroActive ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                                {isPomodoroActive ? 'Pause' : 'Start'}
                            </button>
                            <button
                                onClick={resetTimer}
                                className="btn btn-secondary btn-icon"
                                title="Reset Timer"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[var(--border-primary)]">
                            <button
                                className={`p-2 rounded-lg text-sm font-medium transition-all ${!isBreak
                                    ? 'bg-[var(--primary-500)] text-white shadow-lg'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                                    }`}
                                onClick={() => { setIsBreak(false); setPomodoroTime(25 * 60); setIsPomodoroActive(false); }}
                            >
                                Focus (25m)
                            </button>
                            <button
                                className={`p-2 rounded-lg text-sm font-medium transition-all ${isBreak
                                    ? 'bg-green-500 text-white shadow-lg'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                                    }`}
                                onClick={() => { setIsBreak(true); setPomodoroTime(5 * 60); setIsPomodoroActive(false); }}
                            >
                                Break (5m)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule */}
                <div className="lg:col-span-2 card flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Calendar size={20} className="text-[var(--primary-400)]" />
                            Today's Schedule
                        </h3>
                        <div className="text-sm px-3 py-1 rounded-full bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-secondary)' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {todaySchedule.map((item, index) => (
                            <div
                                key={index}
                                className={`group flex items-start sm:items-center gap-4 p-4 rounded-xl transition-all hover:translate-x-1 ${item.status === 'current'
                                    ? 'ring-1 ring-[var(--primary-500)] shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                                    : 'hover:bg-[var(--bg-tertiary)]'
                                    }`}
                                style={{
                                    background: item.status === 'completed'
                                        ? 'rgba(34, 197, 94, 0.05)'
                                        : item.status === 'current'
                                            ? 'rgba(139, 92, 246, 0.05)'
                                            : 'transparent',
                                    border: `1px solid ${item.status === 'current' ? 'var(--primary-200)' : 'var(--border-primary)'}`
                                }}
                            >
                                <div className="text-center min-w-[70px] flex flex-col items-center gap-1">
                                    <p className="text-sm font-bold p-1 rounded bg-[var(--bg-secondary)] w-full" style={{ color: 'var(--text-primary)' }}>
                                        {item.time}
                                    </p>
                                    <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                        {item.duration}m
                                    </p>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {item.subject}
                                        </h4>
                                        {item.status === 'upcoming' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">Upcoming</span>}
                                    </div>
                                    <p className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                                        <Book size={12} />
                                        {item.topic}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {item.status === 'completed' && (
                                        <div className="flex items-center gap-2 text-green-500 font-medium text-sm">
                                            <CheckCircle size={18} />
                                            <span className="hidden sm:inline">Done</span>
                                        </div>
                                    )}
                                    {item.status === 'current' && (
                                        <button className="btn btn-primary btn-sm animate-pulse-slow">
                                            <Play size={14} fill="currentColor" />
                                            Resume
                                        </button>
                                    )}
                                    <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-secondary)] transition-all">
                                        <Edit2 size={16} className="text-[var(--text-tertiary)]" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button className="w-full py-3 border-2 border-dashed border-[var(--border-primary)] rounded-xl text-[var(--text-tertiary)] hover:border-[var(--primary-400)] hover:text-[var(--primary-400)] transition-all flex items-center justify-center gap-2">
                            <Plus size={18} />
                            Add Study Session
                        </button>
                    </div>
                </div>
            </div>

            {/* Subjects Grid */}
            <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Brain size={24} className="text-[var(--accent-500)]" />
                        Your Subjects
                    </h2>
                    <button className="btn btn-secondary btn-sm">
                        <Plus size={16} />
                        Add Subject
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subjects.map((subject) => (
                        <div key={subject.id} className="card-interactive hover-glow group">
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                                    style={{ background: `${subject.color}15` }}
                                >
                                    <Book size={24} style={{ color: subject.color }} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                                        <Edit2 size={14} style={{ color: 'var(--text-tertiary)' }} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                                {subject.name}
                            </h3>
                            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                {subject.topics.length} topics • 3 upcoming
                            </p>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span style={{ color: 'var(--text-tertiary)' }}>Mastery</span>
                                    <span style={{ color: subject.color }}>{subject.progress}%</span>
                                </div>
                                <div className="progress h-2 bg-[var(--bg-tertiary)]">
                                    <div
                                        className="progress-bar rounded-full relative overflow-hidden"
                                        style={{ width: `${subject.progress}%`, background: subject.color }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Suggestions Banner */}
            <div className="card gradient-primary text-white p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 animate-float">
                        <Sparkles size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold mb-2">AI Study Recommendations</h3>
                        <p className="text-white/90 mb-4 max-w-2xl">
                            Based on your recent quiz scores, I recommend focusing more on <span className="font-bold underline decoration-white/30 underline-offset-4">Thermodynamics</span> (Physics) and <span className="font-bold underline decoration-white/30 underline-offset-4">Integration</span> (Math). Your next exam is in 2 weeks!
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <button className="btn bg-white text-[var(--primary-600)] hover:bg-white/90 border-none">
                                Generate Exam Plan
                                <ChevronRight size={18} />
                            </button>
                            <button className="btn bg-black/20 text-white hover:bg-black/30 border-none backdrop-blur">
                                View Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
