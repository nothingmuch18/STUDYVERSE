import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Square, Music, Maximize2, Minimize2 } from 'lucide-react';
import { sessionsApi } from '../../lib/api';

interface FocusModeProps {
    isOpen: boolean;
    onClose: () => void;
    initialTask?: string; // Optional task to focus on
}

export function FocusMode({ isOpen, onClose, initialTask }: FocusModeProps) {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
    const [isActive, setIsActive] = useState(false);
    const [isZen, setIsZen] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const startTimeRef = useRef<Date | null>(null);

    // Initial task display
    const currentTask = initialTask || "Focus Session";

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSessionComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleStart = async () => {
        if (!isActive) {
            try {
                // If resuming or starting fresh
                if (!sessionId) {
                    const { data } = await sessionsApi.start({
                        subject: 'General'
                    });
                    setSessionId(data.session.id);
                    startTimeRef.current = new Date();
                }
                setIsActive(true);
            } catch (error) {
                console.error("Failed to start session", error);
                // Fallback to local timer if offline
                setIsActive(true);
            }
        } else {
            setIsActive(false); // Pause
        }
    };

    const handleStop = async () => {
        setIsActive(false);
        if (sessionId) {
            try {
                await sessionsApi.end(sessionId);
            } catch (error) {
                console.error("Failed to end session", error);
            }
            setSessionId(null);
        }
        setTimeLeft(25 * 60); // Reset
    };

    const handleSessionComplete = async () => {
        setIsActive(false);
        // Play notification sound here
        if (sessionId) {
            try {
                await sessionsApi.end(sessionId);
            } catch (error) {
                console.error("Failed to save completed session", error);
            }
            setSessionId(null);
        }
    };

    // Cleanup on unmount or close if active
    useEffect(() => {
        return () => {
            // If component unmounts while session is active, we might want to end it or keep it background.
            // For now, let's just leave it (browser close might lose end event)
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 transition-all duration-500 ${isZen ? 'bg-black' : 'bg-[var(--bg-canvas)]/95 backdrop-blur-xl'}`}>
            {/* Top Bar */}
            <div className={`absolute top-0 left-0 right-0 p-6 flex items-center justify-between transition-opacity ${isActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
                <div className="flex items-center gap-4">
                    <div className="text-xl font-bold text-white tracking-widest">FOCUS MODE</div>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-[var(--bg-surface-3)] text-[var(--accent-ai)] border border-[var(--border-subtle)]">
                        BETA
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsZen(!isZen)}
                        className="p-3 rounded-full hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-white transition-all"
                        title="Zen Mode"
                    >
                        {isZen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full hover:bg-[var(--error)]/20 text-[var(--text-secondary)] hover:text-[var(--error)] transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="h-full flex flex-col items-center justify-center relative">

                {/* Timer Circle */}
                <div className="relative mb-12 group">
                    <div className="absolute inset-0 bg-[var(--accent-primary)] rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                    <div className="text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-[var(--text-secondary)] tabular-nums leading-none tracking-tighter select-none">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8 mb-16">
                    <button className="p-4 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface-3)] transition-all border border-[var(--border-subtle)]">
                        <Music size={24} />
                    </button>

                    <button
                        onClick={handleStart}
                        className="w-20 h-20 rounded-full bg-[var(--accent-primary)] hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] flex items-center justify-center text-white transition-all duration-300"
                    >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>

                    <button
                        onClick={handleStop}
                        className="p-4 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface-3)] transition-all border border-[var(--border-subtle)]">
                        <Square size={24} fill="currentColor" className="scale-75" />
                    </button>
                </div>

                {/* Current Task */}
                <div className="text-center space-y-2 max-w-md mx-auto">
                    <div className="text-sm font-medium text-[var(--accent-ai)] uppercase tracking-widest">Current Task</div>
                    <div className="text-2xl font-medium text-white">{currentTask}</div>
                    <div className="flex items-center justify-center gap-2 text-[var(--text-tertiary)] text-sm mt-2">
                        <span>Stay focused</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
                        <span>Keep the streak</span>
                    </div>
                </div>
            </div>

            {/* Quote Footer */}
            <div className={`absolute bottom-8 left-0 right-0 text-center transition-opacity duration-1000 ${isActive ? 'opacity-0' : 'opacity-60'}`}>
                <p className="text-[var(--text-secondary)] italic">"Focus is the key to all great achievements."</p>
            </div>
        </div>
    );
}
