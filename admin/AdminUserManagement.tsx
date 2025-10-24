import React, { useState, useMemo, Fragment } from 'react';
import type { User } from '../types';
import { Pencil, Save, AlertTriangle, ShieldOff, Shield, Trash2, Eye, EyeOff, Info, Search, ChevronDown, Mail, MapPin, Users, Home } from 'lucide-react';
import { useData } from '../context/DataContext';

interface AdminUserManagementProps {
    users: User[];
    updateUser: (user: User) => void;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users, updateUser }) => {
    const { deleteUser, addMessage } = useData();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [warningUser, setWarningUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [messagingUser, setMessagingUser] = useState<User | null>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [messageText, setMessageText] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('date-desc');

    const processedUsers = useMemo(() => {
        const householdUsers = users.filter(user => user.role === 'household');
        
        let filtered = householdUsers.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.identifier.toLowerCase().includes(searchQuery.toLowerCase())
        );

        switch (sortOption) {
            case 'date-desc':
                filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                break;
            case 'date-asc':
                filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }

        return filtered;
    }, [users, searchQuery, sortOption]);

    const getUserInitials = (name: string) => {
        const nameParts = name.split(' ');
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email || '');
    }

    const handleViewClick = (user: User) => {
        setViewingUser(user);
        setIsPasswordVisible(false);
    }
    
    const handleWarnClick = (user: User) => {
        setWarningUser(user);
        setWarningMessage('');
    }

    const handleDeleteClick = (user: User) => {
        setDeletingUser(user);
    }

    const handleMessageClick = (user: User) => {
        setMessagingUser(user);
        setMessageText('');
    }

    const handleBlockToggle = (user: User) => {
        const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
        updateUser({ ...user, status: newStatus });
    }
    
    const closeModals = () => {
        setEditingUser(null);
        setWarningUser(null);
        setDeletingUser(null);
        setViewingUser(null);
        setMessagingUser(null);
        setName('');
        setEmail('');
        setWarningMessage('');
        setMessageText('');
    }

    const handleSaveChanges = () => {
        if (editingUser) {
            updateUser({ ...editingUser, name, email });
            closeModals();
        }
    }

    const handleSendWarning = () => {
        if (warningUser && warningMessage) {
            updateUser({ ...warningUser, status: 'warned', warningMessage });
            closeModals();
        }
    }
    
    const handleConfirmDelete = () => {
        if (deletingUser) {
            deleteUser(deletingUser.householdId);
            closeModals();
        }
    }

    const handleSendMessage = () => {
        if (messagingUser && messageText.trim()) {
            addMessage(messagingUser.householdId, messageText.trim());
            closeModals();
        }
    }

    const getStatusChip = (status: User['status']) => {
        switch (status) {
            case 'active':
                return <span className="text-xs font-semibold text-success bg-success/10 dark:bg-success/20 px-2 py-1 rounded-full">Active</span>;
            case 'blocked':
                return <span className="text-xs font-semibold text-red-600 bg-red-500/10 dark:bg-red-500/20 px-2 py-1 rounded-full">Blocked</span>;
            case 'warned':
                 return <span className="text-xs font-semibold text-warning-dark dark:text-warning bg-warning/10 dark:bg-warning/20 px-2 py-1 rounded-full">Warned</span>;
        }
    }

    return (
         <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-6">User Details</h1>
            
             <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 p-2 pl-10 border border-border-light dark:border-border-dark bg-card-light dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="relative">
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="appearance-none w-full sm:w-48 p-2 pr-8 border border-border-light dark:border-border-dark bg-card-light dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="date-desc">Date (Newest)</option>
                        <option value="date-asc">Date (Oldest)</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left min-w-[1200px]">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                        <tr>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">User</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Identifier</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Last Activity</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Live Location</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Status</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedUsers.map((user, index) => (
                             <tr key={user.householdId} className={`border-b border-border-light dark:border-border-dark ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                <td className="p-4 text-heading-light dark:text-heading-dark">
                                    <div className="flex items-center space-x-3">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                                                <span className="font-bold text-sm text-primary">{getUserInitials(user.name)}</span>
                                            </div>
                                        )}
                                        <span className="font-medium">{user.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-text-light dark:text-text-dark font-mono text-sm">{user.identifier}</td>
                                <td className="p-4 text-text-light dark:text-text-dark text-sm">
                                    {user.lastLoginTime ? (
                                        <div>
                                            <p>{user.lastLoginTime.toLocaleString()}</p>
                                            <p className="font-mono text-xs text-slate-500">{user.lastIpAddress || 'No IP'}</p>
                                        </div>
                                    ) : <span className="text-slate-400">N/A</span>}
                                </td>
                                <td className="p-4 text-text-light dark:text-text-dark">
                                    {user.lastLocation ? (
                                        <a
                                            href={`https://www.google.com/maps?q=${user.lastLocation.lat},${user.lastLocation.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-semibold py-1 px-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900"
                                        >
                                            <MapPin size={12} className="mr-1"/> View Map
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 text-xs">No data</span>
                                    )}
                                </td>
                                <td className="p-4">{getStatusChip(user.status)}</td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center items-center space-x-1">
                                         <button onClick={() => handleViewClick(user)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-500 rounded-full transition" title="View Details">
                                            <Info size={18} />
                                        </button>
                                        <button onClick={() => handleMessageClick(user)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary rounded-full transition" title="Send Message">
                                            <Mail size={18} />
                                        </button>
                                        <button onClick={() => handleEditClick(user)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary rounded-full transition" title="Edit User">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleWarnClick(user)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-500 rounded-full transition" title="Warn User">
                                            <AlertTriangle size={18} />
                                        </button>
                                        <button onClick={() => handleBlockToggle(user)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition" title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}>
                                            {user.status === 'blocked' ? <Shield size={18} className="text-success" /> : <ShieldOff size={18} className="text-red-500" />}
                                        </button>
                                        <button onClick={() => handleDeleteClick(user)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600 rounded-full transition" title="Delete User">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {processedUsers.length === 0 && <p className="p-6 text-center text-text-light dark:text-text-dark">No users found matching your criteria.</p>}
            </div>
            
            {viewingUser && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md relative transform transition-all animate-scale-in">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-heading-light dark:text-heading-dark mb-4">User Details</h3>
                            <div className="space-y-3 text-sm text-text-light dark:text-text-dark">
                                <p><strong>Name:</strong> {viewingUser.name}</p>
                                <p><strong>Identifier:</strong> {viewingUser.identifier}</p>
                                <p><strong>Email:</strong> {viewingUser.email || 'N/A'}</p>
                                <p className="flex items-center"><Users size={14} className="mr-2"/><strong>Family Size:</strong> {viewingUser.familySize}</p>
                                <div className="pt-2 border-t border-border-light dark:border-border-dark">
                                    <p className="flex items-center font-semibold text-heading-light dark:text-heading-dark"><Home size={14} className="mr-2"/> Address</p>
                                    <p className="pl-6">{viewingUser.address.area},<br/>{viewingUser.address.landmark},<br/>Pincode: {viewingUser.address.pincode}</p>
                                </div>
                                <div className="pt-2 border-t border-border-light dark:border-border-dark space-y-1">
                                    <p><strong>Last Login:</strong> {viewingUser.lastLoginTime?.toLocaleString() || 'N/A'}</p>
                                    <p><strong>IP Address:</strong> {viewingUser.lastIpAddress || 'N/A'}</p>
                                </div>
                                <div className="pt-3 border-t border-border-light dark:border-border-dark">
                                    <p className="flex items-center font-semibold text-heading-light dark:text-heading-dark mb-2"><MapPin size={14} className="mr-2"/> Live Location</p>
                                    {viewingUser.lastLocation ? (
                                        <div className="pl-6 space-y-2">
                                            <p><strong>Coordinates:</strong> <span className="font-mono">{`${viewingUser.lastLocation.lat.toFixed(6)}, ${viewingUser.lastLocation.lng.toFixed(6)}`}</span></p>
                                            <p><strong>Last Update:</strong> {viewingUser.lastLocation.timestamp.toLocaleString()}</p>
                                            <a href={`https://www.google.com/maps?q=${viewingUser.lastLocation.lat},${viewingUser.lastLocation.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-xs shadow-md hover:bg-blue-600 transition-all">
                                                <MapPin className="mr-1.5" size={14} /> Open in Google Maps
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="pl-6 text-slate-500">No location data available.</p>
                                    )}
                                </div>

                                <div className="flex items-center pt-2 border-t border-border-light dark:border-border-dark">
                                    <strong className="mr-2">Password:</strong>
                                    <span className={`font-mono ${!isPasswordVisible ? 'blur-sm' : ''}`}>{viewingUser.password || 'Not Set'}</span>
                                    <button onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="ml-auto p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                        {isPasswordVisible ? <EyeOff size={16}/> : <Eye size={16}/>}
                                    </button>
                                </div>
                            </div>
                        </div>
                         <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-end space-x-3 rounded-b-xl">
                            <button onClick={closeModals} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {editingUser && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md relative transform transition-all animate-scale-in">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-heading-light dark:text-heading-dark mb-4">Edit User: {editingUser.name}</h3>
                             <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Full Name</label>
                                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 pl-4 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Email Address</label>
                                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 pl-4 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-end space-x-3 rounded-b-xl">
                            <button onClick={closeModals} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Cancel</button>
                            <button onClick={handleSaveChanges} className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-glow-primary font-semibold flex items-center"><Save size={16} className="mr-2"/> Save</button>
                        </div>
                    </div>
                </div>
            )}
            
            {warningUser && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md relative transform transition-all animate-scale-in">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-heading-light dark:text-heading-dark mb-4">Warn User: {warningUser.name}</h3>
                            <p className="text-sm text-text-light dark:text-text-dark mb-3">Enter a message that will be shown to the user upon their next login. They must acknowledge it to continue.</p>
                            <textarea value={warningMessage} onChange={(e) => setWarningMessage(e.target.value)} rows={4} className="w-full p-3 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Please be respectful to our staff..."></textarea>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-end space-x-3 rounded-b-xl">
                            <button onClick={closeModals} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Cancel</button>
                            <button onClick={handleSendWarning} disabled={!warningMessage.trim()} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"><AlertTriangle size={16} className="mr-2"/> Send Warning</button>
                        </div>
                    </div>
                </div>
            )}

            {deletingUser && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md relative transform transition-all animate-scale-in">
                        <div className="p-6 text-center">
                            <Trash2 size={40} className="mx-auto text-red-500 mb-4"/>
                            <h3 className="text-xl font-bold text-heading-light dark:text-heading-dark mb-2">Are you sure?</h3>
                            <p className="text-text-light dark:text-text-dark">You are about to delete the user <strong className="text-heading-light dark:text-heading-dark">{deletingUser.name}</strong>. All associated data will be removed. This action cannot be undone.</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-center space-x-3 rounded-b-xl">
                            <button onClick={closeModals} className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Cancel</button>
                            <button onClick={handleConfirmDelete} className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold flex items-center"><Trash2 size={16} className="mr-2"/> Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            {messagingUser && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md relative transform transition-all animate-scale-in">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-heading-light dark:text-heading-dark mb-4">Send Message to {messagingUser.name}</h3>
                            <p className="text-sm text-text-light dark:text-text-dark mb-3">The message will appear in the user's inbox inside the app.</p>
                            <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={5} className="w-full p-3 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Type your message here..."></textarea>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-end space-x-3 rounded-b-xl">
                            <button onClick={closeModals} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Cancel</button>
                            <button onClick={handleSendMessage} disabled={!messageText.trim()} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"><Mail size={16} className="mr-2"/> Send Message</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminUserManagement;