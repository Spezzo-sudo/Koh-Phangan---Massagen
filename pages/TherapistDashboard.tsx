
import React, { useState } from 'react';
import { THERAPISTS } from '../constants';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Power } from 'lucide-react';
import { useData } from '../contexts';

export default function TherapistDashboard() {
  // Simulate "Ms. Ang" is logged in (t1)
  const [currentTherapist] = useState(THERAPISTS[0]);
  const [isAvailable, setIsAvailable] = useState(currentTherapist.available);
  const { bookings, updateBookingStatus } = useData();

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // In real app: API call to update status
  };

  // Filter bookings for this therapist
  const myBookings = bookings.filter(b => b.therapistId === currentTherapist.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
            <span className="text-sm font-medium text-gray-600">Current Status:</span>
            <button 
                onClick={toggleAvailability}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
                <Power size={16} />
                {isAvailable ? 'ONLINE (Accepting Jobs)' : 'OFFLINE (Resting)'}
            </button>
        </div>
      </div>

      <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="text-brand-teal" /> Upcoming Jobs
      </h2>

      {/* Job List */}
      <div className="space-y-4">
        {myBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">No bookings yet. Relax and wait!</p>
            </div>
        ) : (
            myBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                {/* Status Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    booking.status === 'confirmed' ? 'bg-green-500' : 
                    booking.status === 'cancelled' || booking.status === 'declined' ? 'bg-red-500' : 'bg-yellow-400'
                }`}></div>
                
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{new Date(booking.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {booking.time} ({booking.duration} min)</span>
                        </div>
                        <h3 className="font-bold text-lg text-brand-dark mb-1">
                            {booking.serviceId === 's1' ? 'Thai Massage' : 'Oil Massage'}
                        </h3>
                        <div className="flex items-start gap-2 text-gray-600">
                             <MapPin size={18} className="text-brand-teal shrink-0 mt-0.5" />
                             <span className="font-medium">{booking.location}</span>
                        </div>
                        {booking.notes && (
                            <div className="mt-2 text-sm bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-100">
                                Note: {booking.notes}
                            </div>
                        )}
                        <div className="mt-2 text-sm text-gray-500">
                            Customer: <span className="font-medium text-gray-800">{booking.customerName}</span> • <a href={`tel:${booking.customerPhone}`} className="text-brand-teal underline">{booking.customerPhone}</a>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {booking.status === 'pending' && (
                            <>
                                <button 
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                                >
                                    <CheckCircle size={16} /> Accept
                                </button>
                                <button 
                                    onClick={() => updateBookingStatus(booking.id, 'declined')}
                                    className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm"
                                >
                                    <XCircle size={16} /> Decline
                                </button>
                            </>
                        )}
                        {booking.status === 'confirmed' && (
                            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1">
                                <CheckCircle size={16} /> Job Confirmed
                            </div>
                        )}
                        {booking.status === 'declined' && (
                             <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1">
                                <XCircle size={16} /> Declined
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )))}
      </div>
    </div>
  );
}
