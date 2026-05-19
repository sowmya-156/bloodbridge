// src/utils/donorScoring.js
// Logic for computing verification tier, profile completion %, and smart sorting

/**
 * Calculate profile completion percentage and verification tier.
 * Tiers: 'full' | 'partial' | 'basic'
 */
export const computeDonorScore = (donor) => {
  let score = 0;
  let total = 0;

  // ── Step 2: previous donation ──────────────────────────
  total += 20;
  const hasDonationAnswer = donor.hasDonatedBefore !== undefined && donor.hasDonatedBefore !== null && donor.hasDonatedBefore !== '';
  if (hasDonatedBefore(donor)) score += 20; // Yes = full credit
  else if (hasDonationAnswer) score += 10;  // No = partial credit (still answered)

  // ── Step 3: eligibility checklist ─────────────────────
  const checklistItems = [
    'eligAgeOk',
    'eligWeightOk',
    'eligHemoglobinOk',
    'eligNotDonatedRecently',
    'eligNoAlcohol',
  ];
  const perItem = 80 / checklistItems.length; // 80 points total for checklist
  checklistItems.forEach((key) => {
    total += perItem;
    if (donor[key] === true) score += perItem;
  });

  const percentage = Math.round((score / total) * 100);

  // ── Tier logic ─────────────────────────────────────────
  const allChecklist = checklistItems.every((k) => donor[k] === true);
  const donatedBefore = hasDonatedBefore(donor);
  const anyChecklist = checklistItems.some((k) => donor[k] === true);
  const skippedAll = !hasDonationAnswer && !anyChecklist;

  let tier = 'basic';
  if (donatedBefore && allChecklist) tier = 'full';
  else if (anyChecklist || hasDonationAnswer) tier = 'partial';

  return { percentage, tier };
};

const hasDonatedBefore = (donor) => donor.hasDonatedBefore === 'yes' || donor.hasDonatedBefore === true;

/**
 * Sort donors by tier priority then profile completion.
 * Returns { fullyVerified, partiallyVerified, normal }
 */
export const categorizeDonors = (donors) => {
  const scored = donors.map((d) => ({ ...d, ...computeDonorScore(d) }));

  const fullyVerified   = scored.filter((d) => d.tier === 'full').sort((a, b) => b.percentage - a.percentage);
  const partiallyVerified = scored.filter((d) => d.tier === 'partial').sort((a, b) => b.percentage - a.percentage);
  const normal          = scored.filter((d) => d.tier === 'basic');

  return { fullyVerified, partiallyVerified, normal };
};
