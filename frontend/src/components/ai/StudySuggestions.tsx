
import { useEffect, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { aiApi } from '../../lib/api';
import { Sparkles, ArrowRight, BrainCircuit, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function StudySuggestions() {
    const { tasks, activeSession, analytics } = useData();
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<{ text: string; action: string; link: string } | null>(null);

    useEffect(() => {
        // Initial load
        analyzeAndSuggest();
    }, [tasks.length, activeSession, analytics?.totalStudyHours]); // Optimized dependencies

    const analyzeAndSuggest = async () => {
        if (activeSession) {
            setSuggestion({
                text: "Focus mode is active. Keep eliminating distractions!",
                action: "View Timer",
                link: "/"
            });
            return;
        }

        setLoading(true);
        try {
            // Try to get AI insight
            const { data } = await aiApi.getInsights();
            if (data.recommendation) {
                setSuggestion({
                    text: data.recommendation,
                    action: "Take Action",
                    link: "/planner" // Default link, could be dynamic based on response
                });
            } else {
                // Fallback logic if AI returns partial data
                setSuggestion({
                    text: "Review your pending tasks to stay ahead to the curve.",
                    action: "View Tasks",
                    link: "/tasks"
                });
            }
        } catch (error) {
            // Fallback to local logic if API fails
            const urgentTasks = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED');
            if (urgentTasks.length > 0) {
                setSuggestion({
                    text: `You have ${urgentTasks.length} urgent tasks. Prioritize them now.`,
                    action: "View Tasks",
                    link: "/tasks"
                });
            } else {
                setSuggestion({
                    text: "Consistency is key. A short study session is better than none.",
                    action: "Start Focus",
                    link: "/"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (!suggestion) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden group">

            <div className="flex items-start gap-4 z-10 relative">
                <div className={`p-3 bg-indigo-500/20 rounded-lg text-indigo-400 ${loading ? 'animate-pulse' : ''}`}>
                    <BrainCircuit size={24} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white mb-1">AI Study Coach</h3>
                        <button
                            onClick={analyzeAndSuggest}
                            disabled={loading}
                            className="text-[var(--text-tertiary)] hover:text-white transition-colors p-1"
                            title="Refresh Insight"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <p className={`text-[var(--text-secondary)] text-sm mb-3 ${loading ? 'opacity-50' : ''}`}>
                        {loading ? "Analyzing your study patterns..." : suggestion.text}
                    </p>

                    {!loading && (
                        <Link
                            to={suggestion.link}
                            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
                        >
                            {suggestion.action} <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors duration-500">
                <Sparkles size={120} />
            </div>
        </div>
    );
}
