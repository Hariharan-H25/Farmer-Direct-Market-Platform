import User from '../models/User.js';

// Haversine formula for distance calculation in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10; // Distance in km
};

export const getNearbyFarmers = async (req, res) => {
  const { lat, lng, district, maxDistance } = req.query;

  try {
    const userLat = lat ? parseFloat(lat) : 11.3410; // Default Erode lat
    const userLng = lng ? parseFloat(lng) : 77.7172; // Default Erode lng
    const maxDist = maxDistance ? parseFloat(maxDistance) : 50; // 50 km radius default

    const farmers = await User.find({ role: 'farmer' }).select('-password');

    const nearbyFarmers = farmers.map(farmer => {
      const farmerLat = farmer.location?.coordinates?.lat || (11.34 + (Math.random() * 0.1 - 0.05));
      const farmerLng = farmer.location?.coordinates?.lng || (77.71 + (Math.random() * 0.1 - 0.05));
      const distance = calculateDistance(userLat, userLng, farmerLat, farmerLng);

      return {
        _id: farmer._id,
        name: farmer.name,
        farmName: farmer.farmName || `${farmer.name}'s Organic Farm`,
        phone: farmer.phone,
        district: farmer.location?.district || 'Erode',
        state: farmer.location?.state || 'Tamil Nadu',
        isVerified: farmer.isVerified,
        coordinates: { lat: farmerLat, lng: farmerLng },
        distanceKm: distance
      };
    })
    .filter(f => f.distanceKm <= maxDist)
    .sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json(nearbyFarmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
