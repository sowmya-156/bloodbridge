// src/utils/donorScoring.js
// Verification tier, profile completion, and distance-aware sorting

export const computeDonorScore = (donor) => {
  let score = 0;
  let total = 0;

  total += 20;
  const hasDonationAnswer = donor.hasDonatedBefore !== undefined && donor.hasDonatedBefore !== null && donor.hasDonatedBefore !== '';
  if (donor.hasDonatedBefore === 'yes' || donor.hasDonatedBefore === true) score += 20;
  else if (hasDonationAnswer) score += 10;

  const checklistItems = ['eligAgeOk','eligWeightOk','eligHemoglobinOk','eligNotDonatedRecently','eligNoAlcohol'];
  const perItem = 80 / checklistItems.length;
  checklistItems.forEach((key) => {
    total += perItem;
    if (donor[key] === true) score += perItem;
  });

  const percentage = Math.round((score / total) * 100);
  const allChecklist = checklistItems.every((k) => donor[k] === true);
  const donatedBefore = donor.hasDonatedBefore === 'yes' || donor.hasDonatedBefore === true;
  const anyChecklist = checklistItems.some((k) => donor[k] === true);

  let tier = 'basic';
  if (donatedBefore && allChecklist) tier = 'full';
  else if (anyChecklist || hasDonationAnswer) tier = 'partial';

  return { percentage, tier };
};

/**
 * Blood compatibility map — which donor blood groups can donate to a given recipient group.
 * Key = recipient (needed) blood group, Value = list of donor groups that can donate to them.
 */
export const COMPATIBLE_DONORS_FOR = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // universal recipient
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'], // can only receive from O-
};

export const isExactMatch = (donorGroup, neededGroup) => donorGroup === neededGroup;

export const isCompatibleDonor = (donorGroup, neededGroup) => {
  if (!neededGroup) return true; // no filter applied
  return COMPATIBLE_DONORS_FOR[neededGroup]?.includes(donorGroup) || false;
};

/**
 * Categorize and sort donors.
 * Within each tier, sort by distance (nearest first), then by profile completion.
 * Also marks each donor as exact match or compatible match.
 */
export const categorizeDonors = (donors, neededBloodGroup = '') => {
  const scored = donors.map((d) => ({
    ...d,
    ...computeDonorScore(d),
    isExactBloodMatch: neededBloodGroup ? isExactMatch(d.bloodGroup, neededBloodGroup) : true,
  }));

  const sortByMatchDistanceScore = (a, b) => {
    // Exact blood group match comes before compatible-only match
    if (a.isExactBloodMatch !== b.isExactBloodMatch) {
      return a.isExactBloodMatch ? -1 : 1;
    }
    // Then by distance
    if (a.distanceKm !== null && a.distanceKm !== undefined &&
        b.distanceKm !== null && b.distanceKm !== undefined) {
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    }
    if (a.distanceKm !== null && a.distanceKm !== undefined && (b.distanceKm === null || b.distanceKm === undefined)) return -1;
    if (b.distanceKm !== null && b.distanceKm !== undefined && (a.distanceKm === null || a.distanceKm === undefined)) return 1;
    // Then by profile completion
    return b.percentage - a.percentage;
  };

  const fullyVerified   = scored.filter((d) => d.tier === 'full').sort(sortByMatchDistanceScore);
  const partiallyVerified = scored.filter((d) => d.tier === 'partial').sort(sortByMatchDistanceScore);
  const normal          = scored.filter((d) => d.tier === 'basic').sort(sortByMatchDistanceScore);

  return { fullyVerified, partiallyVerified, normal };
};
