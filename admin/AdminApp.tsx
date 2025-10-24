import React, { useState } from 'react';
import { LayoutDashboard, Users, ShoppingBasket, MessageSquareWarning, IndianRupee, LogOut, Sun, Moon, Recycle, Megaphone, Target, Bot, Settings, Car, ClipboardList } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import AdminDashboard from './AdminDashboard';
import AdminUserManagement from './AdminUserManagement';
import AdminBookingManagement from './AdminBookingManagement';
import AdminComplaintManagement from './AdminComplaintManagement';
import AdminPaymentManagement from './AdminPaymentManagement';
import AdminBroadcast from './AdminBroadcast';
import AdminStaffTracking from './AdminStaffTracking';
import AdminAIManagement from './AdminAIManagement';
import AdminSubscriptionManagement from './AdminSubscriptionManagement';
import AdminIPTracker from './AdminIPTracker';
import AdminDataOverview from './AdminDataOverview';

type AdminView = 'dashboard' | 'data-overview' | 'users' | 'bookings' | 'complaints' | 'payments' | 'broadcast' | 'employees' | 'drivers' | 'ai-management' | 'subscription-management' | 'ip-tracker';

interface AdminAppProps {
    handleAdminLogout: () => void;
}

const AdminApp: React.FC<AdminAppProps> = ({ handleAdminLogout }) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const { users, payments, complaints, bookings, updateUser, updateComplaint, updateBooking } = useData();
    const [currentView, setCurrentView] = useState<AdminView>('dashboard');

    const renderView = () => {
        switch(currentView) {
            case 'dashboard':
                return <AdminDashboard stats={{users: users.length, bookings: bookings.length, complaints: complaints.length, revenue: payments.reduce((acc, p) => acc + p.amount, 0)}} />;
            case 'data-overview':
                return <AdminDataOverview users={users} payments={payments} complaints={complaints} bookings={bookings} />;
            case 'users':
                return <AdminUserManagement users={users} updateUser={updateUser} />;
            case 'bookings':
                return <AdminBookingManagement bookings={bookings} users={users} updateBooking={updateBooking} />;
            case 'complaints':
                return <AdminComplaintManagement complaints={complaints} users={users} updateComplaint={updateComplaint} />;
            case 'payments':
                return <AdminPaymentManagement />;
            case 'broadcast':
                return <AdminBroadcast />;
            case 'employees':
                return <AdminStaffTracking role="employee" />;
            case 'drivers':
                return <AdminStaffTracking role="driver" />;
            case 'ai-management':
                return <AdminAIManagement />;
            case 'subscription-management':
                return <AdminSubscriptionManagement />;
            case 'ip-tracker':
                return <AdminIPTracker />;
            default:
                return <AdminDashboard stats={{users: users.length, bookings: bookings.length, complaints: complaints.length, revenue: payments.reduce((acc, p) => acc + p.amount, 0)}} />;
        }
    }

    if (!user) return null;

    return (
        <div className="w-full max-w-6xl mx-auto flex h-screen">
            <AdminSidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-1 flex flex-col">
                <AdminHeader user={user} handleAdminLogout={handleAdminLogout} toggleTheme={toggleTheme} theme={theme} />
                <main className="flex-1 p-6 overflow-y-auto bg-slate-100 dark:bg-slate-900">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

const AdminSidebar: React.FC<{currentView: AdminView, setCurrentView: (view: AdminView) => void}> = ({ currentView, setCurrentView }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'data-overview', label: 'Data Overview', icon: ClipboardList },
        { id: 'users', label: 'User Details', icon: Users },
        { id: 'bookings', label: 'Bookings', icon: ShoppingBasket },
        { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
        { id: 'payments', label: 'Payments', icon: IndianRupee },
        { id: 'employees', label: 'Employee Details', icon: Users },
        { id: 'drivers', label: 'Driver Details', icon: Car },
        { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
        { id: 'ai-management', label: 'AI Management', icon: Bot },
        { id: 'subscription-management', label: 'Subscription Model', icon: Settings },
        { id: 'ip-tracker', label: 'IP Tracker', icon: Target },
    ];
    
    return (
        <nav className="w-64 bg-card-light dark:bg-card-dark flex flex-col border-r border-border-light dark:border-border-dark">
            <div className="flex items-center space-x-3 p-4 border-b border-border-light dark:border-border-dark">
               <Recycle className="h-8 w-8 text-primary" />
               <h1 className="text-xl font-bold text-heading-light dark:text-heading-dark">EcoTrack Admin</h1>
            </div>
            <ul className="flex-1 py-4">
                {navItems.map(item => (
                    <li key={item.id} className="px-4 mb-2">
                        <button 
                            onClick={() => setCurrentView(item.id as AdminView)}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${currentView === item.id ? 'bg-primary/10 text-primary font-bold' : 'text-text-light dark:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const AdminHeader: React.FC<{user: any, handleAdminLogout: () => void, toggleTheme: () => void, theme: string}> = ({ user, handleAdminLogout, toggleTheme, theme }) => {
    return (
        <header className="bg-card-light dark:bg-card-dark h-16 flex items-center justify-end px-6 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center space-x-4">
                <button onClick={toggleTheme} className="p-2 rounded-full text-text-light dark:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle theme">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <span className="text-text-light dark:text-text-dark">|</span>
                <span className="font-semibold text-heading-light dark:text-heading-dark">{user.name}</span>
                <button onClick={handleAdminLogout} className="p-2 rounded-full text-text-light dark:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Logout Admin Session">
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default AdminApp;