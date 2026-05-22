// src/pages/SearchDonors.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiMapPin, FiNavigation, FiDroplet,
  FiRefreshCw, FiAward, FiShield, FiStar, FiUsers,
  FiChevronDown, FiChevronUp, FiAlertCircle,
} from 'react-icons/fi';
import { searchDonors } from '../services/donorService';
import { BLOOD_GROUPS, INDIAN_CITIES, SAMPLE_DONORS } from '../utils/constants';
import { categorizeDonors } from '../utils/donorScoring';
import { getDistanceKm, geocodeCity, getCurrentPosition } from '../utils/distance';
import DonorCard from '../components/donor/DonorCard';
import SkeletonCard from '../components/common/SkeletonCard';

function SectionHeader({ icon: Icon, title, count, color, description, collapsed, onToggle }) {
  return (
    <button onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 mb-4 transition-all ${color}`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
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

function FullyVerifiedSection({ donors }) {
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
  const [patientCoords, setPatientCoords] = useState(null);
  const [locationMode, setLocationMode] = useState('city');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');

  const handleDetectLiveLocation = async () => {
    setDetectingLocation(true);
    try {
      const coords = await getCurrentPosition();
      setPatientCoords(coords);
      setLocationMode('live');
      setLocationLabel('Live location detected');
      setCity('');
    } catch {
      alert('Could not access your location. Please allow location access or enter your city.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const attachDistances = async (donors, patCoords) => {
    if (!patCoords) return donors.map((d) => ({ ...d, distanceKm: null }));
    return await Promise.all(donors.map(async (d) => {
      if (d.lat && d.lng) {
        const distanceKm = getDistanceKm(patCoords.lat, patCoords.lng, d.lat, d.lng);
        return { ...d, distanceKm };
      }
      if (d.city) {
        const donorCoords = await geocodeCity(d.city);
        if (donorCoords) {
          const distanceKm = getDistanceKm(patCoords.lat, patCoords.lng, donorCoords.lat, donorCoords.lng);
          return { ...d, distanceKm };
        }
      }
      return { ...d, distanceKm: null };
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      let patCoords = patientCoords;
      if (!patCoords && city) {
        patCoords = await geocodeCity(city);
        if (patCoords) setPatientCoords(patCoords);
      }
      let results = await searchDonors({ bloodGroup, city: locationMode === 'city' ? city : '', availableOnly });
      if (results.length === 0) {
        results = SAMPLE_DONORS.filter((d) => {
          if (bloodGroup && d.bloodGroup !== bloodGroup) return false;
          if (locationMode === 'city' && city && d.city.toLowerCase() !== city.toLowerCase()) return false;
          if (availableOnly && !d.isAvailable) return false;
          return true;
        });
      }
      const withDistances = await attachDistances(results, patCoords);
      const cats = categorizeDonors(withDistances);
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
    setPatientCoords(null); setLocationMode('city'); setLocationLabel('');
    setRecommendedCollapsed(false); setNormalCollapsed(false);
  };

  const recommendedCount = categorized ? categorized.fullyVerified.length + categorized.partiallyVerified.length : 0;
  const normalCount = categorized ? categorized.normal.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg">
            <FiSearch size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Blood Donors</h1>
          <p className="text-gray-500 dark:text-gray-400">Smart recommendations sorted by distance and verification level.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-8"
        >
          {/* Blood Group + Available Only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Blood Group Needed</label>
              <div className="relative">
                <FiDroplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                  <option value="">All Blood Groups</option>
                  {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer h-[42px]">
                <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="w-4 h-4 accent-red-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Available donors only</span>
              </label>
            </div>
          </div>

          {/* Patient Location */}
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 mb-4">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FiMapPin size={12} /> Your Location (to calculate distances)
            </p>
            <div className="flex gap-2 mb-3">
              <button type="button"
                onClick={() => { setLocationMode('city'); setPatientCoords(null); setLocationLabel(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${locationMode === 'city' ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900'}`}>
                Enter City
              </button>
              <button type="button" onClick={handleDetectLiveLocation} disabled={detectingLocation}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors flex items-center justify-center gap-1.5 ${locationMode === 'live' ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900'}`}>
                <FiNavigation size={13} className={detectingLocation ? 'animate-spin' : ''} />
                {detectingLocation ? 'Detecting...' : 'Use Live Location'}
              </button>
            </div>

            {locationMode === 'city' ? (
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" list="search-cities" value={city} onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city or hospital location..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                <datalist id="search-cities">{INDIAN_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-2.5 px-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <FiNavigation size={14} className="text-green-600 dark:text-green-400 shrink-0" />
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">📍 {locationLabel}</span>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
              <FiAlertCircle size={11} />
              Distances shown on donor cards are calculated from your location
            </p>
          </div>

          {/* Search + Reset buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <button onClick={handleSearch} disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-8 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-all shadow-md">
                <FiSearch size={16} />
                {loading ? 'Searching...' : 'Search Donors'}
              </button>
              {searched && (
                <button onClick={handleReset}
                  className="flex items-center gap-2 py-3 px-5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
                  <FiRefreshCw size={14} /> Reset
                </button>
              )}
            </div>
            {!city && !patientCoords && (
              <p className="text-xs text-orange-500 flex items-center gap-1">
                <FiAlertCircle size={11} />
                Enter your city or use live location to see distances to donors
              </p>
            )}
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
              <FiNavigation size={14} className="animate-spin text-red-500" />
              Calculating distances to donors...
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : searched && categorized ? (
          totalCount > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span> donor{totalCount !== 1 ? 's' : ''}
                  {bloodGroup && <> with <span className="font-bold text-red-600">{bloodGroup}</span></>}
                  {city && locationMode === 'city' && <> in <span className="font-bold text-red-600">{city}</span></>}
                  {locationMode === 'live' && <> near <span className="font-bold text-red-600">your location</span></>}
                  {patientCoords && <span className="text-green-600 dark:text-green-400 font-medium"> · sorted by distance</span>}
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

              {recommendedCount > 0 && (
                <div className="mb-8">
                  <SectionHeader
                    icon={FiStar} title="Highly Recommended Donors" count={recommendedCount}
                    description={patientCoords ? "Verified donors · sorted nearest first" : "Verified donors with completed health profiles"}
                    color="border-red-400 bg-gradient-to-r from-red-600 to-red-500 text-white"
                    collapsed={recommendedCollapsed} onToggle={() => setRecommendedCollapsed(!recommendedCollapsed)}
                  />
                  <AnimatePresence>
                    {!recommendedCollapsed && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <FullyVerifiedSection donors={categorized.fullyVerified} />
                        <PartiallyVerifiedSection donors={categorized.partiallyVerified} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {normalCount > 0 && (
                <div>
                  <SectionHeader
                    icon={FiUsers} title="Other Donors" count={normalCount}
                    description="Basic registered donors"
                    color="border-gray-400 bg-gradient-to-r from-gray-600 to-gray-500 text-white"
                    collapsed={normalCollapsed} onToggle={() => setNormalCollapsed(!normalCollapsed)}
                  />
                  <AnimatePresence>
                    {!normalCollapsed && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {categorized.normal.map((d, i) => <DonorCard key={d.id} donor={d} index={i} showBadge={false} />)}
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
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { icon: FiAward, label: 'Fully Verified', desc: 'Donated before + all eligibility checks', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
                { icon: FiShield, label: 'Partially Verified', desc: 'Some eligibility info provided', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
                { icon: FiNavigation, label: 'Distance Sorted', desc: 'Nearest donors shown first', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
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
            <p className="text-sm text-gray-400 dark:text-gray-600">Enter your location above and search to see donors sorted by distance.</p>
          </div>
        )}
      </div>
    </div>
  );
}
