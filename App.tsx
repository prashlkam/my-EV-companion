import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { Dashboard, Logbook } from './components/Dashboard';
import EVManagement from './components/EVManagement';
import Analytics from './components/Analytics';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './components/LoginPage';

const AppContent: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedEVId, setSelectedEVId] = useState<string | null>(null);
    const { state } = useAppContext();

    useEffect(() => {
        if (state.evs.length === 0 && (currentView === 'logbook' || currentView === 'analytics')) {
            setCurrentView('dashboard');
        }
        // If the selected EV is deleted, go back to the EV list
        if (selectedEVId && !state.evs.find(ev => ev.id === selectedEVId)) {
            setSelectedEVId(null);
            setCurrentView('evs');
        }
    }, [state.evs, currentView, selectedEVId]);

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard setCurrentView={setCurrentView}/>;
            case 'evs':
                return <EVManagement setCurrentView={setCurrentView} setSelectedEVId={setSelectedEVId} />;
            case 'logbook':
                 // If an EV is selected, show its logbook. Otherwise (from sidebar), show primary.
                const evToShow = state.evs.find(ev => ev.id === selectedEVId) || state.evs[0];

                if (evToShow) {
                    // Show back button only when navigating from the EV list (i.e., selectedEVId is set)
                    return <Logbook ev={evToShow} showBackButton={!!selectedEVId} setCurrentView={setCurrentView} setSelectedEVId={setSelectedEVId} />;
                }
                // Fallback if no EVs exist (though useEffect should prevent this)
                return <Dashboard setCurrentView={setCurrentView}/>;
            case 'analytics':
                return <Analytics />;
            default:
                return <Dashboard setCurrentView={setCurrentView}/>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 font-sans">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={onLogout} />
            <main className="flex-1 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
}

const AuthGate: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const sessionActive = localStorage.getItem('isLoggedIn') === 'true';
        setIsAuthenticated(sessionActive);
        setIsLoading(false);
    }, []);

    const handleLogin = () => {
        localStorage.setItem('isLoggedIn', 'true');
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLogin} />;
    }

    return <AppContent onLogout={handleLogout} />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
        <AuthGate />
    </AppProvider>
  );
};

export default App;
