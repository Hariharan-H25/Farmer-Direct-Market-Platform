import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, CheckCircle2, AlertCircle, Loader2, Crosshair } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Custom Pin Icon for Dropoff Pin
const createCustomerPinIcon = () => {
  return L.divIcon({
    className: 'custom-dropoff-pin',
    html: `
      <div style="
        background: #0F5A32;
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        border: 2px solid #ffffff;
      ">
        <span style="transform: rotate(45deg); font-size: 18px;">📍</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const AddressMapPicker = ({
  initialLocation,
  onLocationConfirmed,
  readOnly = false,
  savedAddressLabel = ''
}) => {
  const { theme } = useTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Default coordinate: Central Tamil Nadu (Salem/Namakkal agri corridor)
  const defaultLat = 11.6643;
  const defaultLng = 78.1460;

  const [currentCoords, setCurrentCoords] = useState(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      return { lat: Number(initialLocation.lat), lng: Number(initialLocation.lng) };
    }
    return { lat: defaultLat, lng: defaultLng };
  });

  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [confirmed, setConfirmed] = useState(Boolean(initialLocation?.lat && initialLocation?.lng));
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState(null);

  // Sync if initialLocation changes (e.g. user toggles between saved addresses)
  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      const lat = Number(initialLocation.lat);
      const lng = Number(initialLocation.lng);
      setCurrentCoords({ lat, lng });
      setConfirmed(true);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
      }
    }
  }, [initialLocation?.lat, initialLocation?.lng]);

  // Reverse geocoding helper
  const performReverseGeocode = useCallback(async (lat, lng) => {
    setReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const parsed = {
          streetArea: addr.suburb || addr.neighbourhood || addr.road || addr.village || '',
          city: addr.city || addr.town || addr.village || addr.county || 'City',
          district: addr.state_district || addr.county || '',
          state: addr.state || 'Tamil Nadu',
          pincode: addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : ''
        };
        setDetectedAddress(parsed);
        return parsed;
      }
    } catch (err) {
      console.warn("Reverse geocode failed:", err.message);
    } finally {
      setReverseGeocoding(false);
    }
    return null;
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapContainerRef.current._leaflet_id && !mapInstanceRef.current) {
      delete mapContainerRef.current._leaflet_id;
    }

    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [currentCoords.lat, currentCoords.lng],
          zoom: initialLocation?.lat ? 14 : 11,
          scrollWheelZoom: false,
          attributionControl: false
        });

        // Add Tile Layer
        const tileUrl = theme === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

        // Add marker
        const pinIcon = createCustomerPinIcon();
        const marker = L.marker([currentCoords.lat, currentCoords.lng], {
          icon: pinIcon,
          draggable: !readOnly
        }).addTo(map);

        if (!readOnly) {
          marker.on('dragend', async () => {
            const pos = marker.getLatLng();
            setCurrentCoords({ lat: pos.lat, lng: pos.lng });
            setConfirmed(false);
            const addrData = await performReverseGeocode(pos.lat, pos.lng);
            if (onLocationConfirmed) {
              onLocationConfirmed({ lat: pos.lat, lng: pos.lng }, addrData, false);
            }
          });

          // Allow clicking map to place pin
          map.on('click', async (e) => {
            marker.setLatLng(e.latlng);
            setCurrentCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
            setConfirmed(false);
            const addrData = await performReverseGeocode(e.latlng.lat, e.latlng.lng);
            if (onLocationConfirmed) {
              onLocationConfirmed({ lat: e.latlng.lat, lng: e.latlng.lng }, addrData, false);
            }
          });
        }

        markerRef.current = marker;
        mapInstanceRef.current = map;
      } catch (err) {
        console.warn('Map initialization error:', err.message);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
        delete mapContainerRef.current._leaflet_id;
      }
    };
  }, []);

  // Update theme tiles dynamically
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapInstanceRef.current);
  }, [theme]);

  // Request Browser Geolocation
  const handleRequestGps = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your current browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCurrentCoords(newCoords);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }

        const addrData = await performReverseGeocode(latitude, longitude);
        setConfirmed(true);
        if (onLocationConfirmed) {
          onLocationConfirmed(newCoords, addrData, true);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setGpsError('Location permission was denied. You can click anywhere on the map or enter your address manually.');
        } else if (err.code === 2) {
          setGpsError('GPS position unavailable. Please adjust the map pin or enter address manually.');
        } else {
          setGpsError(`GPS request timed out. Please drag the pin on the map.`);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Explicit Pin Confirmation Button
  const handleConfirmPin = async () => {
    let addr = detectedAddress;
    if (!addr) {
      addr = await performReverseGeocode(currentCoords.lat, currentCoords.lng);
    }
    setConfirmed(true);
    if (onLocationConfirmed) {
      onLocationConfirmed(currentCoords, addr, true);
    }
  };

  return (
    <div className="space-y-3 bg-gray-50 dark:bg-gray-900/60 p-3.5 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
      {/* Header with Title and GPS Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-white">
            <MapPin size={16} className="text-primary dark:text-emerald-400" />
            <span>Pinpoint Delivery Destination on Map</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {readOnly 
              ? `Delivery pin confirmed at ${savedAddressLabel || 'saved destination'}`
              : 'Drag the pin or click on the map to mark your exact delivery entrance'}
          </p>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={handleRequestGps}
            disabled={locating}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
          >
            {locating ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
            <span>{locating ? 'Locating device...' : 'Use My Current Location'}</span>
          </button>
        )}
      </div>

      {/* GPS Error notice */}
      {gpsError && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 p-2.5 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-amber-600" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Map Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
        <div ref={mapContainerRef} className="h-56 sm:h-64 w-full z-10" />

        {/* Center crosshair guide (subtle visual assist) */}
        {!readOnly && (
          <div className="absolute top-2 right-2 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-[10px] font-bold text-gray-600 dark:text-gray-300 shadow">
            Click map to move pin
          </div>
        )}
      </div>

      {/* Footer Controls: Coordinates & Confirmation Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
          Lat: <strong>{currentCoords.lat.toFixed(5)}</strong>, Lng: <strong>{currentCoords.lng.toFixed(5)}</strong>
          {reverseGeocoding && <span className="ml-2 text-emerald-600 dark:text-emerald-400 animate-pulse">Resolving address...</span>}
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={handleConfirmPin}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              confirmed 
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-primary hover:bg-emerald-700 text-white shadow-md'
            }`}
          >
            <CheckCircle2 size={14} className={confirmed ? "text-emerald-600 dark:text-emerald-400" : ""} />
            <span>{confirmed ? 'Delivery Pin Confirmed' : 'Confirm Delivery Pin'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressMapPicker;
