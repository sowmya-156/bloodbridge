// src/hooks/useGeolocation.js
import { useState, useCallback } from 'react';

export const useGeolocation = () => {
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county || '';
          setCity(detectedCity);
        } catch {
          setError('Could not determine your city. Please enter manually.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location access denied. Please enter your city manually.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { city, coords, loading, error, detectLocation, setCity };
};