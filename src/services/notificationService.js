// src/services/notificationService.js
import emailjs from '@emailjs/browser';
import { getAllDonors } from './donorService';
import { getDistanceKm, geocodeCity } from '../utils/distance';
import { COMPATIBLE_DONORS_FOR } from '../utils/donorScoring';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
// Notifications now go to ALL available, blood-compatible donors — no distance cutoff.
// Distance is still calculated (when possible) purely to show "X km away" in the email.

const getDonorCoords = async (donor) => {
  if (donor.isLiveLocationActive && donor.liveLat && donor.liveLng) {
    const updatedAt = donor.liveLocationUpdatedAt ? new Date(donor.liveLocationUpdatedAt) : null;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (updatedAt && updatedAt > fiveMinutesAgo) {
      return { lat: donor.liveLat, lng: donor.liveLng };
    }
  }
  if (donor.lat && donor.lng) return { lat: donor.lat, lng: donor.lng };
  if (donor.city) return await geocodeCity(donor.city);
  return null;
};

const getHospitalCoords = async (request) => {
  if (request.hospitalLat && request.hospitalLng) {
    return { lat: request.hospitalLat, lng: request.hospitalLng };
  }
  if (request.city) return await geocodeCity(request.city);
  return null;
};

const sendEmailToDonor = async (donor, request, distanceKm) => {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      donor_name: donor.fullName,
      donor_email: donor.email,
      patient_name: request.patientName,
      blood_group: request.bloodGroup,
      hospital_name: request.hospitalName,
      city: request.city,
      urgency: request.urgency,
      distance: distanceKm !== null && distanceKm !== undefined ? distanceKm.toFixed(1) : 'N/A',
      contact_number: request.contactNumber,
    }, PUBLIC_KEY);
    return true;
  } catch (err) {
    console.error(`Failed to notify ${donor.fullName}:`, err);
    return false;
  }
};

// Uses the shared compatibility map (same logic as search page)
const isCompatible = (donorGroup, neededGroup) => {
  return COMPATIBLE_DONORS_FOR[neededGroup]?.includes(donorGroup) || false;
};

export const notifyNearbyDonors = async (request) => {
  try {
    // Hospital coords are used only to compute an informational distance — not a requirement to send.
    const hospitalCoords = await getHospitalCoords(request);

    const allDonors = await getAllDonors();
    // Includes both exact match AND blood-compatible donors (e.g. O- for O+ request)
    const matchingDonors = allDonors.filter((d) =>
      d.isAvailable && d.email && isCompatible(d.bloodGroup, request.bloodGroup)
    );

    let notified = 0, skipped = 0;
    for (const donor of matchingDonors) {
      // Try to resolve a distance just for display in the email — never used to skip a donor.
      let distanceKm = null;
      if (hospitalCoords) {
        const donorCoords = await getDonorCoords(donor);
        if (donorCoords) {
          distanceKm = getDistanceKm(hospitalCoords.lat, hospitalCoords.lng, donorCoords.lat, donorCoords.lng);
        }
      }
      const sent = await sendEmailToDonor(donor, request, distanceKm);
      if (sent) notified++; else skipped++;
      await new Promise((r) => setTimeout(r, 300));
    }
    return { notified, skipped };
  } catch (err) {
    console.error('Notification error:', err);
    return { notified: 0, skipped: 0 };
  }
};
