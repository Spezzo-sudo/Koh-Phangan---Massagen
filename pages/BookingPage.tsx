
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, CheckCircle, ChevronRight, ChevronLeft, Star, MapPin, Search, Lock, AlertTriangle, Check, Sparkles, Hand } from 'lucide-react';
import { SERVICES, THERAPISTS, TIME_SLOTS, BOOKING_ADDONS } from '../constants';
import { useAuth, useLanguage, useData } from '../contexts';
import { usePlacesAutocomplete } from '../hooks/usePlacesAutocomplete';
import { ServiceCategory } from '../types';

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
  
  // Steps: 0: Service, 1: Addons, 2: Date/Time, 3: Therapist, 4: Details/Location, 5: Confirm
  const [step, setStep] = useState(0);
  
  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('Massage');

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(searchParams.get('service'));
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
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
  
  // --- NEW LOCATION LOGIC ---
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLDivElement>(null);
  
  // Use the new hook! This separates UI from API logic
  const { predictions, isLoading: isLoadingLocations } = usePlacesAutocomplete(customerDetails.address);

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

    // Sort logic: Verified & High Rating first
    return THERAPISTS.filter(t => 
      t.skills.includes(service.type) && t.available
    ).sort((a, b) => b.rating - a.rating);
  }, [selectedServiceId]);

  const selectedService = SERVICES.find(s => s.id === selectedServiceId);
  const selectedTherapist = THERAPISTS.find(t => t.id === selectedTherapistId);
  const dates = getNextDays(5);

  // Calculate Total Price
  const basePrice = duration === 60 ? selectedService?.price60 || 0 : selectedService?.price90 || 0;
  const addonsPrice = selectedAddons.reduce((sum, id) => {
      const addon = BOOKING_ADDONS.find(a => a.id === id);
      return sum + (addon?.price || 0);
  }, 0);
  const totalPrice = basePrice + addonsPrice;

  const toggleAddon = (id: string) => {
      if (selectedAddons.includes(id)) {
          setSelectedAddons(prev => prev.filter(a => a !== id));
      } else {
          setSelectedAddons(prev => [...prev, id]);
      }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // AUTH GUARD
    if (!isAuthenticated) {
        navigate('/login?redirect=booking');
        return;
    }
    
    if (selectedServiceId && selectedTherapistId && selectedTime) {
        addBooking({
            serviceId: selectedServiceId,
            therapistId: selectedTherapistId,
            date: selectedDate.toISOString(),
            time: selectedTime,
            duration: duration,
            addons: selectedAddons,
            totalPrice: totalPrice,
            customerName: customerDetails.name,
            customerPhone: customerDetails.phone,
            location: customerDetails.address,
            notes: customerDetails.notes,
        });
    }

    setStep(5); // Confirmation
    window.scrollTo(0, 0);
  };

  // Reset selection when going back to services
  const handleBackToServices = () => {
      setSelectedServiceId(null);
      setStep(0);
      // Reset extras too
      setSelectedAddons([]);
      setDuration(60);
  };

  const renderProgressBar = () => (
    <div className="flex justify-between mb-8 relative px-4 max-w-md mx-auto">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
      {[0, 1, 2, 3, 4].map((s) => (
        <div 
          key={s} 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${
            step >= s ? 'bg-brand-teal text-white scale-110 shadow-md' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {s + 1}
        </div>
      ))}
    </div>
  );

  const renderStickyFooter = () => {
      if (step >= 4 || step === 0) return null; // Don't show on first or last steps
      
      return (
        // Adjusted bottom position to sit ABOVE the main mobile navigation (approx 72px)
        <div className="fixed bottom-[72px] md:bottom-0 left-0 w-full bg-white/95 backdrop-blur border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 md:hidden animate-slide-up">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-500">Total Estimate</div>
                    <div className="font-bold text-xl text-brand-dark">{totalPrice} THB</div>
                </div>
                <button 
                    onClick={() => setStep(prev => prev + 1)}
                    disabled={step === 2 && !selectedTime || step === 3 && !selectedTherapistId}
                    className="bg-brand-dark text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 shadow-md"
                >
                    Next Step
                </button>
            </div>
        </div>
      );
  };

  // Filter Services based on Category
  const filteredServices = SERVICES.filter(s => s.category === selectedCategory);

  if (step === 5) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-sm">
          <CheckCircle size={40} />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-2">{t('booking.successTitle') || "Booking Confirmed!"}</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Khop Khun Ka, {customerDetails.name}! <br/>
          <span className="block mt-2">
            <strong>{selectedTherapist?.name}</strong> will come to: <br/>
            <span className="text-brand-teal">{customerDetails.address}</span>
          </span>
          <span className="block mt-2 text-sm">
             on {selectedDate.toLocaleDateString()} at {selectedTime}.
          </span>
        </p>
        
        <div className="bg-brand-sand p-6 rounded-lg mb-4 w-full max-w-md text-left">
          <p className="text-sm text-gray-500 mb-1">Total Payment (Cash on Arrival)</p>
          <div className="flex justify-between items-center">
             <p className="text-3xl font-bold text-brand-dark">
               {totalPrice} THB
             </p>
             <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">Includes Fees</span>
          </div>
          {selectedAddons.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200/50 text-xs text-gray-500">
                  Includes: {selectedAddons.map(id => BOOKING_ADDONS.find(a => a.id === id)?.title).join(', ')}
              </div>
          )}
        </div>

        <div className="mb-8 w-full max-w-md bg-orange-50 border border-orange-100 p-4 rounded-lg flex items-start gap-3 text-left">
            <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-orange-800">
                <span className="font-bold block mb-1">Cancellation Policy</span>
                {t('booking.cancellationPolicy')}
            </p>
        </div>

        <div className="flex gap-4 flex-col w-full max-w-xs">
            <button 
            onClick={() => navigate('/customer/dashboard')}
            className="bg-brand-teal text-white px-8 py-3 rounded-full font-medium hover:bg-brand-dark w-full shadow-lg shadow-brand-teal/20"
            >
            Track My Therapist
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
    // Increased padding-bottom (pb-48) to accommodate double footers (Nav + Sticky Price) on mobile
    <div className="max-w-3xl mx-auto px-4 py-8 pb-48">
      <h1 className="font-serif text-3xl font-bold text-brand-dark mb-8 text-center">
        {step === 4 ? 'Where should we come?' : t('hero.cta')}
      </h1>
      
      {renderProgressBar()}

      {/* Step 0: Service Selection with Categories */}
      {step === 0 && (
        <div className="animate-fade-in">
            {/* Category Tabs */}
            <div className="flex justify-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                {(['Massage', 'Nails', 'Packages'] as ServiceCategory[]).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                            selectedCategory === cat 
                            ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {cat === 'Nails' && <Hand size={16} />}
                        {cat === 'Packages' && <Sparkles size={16} />}
                        {cat === 'Massage' && <span className="text-lg">💆‍♀️</span>}
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredServices.map(service => (
                    <button
                    key={service.id}
                    onClick={() => { setSelectedServiceId(service.id); setStep(1); }}
                    className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-brand-teal hover:bg-brand-light/20 transition-all text-left group bg-white shadow-sm"
                    >
                    <img src={service.image} alt={service.title} className="w-24 h-24 rounded-lg object-cover mr-4" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg group-hover:text-brand-teal">{service.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{service.description}</p>
                        <div className="mt-1 text-sm font-medium flex items-center gap-2">
                            <span className="bg-brand-sand px-2 py-0.5 rounded text-brand-dark text-xs font-bold">
                                From {service.price60} THB
                            </span>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-brand-teal" />
                    </button>
                ))}
            </div>
        </div>
      )}

      {/* Step 1: Add-ons (New) */}
      {step === 1 && (
        <div className="animate-fade-in">
           <button onClick={handleBackToServices} className="flex items-center text-sm text-gray-500 hover:text-brand-teal mb-4">
            <ChevronLeft size={16} /> Back to Services
          </button>

          <h3 className="font-bold text-xl mb-2">Enhance your experience</h3>
          <p className="text-gray-500 mb-6 text-sm">Customize your treatment with our premium add-ons.</p>

          <div className="space-y-4 mb-8">
            {BOOKING_ADDONS.map(addon => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                    <div 
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                            isSelected ? 'border-brand-teal bg-brand-light/30 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                isSelected ? 'bg-brand-teal border-brand-teal text-white' : 'border-gray-300 text-transparent'
                            }`}>
                                <Check size={14} />
                            </div>
                            <div>
                                <h4 className="font-bold text-brand-dark">{addon.title}</h4>
                                <p className="text-xs text-gray-500">{addon.description}</p>
                            </div>
                        </div>
                        <div className="font-medium text-brand-teal">+{addon.price} THB</div>
                    </div>
                );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="bg-brand-teal text-white px-8 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-lg shadow-brand-teal/20"
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Date, Time, Duration */}
      {step === 2 && (
        <div className="space-y-8 animate-fade-in">
           <button onClick={() => setStep(1)} className="flex items-center text-sm text-gray-500 hover:text-brand-teal mb-4">
            <ChevronLeft size={16} /> Back to Extras
          </button>
          
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2"><Clock size={20} /> Select Option</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => setDuration(60)}
                className={`flex-1 py-3 rounded-lg border-2 font-medium ${duration === 60 ? 'border-brand-teal bg-brand-teal/10 text-brand-teal' : 'border-gray-100'}`}
              >
                 {/* Dynamic Label based on category */}
                 {selectedService?.category === 'Nails' ? 'Standard' : '60 Mins'} 
                 <span className="block text-sm font-bold">({selectedService?.price60} THB)</span>
              </button>
              <button 
                onClick={() => setDuration(90)}
                className={`flex-1 py-3 rounded-lg border-2 font-medium ${duration === 90 ? 'border-brand-teal bg-brand-teal/10 text-brand-teal' : 'border-gray-100'}`}
              >
                {selectedService?.category === 'Nails' ? 'Premium/Spa' : '90 Mins'} 
                <span className="block text-sm font-bold">({selectedService?.price90} THB)</span>
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

          {/* Action Button - NOW VISIBLE ON MOBILE */}
          <div className="pt-8 flex justify-end w-full">
            <button
              disabled={!selectedTime}
              onClick={() => setStep(3)}
              className="w-full md:w-auto bg-brand-teal disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full font-medium hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/20"
            >
              {selectedTime ? 'Find Therapist' : 'Select a Time'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Therapist Selection */}
      {step === 3 && (
        <div className="animate-fade-in">
           <button onClick={() => setStep(2)} className="flex items-center text-sm text-gray-500 hover:text-brand-teal mb-4">
            <ChevronLeft size={16} /> Back to Time
          </button>

          <h3 className="font-bold text-xl mb-6">Choose your Specialist</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {availableTherapists.length > 0 ? availableTherapists.map(therapist => (
              <button
                key={therapist.id}
                onClick={() => { setSelectedTherapistId(therapist.id); setStep(4); }}
                className="flex items-start p-4 border border-gray-200 rounded-xl hover:border-brand-teal hover:shadow-md transition-all text-left bg-white group"
              >
                <div className="relative mr-6">
                  <img src={therapist.image} alt={therapist.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-50" />
                  {therapist.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white" title="Verified Therapist">
                       <CheckCircle size={12} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg text-brand-dark">{therapist.name}</h4>
                        {therapist.reviewCount && therapist.reviewCount > 50 && (
                            <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Top Rated</span>
                        )}
                    </div>
                    <div className="flex items-center text-brand-gold text-sm font-bold">
                      <Star size={14} fill="currentColor" className="mr-1" />
                      {therapist.rating} 
                      <span className="text-gray-400 font-normal ml-1 text-xs">({therapist.reviewCount})</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{therapist.bio}</p>
                  
                  {/* Review Snippet */}
                  {therapist.recentReview && (
                    <div className="mt-2 text-xs text-gray-500 italic flex items-center gap-1">
                        <span className="text-brand-teal">"</span>{therapist.recentReview}<span className="text-brand-teal">"</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <MapPin size={12} /> Based in {therapist.locationBase}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
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
                <button onClick={() => setStep(2)} className="text-brand-teal font-medium mt-2 underline">Try another time</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Customer Details & Location (Maps Autocomplete) */}
      {step === 4 && (
        <form onSubmit={handleBookingSubmit} className="animate-fade-in max-w-md mx-auto pb-12">
          <button type="button" onClick={() => setStep(3)} className="flex items-center text-sm text-gray-500 hover:text-brand-teal mb-4">
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
            
            {/* GOOGLE MAPS / MOCK INPUT */}
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

                {/* Autocomplete Dropdown (Uses Hook Data) */}
                {showLocationSuggestions && (customerDetails.address.length > 1 || predictions.length > 0) && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                        {isLoadingLocations ? (
                             <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
                        ) : predictions.length > 0 ? predictions.map((pred, idx) => (
                            <div 
                                key={idx}
                                className="px-4 py-3 hover:bg-brand-light/30 cursor-pointer border-b border-gray-50 last:border-0 text-sm text-gray-700 flex items-center gap-2"
                                onClick={() => {
                                    setCustomerDetails({...customerDetails, address: pred.description});
                                    setShowLocationSuggestions(false);
                                }}
                            >
                                <MapPin size={14} className="text-gray-400" />
                                {pred.description}
                            </div>
                        )) : (
                            <div className="px-4 py-3 text-sm text-gray-400">No matches found.</div>
                        )}
                    </div>
                )}
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
             <div>
                 <span className="text-gray-600 block text-xs">Total Cash on Arrival</span>
                 <div className="text-xl font-bold text-brand-dark">{totalPrice} THB</div>
             </div>
             <div className="text-right text-xs text-gray-500">
                 <div>{selectedService?.category === 'Nails' ? (duration === 60 ? 'Standard' : 'Luxury') : `${duration} min`}</div>
                 {selectedAddons.length > 0 && <div>+ {selectedAddons.length} extras</div>}
             </div>
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
      
      {renderStickyFooter()}
    </div>
  );
}
