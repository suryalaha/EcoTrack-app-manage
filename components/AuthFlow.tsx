import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Recycle, KeyRound, ArrowRight, Mail, ArrowLeft, Loader2, User as UserIcon, MapPin, Users, CheckCircle } from 'lucide-react';
import type { User } from '../types';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

type AuthMode = 'login' | 'signup';

interface AuthFlowProps {
    onBack: () => void;
}

const PasswordStrengthIndicator: React.FC<{ password?: string }> = ({ password = '' }) => {
    const checks = useMemo(() => {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /\W|_/.test(password),
        };
    }, [password]);

    const CheckItem: React.FC<{ text: string; valid: boolean }> = ({ text, valid }) => (
        <li className={`flex items-center transition-colors ${valid ? 'text-success' : 'text-slate-400'}`}>
            <CheckCircle size={14} className="mr-2" />
            <span className="text-xs">{text}</span>
        </li>
    );

    return (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            <CheckItem text="8+ Characters" valid={checks.length} />
            <CheckItem text="Uppercase" valid={checks.uppercase} />
            <CheckItem text="Lowercase" valid={checks.lowercase} />
            <CheckItem text="Number" valid={checks.number} />
            <CheckItem text="Special" valid={checks.special} />
        </ul>
    );
};


const AuthFlow: React.FC<AuthFlowProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [mode, setMode] = useState<AuthMode>('login');
    const [signupStep, setSignupStep] = useState(1);
    
    // Form state
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [familySize, setFamilySize] = useState<number | ''>('');
    const [area, setArea] = useState('');
    const [landmark, setLandmark] = useState('');
    const [pincode, setPincode] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const auth = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await auth.login(identifier, password, rememberMe);
        setIsLoading(false);
        if (!result.success) {
            setError(result.message || 'Login failed. Please try again.');
        }
    };
    
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await auth.signup({
            name,
            identifier,
            password,
            familySize: Number(familySize),
            address: { area, landmark, pincode },
        });
        setIsLoading(false);
        if (!result.success) {
            setError(result.message || 'Sign up failed. Please try again.');
            setSignupStep(1); // Go back to the first step if there's an error
        }
    }
    
    const goToNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setSignupStep(2);
    }
    
    const resetForm = () => {
        setIdentifier('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setFamilySize('');
        setArea('');
        setLandmark('');
        setPincode('');
        setError('');
        setRememberMe(true);
        setSignupStep(1);
    }

    const renderLogin = () => (
         <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-semibold text-heading-light dark:text-heading-dark">{t('welcomeBack')}</h2>
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={t('emailOrMobile')} className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div className="flex items-center">
                <input id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary bg-slate-100 dark:bg-slate-700" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-light dark:text-text-dark">{t('rememberMe')}</label>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105 disabled:opacity-50">
                {isLoading ? <Loader2 className="animate-spin" /> : t('login')}
            </button>
             <p className="text-xs text-slate-500 pt-2">{t('forgotPassword')}</p>
        </form>
    );
    
    const renderSignupStep1 = () => (
        <form onSubmit={goToNextStep} className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-semibold text-heading-light dark:text-heading-dark">{t('createAccount')}</h2>
             <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder={t('fullName')} className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder={t('emailOrMobile')} className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t('password')} className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <PasswordStrengthIndicator password={password} />
            <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder={t('confirmPassword')} className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
             <button type="submit" className="w-full bg-gradient-to-r from-secondary to-slate-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                {t('next')} <ArrowRight className="ml-2" />
            </button>
        </form>
    );

    const renderSignupStep2 = () => (
        <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-semibold text-heading-light dark:text-heading-dark">{t('yourDetails')}</h2>
             <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="number" value={familySize} onChange={(e) => setFamilySize(parseInt(e.target.value, 10) || '')} required placeholder={t('familyMembers')} min="1" className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" value={area} onChange={(e) => setArea(e.target.value)} required placeholder={t('area')} className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div className="relative">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} required placeholder={t('landmark')} className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" inputMode="numeric" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} required placeholder={t('pincode')} maxLength={6} className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
             <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105 disabled:opacity-50">
                {isLoading ? <Loader2 className="animate-spin" /> : t('completeSignup')}
            </button>
             <button type="button" onClick={() => setSignupStep(1)} className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 font-semibold mt-2">
                {t('back')}
            </button>
        </form>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-background-dark p-4 font-sans">
            <div className="w-full max-w-sm mx-auto text-center relative">
                 <div className="absolute -top-16 right-0">
                    <LanguageSwitcher className="w-32"/>
                </div>
                <div className="flex justify-center items-center gap-3 mb-6">
                    <Recycle className="h-10 w-10 text-primary" />
                    <h1 className="text-4xl font-bold text-heading-light dark:text-heading-dark">EcoTrack</h1>
                </div>
                <p className="text-text-light dark:text-text-dark mb-8">Your partner in sustainable waste management.</p>
                
                <div className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-xl w-full relative">
                    <button onClick={onBack} className="absolute top-4 left-4 text-slate-500 hover:text-primary">
                        <ArrowLeft size={24}/>
                    </button>
                    
                    <div className="flex items-center justify-center p-1 rounded-full bg-slate-100 dark:bg-slate-700 mb-6">
                        <button onClick={() => { setMode('login'); resetForm(); }} className={`w-1/2 p-2 rounded-full font-semibold text-sm transition-colors ${mode === 'login' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500'}`}>{t('login')}</button>
                        <button onClick={() => { setMode('signup'); resetForm(); }} className={`w-1/2 p-2 rounded-full font-semibold text-sm transition-colors ${mode === 'signup' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500'}`}>{t('createAccount')}</button>
                    </div>

                    {mode === 'login' && renderLogin()}
                    {mode === 'signup' && signupStep === 1 && renderSignupStep1()}
                    {mode === 'signup' && signupStep === 2 && renderSignupStep2()}
                    
                    {error && <p className="text-red-500 text-sm mt-4 animate-fade-in">{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default AuthFlow;