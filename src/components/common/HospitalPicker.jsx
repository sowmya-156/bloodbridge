// src/components/common/HospitalPicker.jsx
// OpenStreetMap hospital location picker with search
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { FiSearch, FiMapPin, FiX, FiNavigation, FiCheck } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom red marker for hospital
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map click and move marker
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to fly map to new location
function MapFlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 15, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

export default function HospitalPicker({ onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
  const [detectingLocation, setDetectingLocation] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Search hospitals using Nominatim
  const searchHospitals = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' hospital India')}&format=json&limit=6&addressdetails=1&countrycodes=in`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchHospitals(val), 500);
  };

  const handleResultSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const location = {
      lat, lng,
      name: result.display_name.split(',').slice(0, 2).join(', '),
      fullAddress: result.display_name,
    };
    setSelectedLocation(location);
    setMapCenter({ lat, lng });
    setSearchResults([]);
    setSearchQuery(location.name);
  };

  const handleMapClick = async (lat, lng) => {
    // Reverse geocode clicked point
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const name = data.address?.amenity ||
                   data.address?.building ||
                   data.address?.road ||
                   data.display_name.split(',')[0];
      setSelectedLocation({
        lat, lng,
        name: name,
        fullAddress: data.display_name,
      });
      setSearchQuery(name);
    } catch {
      setSelectedLocation({ lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, fullAddress: '' });
    }
  };

  const handleDetectMyLocation = () => {
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const name = data.address?.amenity || data.address?.road || 'My Location';
          setSelectedLocation({ lat, lng, name, fullAddress: data.display_name });
          setSearchQuery(name);
          setMapCenter({ lat, lng });
        } catch {
          setSelectedLocation({ lat, lng, name: 'My Location', fullAddress: '' });
          setMapCenter({ lat, lng });
        }
        setDetectingLocation(false);
      },
      () => {
        alert('Could not get your location. Please search manually.');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiMapPin className="text-red-600" size={18} />
              Select Hospital Location
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Search, use your live location, or click on the map
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Search hospital name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                autoFocus
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={handleDetectMyLocation}
              disabled={detectingLocation}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-medium whitespace-nowrap shadow-sm"
              title="Use my current GPS location — works even if your hospital isn't listed"
            >
              <FiNavigation size={14} className={detectingLocation ? 'animate-spin' : ''} />
              {detectingLocation ? 'Getting...' : 'My Location'}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <FiNavigation size={10} className="shrink-0" />
            At the hospital now? Tap "My Location" — works even if it's not listed in search.
          </p>

          {/* Tip for when hospital not found */}
          {searchQuery.length >= 3 && searchResults.length === 0 && !searching && (
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold mb-1">🏥 Hospital not found in search?</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500 leading-relaxed">
                <strong>Easiest fix:</strong> If you are currently at the hospital, tap <strong>"My Location"</strong> above — it will pin your exact GPS position, which works even if the hospital isn't listed on the map.<br/>
                <strong>Or manually:</strong> Search your city/area name to navigate the map there, then click exactly where the hospital is. A red pin will appear — tap "Use This Location" below.
              </p>
            </div>
          )}

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => handleResultSelect(result)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <FiMapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                      {result.display_name.split(',').slice(0, 2).join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {result.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 min-h-0 p-4">
          <div className="h-48 sm:h-56 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              <MapFlyTo coords={selectedLocation} />
              {selectedLocation && (
                <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={hospitalIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{selectedLocation.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedLocation.fullAddress?.split(',').slice(0, 3).join(', ')}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-2 text-center">
            💡 Can't find your hospital in search? <strong>Click directly on the map</strong> where your hospital is located and a pin will drop there!
          </p>
        </div>

        {/* Selected location + confirm */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {selectedLocation ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <FiMapPin size={14} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">{selectedLocation.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md text-sm whitespace-nowrap"
              >
                <FiCheck size={15} />
                Use This Location
              </button>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 dark:text-gray-600 py-2">
              Search for a hospital or click on the map to select location
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
