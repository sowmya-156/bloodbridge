// src/pages/EmergencyRequests.jsx
// View all emergency blood requests and create new ones
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiPlus, FiX, FiPhone, FiMapPin, FiUser, FiDroplet } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { createEmergencyRequest, getEmergencyRequests } from '../services/donorService';
import { validateEmergencyForm } from '../utils/validators';
import { BLOOD_GROUPS, URGENCY_LEVELS, INDIAN_CITIES } from '../utils/constants';
import EmergencyCard from '../components/emergency/EmergencyCard';
import SkeletonCard from '../components/common/SkeletonCard';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const EMPTY_FORM = {
  patientName: '', bloodGroup: '', hospitalName: '',
  city: '', contactNumber: '', urgency: 'High', additionalInfo: '',
};

export default function EmergencyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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

  const handle = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to post a request.'); return; }
    const errs = validateEmergencyForm(form);
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix form errors.'); return; }
    setSubmitting(true);
    try {
      const id = await createEmergencyRequest(form, user.uid);
      const newReq = { id, ...form, userId: user.uid, createdAt: new Date() };
      setRequests([newReq, ...requests]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setErrors({});
      toast.success('Emergency request posted!');
    } catch {
      toast.error('Failed to post request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'All' ? requests : requests.filter((r) => r.urgency === filter);

  const SelectField = ({ name, label, icon: Icon, options, required }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />}
        <select value={form[name]} onChange={handle(name)}
          className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 rounded-xl border ${errors[name] ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}>
          <option value="">Select...</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  const TextField = ({ name, label, icon: Icon, placeholder, required, type = 'text' }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />}
        <input type={type} value={form[name]} onChange={handle(name)} placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 rounded-xl border ${errors[name] ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`} />
      </div>
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <FiAlertTriangle size={20} className="text-white" />
              </span>
              Emergency Requests
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Active blood requests from across India.</p>
          </div>
          {user ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm"
            >
              <FiPlus size={16} />
              Post Request
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
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filter === level ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-red-400'}`}>
              {level}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((req, i) => (
              <EmergencyCard key={req.id} request={req} index={i} onDelete={(id) => setRequests(requests.filter((r) => r.id !== id))} />
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiAlertTriangle className="text-red-600" />
                    Post Emergency Request
                  </h2>
                  <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                    <FiX size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField name="patientName" label="Patient Name" icon={FiUser} placeholder="Patient's name" required />
                    <SelectField name="bloodGroup" label="Blood Group Needed" icon={FiDroplet} options={BLOOD_GROUPS} required />
                  </div>
                  <TextField name="hospitalName" label="Hospital Name" icon={FiMapPin} placeholder="Hospital or location" required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">City <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" list="emrg-cities" value={form.city} onChange={handle('city')} placeholder="City"
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.city ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`} />
                        <datalist id="emrg-cities">
                          {INDIAN_CITIES.map((c) => <option key={c} value={c} />)}
                        </datalist>
                      </div>
                      {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                    </div>
                    <TextField name="contactNumber" label="Contact Number" icon={FiPhone} placeholder="+91 98765 43210" required type="tel" />
                  </div>
                  <SelectField name="urgency" label="Urgency Level" options={URGENCY_LEVELS} required />
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Additional Information</label>
                    <textarea value={form.additionalInfo} onChange={handle('additionalInfo')} placeholder="Any additional details..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none" />
                  </div>
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
