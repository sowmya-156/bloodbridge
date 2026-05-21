// src/utils/donorScoring.js
export const computeDonorScore = (donor) => {
  let score = 0;
  let total = 0;

  total += 20;
  const hasDonationAnswer = donor.hasDonatedBefore !== undefined &&
    donor.hasDonatedBefore !== null && donor.hasDonatedBefore !== '';
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

export const categorizeDonors = (donors) => {
  const scored = donors.map((d) => ({ ...d, ...computeDonorScore(d) }));

  const sortByDistanceThenScore = (a, b) => {
    if (a.distanceKm !== null && a.distanceKm !== undefined &&
        b.distanceKm !== null && b.distanceKm !== undefined) {
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    }
    if (a.distanceKm !== null && a.distanceKm !== undefined &&
        (b.distanceKm === null || b.distanceKm === undefined)) return -1;
    if (b.distanceKm !== null && b.distanceKm !== undefined &&
        (a.distanceKm === null || a.distanceKm === undefined)) return 1;
    return b.percentage - a.percentage;
  };

  const fullyVerified = scored.filter((d) => d.tier === 'full').sort(sortByDistanceThenScore);
  const partiallyVerified = scored.filter((d) => d.tier === 'partial').sort(sortByDistanceThenScore);
  const normal = scored.filter((d) => d.tier === 'basic').sort(sortByDistanceThenScore);

  return { fullyVerified, partiallyVerified, normal };
};