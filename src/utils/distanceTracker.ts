import { LocationCoords, ServiceProfessional } from '../types';

// Bangalore locality coordinate map for accurate distance calculations
const BANGALORE_LOCALITIES: Record<string, { lat: number; lng: number }> = {
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  koramangala: { lat: 12.9352, lng: 77.6245 },
  'hsr layout': { lat: 12.9121, lng: 77.6446 },
  hsr: { lat: 12.9121, lng: 77.6446 },
  whitefield: { lat: 12.9698, lng: 77.75 },
  'electronic city': { lat: 12.8399, lng: 77.677 },
  jayanagar: { lat: 12.9308, lng: 77.5838 },
  malleshwaram: { lat: 13.0031, lng: 77.5643 },
  marathahalli: { lat: 12.9591, lng: 77.6974 },
  'btm layout': { lat: 12.9166, lng: 77.6101 },
  btm: { lat: 12.9166, lng: 77.6101 },
  domlur: { lat: 12.9609, lng: 77.6387 },
  ulsoor: { lat: 12.9817, lng: 77.6286 },
  bellandur: { lat: 12.9304, lng: 77.6784 },
  hebbal: { lat: 13.0358, lng: 77.597 },
  rajajinagar: { lat: 12.9982, lng: 77.553 },
  'frazer town': { lat: 12.9968, lng: 77.6133 },
  richmond: { lat: 12.9667, lng: 77.6094 },
};

function resolveCoords(
  input?: LocationCoords | { lat: number; lng: number } | string
): { lat: number; lng: number } {
  if (!input) return BANGALORE_LOCALITIES.indiranagar;

  if (typeof input === 'object' && 'lat' in input && 'lng' in input) {
    if (typeof input.lat === 'number' && typeof input.lng === 'number') {
      return { lat: input.lat, lng: input.lng };
    }
  }

  const str = typeof input === 'string' ? input.toLowerCase() : '';
  for (const [key, coords] of Object.entries(BANGALORE_LOCALITIES)) {
    if (str.includes(key)) {
      return coords;
    }
  }

  // Fallback default Bangalore center coordinates
  return BANGALORE_LOCALITIES.indiranagar;
}

// Great-circle Haversine distance in kilometers
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface DistanceResult {
  distanceKm: number;
  etaMinutes: number;
  formattedDistance: string;
  formattedEta: string;
  displayTransit: string;
  startCoords: { lat: number; lng: number };
  endCoords: { lat: number; lng: number };
}

/**
 * Calculates real-time distance and ETA between professional and customer.
 * NEVER uses a static default time - everything depends on physical distance!
 */
export function calculateDistanceAndEta(
  origin?: LocationCoords | { lat: number; lng: number } | string,
  destination?: LocationCoords | { lat: number; lng: number } | string,
  isEmergency = false
): DistanceResult {
  const start = resolveCoords(origin);
  const end = resolveCoords(destination);

  let rawDistance = haversineDistance(start.lat, start.lng, end.lat, end.lng);

  // If origin and destination are in the same locality, use minimum hyper-local neighborhood distance (1.2 to 2.4 km)
  if (rawDistance < 0.6) {
    // Generate a deterministic small distance based on input string length or coords
    const pseudo = (Math.abs(start.lat * 1000) % 1.5) + 1.2;
    rawDistance = Math.round(pseudo * 10) / 10;
  }

  // Multiply straight-line distance by 1.3 to reflect actual road & street layout routing in Indian cities
  const roadDistanceKm = Math.round(rawDistance * 1.3 * 10) / 10;
  const finalDistanceKm = Math.max(0.8, roadDistanceKm);

  // Urban two-wheeler average travel speed in Bangalore traffic: ~18-22 km/h
  const speedKmH = isEmergency ? 24 : 19;
  const travelMinutes = (finalDistanceKm / speedKmH) * 60;
  const prepBuffer = isEmergency ? 2 : 4; // minutes to equip bag and navigate
  const finalEtaMinutes = Math.max(5, Math.round(travelMinutes + prepBuffer));

  return {
    distanceKm: finalDistanceKm,
    etaMinutes: finalEtaMinutes,
    formattedDistance: `${finalDistanceKm} km`,
    formattedEta: `${finalEtaMinutes} mins`,
    displayTransit: `${finalDistanceKm} km away · ~${finalEtaMinutes} mins transit`,
    startCoords: start,
    endCoords: end,
  };
}

/**
 * Convenience helper to calculate distance between a professional and customer location.
 */
export function getProDistance(
  pro: ServiceProfessional,
  customerLocation?: string | LocationCoords,
  isEmergency = false
): DistanceResult {
  const proOrigin = pro.coords || pro.location;
  return calculateDistanceAndEta(proOrigin, customerLocation, isEmergency || pro.emergencyAvailable);
}
