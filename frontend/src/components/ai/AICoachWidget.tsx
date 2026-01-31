import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, Bot } from 'lucide-react';
import { aiApi } from '../../lib/api';

export function AICoachWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Hi! I'm Prof. Nova. How can I help you study better today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const { data } = await aiApi.postChat({
                message: userMsg,
                history: messages.map(m => ({ role: m.role, content: m.content }))
            });

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my knowledge base right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-[500px] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 bg-[var(--accent-primary)] text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Prof. Nova</h3>
                                <p className="text-xs text-blue-100">AI Study Coach</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-surface-0)] custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[var(--accent-primary)] text-white rounded-br-none'
                                    : 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] rounded-bl-none border border-[var(--border-subtle)]'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--bg-surface-2)] p-3 rounded-2xl rounded-bl-none border border-[var(--border-subtle)] flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)]">
                        <div className="relative">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask for study tips..."
                                className="w-full bg-[var(--bg-surface-2)] border border-[var(--border-element)] rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-[var(--accent-primary)] text-[var(--text-primary)]"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--accent-primary)] text-white rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isOpen ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)]' : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-ai)] text-white'
                    }`}
            >
                {isOpen ? <X size={24} /> : <Bot size={28} />}
            </button>
        </div>
    );
}
