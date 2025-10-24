import React, { useState, useEffect } from 'react';
import type { Booking } from '../types';
import { Calendar, Clock, Check, Bell, CalendarDays, Box, Leaf, Users, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { SUPPORT_EMAIL } from '../constants';

const BookingComponent: React.FC = () => {
    const { user, toggleBookingReminders } = useAuth();
    const { bookings, addBooking } = useData();
    const [wasteType, setWasteType] = useState<'Event Waste' | 'Bulk Household' | 'Garden Waste'>('Bulk Household');
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState<'Morning' | 'Afternoon'>('Morning');
    const [notes, setNotes] = useState('');
    const [attendeeCount, setAttendeeCount] = useState<number | ''>('');
    const [bookingFee, setBookingFee] = useState(0);
    const [isBooked, setIsBooked] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');

    useEffect(() => {
        if (wasteType === 'Event Waste' && typeof attendeeCount === 'number' && attendeeCount > 0) {
            if (attendeeCount <= 300) setBookingFee(500);
            else if (attendeeCount <= 600) setBookingFee(700);
            else if (attendeeCount <= 1000) setBookingFee(1200);
            else setBookingFee(0); // Indicates admin adjustment needed
        } else {
            setBookingFee(0);
        }
    }, [attendeeCount, wasteType]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!date || !user) {
            alert("Please select a date.");
            return;
        }

        const newBooking: Booking = {
            id: `BK-${Date.now()}`,
            householdId: user.householdId,
            date,
            timeSlot,
            wasteType,
            notes,
            status: 'Scheduled',
            attendeeCount: wasteType === 'Event Waste' ? Number(attendeeCount) : undefined,
            bookingFee: wasteType === 'Event Waste' ? bookingFee : undefined,
        };
        addBooking(newBooking);

        // Trigger email notification
        const subject = `New eCart Booking Confirmation: ${newBooking.id}`;
        const feeDetails = newBooking.bookingFee > 0 
            ? `Calculated Fee: ₹${newBooking.bookingFee}` 
            : (newBooking.attendeeCount > 1000 ? 'Fee to be adjusted by admin.' : 'Standard fee applies.');
        
        const body = `A new special collection has been booked by a user.

Booking Details:
----------------
Booking ID: ${newBooking.id}
Date: ${new Date(newBooking.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
Time Slot: ${newBooking.timeSlot}
Waste Type: ${newBooking.wasteType}
${newBooking.attendeeCount ? `Attendees: ${newBooking.attendeeCount}` : ''}
Notes: ${newBooking.notes || 'N/A'}

User Details:
-------------
Name: ${user.name}
Household ID: ${user.householdId}
Email: ${user.email || 'Not provided in profile'}

Payment Details:
----------------
${feeDetails}
Please coordinate with the user for payment confirmation. The amount has been added to their outstanding balance.

Thank you,
EcoTrack App System
        `;
        const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
        // window.open(mailtoLink, '_blank'); // This can be disruptive, so commented out for now.

        setIsBooked(true);
        setConfirmationMessage(`Your eCart has been scheduled. ${bookingFee > 0 ? `A fee of ₹${bookingFee} has been added to your balance.` : ''}`);
        
        // Reset form
        setDate('');
        setNotes('');
        setTimeSlot('Morning');
        setWasteType('Bulk Household');
        setAttendeeCount('');

        setTimeout(() => setIsBooked(false), 5000); // Hide success message after 5s
    };

    const getStatusChip = (status: Booking['status']) => {
        if (status === 'Scheduled') {
            return <div className="flex items-center text-xs font-semibold text-info bg-info/10 dark:bg-info/20 px-2 py-1 rounded-full"><Clock size={12} className="mr-1"/>{status}</div>
        }
        return <div className="flex items-center text-xs font-semibold text-success bg-success/10 dark:bg-success/20 px-2 py-1 rounded-full"><Check size={12} className="mr-1"/>{status}</div>
    }

    const getWasteTypeIcon = (wasteType: Booking['wasteType']) => {
        switch (wasteType) {
            case 'Event Waste':
                return <CalendarDays size={24} />;
            case 'Bulk Household':
                return <Box size={24} />;
            case 'Garden Waste':
                return <Leaf size={24} />;
            default:
                return null;
        }
    };

    if (!user) return null;
    
    const userBookings = bookings.filter(b => b.householdId === user.householdId);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark animate-fade-in-down">Book a Special Collection</h2>

             <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-md border border-border-light dark:border-border-dark flex justify-between items-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center">
                    <Bell size={20} className="mr-3 text-primary flex-shrink-0"/>
                    <div>
                        <h4 className="font-semibold text-heading-light dark:text-heading-dark">Booking Reminders</h4>
                        <p className="text-sm text-text-light dark:text-text-dark">Get a notification one day before collection.</p>
                    </div>
                </div>
                <button 
                  onClick={toggleBookingReminders} 
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${user.bookingReminders ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                  aria-pressed={user.bookingReminders}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${user.bookingReminders ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
            </div>
            
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-md border border-border-light dark:border-border-dark animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                {isBooked ? (
                     <div className="text-center p-4 animate-scale-in">
                        <Check className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse"/>
                        <h3 className="text-xl font-bold text-heading-light dark:text-heading-dark">Booking Confirmed!</h3>
                        <p className="text-text-light dark:text-text-dark mt-2">{confirmationMessage}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Type of Waste</label>
                            <select value={wasteType} onChange={(e) => setWasteType(e.target.value as any)} className="w-full p-2 bg-background-light dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:ring-primary focus:border-primary text-text-light dark:text-text-dark">
                                <option>Bulk Household</option>
                                <option>Event Waste</option>
                                <option>Garden Waste</option>
                            </select>
                        </div>
                        {wasteType === 'Event Waste' && (
                            <div className="animate-fade-in-down">
                                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Number of Attendees</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="number" value={attendeeCount} onChange={e => setAttendeeCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="w-full p-2 pl-10 bg-background-light dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:ring-primary focus:border-primary text-text-light dark:text-text-dark" placeholder="e.g., 250"/>
                                </div>
                                <div className="mt-2 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg text-center">
                                    {bookingFee > 0 && <p className="text-primary font-bold text-lg flex items-center justify-center"><IndianRupee size={18} className="mr-1"/> {bookingFee.toFixed(2)} Fee</p>}
                                    {attendeeCount > 1000 && <p className="text-info text-sm font-semibold">Fee to be adjusted by admin for over 1000 attendees.</p>}
                                    {!bookingFee && attendeeCount <= 1000 && <p className="text-sm text-slate-500">Enter attendees to calculate fee.</p>}
                                </div>
                            </div>
                        )}
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Preferred Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-background-light dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:ring-primary focus:border-primary text-text-light dark:text-text-dark" min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Time Slot</label>
                                <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value as any)} className="w-full p-2 bg-background-light dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:ring-primary focus:border-primary text-text-light dark:text-text-dark">
                                    <option>Morning</option>
                                    <option>Afternoon</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Additional Notes (Optional)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="e.g., heavy items, specific location" className="w-full p-2 bg-background-light dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:ring-primary focus:border-primary text-text-light dark:text-text-dark"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105">
                            Book eCart Now
                        </button>
                    </form>
                )}
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h3 className="text-xl font-semibold text-heading-light dark:text-heading-dark mb-3">Booking History</h3>
                {userBookings.length === 0 ? (
                    <p className="text-text-light dark:text-text-dark text-center py-4">No special bookings made yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {userBookings.slice().reverse().map((booking, index) => (
                             <li key={booking.id} className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-md flex items-start justify-between border border-border-light dark:border-border-dark animate-fade-in-up" style={{ animationDelay: `${index * 75}ms` }}>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary p-3 rounded-full">
                                        {getWasteTypeIcon(booking.wasteType)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-heading-light dark:text-heading-dark">{booking.wasteType}</p>
                                        <p className="text-sm text-text-light dark:text-text-dark flex items-center"><Calendar size={14} className="mr-1.5"/> {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} at {booking.timeSlot}</p>
                                        {booking.bookingFee && <p className="text-sm font-semibold text-primary flex items-center mt-1"><IndianRupee size={14} className="mr-1"/> Fee: {booking.bookingFee.toFixed(2)}</p>}
                                    </div>
                                </div>
                                {getStatusChip(booking.status)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default BookingComponent;