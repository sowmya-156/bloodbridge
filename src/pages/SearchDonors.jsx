// src/pages/SearchDonors.jsx
// Smart donor search with Highly Recommended / Normal sections
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiMapPin, FiNavigation, FiDroplet,
  FiRefreshCw, FiAward, FiShield, FiStar, FiUsers, FiChevronDown, FiChevronUp,
} from 'react-icons/fi';
import { searchDonors } from '../services/donorService';
import { BLOOD_GROUPS, INDIAN_CITIES, SAMPLE_DONORS } from '../utils/constants';
import { useGeolocation } from '../hooks/useGeolocation';
import { categorizeDonors } from '../utils/donorScoring';
import DonorCard from '../components/donor/DonorCard';
import SkeletonCard from '../components/common/SkeletonCard';

// ── Section header with icon ──────────────────────────────────────
function SectionHeader({ icon: Icon, title, count, color, description, collapsed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 mb-4 transition-all ${color}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon size={18} />
        </div>
        <div className="text-left">
          <div className="font-bold text-base">{title}</div>
          <div className="text-xs opacity-80">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">{count}</span>
        {collapsed ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
      </div>
    </button>
  );
}

// ── Fully Verified sub-section ────────────────────────────────────
function FullyVerifiedSection({ donors }) {
  const [collapsed, setCollapsed] = useState(false);
  if (!donors.length) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
          <FiAward size={12} /> Trusted Donors · Fully Verified
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{donors.length} donor{donors.length > 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {donors.map((d, i) => <DonorCard key={d.id} donor={d} index={i} showBadge />)}
      </div>
    </div>
  );
}

// ── Partially Verified sub-section ───────────────────────────────
function PartiallyVerifiedSection({ donors }) {
  if (!donors.length) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-800">
          <FiShield size={12} /> Partially Verified
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{donors.length} donor{donors.length > 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {donors.map((d, i) => <DonorCard key={d.id} donor={d} index={i} showBadge />)}
      </div>
    </div>
  );
}

export default function SearchDonors() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [categorized, setCategorized] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recommendedCollapsed, setRecommendedCollapsed] = useState(false);
  const [normalCollapsed, setNormalCollapsed] = useState(false);
  const { city: geoCity, loading: geoLoading, detectLocation } = useGeolocation();

  useEffect(() => { if (geoCity) setCity(geoCity); }, [geoCity]);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      let results = await searchDonors({ bloodGroup, city, availableOnly });
      if (results.length === 0) {
        results = SAMPLE_DONORS.filter((d) => {
          if (bloodGroup && d.bloodGroup !== bloodGroup) return false;
          if (city && d.city.toLowerCase() !== city.toLowerCase()) return false;
          if (availableOnly && !d.isAvailable) return false;
          return true;
        });
      }
      const cats = categorizeDonors(results);
      setCategorized(cats);
      setTotalCount(results.length);
    } catch {
      setCategorized({ fullyVerified: [], partiallyVerified: [], normal: [] });
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBloodGroup(''); setCity(''); setAvailableOnly(false);
    setCategorized(null); setSearched(false); setTotalCount(0);
    setRecommendedCollapsed(false); setNormalCollapsed(false);
  };

  const recommendedCount = categorized ? categorized.fullyVerified.length + categorized.partiallyVerified.length : 0;
  const normalCount = categorized ? categorized.normal.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg">
            <FiSearch size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Blood Donors</h1>
          <p className="text-gray-500 dark:text-gray-400">Smart recommendations based on verification level and availability.</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Blood Group */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Blood Group</label>
              <div className="relative">
                <FiDroplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                  <option value="">All Blood Groups</option>
                  {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">City</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" list="search-cities" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                <datalist id="search-cities">{INDIAN_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
            </div>

            {/* Auto-detect */}
            <div className="flex items-end">
              <button onClick={detectLocation} disabled={geoLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
                <FiNavigation size={14} className={geoLoading ? 'animate-spin' : ''} />
                {geoLoading ? 'Detecting...' : 'Use My Location'}
              </button>
            </div>

            {/* Available Only */}
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer">
                <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="w-4 h-4 accent-red-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Available only</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSearch} disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-8 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-all shadow-md">
              <FiSearch size={16} />
              {loading ? 'Searching...' : 'Search Donors'}
            </button>
            {searched && (
              <button onClick={handleReset} className="flex items-center gap-2 py-3 px-5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
                <FiRefreshCw size={14} /> Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : searched && categorized ? (
          totalCount > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Summary bar */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span> donor{totalCount !== 1 ? 's' : ''}
                  {bloodGroup && <> · <span className="font-bold text-red-600">{bloodGroup}</span></>}
                  {city && <> in <span className="font-bold text-red-600">{city}</span></>}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {categorized.fullyVerified.length > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold border border-green-200 dark:border-green-800">
                      <FiAward size={11} /> {categorized.fullyVerified.length} Fully Verified
                    </span>
                  )}
                  {categorized.partiallyVerified.length > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold border border-yellow-200 dark:border-yellow-800">
                      <FiShield size={11} /> {categorized.partiallyVerified.length} Partial
                    </span>
                  )}
                  {categorized.normal.length > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700">
                      <FiUsers size={11} /> {categorized.normal.length} Basic
                    </span>
                  )}
                </div>
              </div>

              {/* ── HIGHLY RECOMMENDED SECTION ── */}
              {recommendedCount > 0 && (
                <div className="mb-8">
                  <SectionHeader
                    icon={FiStar}
                    title="Highly Recommended Donors"
                    count={recommendedCount}
                    description="Verified donors with completed health profiles"
                    color="border-red-400 bg-gradient-to-r from-red-600 to-red-500 text-white"
                    collapsed={recommendedCollapsed}
                    onToggle={() => setRecommendedCollapsed(!recommendedCollapsed)}
                  />
                  <AnimatePresence>
                    {!recommendedCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <FullyVerifiedSection donors={categorized.fullyVerified} />
                        <PartiallyVerifiedSection donors={categorized.partiallyVerified} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── NORMAL DONORS SECTION ── */}
              {normalCount > 0 && (
                <div>
                  <SectionHeader
                    icon={FiUsers}
                    title="Other Donors"
                    count={normalCount}
                    description="Basic registered donors"
                    color="border-gray-400 bg-gradient-to-r from-gray-600 to-gray-500 text-white"
                    collapsed={normalCollapsed}
                    onToggle={() => setNormalCollapsed(!normalCollapsed)}
                  />
                  <AnimatePresence>
                    {!normalCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {categorized.normal.map((d, i) => (
                            <DonorCard key={d.id} donor={d} index={i} showBadge={false} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No donors found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">Try a different blood group or city.</p>
              <button onClick={handleReset} className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm">
                Clear Filters
              </button>
            </motion.div>
          )
        ) : !searched && (
          <div className="text-center py-16">
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { icon: FiAward, label: 'Fully Verified', desc: 'Donated before + all eligibility checks passed', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
                { icon: FiShield, label: 'Partially Verified', desc: 'Some eligibility info provided', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
                { icon: FiUsers, label: 'Basic Donor', desc: 'Basic registration only', color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' },
              ].map((item) => (
                <div key={item.label} className={`flex items-start gap-3 p-4 rounded-2xl border max-w-xs text-left ${item.color}`}>
                  <item.icon size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <FiFilter size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-400 dark:text-gray-600">Use the filters above to find donors.</p>
          </div>
        )}
      </div>
    </div>
  );
}
