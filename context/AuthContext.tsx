import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { User } from '../types';
import { useData } from './DataContext';

const USER_ID_STORAGE_KEY = 'ecotrack-user-id';

interface LoginResult {
    success: boolean;
    message?: string;
    user?: User;
}

interface SignupParams {
    name: string;
    identifier: string;
    password?: string;
    familySize: number;
    address: User['address'];
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (identifier: string, password?: string, rememberMe?: boolean) => Promise<LoginResult>;
  signup: (params: SignupParams) => Promise<LoginResult>;
  loginAsAdmin: (identifier: string) => Promise<LoginResult>;
  loginAsStaff: (identifier: string, role: 'employee' | 'driver') => Promise<LoginResult>;
  logout: () => void;
  toggleBookingReminders: () => void;
  updateNotificationSettings: (settings: Partial<{ push: boolean; email: boolean; sms: boolean }>) => void;
  updateUserName: (newName: string) => void;
  updateUserEmail: (newEmail: string) => void;
  updateUserProfilePicture: (pictureDataUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const { users, addUser, updateUser, subscriptionPlans } = useData();

  const user = users.find(u => u.householdId === loggedInUserId) || null;
  const isLoggedIn = !!user;

  useEffect(() => {
    let savedUserId = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (!savedUserId) {
        savedUserId = sessionStorage.getItem(USER_ID_STORAGE_KEY);
    }

    if (savedUserId) {
        if (users.some(u => u.householdId === savedUserId)) {
            setLoggedInUserId(savedUserId);
        } else {
            localStorage.removeItem(USER_ID_STORAGE_KEY);
            sessionStorage.removeItem(USER_ID_STORAGE_KEY);
        }
    }
  }, [users]);

  const handleStreakLogic = (user: User): Partial<User> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastIncrement = user.lastStreakIncrement ? new Date(user.lastStreakIncrement) : null;
    if (lastIncrement) {
        lastIncrement.setHours(0, 0, 0, 0);
    }

    // If last increment was not today
    if (!lastIncrement || lastIncrement.getTime() !== today.getTime()) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (lastIncrement && lastIncrement.getTime() === yesterday.getTime()) {
            // Streak continues
            return {
                loginStreak: (user.loginStreak || 0) + 1,
                lastStreakIncrement: new Date(),
            };
        } else {
            // Streak resets
            return {
                loginStreak: 1,
                lastStreakIncrement: new Date(),
            };
        }
    }
    // No changes if already incremented today
    return {};
  };

  const login = async (identifier: string, password?: string, rememberMe?: boolean): Promise<LoginResult> => {
    const isEmail = identifier.includes('@');
    const normalizedIdentifier = isEmail ? identifier.toLowerCase() : identifier.replace(/[^0-9]/g, '');

    const existingUser = users.find(u => u.identifier === normalizedIdentifier);

    if (!existingUser) {
        return { success: false, message: 'No account found with this identifier.' };
    }
    // Allow special admin '9635929052' to log in as a household user
    if (existingUser.role !== 'household' && existingUser.identifier !== '9635929052') {
        return { success: false, message: 'Access denied for this portal.'};
    }
    if (existingUser.status === 'blocked') {
        return { success: false, message: 'Your account has been blocked. Please contact support.' };
    }
    if (existingUser.password !== password) {
        return { success: false, message: 'Invalid password.' };
    }
    
    const mockIpAddress = `103.12.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const streakUpdates = handleStreakLogic(existingUser);
    const updatedUser = { ...existingUser, lastLoginTime: new Date(), lastIpAddress: mockIpAddress, ...streakUpdates };
    updateUser(updatedUser);

    if (rememberMe) {
        localStorage.setItem(USER_ID_STORAGE_KEY, existingUser.householdId);
    } else {
        sessionStorage.setItem(USER_ID_STORAGE_KEY, existingUser.householdId);
    }
    setLoggedInUserId(existingUser.householdId);
    return { success: true, user: updatedUser };
  }
  
  const isStrongPassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W|_/.test(password); // Includes underscore
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
  };

  const signup = async (params: SignupParams): Promise<LoginResult> => {
    const { name, identifier, password, familySize, address } = params;
    const isEmail = identifier.includes('@');
    const normalizedIdentifier = isEmail ? identifier.toLowerCase() : identifier.replace(/[^0-9]/g, '');

    if (users.some(u => u.identifier === normalizedIdentifier)) {
        return { success: false, message: 'An account with this identifier already exists.' };
    }
    
    if (!password || !isStrongPassword(password)) {
        return { success: false, message: 'Password is not strong enough. It must be at least 8 characters and include uppercase, lowercase, a number, and a special character.' };
    }

    const householdId = `HH-${normalizedIdentifier.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const balance = familySize > subscriptionPlans.largeFamilyThreshold ? subscriptionPlans.largeFamily : subscriptionPlans.standard;

    const newUser: User = {
        name,
        householdId,
        identifier: normalizedIdentifier,
        password,
        role: 'household',
        status: 'active',
        hasGreenBadge: false,
        bookingReminders: true,
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: true,
        profilePicture: '',
        email: isEmail ? normalizedIdentifier : '',
        createdAt: new Date(),
        outstandingBalance: balance,
        familySize,
        address,
        loginStreak: 1,
        lastStreakIncrement: new Date(),
    };
    addUser(newUser);

    sessionStorage.setItem(USER_ID_STORAGE_KEY, householdId);
    setLoggedInUserId(householdId);
    return { success: true, user: newUser };
  }

  const loginAsAdmin = async (identifier: string): Promise<LoginResult> => {
      const existingUser = users.find(u => u.identifier === identifier && u.role === 'admin');
      if (!existingUser) {
           return { success: false, message: 'Admin account not found.' };
      }
      if (existingUser.status === 'blocked') {
        return { success: false, message: 'Your account has been blocked. Please contact support.' };
      }
      
      localStorage.setItem(USER_ID_STORAGE_KEY, existingUser.householdId);
      localStorage.setItem('isAdminMode', 'true');
      localStorage.setItem('isAdminLoggedIn', 'true');
      setLoggedInUserId(existingUser.householdId);
      return { success: true };
  };

  const loginAsStaff = async (identifier: string, role: 'employee' | 'driver'): Promise<LoginResult> => {
    // Allow login if the user has the specific role OR if the user is the special admin
    const existingUser = users.find(u => u.identifier === identifier && (u.role === role || u.identifier === '9635929052'));
    if (!existingUser) {
        return { success: false, message: `No ${role} account found with this number.` };
    }
    if (existingUser.status === 'blocked') {
        return { success: false, message: 'Your account has been blocked. Please contact support.' };
    }

    // Attendance Logic: Present if login is between 10:00 AM and 10:30 AM
    const now = new Date();
    const tenAM = new Date();
    tenAM.setHours(10, 0, 0, 0);
    const tenThirtyAM = new Date();
    tenThirtyAM.setHours(10, 30, 0, 0);
    const attendanceStatus: 'present' | 'absent' = (now >= tenAM && now <= tenThirtyAM) ? 'present' : 'absent';
    
    // Simulate getting IP address
    const mockIpAddress = `103.12.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    const streakUpdates = handleStreakLogic(existingUser);
    
    const updatedUser: User = {
        ...existingUser,
        attendanceStatus,
        lastLoginTime: now,
        lastIpAddress: mockIpAddress,
        ...streakUpdates,
    };
    updateUser(updatedUser);

    sessionStorage.setItem(USER_ID_STORAGE_KEY, existingUser.householdId); // Use session storage for staff
    setLoggedInUserId(existingUser.householdId);
    return { success: true, user: updatedUser };
  };

  const logout = () => {
    localStorage.removeItem(USER_ID_STORAGE_KEY);
    sessionStorage.removeItem(USER_ID_STORAGE_KEY);
    localStorage.removeItem('isAdminMode');
    localStorage.removeItem('isAdminLoggedIn');
    setLoggedInUserId(null);
  };

  const updateUserData = (updatedUser: User) => {
    updateUser(updatedUser);
  };
  
  const toggleBookingReminders = () => {
    if(user) {
        const updatedUser = { ...user, bookingReminders: !user.bookingReminders };
        updateUserData(updatedUser);
    }
  };

  const updateNotificationSettings = (settings: Partial<{ push: boolean; email: boolean; sms: boolean }>) => {
      if (user) {
          const updatedUser = {
              ...user,
              pushNotifications: settings.push ?? user.pushNotifications,
              emailNotifications: settings.email ?? user.emailNotifications,
              smsNotifications: settings.sms ?? user.smsNotifications,
          };
          updateUserData(updatedUser);
      }
  };

  const updateUserName = (newName: string) => {
    if(user) {
      const updatedUser = { ...user, name: newName };
      updateUserData(updatedUser);
    }
  };

   const updateUserEmail = (newEmail: string) => {
    if(user) {
      const updatedUser = { ...user, email: newEmail };
      updateUserData(updatedUser);
    }
  };

  const updateUserProfilePicture = (pictureDataUrl: string) => {
     if(user) {
        const updatedUser = { ...user, profilePicture: pictureDataUrl };
        updateUserData(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, signup, loginAsAdmin, loginAsStaff, logout, toggleBookingReminders, updateNotificationSettings, updateUserName, updateUserEmail, updateUserProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};