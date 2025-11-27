
import React, { useState, useMemo, useRef } from 'react';
import { TIME_SLOTS } from '../constants';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Power, Lock, Unlock, ChevronRight, ChevronLeft, Edit2, X, Save, Upload } from 'lucide-react';
import { useAuth, useData } from '../contexts';
import { useTherapists, useBookings } from '../lib/queries';
import { supabase } from '../lib/supabase';

export default function TherapistDashboard() {
  const { user } = useAuth();
  const { updateTherapist, toggleTherapistBlock, updateBookingStatus } = useData();
  // Use the logged-in user's ID as the therapist ID
  const loggedInTherapistId = user?.id || 't1';

  const { data: therapists = [], isLoading: therapistsLoading } = useTherapists();
  const { data: allBookings = [], isLoading: bookingsLoading } = useBookings(loggedInTherapistId);

  // Get current therapist profile
  const currentTherapist = therapists.find(t => t.id === loggedInTherapistId);

  // CRITICAL: ALL HOOKS MUST BE CALLED UNCONDITIONALLY FIRST (before any early returns or conditional logic)

  // Edit Profile State
  const [isAvailable, setIsAvailable] = useState(currentTherapist?.available ?? true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState(currentTherapist?.name || '');
  const [editBio, setEditBio] = useState(currentTherapist?.bio || '');
  const [editSkills, setEditSkills] = useState((currentTherapist?.skills || []).join(', '));
  const [editImage, setEditImage] = useState(currentTherapist?.image || '');
  const [imagePreview, setImagePreview] = useState(currentTherapist?.image || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed values (not hooks, can use state from above)
  const myBookings = allBookings;
  const daysBookings = myBookings.filter(b => {
    const bookingDate = new Date(b.date).toDateString();
    return bookingDate === selectedDate.toDateString();
  });

  // Build Schedule Grid with useMemo (HOOK - must be called unconditionally)
  const schedule = useMemo(() => {
    const grid = [];
    const dateStr = selectedDate.toISOString().split('T')[0];

    for (const time of TIME_SLOTS) {
      const dateTimeString = `${dateStr} ${time}`;

      // Check if Blocked
      const isBlocked = currentTherapist?.blockedSlots?.includes(dateTimeString);

      // Check if Booked
      const booking = daysBookings.find(b => {
        const bTime = parseInt(b.time.split(':')[0]);
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

  // NOW we can do early returns (AFTER all hooks)
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

  // Helper to move days
  const changeDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);
  };


  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // In real app: API call to update status
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Please select an image file' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setIsUploadingImage(true);
    try {
      // Create a unique filename
      const fileName = `avatar_${loggedInTherapistId}_${Date.now()}.${file.name.split('.').pop()}`;
      const bucketName = 'therapist-avatars';

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (publicData?.publicUrl) {
        setEditImage(publicData.publicUrl);
        setImagePreview(publicData.publicUrl);
        setFeedback({ type: 'success', text: 'Image uploaded successfully' });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setFeedback({ type: 'error', text: 'Failed to upload image. Please try again.' });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setFeedback({ type: 'error', text: 'Name cannot be empty' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setIsSaving(true);
    try {
      // Parse skills from comma-separated string
      const skillsArray = editSkills
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      await updateTherapist(loggedInTherapistId, {
        name: editName,
        bio: editBio,
        skills: skillsArray as any,
        image: editImage,
      });

      setFeedback({ type: 'success', text: 'Profile updated successfully' });
      setIsEditMode(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setFeedback({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(currentTherapist?.name || '');
    setEditBio(currentTherapist?.bio || '');
    setEditSkills((currentTherapist?.skills || []).join(', '));
    setEditImage(currentTherapist?.image || '');
    setImagePreview(currentTherapist?.image || '');
    setIsEditMode(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Feedback Message */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-xl border ${feedback.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          {feedback.text}
        </div>
      )}

      {/* Header Profile Section - View Mode */}
      {!isEditMode && (
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

          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-opacity-90 font-medium text-sm transition-colors"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        </div>
      )}

      {/* Header Profile Section - Edit Mode */}
      {isEditMode && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
            <Edit2 size={20} /> Edit Your Profile
          </h2>

          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            {/* Bio Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About You</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                placeholder="Tell customers about your experience and specialization..."
              />
            </div>

            {/* Skills Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
              <input
                type="text"
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                placeholder="e.g. Thai Massage, Deep Tissue, Oil Massage"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
            </div>

            {/* Avatar Upload Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>

              {/* Preview */}
              {imagePreview && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-brand-light shadow-md"
                  />
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
                className="hidden"
              />

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-teal hover:bg-brand-sand/30 font-medium text-sm text-gray-600 hover:text-brand-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={18} />
                {isUploadingImage ? 'Uploading...' : 'Click to Upload Picture'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">PNG, JPG or GIF (Max 5MB)</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: SCHEDULE MANAGEMENT */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-brand-sand border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-brand-dark flex items-center gap-2">
                <Calendar size={18} /> My Schedule
              </h2>
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                <button onClick={() => changeDay(-1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={18} /></button>
                <span className="text-sm font-bold min-w-[100px] text-center">{selectedDate.toLocaleDateString()}</span>
                <button onClick={() => changeDay(1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={18} /></button>
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
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${booking.status === 'confirmed' ? 'bg-green-500' :
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
