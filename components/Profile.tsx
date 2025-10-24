import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Save, CheckCircle, Camera, Upload, X, Mail, ChevronRight, MessageSquareWarning, Star, HelpCircle } from 'lucide-react';
import { View, ViewType } from '../types';

interface CameraModalProps {
    onPictureTaken: (dataUrl: string) => void;
    onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onPictureTaken, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasCamera, setHasCamera] = useState(false);

    useEffect(() => {
        const startCamera = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setHasCamera(true);
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Camera not available. Please check your browser permissions.");
                }
            } else {
                setError("Camera access is not supported by your browser.");
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current && hasCamera) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            onPictureTaken(dataUrl);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full max-w-lg relative p-4">
                <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                    <X size={20} />
                </button>
                <h3 className="text-lg font-bold text-center text-heading-light dark:text-heading-dark mb-4">Take a Photo</h3>
                {error ? (
                    <div className="text-red-500 text-center p-4">{error}</div>
                ) : (
                    <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[60vh] rounded-md bg-slate-900"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <div className="mt-4 flex justify-center">
                            <button onClick={handleCapture} disabled={!hasCamera} className="bg-gradient-to-r from-primary to-accent text-white font-bold p-4 rounded-full shadow-lg hover:shadow-glow-primary transition-transform transform hover:scale-110 disabled:from-slate-400 disabled:to-slate-500 disabled:scale-100">
                                <Camera size={28} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

interface ProfileComponentProps {
    setCurrentView: (view: View) => void;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ setCurrentView }) => {
    const { user, updateUserName, updateUserProfilePicture, updateUserEmail } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaved, setIsSaved] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        let changed = false;
        if (name.trim() && user && name.trim() !== user.name) {
            updateUserName(name.trim());
            changed = true;
        }
        if (user && email.trim() !== (user.email || '')) {
            updateUserEmail(email.trim());
            changed = true;
        }

        if (changed) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if(reader.result) {
                    updateUserProfilePicture(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePictureTaken = (dataUrl: string) => {
        updateUserProfilePicture(dataUrl);
        setIsCameraOpen(false);
    };


    if (!user) {
        return <div>Loading profile...</div>;
    }
    
    const hasChanges = (name.trim() && name.trim() !== user.name) || (email.trim() !== (user.email || ''));

     const optionItems = [
        {
            label: 'File a Complaint',
            icon: MessageSquareWarning,
            action: () => setCurrentView(ViewType.Complaints),
            color: 'text-amber-500'
        },
        {
            label: 'Provide Feedback',
            icon: Star,
            action: () => setCurrentView(ViewType.Feedback),
            color: 'text-yellow-500'
        },
        {
            label: 'Help & FAQ',
            icon: HelpCircle,
            action: () => setCurrentView(ViewType.HelpAndFaq),
            color: 'text-blue-500'
        }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark animate-fade-in-down">My Profile</h2>
            
            <div className="flex flex-col items-center space-y-4 bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="relative p-1 bg-gradient-to-r from-primary to-accent rounded-full">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-card-light dark:border-card-dark" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-4 border-card-light dark:border-card-dark">
                            <User size={64} className="text-slate-400 dark:text-slate-500" />
                        </div>
                    )}
                </div>
                <div className="flex space-x-4">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                        <Upload size={18} />
                        <span>Upload</span>
                    </button>
                    <button onClick={() => setIsCameraOpen(true)} className="flex items-center space-x-2 bg-gradient-to-r from-primary to-accent text-white font-semibold py-2 px-4 rounded-lg hover:shadow-glow-primary transition">
                        <Camera size={18} />
                        <span>Take Photo</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="householdId" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Household ID</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                id="householdId"
                                type="text"
                                value={user.householdId}
                                readOnly
                                className="w-full p-3 pl-10 border border-border-light dark:border-border-dark bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-lg focus:outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full p-3 pl-10 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                className="w-full p-3 pl-10 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end space-x-4">
                         {isSaved && (
                            <div className="flex items-center text-green-600 dark:text-green-400 animate-fade-in" role="status">
                                <CheckCircle size={18} className="mr-2" />
                                <span className="text-sm font-semibold">Saved!</span>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={!hasChanges}
                            className="bg-gradient-to-r from-primary to-accent text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105 disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            <Save className="mr-2" size={18} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
             <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-md border border-border-light dark:border-border-dark animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h3 className="p-4 text-lg font-semibold text-heading-light dark:text-heading-dark border-b border-border-light dark:border-border-dark">More Options</h3>
                <ul className="divide-y divide-border-light dark:divide-border-dark">
                    {optionItems.map((item, index) => (
                        <li key={index}>
                            <button onClick={item.action} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center">
                                    <item.icon className={`w-6 h-6 mr-4 ${item.color}`} />
                                    <span className="font-medium text-text-light dark:text-text-dark">{item.label}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {isCameraOpen && <CameraModal onPictureTaken={handlePictureTaken} onClose={() => setIsCameraOpen(false)} />}
        </div>
    );
};

export default ProfileComponent;