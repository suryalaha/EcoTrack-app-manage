import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import type { User } from '../types';

interface AdminStaffTrackingProps {
    role: 'employee' | 'driver';
}

const AdminStaffTracking: React.FC<AdminStaffTrackingProps> = ({ role }) => {
    const { users } = useData();
    const staff = users.filter(u => u.role === role)
        .sort((a, b) => a.name.localeCompare(b.name));
    
    const title = role === 'employee' ? 'Employee Details' : 'Driver Details';

    const getAttendanceChip = (user: User) => {
        switch (user.attendanceStatus) {
            case 'present':
                return (
                    <div className="flex flex-col items-start">
                        <span className="flex items-center text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">
                            <CheckCircle size={14} className="mr-1.5"/> Present
                        </span>
                         {user.lastLoginTime && <span className="text-xs text-slate-500 mt-1">In: {user.lastLoginTime.toLocaleTimeString()}</span>}
                    </div>
                );
            case 'absent':
                return (
                     <div className="flex flex-col items-start">
                        <span className="flex items-center text-xs font-semibold text-red-600 bg-red-500/10 px-2 py-1 rounded-full">
                            <XCircle size={14} className="mr-1.5"/> Absent
                        </span>
                        {user.lastLoginTime && <span className="text-xs text-slate-500 mt-1">Late: {user.lastLoginTime.toLocaleTimeString()}</span>}
                    </div>
                );
            default:
                return (
                    <span className="flex items-center text-xs font-semibold text-slate-500 bg-slate-400/10 px-2 py-1 rounded-full">
                        <Clock size={14} className="mr-1.5"/> On Leave
                    </span>
                );
        }
    };
    
    const getUserInitials = (name: string) => {
        const nameParts = name.split(' ');
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-6">{title}</h1>
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                        <tr>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Staff Member</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Attendance</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Last Activity</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Live Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((member, index) => (
                             <tr key={member.householdId} className={`border-b border-border-light dark:border-border-dark ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                <td className="p-4 text-heading-light dark:text-heading-dark">
                                    <div className="flex items-center space-x-3">
                                        {member.profilePicture ? (
                                            <img src={member.profilePicture} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                                                <span className="font-bold text-sm text-primary">{getUserInitials(member.name)}</span>
                                            </div>
                                        )}
                                        <span className="font-medium">{member.name}</span>
                                    </div>
                                </td>
                                <td className="p-4">{getAttendanceChip(member)}</td>
                                <td className="p-4 text-text-light dark:text-text-dark text-sm">
                                    {member.lastLoginTime ? (
                                        <div>
                                            <p>{member.lastLoginTime.toLocaleString()}</p>
                                            <p className="font-mono text-xs text-slate-500">{member.lastIpAddress || 'No IP'}</p>
                                        </div>
                                    ) : <span className="text-slate-400">N/A</span>}
                                </td>
                                <td className="p-4 text-text-light dark:text-text-dark">
                                    {member.lastLocation ? (
                                        <div>
                                            <span className="font-mono text-xs">{`${member.lastLocation.lat.toFixed(5)}, ${member.lastLocation.lng.toFixed(5)}`}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <a
                                                    href={`https://www.google.com/maps?q=${member.lastLocation.lat},${member.lastLocation.lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-semibold py-1 px-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900"
                                                >
                                                    <MapPin size={12} className="mr-1"/> Map
                                                </a>
                                                <span className="text-xs text-slate-500">{member.lastLocation.timestamp.toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-xs">No data</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {staff.length === 0 && <p className="p-6 text-center text-text-light dark:text-text-dark">No {role}s found.</p>}
            </div>
            <p className="text-xs text-slate-500 mt-4">
                Location data updates automatically when staff members have the app open and active on their device.
            </p>
        </div>
    );
};

export default AdminStaffTracking;