
import { useState, useEffect, useRef } from 'react';
import { KOH_PHANGAN_LOCATIONS } from '../constants';
// import { loadGoogleMapsScript } from '../lib/googleMaps'; 

interface Prediction {
  description: string;
  place_id?: string;
}

export function usePlacesAutocomplete(input: string) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // SICHERE VARIANTE: Verhindert Absturz, wenn import.meta.env undefined ist.
  // Wir nutzen Optional Chaining (?.) und Fallback auf ein leeres Objekt.
  const env = (import.meta as any)?.env || {};
  const GOOGLE_API_KEY = env.VITE_GOOGLE_MAPS_API_KEY; 
  
  // Logik: Wenn Key da ist, nutzen wir Google. Wenn nicht, nutzen wir Mock-Daten.
  const USE_REAL_GOOGLE_API = !!GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your_google_maps_api_key_here';

  const autocompleteService = useRef<any>(null);

  // 1. Init Real Google API
  useEffect(() => {
    if (USE_REAL_GOOGLE_API && input.length > 1 && !window.google?.maps?.places) {
        // Hier würde man loadGoogleMapsScript(GOOGLE_API_KEY) aufrufen
        // Das ist aktuell auskommentiert, um keine Fehler ohne Key zu werfen
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
        // --- ECHTE GOOGLE API LOGIK (Aktiviert sich erst, wenn Script geladen ist) ---
        /*
        if (!autocompleteService.current) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
        
        const request = {
            input: input,
            componentRestrictions: { country: 'th' }, 
            // locationBias kann hier auf Koh Phangan Bounds gesetzt werden
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
        */
        // Fallback solange Code auskommentiert ist:
        const matches = KOH_PHANGAN_LOCATIONS.filter(loc => 
            loc.toLowerCase().includes(input.toLowerCase())
          ).map(loc => ({ description: loc }));
          setPredictions(matches);
          setIsLoading(false);

      } else {
        // --- MOCK LOGIK ---
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
