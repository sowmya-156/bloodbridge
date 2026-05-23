// src/pages/SearchDonors.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiMapPin, FiNavigation, FiDroplet,
  FiRefreshCw, FiAward, FiShield, FiStar, FiUsers,
  FiChevronDown, FiChevronUp, FiAlertCircle, FiMap, FiX,
} from 'react-icons/fi';
import { searchDonors } from '../services/donorService';
import { BLOOD_GROUPS, SAMPLE_DONORS } from '../utils/constants';
import { categorizeDonors } from '../utils/donorScoring';
import { getDistanceKm, geocodeCity, getCurrentPosition } from '../utils/distance';
import DonorCard from '../components/donor/DonorCard';
import SkeletonCard from '../components/common/SkeletonCard';
import HospitalPicker from '../components/common/HospitalPicker';

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
  const [availableOnly, setAvailableOnly] = useState(false);
  const [categorized, setCategorized] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recommendedCollapsed, setRecommendedCollapsed] = useState(false);
  const [normalCollapsed, setNormalCollapsed] = useState(false);

  // Hospital / patient location
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [patientLocation, setPatientLocation] = useState(null); // { lat, lng, name }
  const [detectingLive, setDetectingLive] = useState(false);

  const handleHospitalSelect = (location) => {
    setPatientLocation(location);
    setShowMapPicker(false);
  };

  const handleDetectLiveLocation = async () => {
    setDetectingLive(true);
    try {
      const coords = await getCurrentPosition();
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
      );
      const data = await res.json();
      const name = data.address?.amenity || data.address?.road || 'My Live Location';
      setPatientLocation({ lat: coords.lat, lng: coords.lng, name });
    } catch {
      alert('Could not get your location. Please use the map picker.');
    } finally {
      setDetectingLive(false);
    }
  };

  const attachDistances = async (donors, patCoords) => {
    if (!patCoords) return donors.map((d) => ({ ...d, distanceKm: null }));
  
    const results = [];
    for (const d of donors) {
      // 1. Use live location if active and updated within last 5 mins
      if (d.isLiveLocationActive && d.liveLat && d.liveLng) {
        const updatedAt = d.liveLocationUpdatedAt ? new Date(d.liveLocationUpdatedAt) : null;
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (updatedAt && updatedAt > fiveMinutesAgo) {
          results.push({
            ...d,
            distanceKm: getDistanceKm(patCoords.lat, patCoords.lng, d.liveLat, d.liveLng),
            usingLiveLocation: true,
          });
          continue;
        }
      }

      // 2. Fall back to registered home location
      if (d.lat && d.lng) {
        results.push({
          ...d,
          distanceKm: getDistanceKm(patCoords.lat, patCoords.lng, d.lat, d.lng),
          usingLiveLocation: false,
        });
        continue;
      }

      // 3. Fall back to geocoded city
      if (d.city) {
        const donorCoords = await geocodeCity(d.city);
        if (donorCoords) {
          results.push({
            ...d,
            distanceKm: getDistanceKm(patCoords.lat, patCoords.lng, donorCoords.lat, donorCoords.lng),
            usingLiveLocation: false,
          });
          continue;
        }
      }

      results.push({ ...d, distanceKm: null, usingLiveLocation: false });
    }
    return results;
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      let results = await searchDonors({ bloodGroup, city: '', availableOnly });
      if (results.length === 0) {
        results = SAMPLE_DONORS.filter((d) => {
          if (bloodGroup && d.bloodGroup !== bloodGroup) return false;
          if (availableOnly && !d.isAvailable) return false;
          return true;
        });
      }
      const withDistances = await attachDistances(results, patientLocation);
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
    setBloodGroup(''); setAvailableOnly(false);
    setCategorized(null); setSearched(false); setTotalCount(0);
    setPatientLocation(null);
    setRecommendedCollapsed(false); setNormalCollapsed(false);
  };

  const recommendedCount = categorized ? categorized.fullyVerified.length + categorized.partiallyVerified.length : 0;
  const normalCount = categorized ? categorized.normal.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Hospital Picker Modal */}
        {showMapPicker && (
          <HospitalPicker
            onSelect={handleHospitalSelect}
            onClose={() => setShowMapPicker(false)}
          />
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg">
            <FiSearch size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Blood Donors</h1>
          <p className="text-gray-500 dark:text-gray-400">Smart recommendations sorted by distance from your hospital.</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-8"
        >
          {/* Blood Group + Available Only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
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

          {/* Hospital / Patient Location */}
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 mb-5">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FiMapPin size={12} /> Hospital / Patient Location
            </p>

            {patientLocation ? (
              // Selected location display
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 mb-3">
                <FiMapPin size={16} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 truncate">{patientLocation.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                    {patientLocation.lat.toFixed(5)}, {patientLocation.lng.toFixed(5)}
                  </p>
                </div>
                <button onClick={() => setPatientLocation(null)}
                  className="text-green-500 hover:text-red-500 transition-colors shrink-0">
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Select your hospital location to see how far each donor is.
              </p>
            )}

            {/* Location action buttons */}
            <div className="flex gap-2">
              <button onClick={() => setShowMapPicker(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors text-sm shadow-sm">
                <FiMap size={14} />
                {patientLocation ? 'Change on Map' : 'Pick on Map 🗺️'}
              </button>
              <button onClick={handleDetectLiveLocation} disabled={detectingLive}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-xl transition-colors text-sm">
                <FiNavigation size={14} className={detectingLive ? 'animate-spin' : ''} />
                {detectingLive ? 'Detecting...' : 'Use Live Location'}
              </button>
            </div>

            {!patientLocation && (
              <p className="text-xs text-orange-500 dark:text-orange-400 mt-2 flex items-center gap-1">
                <FiAlertCircle size={11} />
                Select a location to see distances to donors
              </p>
            )}
          </div>

          {/* Search + Reset */}
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
        </motion.div>

        {/* Results */}
        {loading ? (
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
              <FiNavigation size={14} className="animate-spin text-red-500" />
              Calculating distances from hospital to donors...
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : searched && categorized ? (
          totalCount > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span> donor{totalCount !== 1 ? 's' : ''}
                  {bloodGroup && <> with <span className="font-bold text-red-600">{bloodGroup}</span></>}
                  {patientLocation && (
                    <> near <span className="font-bold text-red-600">{patientLocation.name}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium"> · sorted by distance</span>
                    </>
                  )}
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

              {/* Highly Recommended */}
              {recommendedCount > 0 && (
                <div className="mb-8">
                  <SectionHeader
                    icon={FiStar} title="Highly Recommended Donors" count={recommendedCount}
                    description={patientLocation ? "Verified donors · sorted nearest to your hospital" : "Verified donors with completed health profiles"}
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

              {/* Normal Donors */}
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
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">Try a different blood group or remove filters.</p>
              <button onClick={handleReset} className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm">
                Clear Filters
              </button>
            </motion.div>
          )
        ) : !searched && (
          <div className="text-center py-16">
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { icon: FiMap, label: 'Hospital Picker', desc: 'Search & pin your hospital on map', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
                { icon: FiAward, label: 'Fully Verified', desc: 'Donated before + all eligibility checks', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
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
            <p className="text-sm text-gray-400 dark:text-gray-600">Pick your hospital on the map then search for donors.</p>
          </div>
        )}
      </div>
    </div>
  );
}
