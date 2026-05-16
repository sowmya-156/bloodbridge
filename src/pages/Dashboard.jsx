// src/pages/Dashboard.jsx
// User dashboard — view profile, edit, toggle availability, delete
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser, FiEdit2, FiTrash2, FiDroplet, FiPhone, FiMail,
  FiMapPin, FiCalendar, FiCheckCircle, FiXCircle, FiAlertTriangle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getDonorByUserId, updateDonor, deleteDonor } from '../services/donorService';
import { BLOOD_GROUP_COLORS } from '../utils/constants';
import { logoutUser } from '../services/authService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

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
      } catch {
        toast.error('Could not load profile data.');
      } finally {
        setLoading(false);
      }
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
    } catch {
      toast.error('Failed to update availability.');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your donor profile? This cannot be undone.')) return;
    try {
      await deleteDonor(donor.id);
      setDonor(null);
      toast.success('Donor profile deleted.');
    } catch {
      toast.error('Failed to delete profile.');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const bloodColor = donor ? BLOOD_GROUP_COLORS[donor.bloodGroup] || 'bg-gray-100 text-gray-700' : '';

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
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Logout
            </button>
          </div>

          {/* Account Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <FiUser size={28} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {user.displayName || 'User'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">Account created with Firebase Auth</p>
              </div>
            </div>
          </div>

          {/* Donor Profile */}
          {donor ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
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
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${bloodColor}`}>
                    {donor.bloodGroup}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { icon: FiMapPin, label: 'City', value: donor.city },
                    { icon: FiPhone, label: 'Phone', value: donor.phone },
                    { icon: FiMail, label: 'Email', value: donor.email },
                    { icon: FiCalendar, label: 'Last Donation', value: donor.lastDonationDate || 'Not specified' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <item.icon size={16} className="text-red-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Availability */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
                  <div className={`flex items-center gap-2 text-sm font-medium ${donor.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {donor.isAvailable
                      ? <><FiCheckCircle /> Currently available to donate</>
                      : <><FiXCircle /> Not available to donate</>
                    }
                  </div>
                  <button
                    onClick={handleToggleAvailability}
                    disabled={toggling}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${donor.isAvailable
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                      : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {toggling ? 'Updating...' : donor.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    to="/register-donor"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm"
                  >
                    <FiEdit2 size={15} />
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-5 py-3 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-xl transition-colors text-sm"
                  >
                    <FiTrash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 shadow-sm text-center"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <FiAlertTriangle size={32} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No donor profile yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                Register as a donor to appear in search results and help save lives.
              </p>
              <Link
                to="/register-donor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm"
              >
                <FiDroplet size={16} />
                Register as Donor
              </Link>
            </motion.div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              { to: '/search', label: 'Search Donors', icon: FiDroplet, desc: 'Find donors near you' },
              { to: '/emergency', label: 'Emergency Requests', icon: FiAlertTriangle, desc: 'View or post requests' },
              { to: '/register-donor', label: donor ? 'Update Profile' : 'Register as Donor', icon: FiUser, desc: 'Manage your info' },
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
