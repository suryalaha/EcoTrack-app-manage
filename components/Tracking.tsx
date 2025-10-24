import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Home, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getETA } from '../services/geminiService';
import type { User } from '../types';

const TrackingComponent: React.FC = () => {
    const { user } = useAuth();
    const { users } = useData();
    const [activeDriver, setActiveDriver] = useState<User | null>(null);
    const [eta, setEta] = useState<string | null>(null);
    const [isLoadingEta, setIsLoadingEta] = useState(false);

    useEffect(() => {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const driver = users.find(
            (u) =>
                u.role === 'driver' &&
                u.lastLocation &&
                u.lastLocation.timestamp > fifteenMinutesAgo
        );
        setActiveDriver(driver || null);
    }, [users]);

    useEffect(() => {
        if (activeDriver && user?.lastLocation) {
            const fetchEta = async () => {
                if (!activeDriver.lastLocation) return;
                setIsLoadingEta(true);
                setEta(null);
                const result = await getETA(
                    { lat: activeDriver.lastLocation.lat, lng: activeDriver.lastLocation.lng },
                    { lat: user.lastLocation.lat, lng: user.lastLocation.lng }
                );
                setEta(result);
                setIsLoadingEta(false);
            };
            fetchEta();
        }
    }, [activeDriver, user?.lastLocation]);

    const renderActiveTracking = () => {
        if (!activeDriver || !activeDriver.lastLocation) return null;
        return (
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark animate-fade-in-up w-full">
                <h3 className="font-semibold text-lg mb-4 text-heading-light dark:text-heading-dark">
                    Driver: <span className="text-primary">{activeDriver.name}</span>
                </h3>

                <div className="my-8 flex items-center justify-between px-4">
                    <div className="flex flex-col items-center">
                        <Truck size={40} className="text-primary"/>
                        <span className="text-sm font-semibold mt-2">Collection Truck</span>
                    </div>
                    <div className="flex-1 border-b-2 border-dashed border-slate-300 dark:border-slate-600 mx-4"></div>
                    <div className="flex flex-col items-center">
                        <Home size={40} className="text-green-500"/>
                        <span className="text-sm font-semibold mt-2">Your Home</span>
                    </div>
                </div>

                <div className="text-center bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-sm text-text-light dark:text-text-dark font-semibold">ESTIMATED TIME OF ARRIVAL</p>
                    {isLoadingEta && (
                        <div className="flex items-center justify-center mt-2">
                            <Loader2 size={24} className="animate-spin text-primary mr-2" />
                            <p className="text-2xl font-bold text-primary">Calculating...</p>
                        </div>
                    )}
                    {eta && !isLoadingEta && (
                         <p className="text-4xl font-bold text-primary mt-1">{eta}</p>
                    )}
                    {!eta && !isLoadingEta && user?.lastLocation && (
                        <p className="text-lg font-bold text-red-500 mt-1">Could not calculate ETA.</p>
                    )}
                     {!user?.lastLocation && !isLoadingEta && (
                         <p className="text-sm text-amber-600 mt-2">Enable location to calculate ETA.</p>
                    )}
                </div>

                <div className="text-center mt-4">
                     {user?.lastLocation ? (
                         <a
                            href={`https://www.google.com/maps/dir/?api=1&origin=${user.lastLocation.lat},${user.lastLocation.lng}&destination=${activeDriver.lastLocation.lat},${activeDriver.lastLocation.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-glow-primary transition-all transform hover:scale-105"
                        >
                            <MapPin className="mr-2" size={20} /> View on Live Map
                        </a>
                    ) : (
                         <button
                            disabled
                            className="w-full inline-flex items-center justify-center bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 font-bold py-3 px-4 rounded-lg cursor-not-allowed"
                        >
                            <MapPin className="mr-2" size={20} /> Enable your location to see map
                        </button>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Last updated: {activeDriver.lastLocation.timestamp.toLocaleTimeString()}
                    </p>
                </div>
            </div>
        );
    };

    const renderInactiveTracking = () => (
        <div className="text-center py-10 bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark animate-fade-in w-full">
            <Truck className="mx-auto h-16 w-16 text-slate-400" />
            <h3 className="mt-4 text-xl font-medium text-heading-light dark:text-heading-dark">No Active Vehicle</h3>
            <p className="mt-2 text-md text-text-light dark:text-text-dark">There is no collection vehicle currently active in your area. Please check back later.</p>
        </div>
    );

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark mb-4 self-start">Live Vehicle Tracking</h2>
            {activeDriver ? renderActiveTracking() : renderInactiveTracking()}
        </div>
    );
};

export default TrackingComponent;
