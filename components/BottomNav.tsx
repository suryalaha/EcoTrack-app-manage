import React, { useMemo } from 'react';
import { Home, IndianRupee, History, Map, ShoppingBasket, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { View, ViewType } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const { user } = useAuth();
  const { messages } = useData();
  const { t } = useLanguage();

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return messages.filter(m => m.recipientId === user.householdId && !m.read).length;
  }, [user, messages]);

  const navItems = useMemo(() => [
    { view: ViewType.Dashboard, icon: Home, label: t('home') },
    { view: ViewType.Payment, icon: IndianRupee, label: t('pay') },
    { view: ViewType.Tracking, icon: Map, label: t('track') },
    { view: ViewType.Booking, icon: ShoppingBasket, label: t('book') },
    { view: ViewType.History, icon: History, label: t('history') },
    { view: ViewType.Profile, icon: UserIcon, label: t('profile'), badgeCount: unreadCount },
  ], [t, unreadCount]);

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

export default BottomNav;
