// src/hooks/useLiveLocation.js
// Continuously tracks donor's live location and updates Firestore
import { useEffect, useRef } from 'react';
import { updateDonor } from '../services/donorService';

export const useLiveLocation = (donor) => {
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!donor?.id) return;
    if (!navigator.geolocation) return;

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude: liveLat, longitude: liveLng } = position.coords;
        try {
          await updateDonor(donor.id, {
            liveLat,
            liveLng,
            liveLocationUpdatedAt: new Date().toISOString(),
            isLiveLocationActive: true,
          });
        } catch (err) {
          console.error('Failed to update live location:', err);
        }
      },
      () => {
        // Location denied or unavailable — mark live location as inactive
        if (donor?.id) {
          updateDonor(donor.id, { isLiveLocationActive: false }).catch(() => {});
        }
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );

    // Cleanup — stop watching when component unmounts
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        // Mark live location as inactive when donor leaves
        if (donor?.id) {
          updateDonor(donor.id, { isLiveLocationActive: false }).catch(() => {});
        }
      }
    };
  }, [donor?.id]);
};