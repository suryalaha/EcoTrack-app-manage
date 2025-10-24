import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Home, IndianRupee, History, MessageSquareWarning, Bot, ShoppingBasket, User as UserIcon, Mail, Map } from 'lucide-react';

import type { View, User } from './types';
import { ViewType } from './types';
import Dashboard from './components/Dashboard';
import PaymentComponent from './components/Payment';
import HistoryComponent from './components/History';
import ComplaintsComponent from './components/Complaints';
import EducationComponent from './components/Education';
import BookingComponent from './components/Booking';
import ProfileComponent from './components/Profile';
import MessagesComponent from './components/MessagesComponent';
import TrackingComponent from './components/Tracking';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import BroadcastModal from './components/BroadcastModal';
import WarningModal from './components/WarningModal';
import HelpAndFaq from './components/HelpAndFaq';
import FeedbackComponent from './components/FeedbackComponent';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import AuthFlow from './components/AuthFlow';
import AdminApp from './admin/AdminApp';
import LoginSelector from './components/LoginSelector';
import AdminAuthFlow from './components/AdminAuthFlow';
import StaffAuthFlow from './components/StaffAuthFlow';
import StaffApp from './components/StaffApp';

// This is the main user-facing application component
const UserApp: React.FC<{ users: User[] }> = ({ users }) => {
  const { user } = useAuth();
  const { payments, complaints, bookings, addComplaint, updateComplaint, broadcastMessage, clearUserWarning, updateUserLocation } = useData();
  const [currentView, setCurrentView] = useState<View>(ViewType.Dashboard);
  const [isChatbotOpen, setChatbotOpen] = useState<boolean>(false);
  const [isBroadcastVisible, setBroadcastVisible] = useState(false);
  const [isWarningVisible, setWarningVisible] = useState(false);

  // Memoize filtered data for the current user to prevent re-renders
  const userPayments = useMemo(() => payments.filter(p => p.householdId === user?.householdId), [payments, user]);
  const userComplaints = useMemo(() => complaints.filter(c => c.householdId === user?.householdId), [complaints, user]);
  const userBookings = useMemo(() => bookings.filter(b => b.householdId === user?.householdId), [bookings, user]);

  useEffect(() => {
    if (broadcastMessage && sessionStorage.getItem('lastDismissedBroadcast') !== broadcastMessage) {
        setBroadcastVisible(true);
    }
    if (user?.status === 'warned') {
        setWarningVisible(true);
    }
  }, [broadcastMessage, user]);

  // Continuously track user's location while the app is active
  const locationWatcherId = useRef<number | null>(null);
  useEffect(() => {
      if (user && navigator.geolocation) {
           // Clear any existing watcher to prevent duplicates
            if (locationWatcherId.current !== null) {
                navigator.geolocation.clearWatch(locationWatcherId.current);
            }

          locationWatcherId.current = navigator.geolocation.watchPosition(
              (position) => {
                  const { latitude, longitude } = position.coords;
                  const location = { lat: latitude, lng: longitude, timestamp: new Date() };
                  updateUserLocation(user.householdId, location);
              },
              (error) => {
                  console.warn("Could not track household location:", error.message);
              },
              { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 } // High accuracy for live tracking
          );
      }
      return () => {
          if (locationWatcherId.current !== null) {
              navigator.geolocation.clearWatch(locationWatcherId.current);
          }
      };
  }, [user, updateUserLocation]);


  const handleDismissBroadcast = () => {
    setBroadcastVisible(false);
    if(broadcastMessage) {
        sessionStorage.setItem('lastDismissedBroadcast', broadcastMessage);
    }
  };
  
  const handleAcknowledgeWarning = () => {
    if (user) {
        clearUserWarning(user.householdId);
    }
    setWarningVisible(false);
  }

  const renderView = () => {
    if (!user) return null;
    switch (currentView) {
      case ViewType.Dashboard:
        return <Dashboard user={user} bookings={userBookings} users={users} />;
      case ViewType.Payment:
        return <PaymentComponent setCurrentView={setCurrentView} />;
      case ViewType.Tracking:
        return <TrackingComponent />;
      case ViewType.History:
        return <HistoryComponent payments={userPayments} />;
      case ViewType.Complaints:
        return <ComplaintsComponent complaints={userComplaints} addComplaint={addComplaint} updateComplaint={updateComplaint} />;
      case ViewType.Education:
        return <EducationComponent />;
      case ViewType.Booking:
        return <BookingComponent />;
      case ViewType.Messages:
        return <MessagesComponent />;
      case ViewType.Profile:
        return <ProfileComponent setCurrentView={setCurrentView} />;
      case ViewType.HelpAndFaq:
        return <HelpAndFaq setCurrentView={setCurrentView} />;
      case ViewType.Feedback:
        return <FeedbackComponent setCurrentView={setCurrentView} />;
      default:
        return <Dashboard user={user} bookings={userBookings} users={users} />;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-card-light dark:bg-card-dark shadow-2xl flex flex-col h-screen">
      <Header />
      <main className="flex-grow p-4 overflow-y-auto pb-24 bg-transparent animate-fade-in">
        {renderView()}
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      <button
        onClick={() => setChatbotOpen(true)}
        className="fixed bottom-24 right-4 bg-gradient-to-r from-primary to-accent text-white p-4 rounded-full shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-110 z-30 animate-pulse-glow"
        aria-label="Open AI Chatbot"
      >
        <Bot size={28} />
      </button>
      {isChatbotOpen && <Chatbot onClose={() => setChatbotOpen(false)} />}
      {isBroadcastVisible && broadcastMessage && (
          <BroadcastModal message={broadcastMessage} onDismiss={handleDismissBroadcast} />
      )}
      {isWarningVisible && user?.warningMessage && (
          <WarningModal message={user.warningMessage} onAcknowledge={handleAcknowledgeWarning} />
      )}
    </div>
  );
};


const App: React.FC = () => {
  const { theme } = useTheme();
  const { isLoggedIn, user, logout } = useAuth();
  const { users } = useData();
  const [loginMode, setLoginMode] = useState<'selector' | 'user' | 'admin' | 'employee' | 'driver'>('selector');
  
  // States are derived from localStorage on each render.
  const isAdminMode = localStorage.getItem('isAdminMode') === 'true';
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  const isAdmin = user?.role === 'admin';
  
  const handleAdminLogout = () => {
      logout(); // Full logout to return to selector
      setLoginMode('selector');
  }

  // First, check for user login status
  if (!isLoggedIn || !user) {
    switch (loginMode) {
        case 'user':
            return <AuthFlow onBack={() => setLoginMode('selector')} />;
        case 'admin':
            return <AdminAuthFlow onBack={() => setLoginMode('selector')} />;
        case 'employee':
            return <StaffAuthFlow role="employee" onBack={() => setLoginMode('selector')} />;
        case 'driver':
            return <StaffAuthFlow role="driver" onBack={() => setLoginMode('selector')} />;
        case 'selector':
        default:
            return <LoginSelector onSelectMode={setLoginMode} />;
    }
  }
  
  // If user is logged in, check their role to render the correct app
  if (user.role === 'admin' && isAdminMode && isAdminLoggedIn) {
      return <AdminApp handleAdminLogout={handleAdminLogout} />;
  }

  if (user.role === 'employee' || user.role === 'driver') {
      return <StaffApp />;
  }

  // Default to household user app
  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme} bg-gradient-to-b from-slate-50 to-slate-100 dark:from-background-dark dark:to-slate-900`}>
       <UserApp users={users} />
    </div>
  );
};

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const { user } = useAuth();
  const { messages } = useData();

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return messages.filter(m => m.recipientId === user.householdId && !m.read).length;
  }, [user, messages]);

  const navItems = [
    { view: ViewType.Dashboard, icon: Home, label: 'Home' },
    { view: ViewType.Payment, icon: IndianRupee, label: 'Pay' },
    { view: ViewType.Tracking, icon: Map, label: 'Track' },
    { view: ViewType.Booking, icon: ShoppingBasket, label: 'Book' },
    { view: ViewType.History, icon: History, label: 'History' },
    { view: ViewType.Profile, icon: UserIcon, label: 'Profile', badgeCount: unreadCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-lg border-t border-border-light dark:border-border-dark shadow-t-2xl z-20">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setCurrentView(item.view)}
            className={`relative flex flex-col items-center justify-center w-full transition-all duration-300 h-full ${
              currentView === item.view ? 'text-primary' : 'text-secondary dark:text-secondary-dark hover:text-primary'
            }`}
          >
            <div className="relative">
                <item.icon size={24} strokeWidth={currentView === item.view ? 2.5 : 2} />
                {item.badgeCount && item.badgeCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 text-[10px] bg-red-500 text-white font-bold rounded-full flex items-center justify-center">
                        {item.badgeCount > 9 ? '9+' : item.badgeCount}
                    </span>
                )}
            </div>
            <span className={`text-xs font-semibold mt-1 transition-opacity ${currentView === item.view ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
             {currentView === item.view && <div className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-primary to-accent rounded-full mt-1 transition-all"></div>}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default App;