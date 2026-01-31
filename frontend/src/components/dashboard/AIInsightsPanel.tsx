import { useState, useEffect } from 'react';
import { Sparkles, Brain, ArrowRight, Zap, Target } from 'lucide-react';
import { aiApi } from '../../lib/api';

export function AIInsightsPanel() {
    const [typing, setTyping] = useState(true);
    const [message, setMessage] = useState('');
    const [fullMessage, setFullMessage] = useState("Analyzing your study patterns...");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                // Fetch real insights from AI
                // For now, we'll try to fetch, if it fails (e.g. no key), fallback to hardcoded
                const { data } = await aiApi.getInsights();
                if (data.insights && data.insights.length > 0) {
                    setFullMessage(data.insights[0].content);
                } else {
                    setFullMessage("Start tracking your study sessions to get personalized AI insights! 🚀");
                }
            } catch (error) {
                console.error("Failed to fetch AI insights", error);
                setFullMessage("Ready to boost your productivity? Start a focus session now!");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsights();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        setMessage('');
        setTyping(true);
        let i = 0;
        const interval = setInterval(() => {
            if (i < fullMessage.length) {
                setMessage(prev => prev + fullMessage.charAt(i));
                i++;
            } else {
                setTyping(false);
                clearInterval(interval);
            }
        }, 30);
        return () => clearInterval(interval);
    }, [fullMessage, isLoading]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* AI Assistant Message */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-surface-1)] to-[var(--bg-surface-2)] p-6 group">
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-ai)] opacity-5 blur-[80px] rounded-full pointer-events-none -mr-20 -mt-20" />

                <div className="flex items-start gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[var(--ai-gradient)] flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/20 animate-pulse">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-transparent bg-clip-text bg-[var(--ai-gradient)]">
                                StudyAI Assistant
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-surface-3)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
                                BETA
                            </span>
                        </div>
                        <div className="text-lg text-[var(--text-primary)] font-medium leading-relaxed min-h-[56px]">
                            {message}
                            {typing && <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--accent-ai)] animate-pulse align-middle" />}
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] transition-colors">
                                Generate New Tip
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Insight Stats */}
            <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <Brain size={18} />
                        </div>
                        <div>
                            <div className="text-xs text-[var(--text-tertiary)]">Peak Focus</div>
                            <div className="text-sm font-semibold text-white">09:00 AM - 11:00 AM</div>
                        </div>
                    </div>
                    <Zap size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-secondary)] transition-colors" />
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                            <Target size={18} />
                        </div>
                        <div>
                            <div className="text-xs text-[var(--text-tertiary)]">Next Goal</div>
                            <div className="text-sm font-semibold text-white">Keep Streak Alive</div>
                        </div>
                    </div>
                    <ArrowRight size={14} className="text-[var(--text-tertiary)] group-hover:text-amber-500 transition-colors transform group-hover:translate-x-1" />
                </div>
            </div>
        </div>
    );
}
