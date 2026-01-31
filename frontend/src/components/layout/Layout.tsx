import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AICoachWidget } from '../ai/AICoachWidget'; // Import Widget

import { FocusMode } from '../common/FocusMode';

export function Layout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [focusModeOpen, setFocusModeOpen] = useState(false);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <FocusMode isOpen={focusModeOpen} onClose={() => setFocusModeOpen(false)} />
            <AICoachWidget /> {/* AI Coach Widget */}

            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay lg:hidden ${mobileMenuOpen ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                setIsCollapsed={setSidebarCollapsed}
                isMobileOpen={mobileMenuOpen}
                setIsMobileOpen={setMobileMenuOpen}
            />

            {/* Main Content */}
            <div
                className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          ml-0
        `}
            >
                <Header
                    toggleSidebar={() => setMobileMenuOpen(true)}
                    toggleFocusMode={() => setFocusModeOpen(true)}
                />
                <main className="p-4 md:p-6 page-enter">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

