import React, { useState, useEffect, useCallback } from 'react';
import type { User, Booking, WasteLog } from '../types';
import { Truck, Video, BarChart2, MapPin, BellRing, IndianRupee, CheckCircle, Flame, Target } from 'lucide-react';
import { PieChart, Pie, ResponsiveContainer, Cell, Sector } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

interface DashboardProps {
  user: User;
  bookings: Booking[];
  users: User[];
}

const communityData = [
  { name: 'Recycled', value: 78, color: '#34d399' },
  { name: 'Composted', value: 45, color: '#fbbf24' },
  { name: 'Landfill', value: 12, color: '#f87171' },
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, t } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill={fill} className="text-xl font-bold transition-opacity duration-300">
        {t(payload.name.toLowerCase())}
      </text>
       <text x={cx} y={cy + 15} textAnchor="middle" fill={fill} className="text-lg opacity-80 transition-opacity duration-300">
        {`${payload.value} kg`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Pop out effect
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 4px 8px ${fill}99)` }} // Glow effect
      />
    </g>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ user, bookings, users }) => {
  const { t } = useLanguage();
  const { addWasteLog, wasteLogs } = useData();
  const [showAd, setShowAd] = useState(false);
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [activeDriver, setActiveDriver] = useState<User | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const totalWaste = communityData.reduce((sum, entry) => sum + entry.value, 0);

  const onPieEnter = useCallback((_: any, index: number) => {
      setActiveIndex(index);
  }, [setActiveIndex]);

  const onPieLeave = useCallback(() => {
      setActiveIndex(null);
  }, [setActiveIndex]);


  useEffect(() => {
    // Find a driver with a recent location update (e.g., within the last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const driver = users.find(
      (u) =>
        u.role === 'driver' &&
        u.lastLocation &&
        u.lastLocation.timestamp > fifteenMinutesAgo
    );
    setActiveDriver(driver || null);
  }, [users]); // This will re-run whenever the user data (including locations) changes

  useEffect(() => {
    if (user.bookingReminders) {
        const checkUpcomingBookings = () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowString = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

            const foundBooking = bookings.find(b => b.date === tomorrowString && b.status === 'Scheduled');
            if (foundBooking) {
                setUpcomingBooking(foundBooking);
            } else {
                setUpcomingBooking(null);
            }
        };

        checkUpcomingBookings();
    } else {
        setUpcomingBooking(null);
    }
  }, [bookings, user.bookingReminders]);
  
  const handleAdWatch = () => {
      setShowAd(true);
      setTimeout(() => setShowAd(false), 5000); // Simulate 5s ad
  }

  // --- Waste Logging Logic ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastLogDate = user.lastWasteLogDate ? new Date(user.lastWasteLogDate) : null;
  if (lastLogDate) {
    lastLogDate.setHours(0, 0, 0, 0);
  }

  const hasLoggedToday = lastLogDate?.getTime() === today.getTime();

  const todaysLog = hasLoggedToday
    ? wasteLogs.find(log => 
        log.householdId === user.householdId && 
        new Date(log.date).setHours(0,0,0,0) === today.getTime()
      ) 
    : null;

  const handleLogWaste = (wasteType: 'Wet' | 'Dry' | 'Mixed') => {
    addWasteLog(user.householdId, wasteType);
  };
  // --- End Waste Logging Logic ---

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-fade-in-down">{t('dashboardTitle', { name: user.name.split(' ')[0] })}</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in-up border border-border-light dark:border-border-dark" style={{animationDelay: '100ms'}}>
          <h3 className="font-semibold text-lg mb-3 flex items-center text-heading-light dark:text-heading-dark"><IndianRupee className="mr-2 text-primary" />{t('balance')}</h3>
          {user.outstandingBalance > 0 ? (
            <div>
              <p className="text-sm text-text-light dark:text-text-dark">{t('pendingBalance')}</p>
              <p className="text-3xl font-bold text-red-500 mt-2">₹{user.outstandingBalance.toFixed(2)}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-text-light dark:text-text-dark">{t('allSettled')}</p>
              <p className="text-3xl font-bold text-success mt-2 flex items-center"><CheckCircle className="mr-2"/> {t('cleared')}</p>
            </div>
          )}
        </div>
        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in-up border border-border-light dark:border-border-dark" style={{animationDelay: '150ms'}}>
          <h3 className="font-semibold text-lg mb-3 flex items-center text-heading-light dark:text-heading-dark"><Flame className="mr-2 text-orange-500" />{t('loginStreak')}</h3>
            <div className="text-center">
                <p className="text-4xl font-bold text-orange-500 mt-2">{user.loginStreak || 0}</p>
                <p className="text-sm text-text-light dark:text-text-dark">{t(user.loginStreak === 1 ? 'daysInARow' : 'daysInARow_plural', { count: user.loginStreak || 0 })}</p>
            </div>
        </div>
      </div>


      {upcomingBooking && (
        <div className="bg-info/10 dark:bg-info/20 border-l-4 border-info text-info p-4 rounded-r-lg shadow-md animate-fade-in-up" role="alert" style={{animationDelay: '200ms'}}>
          <div className="flex items-center">
            <BellRing className="h-6 w-6 mr-3 flex-shrink-0"/>
            <div>
              <p className="font-bold">{t('reminder')}</p>
              <p className="text-sm">You have a {upcomingBooking.wasteType} collection scheduled for tomorrow ({upcomingBooking.timeSlot}).</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in-up border border-border-light dark:border-border-dark" style={{animationDelay: '300ms'}}>
        <h3 className="font-semibold text-lg mb-3 flex items-center text-heading-light dark:text-heading-dark"><MapPin className="mr-2 text-primary" />{t('liveCollectionStatus')}</h3>
        {activeDriver && activeDriver.lastLocation ? (
          <div className="space-y-3">
             <p className="text-sm text-text-light dark:text-text-dark">
                Driver <span className="font-bold text-primary">{activeDriver.name}</span> is on the way.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Last updated: {activeDriver.lastLocation.timestamp.toLocaleTimeString()}
            </p>
            {user.lastLocation ? (
                 <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${user.lastLocation.lat},${user.lastLocation.lng}&destination=${activeDriver.lastLocation.lat},${activeDriver.lastLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center bg-gradient-to-r from-primary to-accent text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-glow-primary transition-all transform hover:scale-105"
                >
                    <Truck className="mr-2" size={20} /> {t('viewOnMap')}
                </a>
            ) : (
                 <button
                    disabled
                    className="w-full inline-flex items-center justify-center bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed"
                >
                    <Truck className="mr-2" size={20} /> Enable your location to see driver
                </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-light dark:text-text-dark text-center py-4">
              {t('noActiveVehicle')}
          </p>
        )}
      </div>

      <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in-up border border-border-light dark:border-border-dark" style={{animationDelay: '400ms'}}>
        <h3 className="font-semibold text-lg mb-3 flex items-center text-heading-light dark:text-heading-dark"><BarChart2 className="mr-2 text-primary" />{t('communityWasteDiversion')}</h3>
        <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={(props) => renderActiveShape({ ...props, t })}
                        data={communityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                        isAnimationActive={true}
                        animationDuration={1000}
                        animationEasing="ease-out"
                    >
                        {communityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            {activeIndex === null && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-heading-light dark:text-heading-dark">{totalWaste}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">kg {t('total')}</p>
                    </div>
                </div>
            )}
        </div>
        <div className="mt-4 flex justify-center items-center space-x-4 md:space-x-6">
            {communityData.map((entry) => (
                <div key={entry.name} className="flex items-center text-sm">
                    <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-text-light dark:text-text-dark">{t(entry.name.toLowerCase())} <span className="font-semibold">({((entry.value / totalWaste) * 100).toFixed(0)}%)</span></span>
                </div>
            ))}
        </div>
        <p className="text-center text-sm text-text-light dark:text-text-dark mt-4">{t('co2Saved', { amount: '1.2' })}</p>
      </div>

      <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in-up border border-border-light dark:border-border-dark" style={{animationDelay: '500ms'}}>
        <h3 className="font-semibold text-lg mb-2 flex items-center text-heading-light dark:text-heading-dark"><Target className="mr-2 text-primary" />Log Your Waste</h3>
        <p className="text-sm text-text-light dark:text-text-dark mb-4">Log your daily waste type. A fine of ₹100 is applied after three consecutive "Mixed Waste" logs.</p>
        {todaysLog ? (
            <div className="bg-primary/10 text-primary-dark dark:text-primary-light font-semibold p-4 rounded-lg text-center animate-fade-in">
                You've logged "{todaysLog.wasteType} Waste" for today. Thank you!
            </div>
        ) : (
            <div className="animate-fade-in">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <button onClick={() => handleLogWaste('Wet')} className="flex flex-col items-center justify-center p-3 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:scale-105">
                        <span className="text-3xl">🍎</span>
                        <span className="font-semibold text-sm mt-1">Wet Waste</span>
                    </button>
                    <button onClick={() => handleLogWaste('Dry')} className="flex flex-col items-center justify-center p-3 bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg transition-all hover:bg-green-100 dark:hover:bg-green-900/50 hover:scale-105">
                        <span className="text-3xl">📦</span>
                        <span className="font-semibold text-sm mt-1">Dry Waste</span>
                    </button>
                    <button onClick={() => handleLogWaste('Mixed')} className="flex flex-col items-center justify-center p-3 bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg transition-all hover:bg-red-100 dark:hover:bg-red-900/50 hover:scale-105">
                        <span className="text-3xl">🗑️</span>
                        <span className="font-semibold text-sm mt-1">Mixed Waste</span>
                    </button>
                </div>
                 <div className={`mt-3 text-center text-sm font-semibold transition-colors ${(user.consecutiveMixedWasteLogs || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                    Consecutive 'Mixed Waste' logs: {user.consecutiveMixedWasteLogs || 0} / 3
                </div>
            </div>
        )}
      </div>

       <div className="bg-gradient-to-br from-primary-dark to-accent text-white p-5 rounded-xl shadow-lg text-center transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '600ms'}}>
            <h3 className="font-bold text-lg">Support Our NGO!</h3>
            <p className="text-sm mt-1 mb-3 opacity-90">Watch a 30-second ad to contribute to our cause. It's optional but greatly appreciated!</p>
            <button onClick={handleAdWatch} className="bg-white/90 text-primary-dark font-bold py-2 px-5 rounded-full flex items-center mx-auto hover:bg-white transition-transform transform hover:scale-105 shadow-md hover:shadow-lg">
                <Video className="mr-2" /> Watch Ad
            </button>
       </div>
       
       {showAd && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
           <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg text-center text-heading-light dark:text-heading-dark">
             <h3 className="text-xl font-bold">Ad in Progress...</h3>
             <p className="my-4 text-text-light dark:text-text-dark">Thank you for your support!</p>
             <div className="w-24 h-24 bg-slate-200 dark:bg-slate-600 mx-auto flex items-center justify-center text-slate-500">
                 Video
             </div>
             <p className="text-sm mt-4 text-text-light dark:text-text-dark">This window will close automatically.</p>
           </div>
         </div>
       )}
    </div>
  );
};

export default Dashboard;