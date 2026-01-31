
import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Play, Pause, Square } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    sessionType: 'POMODORO' | 'DEEP_WORK';
    subject?: string;
}

export function FocusOverlay({ isOpen, onClose, sessionType, subject }: FocusOverlayProps) {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25m for Pomodoro
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [elapsed, setElapsed] = useState(0); // For Deep Work
    const [isFullscreen, setIsFullscreen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Setup
    useEffect(() => {
        if (sessionType === 'POMODORO') {
            setTimeLeft(25 * 60);
        } else {
            setElapsed(0);
        }
        setIsActive(false);
    }, [sessionType, isOpen]);

    // Timer Logic
    useEffect(() => {
        let interval: any;

        if (isActive) {
            interval = setInterval(() => {
                if (sessionType === 'POMODORO') {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            handleTimerComplete();
                            return 0;
                        }
                        return prev - 1;
                    });
                } else {
                    setElapsed((prev) => prev + 1);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, sessionType, isBreak]);

    const handleTimerComplete = () => {
        setIsActive(false);
        const audio = new Audio('/sounds/bell.mp3'); // Assuming asset exists, or fail silently
        audio.play().catch(() => { });

        if (!isBreak) {
            // Finished Input
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            // Switch to break?
            if (confirm("Focus Session Complete! User Break?")) {
                setIsBreak(true);
                setTimeLeft(5 * 60);
                setIsActive(true);
            }
        } else {
            alert("Break is over! Back to work?");
            setIsBreak(false);
            setTimeLeft(25 * 60);
            setIsActive(false);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center transition-all bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-4xl p-8">
                {/* Header */}
                <div className="absolute top-8 right-8 flex gap-4">
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        {isFullscreen ? <Minimize2 /> : <Maximize2 />}
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X />
                    </button>
                </div>

                {/* Main Timer */}
                <div className="mb-4">
                    <span className="px-3 py-1 rounded-full border border-white/20 text-sm font-medium tracking-wider uppercase">
                        {isBreak ? 'Break Time' : (sessionType === 'POMODORO' ? 'Pomodoro Session' : 'Deep Work')}
                    </span>
                </div>

                <div className="text-[12rem] font-bold font-mono leading-none tracking-tighter tabular-nums drop-shadow-2xl">
                    {sessionType === 'POMODORO' ? formatTime(timeLeft) : formatTime(elapsed)}
                </div>

                <div className="mt-8 text-2xl text-white/80 font-light">
                    Focusing on <span className="font-semibold text-white">{subject || 'General Study'}</span>
                </div>

                {/* Controls */}
                <div className="mt-12 flex items-center gap-6">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className="h-16 w-16 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
                    >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                    <button
                        onClick={() => {
                            setIsActive(false);
                            // Logic to save session would go here
                            onClose();
                        }}
                        className="h-16 w-16 flex items-center justify-center rounded-full border-2 border-white/20 hover:bg-white/10 transition-colors"
                    >
                        <Square size={24} fill="currentColor" />
                    </button>
                </div>

                {isActive && (
                    <div className="mt-8 text-sm text-white/40 animate-pulse">
                        Do not close this window. Focus is active.
                    </div>
                )}
            </div>
        </div>
    );
}
