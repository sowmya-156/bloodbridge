// src/pages/SearchDonors.jsx
// Search and filter donors by blood group, city, availability
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiMapPin, FiNavigation, FiDroplet, FiRefreshCw } from 'react-icons/fi';
import { searchDonors } from '../services/donorService';
import { BLOOD_GROUPS, INDIAN_CITIES, SAMPLE_DONORS } from '../utils/constants';
import { useGeolocation } from '../hooks/useGeolocation';
import DonorCard from '../components/donor/DonorCard';
import SkeletonCard from '../components/common/SkeletonCard';

export default function SearchDonors() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { city: geoCity, loading: geoLoading, detectLocation } = useGeolocation();

  useEffect(() => {
    if (geoCity) setCity(geoCity);
  }, [geoCity]);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      let results = await searchDonors({ bloodGroup, city, availableOnly });
      // Fallback to sample data filtered by params
      if (results.length === 0) {
        results = SAMPLE_DONORS.filter((d) => {
          if (bloodGroup && d.bloodGroup !== bloodGroup) return false;
          if (city && d.city.toLowerCase() !== city.toLowerCase()) return false;
          if (availableOnly && !d.isAvailable) return false;
          return true;
        });
      }
      setDonors(results);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBloodGroup(''); setCity(''); setAvailableOnly(false);
    setDonors([]); setSearched(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg">
            <FiSearch size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Blood Donors</h1>
          <p className="text-gray-500 dark:text-gray-400">Search by blood group and city to find donors near you.</p>
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
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
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
                <input
                  type="text"
                  list="search-cities"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
                <datalist id="search-cities">
                  {INDIAN_CITIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            {/* Auto-detect */}
            <div className="flex items-end">
              <button
                onClick={detectLocation}
                disabled={geoLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <FiNavigation size={14} className={geoLoading ? 'animate-spin' : ''} />
                {geoLoading ? 'Detecting...' : 'Use My Location'}
              </button>
            </div>

            {/* Available Only */}
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 accent-red-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Available only</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-8 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-all shadow-md"
            >
              <FiSearch size={16} />
              {loading ? 'Searching...' : 'Search Donors'}
            </button>
            {searched && (
              <button onClick={handleReset} className="flex items-center gap-2 py-3 px-5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
                <FiRefreshCw size={14} />
                Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : searched ? (
          donors.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found <span className="font-bold text-gray-900 dark:text-white">{donors.length}</span> donor{donors.length !== 1 ? 's' : ''}
                  {bloodGroup && <> with <span className="font-bold text-red-600">{bloodGroup}</span></>}
                  {city && <> in <span className="font-bold text-red-600">{city}</span></>}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {donors.map((donor, i) => (
                  <DonorCard key={donor.id} donor={donor} index={i} />
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No donors found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                No donors match your criteria. Try a different blood group or city.
              </p>
              <button onClick={handleReset} className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm">
                Clear Filters
              </button>
            </motion.div>
          )
        ) : (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <FiFilter size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Use the filters above to search for donors.</p>
          </div>
        )}
      </div>
    </div>
  );
}
