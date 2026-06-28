// src/components/dashboard/DonationCooldownCard.jsx
//
// Drop this into the Dashboard page, near the availability toggle. It shows:
//   - A button to mark "I donated blood today" when the donor IS eligible
//   - A countdown + disabled state when they're still in their 56-day window
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDroplet, FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { markDonationToday } from '../../services/donorService';
import { isInCooldown, daysRemainingInCooldown, getNextEligibleDate } from '../../utils/donationCooldown';
import toast from 'react-hot-toast';

export default function DonationCooldownCard({ donor, onUpdated }) {
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!donor) return null;

  const cooldownActive = isInCooldown(donor);
  const daysLeft = daysRemainingInCooldown(donor);
  const nextEligible = getNextEligibleDate(donor);

  const handleMarkDonated = async () => {
    setSubmitting(true);
    try {
      await markDonationToday(donor.id);
      toast.success("Marked as donated today! You'll automatically show as available again in 56 days.");
      setConfirming(false);
      onUpdated?.(); // let the parent Dashboard re-fetch / update local state
    } catch {
      toast.error('Could not update your status. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cooldownActive) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
            <FiClock size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Resting period — thank you for donating!
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              You're temporarily marked unavailable to protect your health. You'll automatically
              reappear in donor searches in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>
              {nextEligible && (
                <> (on {nextEligible.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})</>
              )} — no action needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      {!confirming ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0">
              <FiDroplet size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Donated blood today?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">We'll pause your availability for 56 days, then restore it automatically.</p>
            </div>
          </div>
          <button
            onClick={() => setConfirming(true)}
            className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            I donated today
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <FiCalendar size={15} className="text-red-500 shrink-0 mt-0.5" />
            <p>
              Confirm you donated blood today. You'll be marked <strong>unavailable</strong> and
              automatically become available again after <strong>56 days</strong> — no need to
              remember to switch it back on.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkDonated}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <FiCheckCircle size={13} className={submitting ? 'animate-spin' : ''} />
              {submitting ? 'Saving...' : 'Yes, confirm'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
