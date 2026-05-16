// src/components/donor/DonorCard.jsx
// Displays individual donor information in a styled card
import { motion } from 'framer-motion';
import { FiPhone, FiMapPin, FiCalendar, FiUser, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { BLOOD_GROUP_COLORS } from '../../utils/constants';

export default function DonorCard({ donor, index = 0 }) {
  const bgColor = BLOOD_GROUP_COLORS[donor.bloodGroup] || 'bg-gray-100 text-gray-700 border-gray-300';

  const lastDonation = donor.lastDonationDate
    ? new Date(donor.lastDonationDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card-hover bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
            <FiUser className="text-red-600 dark:text-red-400" size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight">
              {donor.fullName}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              {donor.gender}, {donor.age} yrs
            </p>
          </div>
        </div>

        {/* Blood Group Badge */}
        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${bgColor}`}>
          {donor.bloodGroup}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
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

      {/* Availability */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${
          donor.isAvailable
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-400 dark:text-gray-500'
        }`}>
          {donor.isAvailable ? (
            <><FiCheckCircle size={13} /> Available to Donate</>
          ) : (
            <><FiXCircle size={13} /> Not Available</>
          )}
        </div>

        {donor.isAvailable && (
          <a
            href={`tel:${donor.phone}`}
            className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            Contact
          </a>
        )}
      </div>
    </motion.div>
  );
}
