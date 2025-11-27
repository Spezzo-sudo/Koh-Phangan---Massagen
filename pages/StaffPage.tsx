import React, { useState, useMemo } from 'react';
import { ServiceType } from '../types';
import { Star, Sparkles, Hand, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTherapists } from '../lib/queries';
import { useSEO } from '../hooks/useSEO';

export default function TherapistsPage() {
    useSEO({
        title: "Our Team",
        description: "Meet our certified Thai massage therapists and professional nail artists. Vetted, experienced, and ready to come to you."
    });

    const [activeTab, setActiveTab] = useState<'massage' | 'beauty'>('massage');
    const { data: THERAPISTS = [], isLoading } = useTherapists();

    const massageTherapists = useMemo(() =>
        THERAPISTS.filter(t =>
            !t.skills?.includes(ServiceType.MANICURE) && !t.skills?.includes(ServiceType.NAIL_ART)
        ),
        [THERAPISTS]
    );

    const beautyArtists = useMemo(() =>
        THERAPISTS.filter(t =>
            t.skills?.includes(ServiceType.MANICURE) || t.skills?.includes(ServiceType.NAIL_ART)
        ),
        [THERAPISTS]
    );

    const displayedTherapists = activeTab === 'massage' ? massageTherapists : beautyArtists;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="font-serif text-4xl font-bold text-brand-dark mb-4">Meet Our Professionals</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    We have two dedicated teams: Our certified Massage Therapists for healing, and our creative Nail & Beauty Artists for your glow.
                </p>
            </div>

            {/* TABS */}
            <div className="flex justify-center mb-12">
                <div className="bg-gray-100 p-1 rounded-full flex gap-2">
                    <button
                        onClick={() => setActiveTab('massage')}
                        className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'massage'
                                ? 'bg-white text-brand-dark shadow-md'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Hand size={18} /> Massage Team
                    </button>
                    <button
                        onClick={() => setActiveTab('beauty')}
                        className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'beauty'
                                ? 'bg-white text-pink-600 shadow-md'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Sparkles size={18} /> Nails & Beauty
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedTherapists.map(therapist => (
                    <div key={therapist.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
                        <div className="h-64 overflow-hidden relative">
                            <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors z-10"></div>
                            <img
                                src={therapist.image}
                                alt={therapist.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {activeTab === 'beauty' && (
                                <div className="absolute top-4 right-4 bg-pink-100 text-pink-600 text-xs font-bold px-3 py-1 rounded-full z-20 shadow-sm">
                                    Nail Artist
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="font-serif text-2xl font-bold text-gray-800">{therapist.name}</h2>
                                <div className="flex items-center bg-brand-sand px-2 py-1 rounded text-brand-gold font-bold text-sm">
                                    <Star size={14} fill="currentColor" className="mr-1" />
                                    {therapist.rating}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 min-h-[3rem]">{therapist.bio}</p>

                            <div className="mb-6">
                                <h3 className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Specialties</h3>
                                <div className="flex flex-wrap gap-2">
                                    {therapist.skills.map(skill => (
                                        <span key={skill} className="px-2 py-1 bg-brand-light text-brand-dark text-xs rounded font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto space-y-3">
                                {therapist.socialHandles && (
                                    <div className="flex gap-2 justify-center mb-3">
                                        {therapist.socialHandles.instagram && (
                                            <a href={`https://instagram.com/${therapist.socialHandles.instagram}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors" title="View Portfolio">
                                                <Instagram size={20} />
                                            </a>
                                        )}
                                        {therapist.socialHandles.facebook && (
                                            <a href={`https://facebook.com/${therapist.socialHandles.facebook}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Facebook Profile">
                                                <Facebook size={20} />
                                            </a>
                                        )}
                                    </div>
                                )}

                                <Link
                                    to={`/booking`}
                                    className={`block w-full text-center text-white py-3 rounded-lg font-medium hover:opacity-90 transition-colors ${activeTab === 'beauty' ? 'bg-pink-500' : 'bg-brand-teal hover:bg-brand-dark'
                                        }`}
                                >
                                    Book Appointment
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
