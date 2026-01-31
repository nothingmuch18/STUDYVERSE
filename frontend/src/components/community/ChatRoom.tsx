
import { useState, useEffect, useRef } from 'react';
import { Send, Users } from 'lucide-react';
import { communityApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export function ChatRoom() {
    const { user } = useAuth();
    const [groups, setGroups] = useState<any[]>([]);
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const loadGroups = async () => {
            const { data } = await communityApi.getGroups();
            setGroups(data);
            if (data.length > 0) setActiveGroup(data[0].id);
        };
        loadGroups();
    }, []);

    // Poll Messages
    useEffect(() => {
        if (!activeGroup) return;

        const fetchMessages = async () => {
            const { data } = await communityApi.getMessages(activeGroup);
            setMessages(data);
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [activeGroup]);

    // Scroll to bottom
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeGroup) return;

        try {
            await communityApi.sendMessage(activeGroup, newMessage);
            setNewMessage('');
            // Optimistic update? Or just wait for poll. Waiting is safer for now.
            const { data } = await communityApi.getMessages(activeGroup);
            setMessages(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Sidebar: Groups */}
            <div className="card-modern p-0 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Users size={18} /> Study Groups
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {groups.map(group => (
                        <button
                            key={group.id}
                            onClick={() => setActiveGroup(group.id)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${activeGroup === group.id
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)]'
                                }`}
                        >
                            <div className="font-medium">{group.name}</div>
                            <div className="text-xs opacity-70">{group.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3 card-modern p-0 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="font-medium text-white">
                        {groups.find(g => g.id === activeGroup)?.name || 'Select a Group'}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live
                    </span>
                </div>

                <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => {
                        const isMe = msg.senderId === user?.id;
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-3)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                                    {msg.sender?.avatarUrl ? <img src={msg.sender.avatarUrl} className="w-full h-full rounded-full" /> : msg.sender?.name?.[0]}
                                </div>
                                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe
                                    ? 'bg-[var(--accent-primary)] text-white rounded-tr-none'
                                    : 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] rounded-tl-none'
                                    }`}>
                                    {!isMe && <div className="text-[10px] opacity-50 mb-1">{msg.sender?.name}</div>}
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-2)] flex gap-2">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-[var(--bg-surface-1)] border border-[var(--border-element)] rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                    />
                    <button type="submit" className="p-2 rounded-full bg-[var(--accent-primary)] text-white hover:brightness-110 transition-all">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
