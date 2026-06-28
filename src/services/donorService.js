// src/services/donorService.js
// Firestore CRUD operations for donors and emergency requests
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const DONORS_COLLECTION = 'donors';
const REQUESTS_COLLECTION = 'emergencyRequests';

// ── Donor Operations ──────────────────────────────────────────────

// Register a new donor
export const registerDonor = async (donorData, userId) => {
  const docRef = await addDoc(collection(db, DONORS_COLLECTION), {
    ...donorData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Update donor
export const updateDonor = async (donorId, updates) => {
  const donorRef = doc(db, DONORS_COLLECTION, donorId);
  await updateDoc(donorRef, { ...updates, updatedAt: serverTimestamp() });
};

// Delete donor
export const deleteDonor = async (donorId) => {
  await deleteDoc(doc(db, DONORS_COLLECTION, donorId));
};

// ── 56-Day Donation Cooldown ──────────────────────────────────────
//
// Called when a donor taps "I donated blood today" on their dashboard.
// Marks them unavailable, records today as their last donation date, and
// stores the exact date 56 days from now — the single source of truth that
// everything else (search results, eligibility badge) reads from.
export const markDonationToday = async (donorId) => {
  const today = new Date();
  const nextEligible = new Date(today);
  nextEligible.setDate(nextEligible.getDate() + 56);

  await updateDonor(donorId, {
    lastDonationDate: today.toISOString().split('T')[0], // 'YYYY-MM-DD'
    nextEligibleDate: nextEligible.toISOString(),
    isAvailable: false,
    eligNotDonatedRecently: false,
    hasDonatedBefore: 'yes',
  });
};

// Self-healing check, called wherever donor data is read (search results,
// dashboard load). If a donor's 56-day cooldown has passed but their record
// still shows them as unavailable from that donation, this flips them back
// to available and re-checks the eligibility box automatically — no action
// needed from the donor, no server-side cron job required.
const autoExpireCooldownIfNeeded = async (donor) => {
  if (!donor?.nextEligibleDate) return donor;
  const nextEligible = new Date(donor.nextEligibleDate);
  const cooldownPassed = new Date() >= nextEligible;
  const stillNeedsCorrection = donor.isAvailable === false || donor.eligNotDonatedRecently === false;

  if (cooldownPassed && stillNeedsCorrection) {
    const corrected = { isAvailable: true, eligNotDonatedRecently: true };
    await updateDonor(donor.id, corrected);
    return { ...donor, ...corrected };
  }
  return donor;
};

// ── Donor Reads (now self-healing) ────────────────────────────────

// Get donor by userId
export const getDonorByUserId = async (userId) => {
  const q = query(collection(db, DONORS_COLLECTION), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const raw = { id: docSnap.id, ...docSnap.data() };
  return await autoExpireCooldownIfNeeded(raw);
};

// Search donors by blood group and/or city
export const searchDonors = async ({ bloodGroup, city, availableOnly }) => {
  let q = collection(db, DONORS_COLLECTION);
  const constraints = [];

  if (bloodGroup && bloodGroup !== 'All') {
    constraints.push(where('bloodGroup', '==', bloodGroup));
  }
  if (city && city.trim() !== '') {
    constraints.push(where('city', '==', city.trim()));
  }
  // NOTE: we no longer filter availableOnly in the query itself — a donor
  // whose cooldown just expired needs to be healed and re-checked first,
  // which has to happen after fetching, not as part of the Firestore query.

  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  const snapshot = await getDocs(q);
  const rawResults = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Self-heal any donor whose 56-day cooldown has quietly expired.
  const healedResults = await Promise.all(
    rawResults.map((donor) => autoExpireCooldownIfNeeded(donor))
  );

  return availableOnly ? healedResults.filter((d) => d.isAvailable) : healedResults;
};

// Get all donors
export const getAllDonors = async () => {
  const snapshot = await getDocs(collection(db, DONORS_COLLECTION));
  const rawResults = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return await Promise.all(rawResults.map((donor) => autoExpireCooldownIfNeeded(donor)));
};

// ── Emergency Request Operations ─────────────────────────────────

// Create emergency request
export const createEmergencyRequest = async (requestData, userId) => {
  const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), {
    ...requestData,
    userId,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get all emergency requests
export const getEmergencyRequests = async () => {
  const q = query(
    collection(db, REQUESTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Update request status
export const updateRequestStatus = async (requestId, status) => {
  await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), { status });
};

// Delete request
export const deleteRequest = async (requestId) => {
  await deleteDoc(doc(db, REQUESTS_COLLECTION, requestId));
};
