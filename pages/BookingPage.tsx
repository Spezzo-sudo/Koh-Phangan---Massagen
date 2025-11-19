
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, CheckCircle, ChevronRight, ChevronLeft, Star, MapPin, Search, Lock } from 'lucide-react';
import { SERVICES, THERAPISTS, TIME_SLOTS, KOH_PHANGAN_LOCATIONS } from '../constants';
import { useAuth, useLanguage, useData } from '../contexts';

// Helper function to get next 7 days
const getNextDays = (days = 7) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const { addBooking } = useData();
  
  // Steps: 0: Service, 1: Date/Time, 2: Therapist, 3: Details/Location, 4: Confirm
  const [step, setStep] = useState(0);
  
  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(searchParams.get('service'));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<60 | 90>(60);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  
  // Pre-fill customer details if logged in
  const [customerDetails, setCustomerDetails] = useState({ 
      name: user?.name || '', 
      phone: '', 
      notes: '', 
      address: '' 
  });

  // Update name if user logs in mid-flow
  useEffect(() => {
      if (user) {
          setCustomerDetails(prev => ({...prev, name: user.name}));
      }
  }, [user]);
  
  // Location Autocomplete State
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLDivElement>(null);

  // Auto-advance if service ID is in URL
  useEffect(() => {
    if (selectedServiceId && step === 0) {
      setStep(1);
    }
  }, [selectedServiceId, step]);

  // Click outside listener for suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic: Find therapists who have the skill for the selected service
  const availableTherapists = useMemo(() => {
    if (!selectedServiceId) return [];
    const service = SERVICES.find(s => s.id === selectedServiceId);
    if (!service) return [];

    return THERAPISTS.filter(t => 
      t.skills.includes(service.type) && t.available
    );
  }, [selectedServiceId]);

  const selectedService = SERVICES.find(s => s.id === selectedServiceId);
  const selectedTherapist = THERAPISTS.find(t => t.id === selectedTherapistId);
  const dates = getNextDays(5);

  // Mock Google Maps Autocomplete filtering
  const filteredLocations = KOH_PHANGAN_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(customerDetails.address.toLowerCase())
  );

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // AUTH GUARD: Must be logged in to submit
    if (!isAuthenticated) {
        // Save current state to return after login? (For MVP we just redirect)
        navigate('/login?redirect=booking');
        return;
    }
    
    // CREATE BOOKING IN "DATABASE"
    if (selectedServiceId && selectedTherapistId && selectedTime) {
        addBooking({
            serviceId: selectedServiceId,
            therapistId: selectedTherapistId,
            date: selectedDate.toISOString(),
            time: selectedTime,
            duration: duration,
            customerName: customerDetails.name,
            customerPhone: customerDetails.phone,
            location: customerDetails.address,
            notes: customerDetails.notes,
        });
    }

    setStep(4);
    window.scrollTo(0, 0);
  };

  const renderProgressBar = () => (
    <div className="flex justify-between mb-8 relative px-4">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10"></div>
      {[1, 2, 3, 4].map((s) => (
        <div 
          key={s} 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 z-10 ${
            step + 1 >= s ? 'bg-brand-teal text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {s}
        </div>
      ))}
    </div>
  );

  if (step === 4) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-2">{t('booking.successTitle') || "Booking Confirmed!"}</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Khop Khun Ka, {customerDetails.name}! <br/>
          <span className="block mt-2">
            <strong>{selectedTherapist?.name}</strong> will come to: <br/>
            <span className="text-brand-teal">{customerDetails.address}</span>
          </span>
          <span className="block mt-2 text-sm">
             on {selectedDate.toLocaleDateString()} at {selectedTime}.
          </span>
        </p>
        <div className="bg-brand-sand p-6 rounded-lg mb-8 w-full max-w-md text-left">
          <p className="text-sm text-gray-500 mb-1">Total Payment (Cash on Arrival)</p>
          <div className="flex justify-between items-center">
             <p className="text-xl font-bold text-brand-dark">
               {duration === 60 ? selectedService?.price60 : selectedService?.price90} THB
             </p>
             <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">Includes Travel Fee</span>
          </div>
        </div>
        <div className="flex gap-4 flex-col w-full max-w-xs">
            <button 
            onClick={() => navigate('/customer/dashboard')}
            className="bg-brand-teal text-white px-8 py-3 rounded-full font-medium hover:bg-brand-dark w-full"
            >
            View My Bookings
            </button>
            <button 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-brand-dark text-sm"
            >
            Back to Home
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-brand-dark mb-8 text-center">
        {step === 3 ? 'Where should we come?' : t('hero.cta')}
      </h1>
      
      {renderProgressBar()}

      {/* Step 1: Service Selection */}
      {step === 0 && (
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
          {SERVICES.map(service => (
            <button
              key={service.id}
              onClick={() => { setSelectedServiceId(service.id); setStep(1); }}
              className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-brand-teal hover:bg-brand-light/20 transition-all text-left group"
            >
              <img src={service.image} alt={service.title} className="w-20 h-20 rounded-lg object-cover mr-4" />
              <div className="flex-1">
                <h3 className="font-bold text-lg group-hover:text-brand-teal">{service.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
                <div className="mt-2 text-sm font-medium">
                  Starts from {service.price60} THB
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-brand-teal" />
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Date, Time, Duration */}
      {step === 1 && (
        <div className="space-y-8 animate-fade-in">
           <button onClick={() => setStep(0)} className="flex items-center text-sm text-gray-500 hover:text-brand-teal mb-4">
            <ChevronLeft size={16} /> Back to Services
          </button>
          
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={20} /> Select Duration</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => setDuration(60)}
                className={`flex-1 py-3 rounded-lg border-2 font-medium ${duration === 60 ? 'border-brand-teal bg-brand-teal/10 text-brand-teal' : 'border-gray-100'}`}
              >
                60 Mins ({selectedService?.price60} THB)
              </button>
              <button 
                onClick={() => setDuration(90)}
                className={`flex-1 py-3 rounded-lg border-2 font-medium ${duration === 90 ? 'border-brand-teal bg-brand-teal/10 text-brand-teal' : 'border-gray-100'}`}
              >
                90 Mins ({selectedService?.price90} THB)
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2"><CalendarIcon size={20} /> Select Date</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {dates.map((date) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                return (
                  <button
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
                      isSelected ? 'border-brand-teal bg-brand-teal text-white' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <span className="text-xs uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-xl font-bold">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Select Time</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {TIME_SLOTS.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTime === time 
                      ? 'bg-brand-dark text-white' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              disabled={!selectedTime}
              onClick={() => setStep(2)}
              className="bg-brand-teal disabled:opacity-50 text-white px-8 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors flex items-center gap-2"
            >
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Therapist Selection */}
      {step === 2 && (
        <div className="animate-fade-in">
           <button onClick={() => setStep(1)} className="flex items-center text-sm text-gray-500 hover:text-brand-teal mb-4">
            <ChevronLeft size={16} /> Back to Time
          </button>

          <h3 className="font-bold text-xl mb-6">Choose your Therapist</h3>
          <p className="text-sm text-gray-500 mb-6">
            Showing specialists available for <strong>{selectedService?.title}</strong> on {selectedDate.toLocaleDateString()} at {selectedTime}.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {availableTherapists.length > 0 ? availableTherapists.map(therapist => (
              <button
                key={therapist.id}
                onClick={() => { setSelectedTherapistId(therapist.id); setStep(3); }}
                className="flex items-start p-4 border border-gray-200 rounded-xl hover:border-brand-teal hover:shadow-md transition-all text-left bg-white group"
              >
                <img src={therapist.image} alt={therapist.name} className="w-24 h-24 rounded-full object-cover mr-6 border-4 border-gray-50" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg text-brand-dark">{therapist.name}</h4>
                    <div className="flex items-center text-brand-gold text-sm font-bold">
                      <Star size={14} fill="currentColor" className="mr-1" />
                      {therapist.rating}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{therapist.bio}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MapPin size={12} /> Based in {therapist.locationBase}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {therapist.skills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            )) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No specific specialist available for this time.</p>
                <button onClick={() => setStep(1)} className="text-brand-teal font-medium mt-2 underline">Try another time</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Customer Details & Location (Maps Autocomplete) */}
      {step === 3 && (
        <form onSubmit={handleBookingSubmit} className="animate-fade-in max-w-md mx-auto pb-12">
          <button type="button" onClick={() => setStep(2)} className="flex items-center text-sm text-gray-500 hover:text-brand-teal mb-4">
            <ChevronLeft size={16} /> Back to Therapist
          </button>
          
          <h3 className="font-bold text-xl mb-2">Location & Details</h3>
          <p className="text-sm text-gray-500 mb-6">Where should {selectedTherapist?.name} come to?</p>
          
          {!isAuthenticated && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                <Lock size={20} />
                <div className="text-sm">
                    <strong>Account Required.</strong> <br/>
                    You will be asked to login or register when confirming.
                </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            
            {/* GOOGLE MAPS MOCK INPUT */}
            <div className="mb-6 relative" ref={locationInputRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin size={16} className="text-brand-teal"/> 
                    Service Location (Hotel / Villa)
                </label>
                <div className="relative">
                    <input 
                        required
                        type="text" 
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
                        placeholder="Search for hotel or village..."
                        value={customerDetails.address}
                        onChange={e => {
                            setCustomerDetails({...customerDetails, address: e.target.value});
                            setShowLocationSuggestions(true);
                        }}
                        onFocus={() => setShowLocationSuggestions(true)}
                    />
                    <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>

                {/* Autocomplete Dropdown */}
                {showLocationSuggestions && (customerDetails.address.length > 0 || filteredLocations.length > 0) && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                        {filteredLocations.length > 0 ? filteredLocations.map((loc, idx) => (
                            <div 
                                key={idx}
                                className="px-4 py-3 hover:bg-brand-light/30 cursor-pointer border-b border-gray-50 last:border-0 text-sm text-gray-700 flex items-center gap-2"
                                onClick={() => {
                                    setCustomerDetails({...customerDetails, address: loc});
                                    setShowLocationSuggestions(false);
                                }}
                            >
                                <MapPin size={14} className="text-gray-400" />
                                {loc}
                            </div>
                        )) : (
                            <div className="px-4 py-3 text-sm text-gray-400">No matches found. Use custom address?</div>
                        )}
                    </div>
                )}
                <p className="text-xs text-gray-400 mt-1 ml-1">Try "Haad Rin", "Srithanu", or "Baan Tai"</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
                  placeholder="Your Name"
                  value={customerDetails.name}
                  onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
                <input 
                  required
                  type="tel" 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
                  placeholder="+66..."
                  value={customerDetails.phone}
                  onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bungalow Number / Specifics</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none h-20 resize-none"
                  placeholder="e.g. Bungalow B4, near the pool..."
                  value={customerDetails.notes}
                  onChange={e => setCustomerDetails({...customerDetails, notes: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-between items-center border border-gray-200">
             <span className="text-gray-600">Price (Cash on arrival)</span>
             <span className="text-xl font-bold text-brand-dark">{duration === 60 ? selectedService?.price60 : selectedService?.price90} THB</span>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transition-colors"
          >
            {isAuthenticated ? 'Confirm Booking' : 'Login to Confirm'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">
            By booking you agree to our terms. 
          </p>
        </form>
      )}
    </div>
  );
}
