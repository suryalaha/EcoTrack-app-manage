import React from 'react';
import { Users, ShoppingBasket, MessageSquareWarning, IndianRupee } from 'lucide-react';

interface AdminDashboardProps {
    stats: {
        users: number;
        bookings: number;
        complaints: number;
        revenue: number;
    }
}

const StatCard: React.FC<{icon: React.ElementType, title: string, value: string | number, color: string}> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md flex items-center space-x-4 border-l-4" style={{ borderColor: color }}>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20`}}>
            <Icon size={24} style={{ color }} />
        </div>
        <div>
            <p className="text-sm text-text-light dark:text-text-dark">{title}</p>
            <p className="text-2xl font-bold text-heading-light dark:text-heading-dark">{value}</p>
        </div>
    </div>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats }) => {
    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} title="Total Users" value={stats.users} color="#3b82f6" />
                <StatCard icon={ShoppingBasket} title="Total Bookings" value={stats.bookings} color="#f59e0b" />
                <StatCard icon={MessageSquareWarning} title="Total Complaints" value={stats.complaints} color="#ef4444" />
                <StatCard icon={IndianRupee} title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="#22c55e" />
            </div>
            
            <div className="mt-8 bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold text-heading-light dark:text-heading-dark mb-4">Welcome, Admin!</h2>
                 <p className="text-text-light dark:text-text-dark">
                    From this panel, you can manage all aspects of the EcoTrack application. Use the navigation on the left to view and manage users, special eCart bookings, user complaints, and payment histories.
                 </p>
            </div>
        </div>
    );
};

export default AdminDashboard;
