import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MapPin, LogOut, Clock, CheckCircle, XCircle, Flame } from 'lucide-react';
import Header from './Header'; // can reuse the header

const StaffApp: React.FC = () => {
    const { user, logout } = useAuth();
    const { updateUserLocation } = useData();
    const [locationStatus, setLocationStatus] = useState('Initializing...');
    const locationWatcherId = useRef<number | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationStatus('Geolocation is not supported by your browser.');
            return;
        }

        const successCallback = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            const newLocation = { lat: latitude, lng: longitude, timestamp: new Date() };
            if (user) {
                updateUserLocation(user.householdId, newLocation);
            }
            setLocationStatus(`Tracking Active. Last update: ${new Date().toLocaleTimeString()}`);
        };

        const errorCallback = (error: GeolocationPositionError) => {
            console.error("Geolocation error:", error);
            let errorMessage = `Error: ${error.message}`;
            if (error.code === error.PERMISSION_DENIED) {
                errorMessage = "Location permission denied. Please enable it in your browser settings.";
            }
            setLocationStatus(errorMessage);
        };

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 20000, // Increased timeout
            maximumAge: 0,
        };

        locationWatcherId.current = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
        setLocationStatus('Attempting to start location tracking...');

        return () => {
            if (locationWatcherId.current !== null) {
                navigator.geolocation.clearWatch(locationWatcherId.current);
            }
        };
    }, [user, updateUserLocation]);
    
    const isWorkdayOver = () => {
        const now = new Date();
        return now.getHours() >= 16; // 4 PM or later (16:00)
    }

    const getAttendanceIcon = () => {
        if (user?.attendanceStatus === 'present') {
            return <CheckCircle className="text-success w-8 h-8" />;
        }
        if (user?.attendanceStatus === 'absent') {
            return <XCircle className="text-red-500 w-8 h-8" />;
        }
        return <Clock className="text-slate-500 w-8 h-8" />;
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-card-light dark:bg-card-dark shadow-2xl flex flex-col h-screen">
            <Header />
            <main className="flex-grow p-6 flex flex-col items-center text-center bg-background-light dark:bg-background-dark">
                <h2 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-2">Welcome, {user?.name.split(' ')[0]}</h2>
                <p className="text-lg text-text-light dark:text-text-dark capitalize mb-6">{user?.role} Dashboard</p>

                <div className="w-full space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 rounded-lg shadow-md">
                            <h3 className="font-semibold text-heading-light dark:text-heading-dark flex items-center justify-center text-lg">
                                <Clock className="mr-2" /> Attendance
                            </h3>
                            <div className="flex items-center justify-center space-x-2 mt-2 text-xl">
                                {getAttendanceIcon()}
                                <p className="font-bold capitalize">{user?.attendanceStatus}</p>
                            </div>
                            {user?.lastLoginTime && <p className="text-xs text-slate-500 mt-1">In: {user.lastLoginTime.toLocaleTimeString()}</p>}
                        </div>
                         <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 rounded-lg shadow-md">
                            <h3 className="font-semibold text-heading-light dark:text-heading-dark flex items-center justify-center text-lg">
                                <Flame className="mr-2 text-orange-500" /> Streak
                            </h3>
                            <div className="text-center mt-2">
                                <p className="text-3xl font-bold text-orange-500">{user?.loginStreak || 0} Day{user?.loginStreak !== 1 && 's'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold text-heading-light dark:text-heading-dark flex items-center justify-center text-lg">
                            <MapPin className="mr-2" /> Location Status
                        </h3>
                        <p className="text-sm text-text-light dark:text-text-dark mt-2 px-2">{locationStatus}</p>
                    </div>
                </div>

                <div className="mt-auto w-full pt-6">
                    {isWorkdayOver() && <p className="text-sm text-success mb-2 font-semibold animate-pulse">Workday complete. You may log out.</p>}
                    <button 
                        onClick={logout} 
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-4 rounded-lg flex items-center justify-center text-lg shadow-lg transition-transform transform hover:scale-105"
                    >
                        <LogOut className="mr-3" /> End Day & Logout
                    </button>
                    <p className="text-xs text-slate-400 mt-4 px-4">
                        Note: Location tracking is active. This app needs to remain open in your browser to function correctly. Closing the app will stop location updates.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default StaffApp;