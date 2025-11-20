
import React from 'react';
import { SERVICES } from '../constants';
import { Calendar, MapPin, Clock, AlertTriangle, Check, Bike, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData, useAuth, useLanguage } from '../contexts';
import { Booking } from '../types';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { bookings } = useData();
  const { t } = useLanguage();

  const myBookings = bookings.filter(b => 
    b.customerName === user?.name || b.id.startsWith('b1') 
  );

  const getServiceName = (id: string) => SERVICES.find(s => s.id === id)?.title || 'Unknown Service';

  // Helper to render the Delivery-Style Timeline
  const StatusTimeline = ({ status }: { status: Booking['status'] }) => {
      const steps = [
          { key: 'pending', label: 'Booked', icon: Calendar },
          { key: 'confirmed', label: 'Confirmed', icon: Check },
          { key: 'on_way', label: 'On Way', icon: Bike },
          { key: 'arrived', label: 'Arrived', icon: MapPin },
          { key: 'completed', label: 'Done', icon: User },
      ];

      const currentIdx = steps.findIndex(s => s.key === status);
      // If status is cancelled/declined, show simple badge instead of timeline
      if (status === 'cancelled' || status === 'declined') {
          return (
            <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold inline-block mt-2">
                {status.toUpperCase()}
            </div>
          );
      }

      // Map simplified status to timeline index
      let activeIndex = 0;
      if (status === 'pending') activeIndex = 0;
      else if (status === 'confirmed') activeIndex = 1;
      else if (status === 'on_way') activeIndex = 2;
      else if (status === 'arrived' || status === 'in_progress') activeIndex = 3;
      else if (status === 'completed') activeIndex = 4;

      return (
          <div className="flex items-center justify-between mt-4 relative">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
              
              {steps.map((step, idx) => {
                  const isActive = idx <= activeIndex;
                  const isCurrent = idx === activeIndex;
                  return (
                      <div key={step.key} className="flex flex-col items-center gap-1 bg-white px-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all border-2 ${
                              isActive 
                                ? 'bg-brand-teal border-brand-teal text-white' 
                                : 'bg-white border-gray-200 text-gray-300'
                          } ${isCurrent ? 'ring-2 ring-brand-light ring-offset-1' : ''}`}>
                              <step.icon size={14} />
                          </div>
                          <span className={`text-[10px] font-medium uppercase tracking-wider ${
                              isActive ? 'text-brand-dark' : 'text-gray-300'
                          }`}>{step.label}</span>
                      </div>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-brand-dark">My Bookings</h1>
        <Link to="/booking" className="bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark">
            New Booking
        </Link>
      </div>

      <div className="mb-8 bg-orange-50 border border-orange-100 p-4 rounded-lg flex items-start gap-3">
        <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-orange-800">
            <span className="font-bold block mb-1">Cancellation Policy</span>
            {t('booking.cancellationPolicy')}
        </p>
      </div>

      <div className="space-y-6">
        {myBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">You haven't booked any massages yet.</p>
            </div>
        ) : (
            myBookings.map(booking => (
            <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg text-brand-dark">{getServiceName(booking.serviceId)}</h3>
                        <div className="font-mono text-sm text-gray-500">
                            {new Date(booking.date).toLocaleDateString()} • {booking.time}
                        </div>
                    </div>
                    <div className="text-right">
                         <span className="font-bold text-lg block">{booking.totalPrice} THB</span>
                    </div>
                </div>

                {/* Delivery Style Timeline */}
                <StatusTimeline status={booking.status} />

                <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {booking.duration} Minutes {booking.addons && booking.addons.length > 0 && `(+${booking.addons.length} extras)`}
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
