// src/pages/RegisterDonor.jsx
// Multi-step donor registration wizard (Step 1: Basic, Step 2: Previous Donation, Step 3: Eligibility)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDroplet, FiUser, FiPhone, FiMail, FiMapPin,
  FiCalendar, FiNavigation, FiCheck, FiArrowRight,
  FiArrowLeft, FiSkipForward, FiShield, FiAward,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { registerDonor, getDonorByUserId, updateDonor } from '../services/donorService';
import { validateDonorForm } from '../utils/validators';
import { BLOOD_GROUPS, INDIAN_CITIES } from '../utils/constants';
import { useGeolocation } from '../hooks/useGeolocation';
import { computeDonorScore } from '../utils/donorScoring';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const TOTAL_STEPS = 3;

// ── Step Indicator ────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = [
    { label: 'Basic Info', icon: FiUser },
    { label: 'Donation History', icon: FiDroplet },
    { label: 'Eligibility', icon: FiShield },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => {
        const num = i + 1;
        const done = current > num;
        const active = current === num;
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                done ? 'bg-red-600 border-red-600 text-white' :
                active ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-900/30' :
                'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400'
              }`}>
                {done ? <FiCheck size={16} /> : <step.icon size={16} />}
              </div>
              <span className={`text-xs mt-1.5 font-medium hidden sm:block ${
                active ? 'text-red-600 dark:text-red-400' : done ? 'text-gray-500' : 'text-gray-400'
              }`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-1 mb-4 sm:mb-5 transition-all ${
                current > num ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-800'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Profile Completion Bar ────────────────────────────────────────
function CompletionBar({ donor }) {
  const { percentage, tier } = computeDonorScore(donor);
  const color = tier === 'full' ? 'bg-green-500' : tier === 'partial' ? 'bg-yellow-500' : 'bg-gray-400';
  const label = tier === 'full' ? 'Fully Verified' : tier === 'partial' ? 'Partially Verified' : 'Basic';
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Profile Completion</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          tier === 'full' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          tier === 'partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>{label}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-2 rounded-full ${color}`}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{percentage}% complete</p>
    </div>
  );
}

// ── STEP 1: Basic Info ────────────────────────────────────────────
function Step1({ form, setForm, errors, onNext, submitting, existingDonorId }) {
  const { city: detectedCity, coords: detectedCoords, loading: geoLoading, detectLocation } = useGeolocation();
  useEffect(() => { if (detectedCity) setForm((p) => ({ ...p, city: detectedCity })); }, [detectedCity]);
  useEffect(() => { if (detectedCoords) setForm((p) => ({ ...p, lat: detectedCoords.lat, lng: detectedCoords.lng })); }, [detectedCoords]);

  const handle = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors[field] ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm`;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
          <div className="relative"><FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="text" value={form.fullName} onChange={handle('fullName')} placeholder="Your full name" className={inputClass('fullName')} />
          </div>
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
        </div>
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Age <span className="text-red-500">*</span></label>
          <div className="relative"><FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="number" value={form.age} onChange={handle('age')} placeholder="18–65" min={18} max={65} className={inputClass('age')} />
          </div>
          {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender <span className="text-red-500">*</span></label>
          <div className="relative"><FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <select value={form.gender} onChange={handle('gender')} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.gender ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm`}>
              <option value="">Select gender</option>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
        </div>
        {/* Blood Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Blood Group <span className="text-red-500">*</span></label>
          <div className="relative"><FiDroplet className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <select value={form.bloodGroup} onChange={handle('bloodGroup')} className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.bloodGroup ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm`}>
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          {errors.bloodGroup && <p className="mt-1 text-xs text-red-500">{errors.bloodGroup}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
          <div className="relative"><FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="tel" value={form.phone} onChange={handle('phone')} placeholder="+91 98765 43210" className={inputClass('phone')} />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email <span className="text-red-500">*</span></label>
          <div className="relative"><FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="email" value={form.email} onChange={handle('email')} placeholder="you@example.com" className={inputClass('email')} />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="text" list="cities" value={form.city} onChange={handle('city')} placeholder="Your city"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.city ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`} />
            <datalist id="cities">{INDIAN_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <button type="button" onClick={detectLocation} disabled={geoLoading}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors text-sm font-medium whitespace-nowrap">
            <FiNavigation size={14} className={geoLoading ? 'animate-spin' : ''} />
            {geoLoading ? 'Detecting...' : 'Auto-detect'}
          </button>
        </div>
        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
      </div>

      {/* Last Donation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Donation Date (optional)</label>
        <div className="relative"><FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input type="date" value={form.lastDonationDate} onChange={handle('lastDonationDate')}
            max={new Date().toISOString().split('T')[0]}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <input type="checkbox" id="isAvailable" checked={form.isAvailable} onChange={handle('isAvailable')} className="w-4 h-4 accent-red-600" />
        <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          I am currently available to donate blood
        </label>
      </div>

      <button type="button" onClick={onNext} disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-all shadow-md">
        {submitting ? 'Saving...' : <>{existingDonorId ? 'Save & Continue' : 'Next'} <FiArrowRight size={16} /></>}
      </button>
    </div>
  );
}

// ── STEP 2: Previous Donation ─────────────────────────────────────
function Step2({ form, setForm, onNext, onBack, onSkip }) {
  const options = [
    { value: 'yes', label: 'Yes, I have donated before', icon: '✅', desc: 'I have previous blood donation experience' },
    { value: 'no', label: 'No, this will be my first time', icon: '🩸', desc: 'I have never donated blood before' },
  ];

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-3">
          <FiDroplet size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Have you donated blood previously?</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This helps us verify your donor experience.</p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => (
          <button key={opt.value} type="button"
            onClick={() => setForm((p) => ({ ...p, hasDonatedBefore: opt.value }))}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
              form.hasDonatedBefore === opt.value
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-red-300 dark:hover:border-red-700'
            }`}>
            <span className="text-2xl">{opt.icon}</span>
            <div>
              <p className={`font-semibold text-sm ${form.hasDonatedBefore === opt.value ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{opt.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
            </div>
            {form.hasDonatedBefore === opt.value && (
              <div className="ml-auto w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shrink-0">
                <FiCheck size={13} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
          <FiArrowLeft size={15} /> Back
        </button>
        <button type="button" onClick={onNext} disabled={!form.hasDonatedBefore}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white disabled:text-gray-500 font-semibold rounded-xl transition-all shadow-md text-sm">
          Next <FiArrowRight size={15} />
        </button>
        <button type="button" onClick={onSkip}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
          <FiSkipForward size={14} /> Skip
        </button>
      </div>
    </div>
  );
}

// ── STEP 3: Eligibility Checklist ─────────────────────────────────
function Step3({ form, setForm, onBack, onSubmit, onSkip, submitting }) {
  const isFemale = form.gender === 'Female';

  const toggle = (field) => () => setForm((p) => ({ ...p, [field]: !p[field] }));

  const CheckItem = ({ field, label, sublabel }) => (
    <button type="button" onClick={toggle(field)}
      className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
        form[field]
          ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-800'
      }`}>
      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
        form[field] ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'
      }`}>
        {form[field] && <FiCheck size={13} className="text-white" />}
      </div>
      <div>
        <p className={`text-sm font-medium ${form[field] ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>{label}</p>
        {sublabel && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-3">
          <FiShield size={24} className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Health & Eligibility Check</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select all conditions that apply to you.</p>
      </div>

      <CheckItem field="eligAgeOk" label="I am between 18–65 years old." sublabel="Age requirement for blood donation" />
      <CheckItem field="eligWeightOk" label="My weight is at least 50 kg." sublabel="Minimum weight requirement" />

      {/* Gender-specific hemoglobin */}
      <div className={`p-4 rounded-2xl border-2 transition-all ${
        form.eligHemoglobinOk ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
      }`}>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Hemoglobin Level</p>
        {/* Gender selector */}
        <div className="flex gap-2 mb-3">
          {['Male', 'Female'].map((g) => (
            <button key={g} type="button"
              onClick={() => setForm((p) => ({ ...p, gender: g, eligHemoglobinOk: false }))}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                form.gender === g
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-400'
              }`}>{g}</button>
          ))}
        </div>
        <button type="button" onClick={toggle('eligHemoglobinOk')}
          className="w-full flex items-start gap-4 text-left">
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            form.eligHemoglobinOk ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'
          }`}>
            {form.eligHemoglobinOk && <FiCheck size={13} className="text-white" />}
          </div>
          <p className={`text-sm font-medium ${form.eligHemoglobinOk ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {isFemale
              ? 'My hemoglobin level is at least 12.5 g/dL.'
              : 'My hemoglobin level is at least 13.0 g/dL.'}
          </p>
        </button>
      </div>

      <CheckItem field="eligNotDonatedRecently" label="I have not donated blood in the last 56 days." sublabel="Minimum waiting period between donations" />
      <CheckItem field="eligNoAlcohol" label="I do not have the habit of drinking alcohol." sublabel="Alcohol affects blood quality" />

      {/* Preview completion */}
      <CompletionBar donor={form} />

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
          <FiArrowLeft size={15} /> Back
        </button>
        <button type="button" onClick={onSubmit} disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-all shadow-md text-sm">
          <FiAward size={15} />
          {submitting ? 'Saving...' : 'Complete Registration'}
        </button>
        <button type="button" onClick={onSkip}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
          <FiSkipForward size={14} /> Skip
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function RegisterDonor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [existingDonorId, setExistingDonorId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1
    fullName: '', age: '', gender: '', bloodGroup: '',
    phone: '', email: user?.email || '', city: '',
    lastDonationDate: '', isAvailable: true,
    // Step 2
    hasDonatedBefore: '',
    lat: null, lng: null,
    // Step 3
    eligAgeOk: false, eligWeightOk: false, eligHemoglobinOk: false,
    eligNotDonatedRecently: false, eligNoAlcohol: false,
  });

  // Load existing donor
  useEffect(() => {
    const load = async () => {
      try {
        const existing = await getDonorByUserId(user.uid);
        if (existing) {
          setExistingDonorId(existing.id);
          setForm((prev) => ({
            ...prev,
            fullName: existing.fullName || '',
            age: existing.age || '',
            gender: existing.gender || '',
            bloodGroup: existing.bloodGroup || '',
            phone: existing.phone || '',
            email: existing.email || user.email || '',
            city: existing.city || '',
            lastDonationDate: existing.lastDonationDate || '',
            isAvailable: existing.isAvailable ?? true,
            hasDonatedBefore: existing.hasDonatedBefore || '',
            eligAgeOk: existing.eligAgeOk || false,
            eligWeightOk: existing.eligWeightOk || false,
            eligHemoglobinOk: existing.eligHemoglobinOk || false,
            eligNotDonatedRecently: existing.eligNotDonatedRecently || false,
            eligNoAlcohol: existing.eligNoAlcohol || false,
          }));
        }
      } catch (err) { console.error(err); }
      finally { setPageLoading(false); }
    };
    load();
  }, [user]);

  // Save to Firestore (used at each step save)
  const saveToDb = async (data) => {
    const { percentage, tier } = computeDonorScore(data);
    const payload = { ...data, profileCompletion: percentage, verificationTier: tier };
    if (existingDonorId) {
      await updateDonor(existingDonorId, payload);
    } else {
      const id = await registerDonor(payload, user.uid);
      setExistingDonorId(id);
    }
  };

  // Step 1 → validate & save basic info, advance
  const handleStep1Next = async () => {
    const errs = validateDonorForm(form);
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix form errors.'); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await saveToDb(form);
      toast.success('Basic info saved!');
      setStep(2);
    } catch { toast.error('Failed to save. Please try again.'); }
    finally { setSubmitting(false); }
  };

  // Step 2 → save donation history, advance
  const handleStep2Next = async () => {
    setSubmitting(true);
    try {
      await saveToDb(form);
      setStep(3);
    } catch { toast.error('Failed to save.'); }
    finally { setSubmitting(false); }
  };

  // Step 3 → save eligibility, finish
  const handleStep3Submit = async () => {
    setSubmitting(true);
    try {
      await saveToDb(form);
      const { tier } = computeDonorScore(form);
      toast.success(
        tier === 'full' ? '🏆 Fully verified donor profile created!' :
        tier === 'partial' ? '✅ Profile saved! Complete more for full verification.' :
        '✅ Registration complete!'
      );
      navigate('/dashboard');
    } catch { toast.error('Failed to save eligibility.'); }
    finally { setSubmitting(false); }
  };

  // Skip any step after step 1
  const handleSkip = async () => {
    setSubmitting(true);
    try {
      await saveToDb(form);
      navigate('/dashboard');
    } catch { toast.error('Failed to save.'); }
    finally { setSubmitting(false); }
  };

  if (pageLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg">
              <FiDroplet size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {existingDonorId ? 'Update Donor Profile' : 'Register as a Donor'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Step {step} of {TOTAL_STEPS} — {step === 1 ? 'Basic Information' : step === 2 ? 'Donation History' : 'Health Eligibility'}
            </p>
          </div>

          <StepIndicator current={step} />

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
                  <Step1
                    form={form} setForm={setForm} errors={errors}
                    onNext={handleStep1Next} submitting={submitting}
                    existingDonorId={existingDonorId}
                  />
                )}
                {step === 2 && (
                  <Step2
                    form={form} setForm={setForm}
                    onNext={handleStep2Next}
                    onBack={() => setStep(1)}
                    onSkip={handleSkip}
                  />
                )}
                {step === 3 && (
                  <Step3
                    form={form} setForm={setForm}
                    onBack={() => setStep(2)}
                    onSubmit={handleStep3Submit}
                    onSkip={handleSkip}
                    submitting={submitting}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
