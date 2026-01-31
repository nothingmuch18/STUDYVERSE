
import { ChatRoom } from '../components/community/ChatRoom';

export function Community() {
    return (
        <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Community Hub</h1>
                <p className="text-[var(--text-secondary)]">Connect with fellow students in real-time study groups.</p>
            </div>

            <ChatRoom />
        </div>
    );
}
