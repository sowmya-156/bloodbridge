// src/services/notificationService.js
import emailjs from '@emailjs/browser';
import { getAllDonors } from './donorService';
import { getDistanceKm, geocodeCity } from '../utils/distance';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const NOTIFY_RADIUS_KM = 500; // temporarily large for testing

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
      distance: distanceKm.toFixed(1),
      contact_number: request.contactNumber,
    }, PUBLIC_KEY);
    return true;
  } catch (err) {
    console.error(`Failed to notify ${donor.fullName}:`, err);
    return false;
  }
};

const isCompatible = (donorGroup, neededGroup) => {
  const compatibility = {
    'O-': ['A+','A-','B+','B-','AB+','AB-','O+','O-'],
    'O+': ['A+','B+','AB+','O+'],
    'A-': ['A+','A-','AB+','AB-'],
    'A+': ['A+','AB+'],
    'B-': ['B+','B-','AB+','AB-'],
    'B+': ['B+','AB+'],
    'AB-': ['AB+','AB-'],
    'AB+': ['AB+'],
  };
  return compatibility[donorGroup]?.includes(neededGroup) || false;
};

export const notifyNearbyDonors = async (request) => {
  try {
    const hospitalCoords = await getHospitalCoords(request);
    console.log('Hospital coords:', hospitalCoords);
    console.log('Request:', request);
    if (!hospitalCoords) return { notified: 0, skipped: 0 };

    const allDonors = await getAllDonors();
    const matchingDonors = allDonors.filter((d) =>
      d.isAvailable && d.email &&
      (d.bloodGroup === request.bloodGroup || isCompatible(d.bloodGroup, request.bloodGroup))
    );

    let notified = 0, skipped = 0;
    for (const donor of matchingDonors) {
      const donorCoords = await getDonorCoords(donor);
      if (!donorCoords) { skipped++; continue; }
      const distanceKm = getDistanceKm(hospitalCoords.lat, hospitalCoords.lng, donorCoords.lat, donorCoords.lng);
      if (distanceKm !== null && distanceKm <= NOTIFY_RADIUS_KM) {
        const sent = await sendEmailToDonor(donor, request, distanceKm);
        if (sent) notified++; else skipped++;
        await new Promise((r) => setTimeout(r, 300));
      } else {
        skipped++;
      }
    }
    return { notified, skipped };
  } catch (err) {
    console.error('Notification error:', err);
    return { notified: 0, skipped: 0 };
  }
};
