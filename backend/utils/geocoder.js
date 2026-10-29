import logger from './logger.js';

// Pre-compiled verified centroid coordinates for key Indian districts/cities,
// especially covering Tamil Nadu agriculture hubs and major Indian metros.
const KNOWN_COORDINATES = {
  // Tamil Nadu Agri Hubs & Major Cities
  'erode': { lat: 11.3410, lng: 77.7172 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'salem': { lat: 11.6643, lng: 78.1460 },
  'tirupur': { lat: 11.1085, lng: 77.3411 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'trichy': { lat: 10.7905, lng: 78.7047 },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'dindigul': { lat: 10.3673, lng: 77.9803 },
  'thanjavur': { lat: 10.7870, lng: 79.1378 },
  'tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'vellore': { lat: 12.9165, lng: 79.1325 },
  'namakkal': { lat: 11.2189, lng: 78.1674 },
  'karur': { lat: 10.9601, lng: 78.0766 },
  'dharmapuri': { lat: 12.1211, lng: 78.1582 },
  'krishnagiri': { lat: 12.5186, lng: 78.2137 },
  'perambalur': { lat: 11.2342, lng: 78.8819 },
  'pudukkottai': { lat: 10.3797, lng: 78.8208 },
  'theni': { lat: 10.0104, lng: 77.4768 },
  'kanyakumari': { lat: 8.0883, lng: 77.5385 },
  'cuddalore': { lat: 11.7480, lng: 79.7714 },
  'villupuram': { lat: 11.9401, lng: 79.4861 },
  'nagapattinam': { lat: 10.7672, lng: 79.8449 },
  'thiruvarur': { lat: 10.7725, lng: 79.6365 },
  'ariyalur': { lat: 11.1401, lng: 79.0786 },
  'nilgiris': { lat: 11.4102, lng: 76.6950 },
  'ooty': { lat: 11.4102, lng: 76.6950 },
  'ramanathapuram': { lat: 9.3639, lng: 78.8395 },
  'sivaganga': { lat: 9.8433, lng: 78.4809 },
  'virudhunagar': { lat: 9.5680, lng: 77.9624 },
  'thoothukudi': { lat: 8.7642, lng: 78.1348 },
  'tuticorin': { lat: 8.7642, lng: 78.1348 },
  'ranipet': { lat: 12.9272, lng: 79.3330 },
  'tirupathur': { lat: 12.4958, lng: 78.5678 },
  'chengalpattu': { lat: 12.6841, lng: 79.9836 },
  'tiruvallur': { lat: 13.1432, lng: 79.9079 },
  'tiruvannamalai': { lat: 12.2253, lng: 79.0747 },
  'kallakurichi': { lat: 11.7384, lng: 78.9639 },
  'tenkasi': { lat: 8.9594, lng: 77.3150 },
  'mayiladuthurai': { lat: 11.1075, lng: 79.6523 },

  // Pan-India Major Agricultural Centers
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'guntur': { lat: 16.3067, lng: 80.4365 },
  'vijayawada': { lat: 16.5062, lng: 80.6480 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'ludhiana': { lat: 30.9010, lng: 75.8573 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'palakkad': { lat: 10.7867, lng: 76.6548 }
};

/**
 * Normalizes query string for location lookup
 */
const cleanKey = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Resolves reliable GPS coordinates from address text or components.
 * 1. Checks if already valid coordinates are provided.
 * 2. Uses known accurate geographic dictionary.
 * 3. Attempts Nominatim geocoding if network allows.
 * 4. Fallback to state/region center.
 */
export const geocodeAddress = async (addressObj = {}) => {
  // If coordinates are already provided and valid, return them immediately
  if (
    addressObj.location &&
    typeof addressObj.location.lat === 'number' &&
    typeof addressObj.location.lng === 'number' &&
    !isNaN(addressObj.location.lat) &&
    !isNaN(addressObj.location.lng) &&
    addressObj.location.lat >= -90 && addressObj.location.lat <= 90 &&
    addressObj.location.lng >= -180 && addressObj.location.lng <= 180
  ) {
    return {
      lat: Number(addressObj.location.lat.toFixed(6)),
      lng: Number(addressObj.location.lng.toFixed(6)),
      source: 'provided'
    };
  }

  const city = cleanKey(addressObj.city);
  const district = cleanKey(addressObj.district);
  const state = cleanKey(addressObj.state);
  const rawAddress = addressObj.address || `${addressObj.city || ''} ${addressObj.district || ''} ${addressObj.state || ''}`;

  // 1. Check known coordinates dictionary by city or district
  if (KNOWN_COORDINATES[city]) {
    return { ...KNOWN_COORDINATES[city], source: 'database' };
  }
  if (KNOWN_COORDINATES[district]) {
    return { ...KNOWN_COORDINATES[district], source: 'database' };
  }

  // Check if any key appears within the address string
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (city.includes(key) || district.includes(key) || rawAddress.toLowerCase().includes(key)) {
      return { ...coords, source: 'database_match' };
    }
  }

  // 2. Online Geocoding via OpenStreetMap Nominatim with timeout
  try {
    const query = [addressObj.city, addressObj.district, addressObj.pincode, addressObj.state, 'India']
      .filter(Boolean)
      .join(', ');

    if (query.length > 5) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'FarmConnect-Platform/2.0' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), source: 'nominatim' };
          }
        }
      }
    }
  } catch (err) {
    logger.debug(`Online geocoding skipped for "${rawAddress}": ${err.message}`);
  }

  // 3. Fallback based on State / Tamil Nadu center
  if (state.includes('kerala')) {
    return { lat: 10.8505, lng: 76.2711, source: 'state_fallback' };
  }
  if (state.includes('karnataka')) {
    return { lat: 12.9716, lng: 77.5946, source: 'state_fallback' };
  }
  if (state.includes('andhra')) {
    return { lat: 16.5062, lng: 80.6480, source: 'state_fallback' };
  }
  if (state.includes('gujarat')) {
    return { lat: 22.2587, lng: 71.1924, source: 'state_fallback' };
  }
  if (state.includes('punjab')) {
    return { lat: 31.1471, lng: 75.3412, source: 'state_fallback' };
  }

  // Default to central Tamil Nadu (Erode/Coimbatore Agri belt)
  return { lat: 11.3410, lng: 77.7172, source: 'region_default' };
};

export default geocodeAddress;
