import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, ArrowRight, RefreshCw, Smartphone, ArrowLeft, Loader2 } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

const ADMIN_PHONE_NUMBERS = ['9064201746', '9635929052'];

interface AdminAuthFlowProps {
    onBack: () => void;
}

const AdminAuthFlow: React.FC<AdminAuthFlowProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState<'login' | 'otp'>('login');
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const auth = useAuth();

    useEffect(() => {
        let timerId: number;
        if (resendTimer > 0) {
            timerId = window.setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timerId);
    }, [resendTimer]);
    
    const generateAndSendOtpRequest = () => {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        const messageForAdmin = `[EcoTrack Admin] Your login OTP for ${identifier} is: ${newOtp}`;
        // OTP is sent to the central admin number 9635929052
        const whatsappUrl = `https://wa.me/919064201746?text=${encodeURIComponent(messageForAdmin)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ADMIN_PHONE_NUMBERS.includes(identifier)) {
            setError('Access Denied. This number is not registered as an administrator.');
            return;
        }
        setError('');
        generateAndSendOtpRequest();
        setResendTimer(30);
        setStep('otp');
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp !== generatedOtp) {
            setError('Invalid OTP. Please try again.');
            return;
        }
        setError('');
        setIsLoading(true);
        const result = await auth.loginAsAdmin(identifier);
        setIsLoading(false);
        if (!result.success) {
            setError(result.message || 'An unknown error occurred.');
        }
    };

    const handleResendOtp = () => {
        if (resendTimer === 0) {
            generateAndSendOtpRequest();
            setResendTimer(30);
            setError('');
            setOtp('');
        }
    };
    
    const changeIdentifier = () => {
        setIdentifier('');
        setOtp('');
        setError('');
        setGeneratedOtp('');
        setStep('login');
    }

    const isSubmitDisabled = identifier.length !== 10;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-background-dark p-4 font-sans">
            <div className="w-full max-w-sm mx-auto relative">
                 <div className="absolute -top-16 right-0">
                    <LanguageSwitcher className="w-32"/>
                </div>
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <Shield className="h-10 w-10 text-primary" />
                        <h1 className="text-4xl font-bold text-heading-light dark:text-heading-dark">Admin Login</h1>
                    </div>
                </div>
                
                <div className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-xl w-full relative">
                    <button onClick={onBack} className="absolute top-4 left-4 text-slate-500 hover:text-primary">
                        <ArrowLeft size={24}/>
                    </button>
                    {step === 'login' ? (
                        <form onSubmit={handleSendOtp} className="animate-scale-in">
                            <h2 className="text-2xl font-semibold text-heading-light dark:text-heading-dark mb-2 text-center">{t('verification')}</h2>
                            <p className="text-text-light dark:text-text-dark mb-6 text-sm text-center">{t('adminVerification')}</p>
                            
                            <div className="relative mb-4">
                               <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type='tel'
                                    value={identifier}
                                    onChange={(e) => {
                                        setError('');
                                        setIdentifier(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
                                    }}
                                    placeholder='10-digit mobile number'
                                    className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105 disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:scale-100"
                            >
                                {t('sendOtp')} <ArrowRight className="ml-2" />
                            </button>
                        </form>
                    ) : (
                         <form onSubmit={handleVerifyOtp} className="animate-scale-in">
                            <h2 className="text-2xl font-semibold text-heading-light dark:text-heading-dark mb-2 text-center">{t('verifyOtp')}</h2>
                            <p className="text-text-light dark:text-text-dark mb-4 text-sm break-words text-center">
                                {t('otpSentTo', { identifier })}
                                <button type="button" onClick={changeIdentifier} className="text-primary ml-2 text-sm font-semibold">{t('change')}</button>
                            </p>
                            <div className="relative mb-4">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="tel"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    placeholder={t('otpPlaceholder')}
                                    className="w-full p-3 pl-12 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={otp.length !== 6 || isLoading}
                                className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105 disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:scale-100"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : t('verifyAndProceed')}
                            </button>
                            <div className="mt-4 text-sm">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendTimer > 0}
                                    className="text-primary font-semibold disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center w-full"
                                >
                                    <RefreshCw size={14} className={`mr-1 ${resendTimer > 0 ? 'animate-spin' : ''}`} style={{animationDuration: '2s'}} />
                                    {resendTimer > 0 ? t('resendOtpIn', { count: resendTimer }) : t('resendOtp')}
                                </button>
                            </div>
                         </form>
                    )}
                     {error && <p className="text-red-500 text-sm mt-4 animate-fade-in text-center">{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default AdminAuthFlow;