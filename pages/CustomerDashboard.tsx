
import React from 'react';
import { SERVICES } from '../constants';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData, useAuth } from '../contexts';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { bookings } = useData();

  // Filter bookings for the current customer (In a real app, the API does this)
  // For our simulation, we just show all bookings created by the 'customer'
  const myBookings = bookings.filter(b => 
    b.customerName === user?.name || b.id.startsWith('b1') // Show mock + new ones
  );

  const getServiceName = (id: string) => SERVICES.find(s => s.id === id)?.title || 'Unknown Service';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-dark">My Bookings</h1>
        <Link to="/booking" className="bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark">
            New Booking
        </Link>
      </div>

      <div className="space-y-4">
        {myBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">You haven't booked any massages yet.</p>
            </div>
        ) : (
            myBookings.map(booking => (
            <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{getServiceName(booking.serviceId)}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                 booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                 booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                             }`}>
                                {booking.status}
                             </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-lg font-bold text-brand-dark">{new Date(booking.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{booking.time}</div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {booking.duration} Minutes
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {booking.location}
                    </div>
                </div>
            </div>
        )))}
      </div>
    </div>
  );
}
