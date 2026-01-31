import { Search, Bell, Moon, Sun, Zap, Menu } from 'lucide-react';
import { useTheme } from '../../contexts';

interface HeaderProps {
    toggleSidebar: () => void;
    toggleFocusMode?: () => void;
}

export function Header({ toggleSidebar, toggleFocusMode }: HeaderProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-[var(--header-height)] sticky top-0 z-40 glass-subtle px-6 flex items-center justify-between">
            {/* Left: Branding for mobile or Context for Desktop */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 text-[var(--text-secondary)] hover:text-white lg:hidden"
                >
                    <Menu size={24} />
                </button>

                {/* Global Search */}
                <div className="relative group hidden md:block">
                    <div className="absolute -top-3 left-0 text-[10px] text-[var(--accent-ai)] font-medium animate-pulse">
                        ✨ AI Suggestion: Review Biology
                    </div>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search workspace..."
                        className="
                            w-64 pl-10 pr-4 py-2 rounded-lg 
                            bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] 
                            text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                            focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/50
                            transition-all
                        "
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
                        <span className="text-[10px] sm:hidden">⌘K</span>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* Focus Mode Toggle */}
                <button
                    onClick={toggleFocusMode}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-element)] bg-[var(--bg-surface-1)] hover:border-[var(--accent-primary)] transition-all group"
                >
                    <Zap size={14} className="text-[var(--warning)] group-hover:text-[var(--accent-primary)]" />
                    <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-white">Focus Mode</span>
                </button>

                <div className="w-[1px] h-6 bg-[var(--border-subtle)] mx-1 hidden sm:block" />

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface-2)] transition-colors"
                >
                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                <button className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface-2)] transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[var(--error)] rounded-full border border-[var(--bg-canvas)]"></span>
                </button>
            </div>
        </header>
    );
}
