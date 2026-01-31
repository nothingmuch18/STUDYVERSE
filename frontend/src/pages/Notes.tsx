
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export function Notes() {
    const [note, setNote] = useState('');
    const [savedTime, setSavedTime] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('studyos_quick_notes');
        if (saved) setNote(saved);
    }, []);

    const handleSave = () => {
        localStorage.setItem('studyos_quick_notes', note);
        setSavedTime(new Date().toLocaleTimeString());
        setTimeout(() => setSavedTime(null), 3000);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto h-[calc(100vh-theme(spacing.20))]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Quick Notes</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Capture thoughts instantly</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-all font-medium"
                >
                    <Save size={18} />
                    <span>Save Note</span>
                </button>
            </div>

            <div className="relative h-full pb-8">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full h-full p-6 text-lg bg-[var(--bg-surface-1)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/50 resize-none leading-relaxed font-mono"
                    placeholder="Start typing your notes here..."
                />

                {savedTime && (
                    <div className="absolute bottom-12 right-6 px-3 py-1 bg-[var(--accent-success)]/10 text-[var(--accent-success)] text-sm rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <CheckIcon />
                        <span>Saved at {savedTime}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );
}
