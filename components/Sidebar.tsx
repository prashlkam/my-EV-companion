import React from 'react';
import { AnalyticsIcon, BoltIcon, CarIcon, DashboardIcon, TrashIcon, LogbookIcon, LogoutIcon } from './icons';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  const { state, dispatch } = useAppContext();

  const navItems = [
    { name: 'Dashboard', icon: DashboardIcon, view: 'dashboard' },
    { name: 'My EVs', icon: CarIcon, view: 'evs' },
  ];
  
  if (state.evs.length > 0) {
    navItems.push({ name: 'Logbook', icon: LogbookIcon, view: 'logbook' });
  }

  navItems.push({ name: 'Analytics', icon: AnalyticsIcon, view: 'analytics' });

  const handleDeleteAllData = () => {
    if (window.confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      dispatch({ type: 'DELETE_ALL_DATA' });
      setCurrentView('dashboard');
    }
  };

  return (
    <aside className="bg-gray-800 text-gray-300 w-16 md:w-64 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-center md:justify-start p-4 border-b border-gray-700">
        <BoltIcon className="h-8 w-8 text-brand-primary" />
        <h1 className="hidden md:block ml-2 text-xl font-bold">EV Companion</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="px-2 py-1">
              <button
                onClick={() => setCurrentView(item.view)}
                className={`w-full flex items-center p-2 rounded-lg transition-colors duration-200 ${
                  currentView === item.view
                    ? 'bg-brand-primary text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="hidden md:inline ml-4">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-2 border-t border-gray-700 space-y-2">
         <button
            onClick={onLogout}
            className="w-full flex items-center p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700"
          >
            <LogoutIcon className="h-6 w-6" />
            <span className="hidden md:inline ml-4">Logout</span>
        </button>
         <button
            onClick={handleDeleteAllData}
            className="w-full flex items-center p-2 rounded-lg transition-colors duration-200 text-red-400 hover:bg-red-900/50"
          >
            <TrashIcon className="h-6 w-6" />
            <span className="hidden md:inline ml-4">Delete All Data</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
