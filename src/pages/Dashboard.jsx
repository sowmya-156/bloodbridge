// src/pages/Dashboard.jsx
// User dashboard — profile view, availability toggle, delete, quick links
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser, FiEdit2, FiTrash2, FiDroplet, FiPhone, FiMail,
  FiMapPin, FiCalendar, FiCheckCircle, FiXCircle, FiAlertTriangle,
  FiAward, FiShield, FiUsers,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getDonorByUserId, updateDonor, deleteDonor } from '../services/donorService';
import { BLOOD_GROUP_COLORS } from '../utils/constants';
import { computeDonorScore } from '../utils/donorScoring';
import { logoutUser } from '../services/authService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Verification badge
function TierBadge({ tier }) {
  if (tier === 'full') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
      <FiAward size={12} /> Fully Verified · Trusted Donor
    </span>
  );
  if (tier === 'partial') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-800">
      <FiShield size={12} /> Partially Verified
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-700">
      <FiUsers size={12} /> Basic Registration
    </span>
  );
}

// Profile completion ring
function CompletionRing({ percentage, tier }) {
  const color = tier === 'full' ? '#22c55e' : tier === 'partial' ? '#eab308' : '#9ca3af';
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = (percentage / 100) * circ;

  return (
    <div className="relative w-20 h-20 mx-auto">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" className="dark:stroke-gray-700" />
        <circle cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{percentage}%</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDonorByUserId(user.uid);
        setDonor(data);
      } catch { toast.error('Could not load profile data.'); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const handleToggleAvailability = async () => {
    if (!donor) return;
    setToggling(true);
    try {
      await updateDonor(donor.id, { isAvailable: !donor.isAvailable });
      setDonor({ ...donor, isAvailable: !donor.isAvailable });
      toast.success(`Availability set to ${!donor.isAvailable ? 'Available' : 'Unavailable'}`);
    } catch { toast.error('Failed to update availability.'); }
    finally { setToggling(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your donor profile? This cannot be undone.')) return;
    try {
      await deleteDonor(donor.id);
      setDonor(null);
      toast.success('Donor profile deleted.');
    } catch { toast.error('Failed to delete profile.'); }
  };

  const handleLogout = async () => { await logoutUser(); navigate('/'); };

  if (loading) return <LoadingSpinner fullScreen />;

  const bloodColor = donor ? BLOOD_GROUP_COLORS[donor.bloodGroup] || 'bg-gray-100 text-gray-700' : '';
  const { percentage, tier } = donor ? computeDonorScore(donor) : { percentage: 0, tier: 'basic' };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
                Welcome back, <span className="text-red-600 font-medium">{user.displayName || user.email}</span>
              </p>
            </div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
              Logout
            </button>
          </div>

          {/* Account card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <FiUser size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{user.displayName || 'User'}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          {donor ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-5">
              {/* Profile header */}
              <div className="bg-gradient-to-r from-red-700 to-red-500 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <FiDroplet size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{donor.fullName}</h2>
                      <p className="text-red-100 text-sm">{donor.gender}, {donor.age} years</p>
                      <div className="mt-2">
                        <TierBadge tier={tier} />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <CompletionRing percentage={percentage} tier={tier} />
                    <p className="text-red-100 text-xs mt-1">Profile</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Profile completion tip */}
                {tier !== 'full' && (
                  <div className={`mb-5 p-4 rounded-xl border text-sm ${
                    tier === 'partial'
                      ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300'
                      : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                  }`}>
                    <p className="font-semibold mb-1">
                      {tier === 'partial' ? '⚡ Almost there! Complete your profile for full verification.' : '💡 Boost your donor ranking!'}
                    </p>
                    <p className="text-xs opacity-80">
                      {tier === 'partial'
                        ? 'Complete the eligibility checklist to become a Fully Verified Trusted Donor and appear at the top of search results.'
                        : 'Complete Steps 2 & 3 to get verified and appear higher in search results.'}
                    </p>
                    <Link to="/register-donor" className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold underline">
                      Complete Profile →
                    </Link>
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { icon: FiMapPin, label: 'City', value: donor.city },
                    { icon: FiPhone, label: 'Phone', value: donor.phone },
                    { icon: FiMail, label: 'Email', value: donor.email },
                    { icon: FiCalendar, label: 'Last Donation', value: donor.lastDonationDate || 'Not specified' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <item.icon size={15} className="text-red-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Eligibility summary */}
                {(donor.eligAgeOk || donor.eligWeightOk || donor.eligHemoglobinOk || donor.eligNotDonatedRecently || donor.eligNoAlcohol) && (
                  <div className="mb-5 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 uppercase tracking-wide">Eligibility Verified</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'eligAgeOk', label: 'Age ✓' },
                        { key: 'eligWeightOk', label: 'Weight ✓' },
                        { key: 'eligHemoglobinOk', label: 'Hemoglobin ✓' },
                        { key: 'eligNotDonatedRecently', label: '56-day wait ✓' },
                        { key: 'eligNoAlcohol', label: 'No Alcohol ✓' },
                      ].filter((e) => donor[e.key]).map((e) => (
                        <span key={e.key} className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                          {e.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blood group + availability */}
                <div className="flex items-center gap-3 mb-5">
                  <span className={`px-4 py-2 rounded-full border text-sm font-bold ${bloodColor}`}>
                    {donor.bloodGroup}
                  </span>
                  <div className={`flex items-center gap-2 text-sm font-medium ${donor.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                    {donor.isAvailable ? <FiCheckCircle size={15} /> : <FiXCircle size={15} />}
                    {donor.isAvailable ? 'Available to donate' : 'Not available'}
                  </div>
                </div>

                {/* Availability toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Availability Status</p>
                  <button onClick={handleToggleAvailability} disabled={toggling}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${donor.isAvailable
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                      : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {toggling ? 'Updating...' : donor.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link to="/register-donor"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm">
                    <FiEdit2 size={15} /> Edit Profile
                  </Link>
                  <button onClick={handleDelete}
                    className="flex items-center gap-2 px-5 py-3 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-xl transition-colors text-sm">
                    <FiTrash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 shadow-sm text-center mb-5">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <FiAlertTriangle size={32} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No donor profile yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                Register as a donor and complete all 3 steps to become a Fully Verified Trusted Donor.
              </p>
              <Link to="/register-donor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm">
                <FiDroplet size={16} /> Register as Donor
              </Link>
            </motion.div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/search', label: 'Search Donors', icon: FiDroplet, desc: 'Smart donor recommendations' },
              { to: '/emergency', label: 'Emergency Requests', icon: FiAlertTriangle, desc: 'View or post requests' },
              { to: '/register-donor', label: donor ? 'Update Profile' : 'Register as Donor', icon: FiUser, desc: 'Complete your profile' },
            ].map((link) => (
              <Link key={link.to} to={link.to}
                className="card-hover flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-red-300 dark:hover:border-red-700 transition-colors">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center shrink-0">
                  <link.icon size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{link.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
