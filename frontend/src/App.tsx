import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
// import { FocusOverlay } from './components/focus/FocusOverlay';
import { Layout } from './components/layout/Layout';
import { AuthGuard, PublicGuard } from './components/common/AuthGuard';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Notes } from './pages/Notes';
import { Planner } from './pages/Planner';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Landing } from './pages/Landing';

import { Habits } from './pages/Habits';
import { Goals } from './pages/Goals';
import { Community } from './pages/Community';
import { JobBoard } from './components/career/JobBoard';
import { Gamification } from './pages/Gamification';
import { Music } from './pages/Music';
import { Settings } from './pages/Settings';
import { Leaderboard } from './pages/Leaderboard';
import { Analytics } from './pages/Analytics';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentCancel } from './pages/PaymentCancel';

import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';

import { QueryProvider } from './contexts/QueryProvider';

// ... imports

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <QueryProvider>
            <DataProvider>
              <Router>
                <Routes>
                  {/* Public Routes (Login/Register/Landing) */}
                  <Route path="/" element={<PublicGuard><Outlet /></PublicGuard>}>
                    <Route index element={<Landing />} />
                    <Route path="auth/login" element={<Login />} />
                    <Route path="auth/register" element={<Register />} />
                  </Route>

                  {/* Protected Routes */}
                  <Route path="/app" element={<AuthGuard><Layout /></AuthGuard>}>
                    <Route index element={<Dashboard />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="planner" element={<Planner />} />
                    <Route path="brain/notes" element={<Notes />} />
                    <Route path="habits" element={<Habits />} />
                    <Route path="goals" element={<Goals />} />
                    <Route path="community" element={<Community />} />
                    <Route path="career" element={<JobBoard />} /> {/* Changed Career to JobBoard */}
                    <Route path="rewards" element={<Gamification />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="music" element={<Music />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  {/* Payment Routes - These are public but should probably be outside the /app layout */}
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/cancel" element={<PaymentCancel />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Global Overlays */}
                {/* <FocusOverlay /> - Moved to Dashboard/FocusContext */}
              </Router>
            </DataProvider>
          </QueryProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// HMR Trigger: Refresh
export default App;
