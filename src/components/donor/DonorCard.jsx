// src/components/donor/DonorCard.jsx
// Displays individual donor with verification badge and completion bar
import { motion } from 'framer-motion';
import {
  FiPhone, FiMapPin, FiCalendar, FiUser,
  FiCheckCircle, FiXCircle, FiAward, FiShield, FiStar,
} from 'react-icons/fi';
import { BLOOD_GROUP_COLORS } from '../../utils/constants';
import { computeDonorScore } from '../../utils/donorScoring';

// Verification badge component
function VerificationBadge({ tier }) {
  if (tier === 'full') return (
    <div className="flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold border border-green-200 dark:border-green-800">
      <FiAward size={11} /> Fully Verified
    </div>
  );
  if (tier === 'partial') return (
    <div className="flex items-center gap-1 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold border border-yellow-200 dark:border-yellow-800">
      <FiShield size={11} /> Partially Verified
    </div>
  );
  return null;
}

export default function DonorCard({ donor, index = 0, showBadge = true }) {
  const bgColor = BLOOD_GROUP_COLORS[donor.bloodGroup] || 'bg-gray-100 text-gray-700 border-gray-300';
  const { percentage, tier } = computeDonorScore(donor);

  const lastDonation = donor.lastDonationDate
    ? new Date(donor.lastDonationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  const tierBorder = tier === 'full'
    ? 'border-green-200 dark:border-green-900/40'
    : tier === 'partial'
    ? 'border-yellow-200 dark:border-yellow-900/40'
    : 'border-gray-200 dark:border-gray-800';

  const tierTopBar = tier === 'full'
    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
    : tier === 'partial'
    ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
    : 'bg-gray-200 dark:bg-gray-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`card-hover bg-white dark:bg-gray-900 rounded-2xl border ${tierBorder} p-5 shadow-sm relative overflow-hidden`}
    >
      {/* Top tier indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${tierTopBar}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
            <FiUser className="text-red-600 dark:text-red-400" size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight">{donor.fullName}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs">{donor.gender}, {donor.age} yrs</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${bgColor}`}>
          {donor.bloodGroup}
        </div>
      </div>

      {/* Verification badge */}
      {showBadge && tier !== 'basic' && (
        <div className="mb-3">
          <VerificationBadge tier={tier} />
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiMapPin size={13} className="text-red-500 shrink-0" />
          <span>{donor.city}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiPhone size={13} className="text-red-500 shrink-0" />
          <span>{donor.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiCalendar size={13} className="text-red-500 shrink-0" />
          <span>Last donated: {lastDonation}</span>
        </div>
      </div>

      {/* Profile completion bar (only for verified donors) */}
      {tier !== 'basic' && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Profile completion</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${tier === 'full' ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Availability */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${
          donor.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
        }`}>
          {donor.isAvailable
            ? <><FiCheckCircle size={13} /> Available</>
            : <><FiXCircle size={13} /> Not Available</>}
        </div>
        {donor.isAvailable && (
          <a href={`tel:${donor.phone}`}
            className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors">
            Contact
          </a>
        )}
      </div>
    </motion.div>
  );
}
