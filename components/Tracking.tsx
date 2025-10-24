import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Truck, Home, Loader2, MapPinOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getETA } from '../services/geminiService';
import type { User } from '../types';

const getUserInitials = (name: string) => {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const MOCK_DRIVER: User = {
    name: 'Rohan Sharma',
    householdId: 'DRV-MOCK-1234',
    identifier: '9876543210',
    role: 'driver',
    status: 'active',
    createdAt: new Date(),
    outstandingBalance: 0,
    familySize: 1,
    address: { area: 'N/A', landmark: 'N/A', pincode: 'N/A' },
    profilePicture: `https://i.pravatar.cc/150?u=rohansharma`,
    lastLocation: { lat: 22.5760, lng: 88.3659, timestamp: new Date() },
};

const MOCK_USER_LOCATION = { lat: 22.5726, lng: 88.3639, timestamp: new Date() };

const TrackingComponent: React.FC = () => {
    const { user } = useAuth();
    const { users } = useData();
    
    const [eta, setEta] = useState<string | null>(null);
    const [isLoadingEta, setIsLoadingEta] = useState(false);
    const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
    const [isMapLoading, setIsMapLoading] = useState(true);
    const [isMapError, setIsMapError] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'checking'>('checking');

    const realActiveDriver = useMemo(() => {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        return users.find(
            (u) =>
                u.role === 'driver' &&
                u.lastLocation &&
                u.lastLocation.timestamp > fifteenMinutesAgo
        );
    }, [users]);

    const activeDriver = realActiveDriver || MOCK_DRIVER;
    const userLocation = user?.lastLocation || MOCK_USER_LOCATION;
    const isDataMocked = !realActiveDriver;

    useEffect(() => {
        if (!navigator.permissions) {
            setPermissionStatus('granted');
            return;
        }
        const queryPermission = async () => {
            try {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                setPermissionStatus(permission.state);
                permission.onchange = () => setPermissionStatus(permission.state);
            } catch (error) {
                console.error("Could not query geolocation permission:", error);
                setPermissionStatus('prompt');
            }
        };
        queryPermission();
    }, []);

    const fetchTrackingData = useCallback(async () => {
        setIsMapError(false);
        setIsMapLoading(true);

        if (!process.env.API_KEY) {
            console.error("Google Maps API Key is not configured.");
            setIsMapLoading(false);
            setIsMapError(true);
            return;
        }

        if (activeDriver?.lastLocation && userLocation) {
            setIsLoadingEta(true);
            
            let etaResult: string | null;
            if (isDataMocked) {
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
                etaResult = '≈ 12 min';
            } else {
                 etaResult = await getETA(
                    { lat: activeDriver.lastLocation.lat, lng: activeDriver.lastLocation.lng },
                    { lat: userLocation.lat, lng: userLocation.lng }
                );
            }
            setEta(etaResult);
            setIsLoadingEta(false);

            const userLoc = `${userLocation.lat},${userLocation.lng}`;
            const driverLoc = `${activeDriver.lastLocation.lat},${activeDriver.lastLocation.lng}`;
            const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=400x225&scale=2&format=jpg&maptype=roadmap&markers=color:blue%7Clabel:H%7C${userLoc}&markers=color:green%7Clabel:T%7C${driverLoc}&path=color:0x0000ffaa%7Cweight:5%7C${userLoc}%7C${driverLoc}&key=${process.env.API_KEY}`;
            setMapImageUrl(mapUrl);
        } else {
            setMapImageUrl(null);
            setIsMapLoading(false);
        }
    }, [activeDriver, userLocation, isDataMocked]);

    useEffect(() => {
        if (permissionStatus === 'granted') {
            fetchTrackingData(); // Initial fetch on permission grant or dependency change

            const intervalId = setInterval(fetchTrackingData, 30000); // Refresh every 30 seconds

            return () => clearInterval(intervalId); // Cleanup interval
        }
    }, [permissionStatus, fetchTrackingData]);

    const handleRequestPermission = () => {
        navigator.geolocation.getCurrentPosition(() => {}, () => {});
    };

    const renderActiveTracking = () => {
        if (!activeDriver || !activeDriver.lastLocation) return null; // Should not happen with mock data
        return (
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark animate-fade-in-up w-full relative">
                 {isDataMocked && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 animate-pulse">
                        LIVE PREVIEW
                    </div>
                )}
                <div className="flex items-center space-x-4 mb-4">
                    {activeDriver.profilePicture ? (
                        <img src={activeDriver.profilePicture} alt={activeDriver.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                            <span className="font-bold text-2xl text-primary">{getUserInitials(activeDriver.name)}</span>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-text-light dark:text-text-dark">Your Driver</p>
                        <h3 className="font-bold text-2xl text-heading-light dark:text-heading-dark">{activeDriver.name}</h3>
                    </div>
                </div>

                 <div className="my-4 rounded-lg overflow-hidden relative bg-slate-200 dark:bg-slate-700 aspect-video">
                    {isMapLoading && (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 size={32} className="animate-spin text-primary" />
                         </div>
                    )}
                    {isMapError && !isMapLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <MapPinOff size={32} className="text-red-500 mb-2" />
                            <p className="font-semibold text-red-600 dark:text-red-400">Could Not Load Map</p>
                            <p className="text-xs text-slate-500">There was an issue loading the map image.</p>
                        </div>
                    )}
                    {mapImageUrl && (
                        <img 
                            src={mapImageUrl} 
                            alt="Map showing driver and user location" 
                            className={`w-full h-full object-cover transition-opacity duration-500 ${isMapLoading || isMapError ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => {
                                setIsMapLoading(false);
                                setIsMapError(false);
                            }}
                            onError={() => {
                                console.error("Failed to load map image.");
                                setIsMapLoading(false);
                                setIsMapError(true);
                            }}
                        />
                    )}
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
                        eta === "Not available" ? (
                            <div className="flex items-center justify-center text-amber-600 dark:text-amber-400 mt-2">
                                <AlertCircle size={20} className="mr-2"/>
                                <p className="text-xl font-bold">{eta}</p>
                            </div>
                        ) : (
                            <p className="text-4xl font-bold text-primary mt-1">{eta}</p>
                        )
                    )}
                    {!eta && !isLoadingEta && (
                         <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">Could not calculate ETA at this time.</p>
                    )}
                </div>

                <div className="text-center mt-4">
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${activeDriver.lastLocation.lat},${activeDriver.lastLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-glow-primary transition-all transform hover:scale-105"
                    >
                        <MapPin className="mr-2" size={20} /> View on Live Map
                    </a>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Last updated: {activeDriver.lastLocation.timestamp.toLocaleTimeString()}
                    </p>
                </div>
            </div>
        );
    };
    
    const renderPermissionPrompt = () => (
        <div className="text-center py-10 bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark animate-fade-in w-full">
            <MapPin className="mx-auto h-16 w-16 text-primary" />
            <h3 className="mt-4 text-xl font-medium text-heading-light dark:text-heading-dark">Enable Location Tracking</h3>
            <p className="mt-2 text-md text-text-light dark:text-text-dark max-w-sm mx-auto">To see the live location of your collection vehicle and get an accurate ETA, please allow location access.</p>
            <button
                onClick={handleRequestPermission}
                className="mt-6 bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105"
            >
                Allow Location Access
            </button>
        </div>
    );

    const renderPermissionDenied = () => (
        <div className="text-center py-10 bg-red-500/10 rounded-lg shadow-sm border border-red-500/20 animate-fade-in w-full">
            <MapPin className="mx-auto h-16 w-16 text-red-500" />
            <h3 className="mt-4 text-xl font-medium text-red-600 dark:text-red-400">Location Access Denied</h3>
            <p className="mt-2 text-md text-red-700 dark:text-red-300 max-w-sm mx-auto">Live tracking features are disabled. To use them, please enable location permissions for this app in your browser or device settings.</p>
        </div>
    );

    const renderContent = () => {
        switch(permissionStatus) {
            case 'checking':
                return <div className="flex justify-center items-center p-10"><Loader2 size={32} className="animate-spin text-primary" /></div>;
            case 'granted':
                return renderActiveTracking();
            case 'prompt':
                return renderPermissionPrompt();
            case 'denied':
                return renderPermissionDenied();
            default:
                return renderPermissionPrompt();
        }
    };
    
    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark mb-4 self-start">Live Vehicle Tracking</h2>
            {renderContent()}
        </div>
    );
};

export default TrackingComponent;
