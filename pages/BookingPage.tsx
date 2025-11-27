import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, CheckCircle, ChevronRight, ChevronLeft, Star, MapPin, Search, Lock, AlertTriangle, Check, Sparkles, Hand, Crosshair, Users, Phone, Mail } from 'lucide-react';
import { TIME_SLOTS, BOOKING_ADDONS } from '../constants';
import { useAuth, useLanguage, useData } from '../contexts';
import { useServices, useStaff, checkAvailability } from '../lib/queries';
import { usePlacesAutocomplete } from '../hooks/usePlacesAutocomplete';
import { ServiceCategory, PaymentMethod } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import PaymentModal from '../components/PaymentModal';
import { getServiceImage } from '../lib/utils';

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
  const { addBooking, isLoading: contextIsLoading, error: contextError } = useData();

  // ✅ Fetch data from Supabase via React Query
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useServices();
  const { data: staffMembers = [], isLoading: staffLoading, error: staffError } = useStaff();

  // Combine loading and error states
  const isLoading = contextIsLoading || servicesLoading || staffLoading;
  const error = contextError || servicesError?.message || staffError?.message;

  // Steps: 0: Service, 1: Addons, 2: Date/Time, 3: Therapist, 4: Details/Location, 5: Confirm
  const [step, setStep] = useState(0);

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('Massage');

  // Form State
  // Initialize from URL if present
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(searchParams.get('service'));
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<60 | 90>(60);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  // const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null); // REMOVED

  // Pre-fill customer details if logged in
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    email: user?.email || '', // Added email field
    phone: '',
    notes: '',
    address: ''
  });

  // Terms Agreement Checkbox State
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Validation Errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Location State
  const [isLocating, setIsLocating] = useState(false);

  // Payment State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);

  // --- RESTORE STATE AFTER LOGIN ---
  useEffect(() => {
    const savedState = sessionStorage.getItem('pendingBooking');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);

        // Restore all states
        if (parsed.selectedServiceId) setSelectedServiceId(parsed.selectedServiceId);
        if (parsed.selectedAddons) setSelectedAddons(parsed.selectedAddons);
        if (parsed.selectedDate) setSelectedDate(new Date(parsed.selectedDate));
        if (parsed.selectedTime) setSelectedTime(parsed.selectedTime);
        if (parsed.duration) setDuration(parsed.duration);
        if (parsed.selectedStaffId) setSelectedStaffId(parsed.selectedStaffId);
        if (parsed.customerDetails) {
          setCustomerDetails(prev => ({
            ...prev,
            ...parsed.customerDetails,
            // If user logged in, prioritize their auth name over the saved name unless empty
            name: user?.name || parsed.customerDetails.name,
            email: user?.email || parsed.customerDetails.email
          }));
        }
        if (parsed.step) setStep(parsed.step);

        // Clear storage so we don't restore old data next time
        sessionStorage.removeItem('pendingBooking');
      } catch (e) {
        console.error("Failed to restore booking state", e);
      }
    } else if (user) {
      // Standard behavior: fill name if logged in
      setCustomerDetails(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]); // Run when user auth state settles

  // 🔒 SECURITY: Prevent Staff from booking as customers
  useEffect(() => {
    if (user?.role === 'staff') {
      // Optional: Add a toast notification here if you have a toast system
      navigate('/therapist/dashboard');
    }
  }, [user, navigate]);

  // --- NEW LOCATION LOGIC ---
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLDivElement>(null);

  // Use the new hook! This separates UI from API logic
  const { predictions, isLoading: isLoadingLocations } = usePlacesAutocomplete(customerDetails.address);

  // Auto-advance if service ID is in URL (only if not restoring state)
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    const savedState = sessionStorage.getItem('pendingBooking');

    // Only auto-advance if:
    // 1. We have a service param in URL
    // 2. We are currently on step 0
    // 3. We are NOT restoring a saved state (which might be on a later step)
    if (serviceParam && step === 0 && !savedState) {
      setSelectedServiceId(serviceParam);
      setStep(1);
    }
  }, [searchParams, step]);

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

  // Filter Logic: Find staff who have the skill AND are available at the specific time
  const availableStaff = useMemo(() => {
    if (!selectedServiceId || !selectedDate || !selectedTime) return [];

    const service = services.find(s => s.id === selectedServiceId);
    if (!service) return [];

    return staffMembers.filter(staff => {
      // 1. Check if staff has the required skill
      const hasSkill = staff.skills.includes(service.type);
      if (!hasSkill) return false;

      // 2. Check if staff is verified (already filtered by hook, but double check)
      if (!staff.verified) return false;

      // 3. Check availability (simplified for now, would need real backend check)
      // In a real app, we'd check against the 'bookings' table here or via API
      return staff.available;
    });
  }, [selectedServiceId, staffMembers, selectedDate, selectedTime]);

  const selectedStaff = staffMembers.find(s => s.id === selectedStaffId);
  const selectedService = services.find(s => s.id === selectedServiceId);
  const dates = getNextDays(5);

  // Check if multiple staff are required
  const requiresMultiStaff = selectedService?.staffRequired && selectedService.staffRequired > 1;

  // Calculate Total Price
  const basePrice = duration === 60 ? selectedService?.price60 || 0 : selectedService?.price90 || 0;
  const addonsPrice = selectedAddons.reduce((sum, id) => {
    const addon = BOOKING_ADDONS.find(a => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);
  const totalPrice = basePrice + addonsPrice;

  // Time Slot Logic (Disable past times and enforce 2-hour lead time)
  const availableTimeSlots = useMemo(() => {
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (!isToday) return TIME_SLOTS;

    const currentHour = now.getHours();
    return TIME_SLOTS.filter(time => {
      const [hour] = time.split(':').map(Number);
      // Enforce 2 hour lead time (e.g. if 13:00, earliest booking is 15:00)
      return hour >= currentHour + 2;
    });
  }, [selectedDate]);

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(prev => prev.filter(a => a !== id));
    } else {
      setSelectedAddons(prev => [...prev, id]);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCustomerDetails(prev => ({
          ...prev,
          address: `📍 GPS Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} `
        }));
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert('Unable to retrieve your location');
        setIsLocating(false);
      }
    );
  };

  const validateStep4 = () => {
    const errors: Record<string, string> = {};

    if (!customerDetails.name.trim()) errors.name = "Name is required";
    if (!customerDetails.address.trim()) errors.address = "Location is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerDetails.email.trim()) {
      errors.email = "Email is required for confirmation";
    } else if (!emailRegex.test(customerDetails.email)) {
      errors.email = "Invalid email address";
    }

    // Strict Phone Regex: Allows +, (), space, -, .
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!customerDetails.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(customerDetails.phone.replace(/\s/g, ''))) {
      errors.phone = "Please enter a valid phone number (e.g. +66 123 456 789)";
    }

    if (!agreedToTerms) {
      errors.terms = "You must agree to the payment terms";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Input FIRST
    if (!validateStep4()) {
      return;
    }

    // 2. Check Auth & Redirect if needed
    if (!isAuthenticated) {
      const stateToSave = {
        selectedServiceId,
        selectedAddons,
        selectedDate: selectedDate.toISOString(),
        selectedTime,
        duration,
        selectedStaffId,
        customerDetails,
        step: 4
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(stateToSave));

      navigate('/login?redirect=booking');
      return;
    }

    // 3. Submit Booking
    if (selectedServiceId && selectedStaffId && selectedTime) {
      setPaymentStatus('processing');
      setPaymentError(undefined);

      try {
        await addBooking({
          customerId: user?.id,
          serviceId: selectedServiceId,
          staffId: selectedStaffId,
          date: selectedDate.toISOString(),
          time: selectedTime,
          duration: duration,
          coordinates: undefined,
          addons: selectedAddons,
          totalPrice: totalPrice,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
          location: customerDetails.address,
          notes: customerDetails.notes,
          payment_method: selectedPaymentMethod,
          payment_status: selectedPaymentMethod === 'card' ? 'paid' : 'pending' // Mock logic
        });

        setPaymentStatus('success');
        // Delay step change to show success modal briefly or handle it via modal close

      } catch (err: any) {
        console.error(err);
        setPaymentStatus('error');
        setPaymentError(err.message || 'Failed to create booking');
      }
    }
  };

  const closePaymentModal = () => {
    if (paymentStatus === 'success') {
      setPaymentStatus('idle');
      setStep(5); // Move to confirmation step
      window.scrollTo(0, 0);
      sessionStorage.removeItem('pendingBooking');
    } else {
      setPaymentStatus('idle');
    }
  };

  const handleBackToServices = () => {
    setSelectedServiceId(null);
    setStep(0);
    setSelectedAddons([]);
    setDuration(60);
  };

  const renderProgressBar = () => (
    <div className="flex justify-between mb-8 relative px-4 max-w-md mx-auto">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
      {[0, 1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`w - 8 h - 8 rounded - full flex items - center justify - center text - xs font - bold transition - all duration - 300 z - 10 ${step >= s ? 'bg-brand-teal text-white scale-110 shadow-md' : 'bg-gray-200 text-gray-400'
            } `}
        >
          {s + 1}
        </div>
      ))}
    </div>
  );

  const renderStickyFooter = () => {
    if (step >= 4 || step === 0) return null;

    return (
      <div className="fixed bottom-[72px] md:bottom-0 left-0 w-full bg-white/95 backdrop-blur border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 md:hidden animate-slide-up">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500">Total Estimate</div>
            <div className="font-bold text-xl text-brand-dark">{totalPrice} THB</div>
          </div>
          <button
            onClick={() => setStep(prev => prev + 1)}
            disabled={step === 2 && !selectedTime || step === 3 && !selectedStaffId}
            className="bg-brand-dark text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 shadow-md"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  };



  const filteredServices = services.filter(s => s.category === selectedCategory);

  if (step === 5) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-sm">
          <CheckCircle size={40} />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-2">{t('booking.successTitle') || "Booking Confirmed!"}</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Khop Khun Ka, {customerDetails.name}! <br />
          <span className="block mt-2">
            <strong>{selectedStaff?.name} {requiresMultiStaff ? '& Partner' : ''}</strong> will come to: <br />
            <span className="text-brand-teal">{customerDetails.address}</span>
          </span>
          <span className="block mt-2 text-sm">
            on {selectedDate.toLocaleDateString()} at {selectedTime}.
          </span>
          <span className="block mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <span className="flex items-center gap-1">
              <Mail size={12} /> A confirmation email has been sent to {customerDetails.email}
            </span>
          </span>
        </p>

        <div className="bg-brand-sand p-6 rounded-lg mb-4 w-full max-w-md text-left">
          <p className="text-sm text-gray-500 mb-1">Total Payment ({selectedPaymentMethod === 'cash' ? 'Cash on Arrival' : selectedPaymentMethod === 'transfer' ? 'Bank Transfer' : 'Paid via Card'})</p>
          <div className="flex justify-between items-center">
            <p className="text-3xl font-bold text-brand-dark">
              {totalPrice} THB
            </p>
            <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">Includes Fees</span>
          </div>
        </div>

        <div className="mb-8 w-full max-w-md bg-orange-50 border border-orange-100 p-4 rounded-lg flex items-start gap-3 text-left">
          <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-orange-800">
            <span className="font-bold block mb-1">Cancellation Policy (Strict)</span>
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
    <div className="max-w-3xl mx-auto px-4 py-8 pb-48">
      <h1 className="font-serif text-3xl font-bold text-brand-dark mb-8 text-center">
        {step === 4 ? 'Where should we come?' : t('hero.cta')}
      </h1>

      {renderProgressBar()}

      {/* Step 0: Service Selection */}
      {step === 0 && (
        <div className="animate-fade-in">
          <div className="flex justify-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
            {(['Massage', 'Nails', 'Packages'] as ServiceCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px - 6 py - 2.5 rounded - full font - medium text - sm transition - all whitespace - nowrap flex items - center gap - 2 ${selectedCategory === cat
                  ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } `}
              >
                {cat === 'Nails' && <Hand size={16} />}
                {cat === 'Packages' && <Sparkles size={16} />}
                {cat === 'Massage' && <Users size={16} />}
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
                <div className="relative mr-4">
                  <img src={getServiceImage(service)} alt={service.title} className="w-24 h-24 rounded-lg object-cover" />
                  {service.staffRequired && service.staffRequired > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-purple-600/90 text-white text-[10px] font-bold text-center py-0.5 rounded-b-lg flex items-center justify-center gap-1">
                      <Users size={10} /> Team of {service.staffRequired}
                    </div>
                  )}
                </div>
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

      {/* Step 1: Add-ons */}
      {step === 1 && (
        <div className="animate-fade-in">
          <button onClick={handleBackToServices} className="flex items-center text-sm text-gray-500 hover:text-brand-teal mb-4">
            <ChevronLeft size={16} /> Back to Services
          </button>

          <h3 className="font-bold text-xl mb-2">Enhance your experience</h3>
          <p className="text-gray-500 mb-6 text-sm">Customize your treatment with our premium add-ons.</p>

          <div className="space-y-4 mb-8">
            {BOOKING_ADDONS.filter(addon =>
              !addon.validFor || addon.validFor.includes(selectedService?.category || 'Massage')
            ).map(addon => {
              const isSelected = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`border rounded - xl p - 4 flex items - center justify - between cursor - pointer transition - all ${isSelected ? 'border-brand-teal bg-brand-light/30 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    } `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w - 6 h - 6 rounded - full border flex items - center justify - center ${isSelected ? 'bg-brand-teal border-brand-teal text-white' : 'border-gray-300 text-transparent'
                      } `}>
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
              <div className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${duration === 60 ? 'border-brand-teal bg-brand-light/30 ring-1 ring-brand-teal' : 'border-gray-200 hover:border-brand-teal'}`}
                onClick={() => setDuration(60)}>
                <div className="flex items-center gap-3">
                  <Clock size={20} className={duration === 60 ? 'text-brand-teal' : 'text-gray-400'} />
                  <span className="font-medium">60 Minutes</span>
                </div>
                <span className="font-bold text-brand-dark">{selectedService?.price60} THB</span>
              </div>

              <div className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${duration === 90 ? 'border-brand-teal bg-brand-light/30 ring-1 ring-brand-teal' : 'border-gray-200 hover:border-brand-teal'}`}
                onClick={() => setDuration(90)}>
                <div className="flex items-center gap-3">
                  <Clock size={20} className={duration === 90 ? 'text-brand-teal' : 'text-gray-400'} />
                  <span className="font-medium">90 Minutes</span>
                </div>
                <span className="font-bold text-brand-dark">{selectedService?.price90} THB</span>
              </div>
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
                    onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                    className={`flex - shrink - 0 w - 16 h - 20 rounded - xl flex flex - col items - center justify - center border - 2 transition - all ${isSelected ? 'border-brand-teal bg-brand-teal text-white' : 'border-gray-100 bg-white'
                      } `}
                  >
                    <span className="text-xs uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-xl font-bold">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Select Time</h3>
            {/* Warning about Lead Time */}
            {selectedDate.toDateString() === new Date().toDateString() && (
              <p className="text-xs text-orange-600 mb-4 flex items-center gap-1">
                <Clock size={12} /> {t('booking.leadTimeNotice')}
              </p>
            )}

            {availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableTimeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py - 2 rounded - lg text - sm font - medium transition - colors ${selectedTime === time
                      ? 'bg-brand-dark text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      } `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                No more slots available today due to lead time. Please select tomorrow.
              </div>
            )}
          </div>

          <div className="pt-8 flex justify-end w-full">
            <button
              disabled={!selectedTime}
              onClick={() => setStep(3)}
              className="w-full md:w-auto bg-brand-teal disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full font-medium hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/20"
            >
              {selectedTime ? (requiresMultiStaff ? 'Find Lead Specialist' : 'Find Specialist') : 'Select a Time'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Staff Selection */}
      {step === 3 && (
        <div className="animate-fade-in">
          <button onClick={() => setStep(2)} className="flex items-center text-sm text-gray-500 hover:text-brand-teal mb-4">
            <ChevronLeft size={16} /> Back to Time
          </button>

          <h3 className="font-bold text-xl mb-2">Choose your Specialist</h3>
          {requiresMultiStaff && (
            <div className="mb-6 bg-purple-50 border border-purple-100 p-3 rounded-lg flex gap-3">
              <Users className="text-purple-600 shrink-0" size={20} />
              <div className="text-sm text-purple-800">
                <strong>Team of {selectedService?.staffRequired}:</strong> Please select your LEAD specialist. A partner will automatically be assigned to assist.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {availableStaff.length > 0 ? availableStaff.map(staff => (
              <div
                key={staff.id}
                onClick={() => { setSelectedStaffId(staff.id); setStep(4); }}
                className={`border rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all hover:border-brand-teal hover:shadow-md ${selectedStaffId === staff.id ? 'border-brand-teal bg-brand-light/30 ring-1 ring-brand-teal' : 'border-gray-100'}`}
              >
                <img src={staff.image} alt={staff.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-50" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg text-brand-dark">{staff.name}</h4>
                        {staff.verified && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle size={10} /> VERIFIED STAFF
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-brand-gold text-sm mt-1">
                        <Star size={14} fill="currentColor" />
                        <span className="font-bold ml-1">{staff.rating}</span>
                        <span className="text-gray-400 font-normal ml-1 text-xs">({staff.reviewCount})</span>
                      </div>
                    </div>
                    {selectedStaffId === staff.id && (
                      <div className="bg-brand-teal text-white p-1 rounded-full">
                        <Check size={16} />
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{staff.bio}</p>

                  {staff.recentReview && (
                    <div className="mt-2 text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                      <span className="text-brand-teal">"</span>{staff.recentReview}<span className="text-brand-teal">"</span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> Based in {staff.locationBase}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Users size={48} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Staff Available</h3>
                <p className="text-gray-500 text-sm mt-1">Try selecting a different time or date.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Customer Details & Location */}
      {step === 4 && (
        <form onSubmit={handleBookingSubmit} className="animate-fade-in max-w-md mx-auto pb-12">
          <button type="button" onClick={() => setStep(3)} className="flex items-center text-sm text-gray-500 hover:text-brand-teal mb-4">
            <ChevronLeft size={16} /> Back to Specialist
          </button>

          <h3 className="font-bold text-xl mb-2">Location & Details</h3>

          {selectedService?.staffRequired && selectedService.staffRequired > 1 && (
            <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-sm mb-4 flex items-center gap-2 border border-purple-100">
              <Users size={16} />
              <span>
                <strong>Double Staff Service:</strong> You are selecting the lead staff member. A second staff member will be automatically assigned.
              </span>
            </div>
          )}

          {!isAuthenticated && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
              <Lock size={20} />
              <div className="text-sm">
                <strong>Account Required.</strong> <br />
                You will be asked to login or register when confirming.
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 animate-shake">
              <AlertTriangle size={16} className="inline mr-2" />
              {error}
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">

            <div className="mb-6 relative" ref={locationInputRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin size={16} className="text-brand-teal" />
                Service Location (Hotel / Villa) *
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className={`w - full pl - 10 pr - 4 py - 3 rounded - lg border outline - none ${validationErrors.address ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand-teal'} `}
                    placeholder="Search for hotel or village..."
                    value={customerDetails.address}
                    onChange={e => {
                      setCustomerDetails({ ...customerDetails, address: e.target.value });
                      setValidationErrors(prev => ({ ...prev, address: '' }));
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                  />
                  <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="px-3 bg-gray-100 rounded-lg text-gray-600 hover:bg-brand-light hover:text-brand-teal transition-colors"
                  title="Use my current location"
                >
                  {isLocating ? <LoadingSpinner /> : <Crosshair size={20} />}
                </button>
              </div>
              {validationErrors.address && <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>}

              {/* Autocomplete Dropdown */}
              {showLocationSuggestions && (customerDetails.address.length > 1 || predictions.length > 0) && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                  {isLoadingLocations ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
                  ) : predictions.length > 0 ? predictions.map((pred, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 hover:bg-brand-light/30 cursor-pointer border-b border-gray-50 last:border-0 text-sm text-gray-700 flex items-center gap-2"
                      onClick={() => {
                        setCustomerDetails({ ...customerDetails, address: pred.description });
                        setShowLocationSuggestions(false);
                        setValidationErrors(prev => ({ ...prev, address: '' }));
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  className={`w - full px - 4 py - 2 rounded - lg border outline - none ${validationErrors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand-teal'} `}
                  placeholder="Your Name"
                  value={customerDetails.name}
                  onChange={e => {
                    setCustomerDetails({ ...customerDetails, name: e.target.value });
                    setValidationErrors(prev => ({ ...prev, name: '' }));
                  }}
                />
                {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
              </div>

              {/* EMAIL FIELD (NEW) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Email (for confirmation) *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className={`w - full pl - 10 px - 4 py - 2 rounded - lg border outline - none ${validationErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand-teal'} `}
                    placeholder="name@example.com"
                    value={customerDetails.email}
                    onChange={e => {
                      setCustomerDetails({ ...customerDetails, email: e.target.value });
                      setValidationErrors(prev => ({ ...prev, email: '' }));
                    }}
                  />
                  <Mail size={18} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
                {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Phone / WhatsApp *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    className={`w - full pl - 10 px - 4 py - 2 rounded - lg border outline - none ${validationErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-brand-teal'} `}
                    placeholder="+66..."
                    value={customerDetails.phone}
                    onChange={e => {
                      setCustomerDetails({ ...customerDetails, phone: e.target.value });
                      setValidationErrors(prev => ({ ...prev, phone: '' }));
                    }}
                  />
                  <Phone size={18} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
                {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Instructions</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none h-20 resize-none"
                  placeholder="e.g. Bungalow B4, near the pool..."
                  value={customerDetails.notes}
                  onChange={e => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment / No-Show Warning */}
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg mb-6">
            <h4 className="text-red-800 font-bold flex items-center gap-2 mb-2 text-sm">
              <AlertTriangle size={16} /> Payment & Cancellation Rule
            </h4>
            <p className="text-red-700 text-xs mb-3 leading-relaxed">
              Because our therapists travel to you, we have a strict no-show policy.
              If you are not at the location within 15 minutes of the start time,
              you are liable for the full cost.
            </p>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`w - 5 h - 5 rounded border flex items - center justify - center shrink - 0 mt - 0.5 ${agreedToTerms ? 'bg-brand-teal border-brand-teal' : 'bg-white border-gray-400 group-hover:border-brand-teal'} `}>
                {agreedToTerms && <Check size={14} className="text-white" />}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  setValidationErrors(prev => ({ ...prev, terms: '' }));
                }}
              />
              <span className="text-sm text-gray-700 font-medium">
                {t('booking.agreeToTerms')}
              </span>
            </label>
            {validationErrors.terms && <p className="text-red-500 text-xs mt-2 pl-8">{validationErrors.terms}</p>}
          </div>

          {/* Payment Method Selector */}
          <div className="mb-6">
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onSelect={setSelectedPaymentMethod}
              amount={totalPrice}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><LoadingSpinner /> Processing...</>
            ) : (
              <>{isAuthenticated ? 'Confirm Booking' : 'Login to Confirm'}</>
            )}
          </button>
        </form>
      )}

      {renderStickyFooter()}

      <PaymentModal
        isOpen={paymentStatus !== 'idle'}
        onClose={closePaymentModal}
        status={paymentStatus}
        error={paymentError}
        successMessage="Booking confirmed! We have sent the details to your email."
      />
    </div>
  );
}
