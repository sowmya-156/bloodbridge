// src/utils/donationCooldown.js
//
// Centralizes the "56 days since last donation" rule so it's calculated the
// same way everywhere (dashboard, search results, eligibility checklist),
// instead of each page reimplementing its own date math.

export const COOLDOWN_DAYS = 56;

// Given a donor record, returns the next date they are eligible to donate again.
// Prefers an explicit nextEligibleDate field (set the moment they tap "I donated
// today"); falls back to lastDonationDate + 56 days for older records that
// predate this feature, so existing data still behaves correctly.
export const getNextEligibleDate = (donor) => {
  if (donor?.nextEligibleDate) {
    return new Date(donor.nextEligibleDate);
  }
  if (donor?.lastDonationDate) {
    const d = new Date(donor.lastDonationDate);
    d.setDate(d.getDate() + COOLDOWN_DAYS);
    return d;
  }
  return null;
};

// Is this donor still inside their mandatory 56-day waiting period right now?
export const isInCooldown = (donor) => {
  const nextEligible = getNextEligibleDate(donor);
  if (!nextEligible) return false;
  return new Date() < nextEligible;
};

// How many days are left until they're eligible again (0 if already eligible).
export const daysRemainingInCooldown = (donor) => {
  const nextEligible = getNextEligibleDate(donor);
  if (!nextEligible) return 0;
  const diffMs = nextEligible.getTime() - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Self-healing check: given a donor record as currently stored, does its
// availability/eligibility data need correcting right now? This is what lets
// the 56-day window "expire" automatically without any server-side cron job —
// any page that reads donor data can call this and silently patch Firestore
// the moment the date has passed, even if nobody touched the app in between.
export const needsCooldownExpiry = (donor) => {
  if (!donor?.nextEligibleDate) return false;
  const nextEligible = new Date(donor.nextEligibleDate);
  // Cooldown has passed, but the record still reflects the "just donated" state.
  return new Date() >= nextEligible && (donor.isAvailable === false || donor.eligNotDonatedRecently === false);
};
