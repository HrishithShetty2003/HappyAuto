// src/services/geoUtils.js

// Haversine Formula to calculate distance in Kilometers
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Calculate Cost (Logic: Base ₹50 + ₹15 per km)
export const calculateCost = (distanceKm) => {
  const baseRate = 50;
  const perKmRate = 15;
  const total = baseRate + (distanceKm * perKmRate);
  return Math.round(total);
};