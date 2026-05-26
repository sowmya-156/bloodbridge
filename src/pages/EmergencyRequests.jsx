// src/pages/EmergencyRequests.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertTriangle, FiPlus, FiX, FiPhone, FiMapPin,
  FiUser, FiDroplet, FiMap, FiNavigation,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { createEmergencyRequest, getEmergencyRequests } from '../services/donorService';
import { validateEmergencyForm } from '../utils/validators';
import { BLOOD_GROUPS, URGENCY_LEVELS, INDIAN_CITIES } from '../utils/constants';
import EmergencyCard from '../components/emergency/EmergencyCard';
import SkeletonCard from '../components/common/SkeletonCard';
import HospitalPicker from '../components/common/HospitalPicker';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { notifyNearbyDonors } from '../services/notificationService';

const EMPTY_FORM = {
  patientName: '',
  bloodGroup: '',
  hospitalName: '',
  city: '',
  contactNumber: '',
  urgency: 'High',
  additionalInfo: '',
  hospitalLat: null,
  hospitalLng: null,
};

export default function EmergencyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getEmergencyRequests();
      setRequests(data);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Fix: use useCallback with functional update to prevent focus loss
  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleHospitalSelect = useCallback((location) => {
    setForm((prev) => ({
      ...prev,
      hospitalName: location.name,
      city: location.fullAddress?.split(',').slice(-3, -1).join(',').trim() || prev.city,
      hospitalLat: location.lat,
      hospitalLng: location.lng,
    }));
    setShowMapPicker(false);
    toast.success('Hospital location selected!');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to post a request.'); return; }
    const errs = validateEmergencyForm(form);
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix form errors.'); return; }
    setSubmitting(true);
    try {
      const id = await createEmergencyRequest(form, user.uid);
      const newReq = { id, ...form, userId: user.uid, createdAt: new Date() };
      setRequests((prev) => [newReq, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setErrors({});
      toast.success('Emergency request posted!');

      // Notify nearby donors
      toast.loading('Notifying nearby donors...', { id: 'notify' });
      const { notified } = await notifyNearbyDonors(form);
      toast.dismiss('notify');
      if (notified > 0) {
        toast.success(`📧 ${notified} nearby donor${notified > 1 ? 's' : ''} notified!`);
      } else {
        toast('No donors found within 11km to notify.', { icon: 'ℹ️' });
      }
    } catch {
      toast.error('Failed to post request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'All' ? requests : requests.filter((r) => r.urgency === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Hospital Map Picker Modal */}
        {showMapPicker && (
          <HospitalPicker
            onSelect={handleHospitalSelect}
            onClose={() => setShowMapPicker(false)}
          />
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <FiAlertTriangle size={20} className="text-white" />
              </span>
              Emergency Requests
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Active blood requests. Nearby donors are notified automatically.</p>
          </div>
          {user ? (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm">
              <FiPlus size={16} /> Post Request
            </button>
          ) : (
            <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm">
              Login to Post Request
            </Link>
          )}
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['All', ...URGENCY_LEVELS].map((level) => (
            <button key={level} onClick={() => setFilter(level)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                filter === level
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-red-400'
              }`}>
              {level}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((req, i) => (
              <EmergencyCard key={req.id} request={req} index={i}
                onDelete={(id) => setRequests((prev) => prev.filter((r) => r.id !== id))} />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No emergency requests</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">There are currently no active blood requests.</p>
          </motion.div>
        )}

        {/* Post Request Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiAlertTriangle className="text-red-600" />
                    Post Emergency Request
                  </h2>
                  <button onClick={() => setShowForm(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                    <FiX size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {/* Patient Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Patient Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                      <input
                        type="text"
                        value={form.patientName}
                        onChange={(e) => handleChange('patientName', e.target.value)}
                        placeholder="Patient's full name"
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.patientName ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}
                      />
                    </div>
                    {errors.patientName && <p className="mt-1 text-xs text-red-500">{errors.patientName}</p>}
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Blood Group Needed <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiDroplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                      <select
                        value={form.bloodGroup}
                        onChange={(e) => handleChange('bloodGroup', e.target.value)}
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.bloodGroup ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}
                      >
                        <option value="">Select blood group</option>
                        {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    {errors.bloodGroup && <p className="mt-1 text-xs text-red-500">{errors.bloodGroup}</p>}
                  </div>

                  {/* Hospital Name + Map Picker */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Hospital Name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        <input
                          type="text"
                          value={form.hospitalName}
                          onChange={(e) => handleChange('hospitalName', e.target.value)}
                          placeholder="Hospital or location name"
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.hospitalName ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        className="flex items-center gap-1.5 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-medium whitespace-nowrap shadow-sm"
                        title="Pick on map"
                      >
                        <FiMap size={14} /> Map
                      </button>
                    </div>
                    {form.hospitalLat && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                        <FiNavigation size={11} />
                        Location pinned: {form.hospitalLat.toFixed(4)}, {form.hospitalLng.toFixed(4)}
                      </p>
                    )}
                    {errors.hospitalName && <p className="mt-1 text-xs text-red-500">{errors.hospitalName}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                      <input
                        type="text"
                        list="emrg-cities"
                        value={form.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="City"
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.city ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}
                      />
                      <datalist id="emrg-cities">
                        {INDIAN_CITIES.map((c) => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                      <input
                        type="tel"
                        value={form.contactNumber}
                        onChange={(e) => handleChange('contactNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.contactNumber ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}
                      />
                    </div>
                    {errors.contactNumber && <p className="mt-1 text-xs text-red-500">{errors.contactNumber}</p>}
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Urgency Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.urgency}
                      onChange={(e) => handleChange('urgency', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.urgency ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}
                    >
                      <option value="">Select urgency</option>
                      {URGENCY_LEVELS.map((l) => <option key={l}>{l}</option>)}
                    </select>
                    {errors.urgency && <p className="mt-1 text-xs text-red-500">{errors.urgency}</p>}
                  </div>

                  {/* Additional Info */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Additional Information
                    </label>
                    <textarea
                      value={form.additionalInfo}
                      onChange={(e) => handleChange('additionalInfo', e.target.value)}
                      placeholder="Any additional details..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                    />
                  </div>

                  {/* Notification info */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">📧</span>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      All available donors within <strong>11km</strong> will be automatically notified by email when you post this request.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-all shadow-md text-sm">
                      {submitting ? 'Posting...' : 'Post Request'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
