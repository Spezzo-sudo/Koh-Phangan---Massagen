
// Singleton um zu verhindern, dass das Script mehrfach geladen wird
let googleMapsScriptLoaded = false;

declare global {
  interface Window {
    google: any;
  }
}

/**
 * Lädt die Google Maps JavaScript API asynchron.
 * Rufe diese Funktion auf, sobald die App startet oder wenn die Booking-Seite betreten wird.
 */
export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (googleMapsScriptLoaded) {
      resolve();
      return;
    }

    if (typeof window !== 'undefined' && window.google && window.google.maps) {
        googleMapsScriptLoaded = true;
        resolve();
        return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      googleMapsScriptLoaded = true;
      resolve();
    };
    
    script.onerror = (err) => {
      reject(err);
    };

    document.head.appendChild(script);
  });
};

/**
 * Hilfsfunktion um Distanzen zu berechnen (für Fahrtkosten später).
 * Gibt Distanz in km zurück.
 */
export const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
): number => {
    const R = 6371; // Radius der Erde in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distanz in km
    return d;
};

function deg2rad(deg: number): number {
  return deg * (Math.PI/180)
}
