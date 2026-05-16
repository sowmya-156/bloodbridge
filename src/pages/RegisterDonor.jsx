// src/pages/RegisterDonor.jsx
// Form for registering/editing a donor profile
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDroplet, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiNavigation } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { registerDonor, getDonorByUserId, updateDonor } from '../services/donorService';
import { validateDonorForm } from '../utils/validators';
import { BLOOD_GROUPS, INDIAN_CITIES } from '../utils/constants';
import { useGeolocation } from '../hooks/useGeolocation';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function RegisterDonor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { city: detectedCity, loading: geoLoading, detectLocation } = useGeolocation();

  const [existingDonorId, setExistingDonorId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    fullName: '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    email: user?.email || '',
    city: '',
    lastDonationDate: '',
    isAvailable: true,
  });

  // Load existing donor data
  useEffect(() => {
    const load = async () => {
      try {
        const existing = await getDonorByUserId(user.uid);
        if (existing) {
          setExistingDonorId(existing.id);
          setForm({
            fullName: existing.fullName || '',
            age: existing.age || '',
            gender: existing.gender || '',
            bloodGroup: existing.bloodGroup || '',
            phone: existing.phone || '',
            email: existing.email || user.email || '',
            city: existing.city || '',
            lastDonationDate: existing.lastDonationDate || '',
            isAvailable: existing.isAvailable ?? true,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [user]);

  // Apply detected city
  useEffect(() => {
    if (detectedCity) setForm((prev) => ({ ...prev, city: detectedCity }));
  }, [detectedCity]);

  const handle = (field) => (e) =>
    setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateDonorForm(form);
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix form errors.'); return; }
    setErrors({});
    setSubmitting(true);
    try {
      if (existingDonorId) {
        await updateDonor(existingDonorId, form);
        toast.success('Donor profile updated!');
      } else {
        await registerDonor(form, user.uid);
        toast.success('You are now registered as a donor!');
      }
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save donor profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <LoadingSpinner fullScreen />;

  const Field = ({ name, label, type = 'text', icon: Icon, required, children, ...rest }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />}
        {children || (
          <input
            type={type}
            value={form[name]}
            onChange={handle(name)}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border ${errors[name] ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm`}
            {...rest}
          />
        )}
      </div>
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg">
              <FiDroplet size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {existingDonorId ? 'Update Donor Profile' : 'Register as a Donor'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Your information helps us connect you with people in need.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field name="fullName" label="Full Name" icon={FiUser} required placeholder="Your full name" />
              <Field name="age" label="Age" type="number" icon={FiUser} required placeholder="18–65" min={18} max={65} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field name="gender" label="Gender" icon={FiUser} required>
                <select value={form.gender} onChange={handle('gender')} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.gender ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm`}>
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>

              <Field name="bloodGroup" label="Blood Group" icon={FiDroplet} required>
                <select value={form.bloodGroup} onChange={handle('bloodGroup')} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.bloodGroup ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm`}>
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field name="phone" label="Phone Number" type="tel" icon={FiPhone} required placeholder="+91 98765 43210" />
              <Field name="email" label="Email Address" type="email" icon={FiMail} required placeholder="you@example.com" />
            </div>

            {/* City with geolocation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input
                    type="text"
                    list="cities"
                    value={form.city}
                    onChange={handle('city')}
                    placeholder="Enter or detect your city"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.city ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm`}
                  />
                  <datalist id="cities">
                    {INDIAN_CITIES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={geoLoading}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors text-sm font-medium whitespace-nowrap"
                  title="Detect my location"
                >
                  <FiNavigation size={14} className={geoLoading ? 'animate-spin' : ''} />
                  {geoLoading ? 'Detecting...' : 'Auto-detect'}
                </button>
              </div>
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>

            <Field name="lastDonationDate" label="Last Donation Date (if any)" type="date" icon={FiCalendar}
              max={new Date().toISOString().split('T')[0]} />

            {/* Availability Toggle */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <input
                type="checkbox"
                id="isAvailable"
                checked={form.isAvailable}
                onChange={handle('isAvailable')}
                className="w-4 h-4 accent-red-600"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                I am currently available to donate blood
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : existingDonorId ? 'Update Profile' : 'Register as Donor'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
