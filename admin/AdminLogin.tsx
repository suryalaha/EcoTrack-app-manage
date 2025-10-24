import React, { useState } from 'react';
import { LogIn, Shield, User, KeyRound } from 'lucide-react';

interface AdminLoginProps {
    onLoginSuccess: () => void;
    onExitAdminMode: () => void;
}

// Hardcoded credentials for the demo
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onExitAdminMode }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            setError('');
            onLoginSuccess();
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-900 dark:to-background-dark p-4 font-sans">
            <div className="w-full max-w-sm mx-auto text-center">
                <div className="flex justify-center items-center gap-3 mb-6">
                    <Shield className="h-10 w-10 text-primary" />
                    <h1 className="text-4xl font-bold text-heading-light dark:text-heading-dark">Admin Access</h1>
                </div>
                <p className="text-text-light dark:text-text-dark mb-8">Please enter your credentials to continue.</p>
                
                <div className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-xl w-full">
                    <form onSubmit={handleSubmit} className="animate-scale-in">
                        <div className="relative mb-4">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="relative mb-4">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105"
                        >
                            <LogIn className="mr-2" /> Login
                        </button>
                        {error && <p className="text-red-500 text-sm mt-4 animate-fade-in">{error}</p>}
                    </form>
                    <div className="mt-6 border-t border-border-light dark:border-border-dark pt-4">
                         <button
                            onClick={onExitAdminMode}
                            className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 font-semibold"
                         >
                            Back to User App
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
