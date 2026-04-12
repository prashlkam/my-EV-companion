import React, { useState } from 'react';
import { BoltIcon } from './icons';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Mock authentication: Allow any email and password for now.
        onLoginSuccess();
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Mock registration: Auto-login after registration
        onLoginSuccess();
    };

    const switchTab = (tab: 'login' | 'register') => {
        setActiveTab(tab);
        setError('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <BoltIcon className="w-16 h-16 mx-auto text-brand-primary" />
                    <h1 className="mt-4 text-3xl font-bold text-white">EV Companion</h1>
                    <p className="mt-2 text-gray-400">{activeTab === 'login' ? 'Sign in to continue' : 'Create your account'}</p>
                </div>

                {/* Tabs */}
                <div className="flex rounded-md bg-gray-700 p-1">
                    <button
                        type="button"
                        onClick={() => switchTab('login')}
                        className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                            activeTab === 'login'
                                ? 'bg-brand-primary text-white'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => switchTab('register')}
                        className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                            activeTab === 'register'
                                ? 'bg-brand-primary text-white'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        Register
                    </button>
                </div>

                {activeTab === 'login' ? (
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-400">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                            placeholder="Enter any email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-400">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                            placeholder="Enter any password"
                        />
                    </div>
                    
                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 font-bold text-white bg-brand-primary rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-secondary transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            ) : (
                <form className="space-y-5" onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="register-email" className="text-sm font-medium text-gray-400">Email address</label>
                        <input
                            id="register-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="register-password" className="text-sm font-medium text-gray-400">Password</label>
                        <input
                            id="register-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                            placeholder="Create a password"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="text-sm font-medium text-gray-400">Confirm Password</label>
                        <input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                            placeholder="Confirm your password"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 font-bold text-white bg-brand-primary rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-secondary transition-colors"
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            )}
            </div>
        </div>
    );
};

export default LoginPage;