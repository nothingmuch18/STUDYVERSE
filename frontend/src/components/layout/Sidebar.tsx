import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UpgradeModal } from '../subscription/UpgradeModal';
import {
    LayoutDashboard,
    Calendar,
    BookOpen,
    Briefcase,
    CheckSquare,
    Target,
    Zap,
    Award,
    Settings,
    GraduationCap,
    Sparkles,
    Users,
    Trophy,
    Headphones
} from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/planner', label: 'Study Planner', icon: Calendar },
        { path: '/tasks', label: 'Tasks', icon: CheckSquare },
        { path: '/brain/notes', label: 'Notes', icon: BookOpen },
        { path: '/habits', label: 'Habits', icon: Zap },
        { path: '/goals', label: 'Goals', icon: Target },
        { path: '/community', label: 'Community', icon: Users },
        { path: '/career', label: 'Career', icon: Briefcase },
        { path: '/analytics', label: 'Analytics', icon: LayoutDashboard }, // Changing Icon to differentiate
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        { path: '/quiz', label: 'Quizzes', icon: Award },
        { path: '/music', label: 'Focus Music', icon: Headphones },
    ];

    return (
        <>
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed top-0 left-0 h-full z-50
                    bg-[var(--bg-surface-1)] border-r border-[var(--border-subtle)]
                    flex flex-col transition-all duration-300
                    ${isCollapsed ? 'w-20' : 'w-[260px]'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Brand / Logo */}
                <div className="h-[var(--header-height)] flex items-center px-6 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <GraduationCap className="text-white" size={18} />
                        </div>
                        {!isCollapsed && (
                            <span className="font-bold text-lg text-white tracking-tight">
                                StudyVerse <span className="text-[var(--accent-primary)]">.</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {/* Section Label */}
                    {!isCollapsed && (
                        <div className="px-3 mb-2 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                            Main Menu
                        </div>
                    )}

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative
                                ${isActive
                                    ? 'text-white bg-[var(--bg-surface-3)]'
                                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface-2)]'
                                }
                                ${isCollapsed ? 'justify-center' : ''}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && !isCollapsed && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--accent-primary)] rounded-r-full shadow-[0_0_12px_var(--accent-primary)]" />
                                    )}
                                    <item.icon
                                        size={20}
                                        className={`transition-colors ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)] group-hover:text-white'}`}
                                    />
                                    {!isCollapsed && (
                                        <span className="tracking-wide">{item.label}</span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* Pro Feature Teaser */}
                    {!isCollapsed && (
                        <div
                            className="mt-8 mx-3 p-4 rounded-xl bg-gradient-to-br from-[var(--bg-surface-2)] to-[var(--bg-surface-1)] border border-[var(--border-subtle)] relative overflow-hidden group cursor-pointer"
                            onClick={() => setIsUpgradeModalOpen(true)}
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Sparkles size={40} />
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1">Go Pro</h4>
                            <p className="text-xs text-[var(--text-secondary)] mb-3">Unlock AI features & unlimited history.</p>
                            <button className="w-full py-1.5 text-xs font-medium text-white bg-[var(--accent-primary)] rounded-md hover:brightness-110 transition-all">
                                Upgrade Plan
                            </button>
                        </div>
                    )}
                </div>

                {/* User Profile / Bottom */}
                <div className="p-4 border-t border-[var(--border-subtle)]">
                    <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[var(--bg-surface-2)] transition-colors text-left group">
                        <div className="w-9 h-9 rounded-full bg-[var(--bg-surface-3)] border border-[var(--border-element)] flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-white">AM</span>
                        </div>

                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate group-hover:text-[var(--accent-primary)] transition-colors">Aryan M.</div>
                                <div className="text-xs text-[var(--text-tertiary)] truncate">Free Plan</div>
                            </div>
                        )}

                        {!isCollapsed && <Settings size={16} className="text-[var(--text-tertiary)] group-hover:text-white transition-colors" />}
                    </button>
                </div>

                {/* Toggle Button (Desktop) */}
                <button
                    onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-white transition-colors shadow-lg hidden lg:flex z-50 hover:scale-110"
                >
                    {isCollapsed ? <Sparkles size={12} className="rotate-180" /> : <Sparkles size={12} />}
                </button>
            </aside>
        </>
    );
}
