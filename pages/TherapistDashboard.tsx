
import React, { useState, useMemo } from 'react';
import { TIME_SLOTS } from '../constants';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Power, Lock, Unlock, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth, useData } from '../contexts';
import { useTherapists, useBookings } from '../lib/queries';

export default function TherapistDashboard() {
  const { user } = useAuth();
  // Use the logged-in user's ID as the therapist ID
  const loggedInTherapistId = user?.id || 't1';

  const { updateBookingStatus, toggleTherapistBlock } = useData();
  const { data: therapists = [], isLoading: therapistsLoading } = useTherapists();
  const { data: allBookings = [], isLoading: bookingsLoading } = useBookings(loggedInTherapistId);

  // Get current therapist profile
  const currentTherapist = therapists.find(t => t.id === loggedInTherapistId);

  // Show loading state while fetching therapist data
  if (therapistsLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading therapist profile...</p>
        </div>
      </div>
    );
  }

  // Show error if therapist not found
  if (!currentTherapist) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Therapist profile not found. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Filter bookings for this therapist (already filtered by useBookings hook)
  const myBookings = allBookings;
  const [isAvailable, setIsAvailable] = useState(currentTherapist?.available ?? true);

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper to move days
  const changeDay = (offset: number) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + offset);
      setSelectedDate(newDate);
  };

  // Filter bookings for Selected Date only
  const daysBookings = myBookings.filter(b => {
    const bookingDate = new Date(b.scheduled_date).toDateString();
    return bookingDate === selectedDate.toDateString();
  });

  // Build Schedule Grid
  const schedule = useMemo(() => {
      const grid = [];
      const dateStr = selectedDate.toISOString().split('T')[0];

      for (const time of TIME_SLOTS) {
          const dateTimeString = `${dateStr} ${time}`;

          // Check if Blocked
          const isBlocked = currentTherapist?.blockedSlots?.includes(dateTimeString);

          // Check if Booked
          const booking = daysBookings.find(b => {
             const bTime = parseInt(b.scheduled_time.split(':')[0]);
             const slotTime = parseInt(time.split(':')[0]);
             // Simple check: starts at this time OR covers this time
             const bEnd = bTime + (b.duration / 60);
             return slotTime >= bTime && slotTime < bEnd;
          });

          grid.push({
              time,
              status: booking ? 'booked' : isBlocked ? 'blocked' : 'free',
              bookingData: booking
          });
      }
      return grid;
  }, [selectedDate, currentTherapist?.blockedSlots, daysBookings]);


  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // In real app: API call to update status
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <img src={currentTherapist.image} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-brand-light" />
            <div>
                <h1 className="font-serif text-2xl font-bold text-brand-dark">Sawasdee, {currentTherapist.name}</h1>
                <p className="text-sm text-gray-500">Based in {currentTherapist.locationBase}</p>
            </div>
        </div>
        
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Global Status:</span>
            <button 
                onClick={toggleAvailability}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
                <Power size={16} />
                {isAvailable ? 'ONLINE' : 'OFFLINE'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: SCHEDULE MANAGEMENT */}
          <div className="lg:col-span-2">
               <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                   <div className="p-4 bg-brand-sand border-b border-gray-200 flex justify-between items-center">
                       <h2 className="font-bold text-brand-dark flex items-center gap-2">
                           <Calendar size={18} /> My Schedule
                       </h2>
                       <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                           <button onClick={() => changeDay(-1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={18}/></button>
                           <span className="text-sm font-bold min-w-[100px] text-center">{selectedDate.toLocaleDateString()}</span>
                           <button onClick={() => changeDay(1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={18}/></button>
                       </div>
                   </div>

                   <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                       {schedule.map((slot) => (
                           <div 
                                key={slot.time}
                                onClick={() => {
                                    if (slot.status !== 'booked') {
                                        toggleTherapistBlock(currentTherapist.id, selectedDate.toISOString(), slot.time);
                                    }
                                }}
                                className={`
                                    relative p-3 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all
                                    ${slot.status === 'booked' ? 'bg-brand-teal/10 border-brand-teal cursor-default' : ''}
                                    ${slot.status === 'blocked' ? 'bg-gray-100 border-gray-300 opacity-70' : ''}
                                    ${slot.status === 'free' ? 'bg-white border-green-100 hover:border-green-300' : ''}
                                `}
                           >
                               <span className="text-lg font-bold text-gray-700">{slot.time}</span>
                               
                               {slot.status === 'booked' && (
                                   <div className="mt-1 flex items-center gap-1 text-xs text-brand-teal font-bold">
                                       <CheckCircle size={12} /> Booked
                                   </div>
                               )}
                               {slot.status === 'blocked' && (
                                   <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                       <Lock size={12} /> Blocked
                                   </div>
                               )}
                               {slot.status === 'free' && (
                                   <div className="mt-1 text-xs text-green-500 font-medium">
                                       Available
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>
                   <div className="p-4 bg-gray-50 text-xs text-gray-500 flex gap-4 justify-center border-t border-gray-100">
                       <span className="flex items-center gap-1"><div className="w-3 h-3 bg-white border-2 border-green-100 rounded"></div> Free</span>
                       <span className="flex items-center gap-1"><div className="w-3 h-3 bg-brand-teal/10 border-2 border-brand-teal rounded"></div> Customer Booking</span>
                       <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border-2 border-gray-300 rounded"></div> Personal Time (Blocked)</span>
                   </div>
               </div>
          </div>

          {/* RIGHT: JOB LIST */}
          <div>
            <h2 className="font-bold text-gray-800 mb-4">Incoming Requests</h2>
            <div className="space-y-4">
                {myBookings.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No active jobs.</p>
                    </div>
                ) : (
                    myBookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            booking.status === 'confirmed' ? 'bg-green-500' : 
                            booking.status === 'cancelled' || booking.status === 'declined' ? 'bg-red-500' : 'bg-yellow-400'
                        }`}></div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <span className="font-bold bg-gray-100 px-2 py-0.5 rounded">{new Date(booking.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {booking.time} ({booking.duration}m)</span>
                        </div>
                        
                        <h3 className="font-bold text-md text-brand-dark mb-1">
                            {booking.serviceId === 's1' ? 'Thai Massage' : 'Service'}
                        </h3>
                        
                        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                                <MapPin size={16} className="text-brand-teal shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{booking.location}</span>
                        </div>

                        <div className="flex gap-2">
                            {booking.status === 'pending' && (
                                <>
                                    <button 
                                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                        className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-xs"
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => updateBookingStatus(booking.id, 'declined')}
                                        className="flex-1 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 font-medium text-xs"
                                    >
                                        Decline
                                    </button>
                                </>
                            )}
                            {booking.status !== 'pending' && (
                                <span className="text-xs font-bold uppercase text-gray-400">{booking.status}</span>
                            )}
                        </div>
                    </div>
                )))}
            </div>
          </div>
      </div>
    </div>
  );
}
