import { useState, useEffect, useRef } from 'react';
import { KOH_PHANGAN_LOCATIONS } from '../constants';

interface Prediction {
  description: string;
  place_id?: string;
}

export function usePlacesAutocomplete(input: string) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Logik: Wenn Key da ist und NICHT der Platzhalter, nutzen wir Google.
  const USE_REAL_GOOGLE_API = !!GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your_google_maps_api_key_here';

  const autocompleteService = useRef<any>(null);

  // 1. Init Real Google API
  useEffect(() => {
    if (USE_REAL_GOOGLE_API && input.length > 1 && !window.google?.maps?.places) {
        // Hier würde man das Script laden, siehe lib/googleMaps.ts
    }
  }, [USE_REAL_GOOGLE_API, GOOGLE_API_KEY, input.length]);

  // 2. Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input || input.length < 2) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);

      if (USE_REAL_GOOGLE_API && window.google && window.google.maps) {
        // --- ECHTE GOOGLE API LOGIK ---
        if (!autocompleteService.current) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }

        const request = {
            input: input,
            componentRestrictions: { country: 'th' },
        };

        autocompleteService.current.getPlacePredictions(request, (results: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                setPredictions(results.map((r: any) => ({
                    description: r.description,
                    place_id: r.place_id
                })));
            } else {
                setPredictions([]);
            }
            setIsLoading(false);
        });

      } else {
        // --- FALLBACK: Use local Koh Phangan locations when API not available ---
        const matches = KOH_PHANGAN_LOCATIONS.filter(loc =>
          loc.toLowerCase().includes(input.toLowerCase())
        ).map(loc => ({ description: loc }));

        setPredictions(matches);
        setIsLoading(false);
      }

    }, 300);

    return () => clearTimeout(timer);
  }, [input, USE_REAL_GOOGLE_API]);

  return { predictions, isLoading };
}
