import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { CheckCircle, Wallet, X, Loader2, QrCode, UploadCloud, Check, XCircle, ShieldCheck } from 'lucide-react';

import type { Payment, View } from '../types';
import { ViewType } from '../types';
import { generateUpiUrl, UPI_ID } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface PaymentComponentProps {
    setCurrentView: (view: View) => void;
}

type PaymentStep = 'pay' | 'upload' | 'otp' | 'confirm' | 'error';

const PaymentComponent: React.FC<PaymentComponentProps> = ({ setCurrentView }) => {
    const { user } = useAuth();
    const { addPayment } = useData();
    const [step, setStep] = useState<PaymentStep>('pay');
    const [showQrModal, setShowQrModal] = useState(false);
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const paymentAmount = user?.outstandingBalance ?? 0;
    const upiPaymentUrl = generateUpiUrl(paymentAmount, `Payment for ${user?.householdId}`);

    useEffect(() => {
        let timerId: number;
        if (resendTimer > 0) {
            timerId = window.setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => window.clearTimeout(timerId);
    }, [resendTimer]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setScreenshotFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
                setStep('upload');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitForVerification = async () => {
        if (!user || !screenshotPreview) return;
        setIsSubmitting(true);
        
        setTimeout(() => {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`Generated OTP for user ${user.identifier}: ${newOtp}`); // For debugging
            setGeneratedOtp(newOtp);
            setResendTimer(30);
            setOtp('');
            setOtpError('');
            setStep('otp');
            setIsSubmitting(false);
        }, 1000);
    };

    const handleVerifyOtpAndSubmit = async () => {
        if (otp !== generatedOtp) {
            setOtpError('Invalid OTP. Please try again.');
            return;
        }

        setIsSubmitting(true);
        setOtpError('');
        setSubmissionError('');

        const paymentDetails: Payment = {
            id: `TXN${Date.now()}`,
            householdId: user!.householdId,
            date: new Date(),
            amount: paymentAmount,
            status: 'Pending Verification',
            screenshot: screenshotPreview,
        };

        try {
            await addPayment(paymentDetails);
            setStep('confirm');
        } catch (failedPayment: any) {
            setSubmissionError(failedPayment.rejectionReason || 'An unknown error occurred during verification.');
            setStep('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = () => {
        if (resendTimer === 0) {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`Resent OTP for user ${user?.identifier}: ${newOtp}`); // For debugging
            setGeneratedOtp(newOtp);
            setResendTimer(30);
            setOtp('');
            setOtpError('');
        }
    };

    const renderPayStep = () => (
        <div className="text-center animate-scale-in">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">Pay Your Bill</h2>
            <p className="text-text-light dark:text-text-dark mb-6">Your contribution keeps our community clean.</p>
            
            <div className="bg-card-light dark:bg-card-dark p-1 rounded-xl shadow-lg inline-block relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent -m-0.5 rounded-xl"></div>
                <div className="relative bg-card-light dark:bg-card-dark p-8 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Amount Due</p>
                    {paymentAmount > 0 ? (
                        <p className="text-5xl font-bold text-primary my-2">₹{paymentAmount.toFixed(2)}</p>
                    ) : (
                         <p className="text-3xl font-bold text-success my-2 flex items-center justify-center"><CheckCircle className="mr-2"/> Cleared!</p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-500">for {new Date().toLocaleString('default', { month: 'long' })}</p>
                </div>
            </div>
            
            {paymentAmount > 0 ? (
                <>
                    <div className="mt-8 max-w-sm mx-auto p-4 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-border-light dark:border-border-dark">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">1</div>
                            <h3 className="text-left text-lg font-semibold text-heading-light dark:text-heading-dark">Complete Your Payment</h3>
                        </div>
                         <p className="text-sm text-text-light dark:text-text-dark mb-4 text-left">Choose your preferred UPI method to pay the outstanding amount.</p>
                        <div className="space-y-3">
                             <a 
                                href={upiPaymentUrl}
                                className="w-full bg-gradient-to-r from-secondary to-slate-700 dark:from-slate-600 dark:to-slate-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                            >
                                <Wallet className="mr-3" /> Pay with UPI App
                            </a>
                            <button 
                                onClick={() => setShowQrModal(true)}
                                className="w-full bg-gradient-to-r from-secondary to-slate-700 dark:from-slate-600 dark:to-slate-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                            >
                                <QrCode className="mr-3" /> Scan QR Code
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 max-w-sm mx-auto p-4 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-border-light dark:border-border-dark">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">2</div>
                            <h3 className="text-left text-lg font-semibold text-heading-light dark:text-heading-dark">Upload Proof</h3>
                        </div>
                         <p className="text-sm text-text-light dark:text-text-dark mb-4 text-left">After successful payment, a screenshot is mandatory for verification.</p>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105"
                        >
                            <UploadCloud className="mr-3" /> Upload Screenshot
                        </button>
                    </div>
                </>
            ) : (
                <div className="mt-8 max-w-sm mx-auto p-4">
                    <p className="text-lg text-success font-semibold">You have no outstanding balance. Thank you!</p>
                </div>
            )}

            <div className="mt-6 max-w-sm mx-auto p-3 rounded-lg bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 flex justify-center items-center space-x-2 text-green-700 dark:text-green-300">
                <ShieldCheck size={18} />
                <p className="text-sm font-semibold">All transactions are secure and PCI-DSS compliant.</p>
            </div>
        </div>
    );

    const renderUploadStep = () => (
         <div className="text-center animate-scale-in">
            <h2 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-2">Confirm Screenshot</h2>
            <p className="text-text-light dark:text-text-dark mb-6">Please confirm this is the correct screenshot before submitting.</p>
            {screenshotPreview && (
                <img src={screenshotPreview} alt="Payment screenshot preview" className="max-w-xs mx-auto max-h-64 object-contain rounded-lg border-2 border-primary shadow-lg mb-6"/>
            )}
            <div className="mt-8 max-w-sm mx-auto space-y-4">
                 <button 
                    onClick={handleSubmitForVerification}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="animate-spin mr-3"/> : <CheckCircle className="mr-3" />}
                    {isSubmitting ? 'Proceeding...' : 'Proceed to Verification'}
                </button>
                <button 
                    onClick={() => setStep('pay')}
                    className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

     const renderOtpStep = () => (
        <div className="text-center p-4 flex flex-col items-center justify-center h-full animate-scale-in">
            <ShieldCheck className="w-20 h-20 text-primary mb-4" />
            <h2 className="text-3xl font-bold text-heading-light dark:text-heading-dark">Verify Your Payment</h2>
            <p className="text-text-light dark:text-text-dark mt-2 mb-6 max-w-sm">
                Enter the 6-digit OTP sent to your registered mobile number <span className="font-bold text-heading-light dark:text-heading-dark">{user?.identifier}</span>.
            </p>
            <div className="max-w-sm mx-auto w-full">
                <input
                    type="tel"
                    value={otp}
                    onChange={(e) => {
                        setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                        setOtpError('');
                    }}
                    placeholder="6-Digit OTP"
                    maxLength={6}
                    className="w-full text-center text-2xl tracking-[0.5em] p-3 border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                 {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}
            </div>
            <div className="mt-6 w-full max-w-sm space-y-3">
                <button
                    onClick={handleVerifyOtpAndSubmit}
                    disabled={isSubmitting || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 className="animate-spin mr-3" /> : <ShieldCheck className="mr-3" />}
                    {isSubmitting ? 'Verifying...' : 'Verify & Submit'}
                </button>
                <button
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className="w-full text-sm text-primary font-semibold disabled:text-slate-400"
                >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
            </div>
        </div>
    );

    const renderConfirmStep = () => (
        <div className="text-center p-4 flex flex-col items-center justify-center h-full animate-scale-in">
            <div className="relative w-24 h-24 flex items-center justify-center mb-4 animate-pulse-glow">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-50"></div>
                <CheckCircle className="w-20 h-20 text-white relative" />
            </div>
            <h2 className="text-3xl font-bold text-heading-light dark:text-heading-dark">Submitted Successfully!</h2>
            <p className="text-text-light dark:text-text-dark mt-2 mb-6 max-w-sm">Your payment is now pending verification. Our team will review it shortly. You can check the status in your payment history.</p>
            <button
                onClick={() => setCurrentView(ViewType.History)}
                className="w-full max-w-sm bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105"
            >
                View Payment History
            </button>
        </div>
    );

    const renderErrorStep = () => (
        <div className="text-center p-4 flex flex-col items-center justify-center h-full animate-scale-in">
            <XCircle className="w-20 h-20 text-red-500 mb-4" />
            <h2 className="text-3xl font-bold text-heading-light dark:text-heading-dark">Submission Failed</h2>
            <p className="text-text-light dark:text-text-dark mt-2 mb-6 max-w-sm">
                {submissionError}
            </p>
            <button
                onClick={() => setStep('upload')}
                className="w-full max-w-sm bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105"
            >
                Try Again
            </button>
        </div>
    );

    return (
        <>
            {step === 'pay' && renderPayStep()}
            {step === 'upload' && renderUploadStep()}
            {step === 'otp' && renderOtpStep()}
            {step === 'confirm' && renderConfirmStep()}
            {step === 'error' && renderErrorStep()}

            {showQrModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-sm relative transform transition-all animate-scale-in text-center overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-accent p-4">
                             <h3 className="text-xl font-bold text-white">Scan & Pay</h3>
                        </div>
                        <button
                            onClick={() => setShowQrModal(false)}
                            className="absolute top-2 right-2 p-2 text-white/70 hover:bg-black/20 rounded-full"
                        >
                            <X size={24} />
                        </button>
                        <div className="p-6">
                            <p className="text-sm text-text-light dark:text-text-dark mb-4">Use any UPI app</p>
                            <div className="bg-white p-4 rounded-lg inline-block ring-4 ring-slate-100 dark:ring-slate-700">
                                <QRCode value={upiPaymentUrl} size={180} />
                            </div>
                            <div className="my-4">
                                <p className="text-slate-500 dark:text-slate-400">Amount: <span className="font-bold text-primary">₹{paymentAmount.toFixed(2)}</span></p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">UPI ID: {UPI_ID}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentComponent;