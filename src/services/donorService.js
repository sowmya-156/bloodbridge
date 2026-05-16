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

// Get donor by userId
export const getDonorByUserId = async (userId) => {
  const q = query(collection(db, DONORS_COLLECTION), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
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
  if (availableOnly) {
    constraints.push(where('isAvailable', '==', true));
  }

  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get all donors
export const getAllDonors = async () => {
  const snapshot = await getDocs(collection(db, DONORS_COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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
