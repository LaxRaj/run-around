import type { DifficultyLevel } from '@/constants/colors';

const ORS_BASE = 'https://api.openrouteservice.org/v2';

// ORS profile: hard uses hiking with a steepness preference; easy uses walking
const PROFILE: Record<DifficultyLevel, string> = {
  easy: 'foot-walking',
  moderate: 'foot-hiking',
  hard: 'foot-hiking',
};

// Weight towards hillier terrain for hard difficulty
const EXTRA_OPTIONS: Record<DifficultyLevel, Record<string, unknown>> = {
  easy: {},
  moderate: {},
  hard: { steepness_difficulty: { level: 3 } },
};

export interface ORSRoute {
  /** GeoJSON [longitude, latitude] coordinate pairs */
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  ascentMeters: number;
}

export class ORSError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ORSError';
  }
}

export async function fetchRoundTripRoute(
  latitude: number,
  longitude: number,
  miles: number,
  difficulty: DifficultyLevel,
  seed = Math.floor(Math.random() * 9999),
): Promise<ORSRoute> {
  const apiKey = process.env.EXPO_PUBLIC_ORS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_ORS_KEY_HERE') {
    throw new ORSError(0, 'ORS API key not configured. Copy .env.example → .env and add your key.');
  }

  const distanceMeters = miles * 1609.344;
  const profile = PROFILE[difficulty];

  const body = {
    coordinates: [[longitude, latitude]],
    options: {
      round_trip: {
        length: distanceMeters,
        points: 3,
        seed,
      },
      ...EXTRA_OPTIONS[difficulty],
    },
    elevation: true,
  };

  const res = await fetch(`${ORS_BASE}/directions/${profile}/geojson`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ORSError(res.status, `Route generation failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    features: Array<{
      geometry: { coordinates: number[][] };
      properties: {
        summary: { distance: number; duration: number };
        ascent?: number;
      };
    }>;
  };

  const feature = data.features[0];
  if (!feature) throw new ORSError(200, 'ORS returned no route features.');

  const coordinates: [number, number][] = feature.geometry.coordinates.map(
    (c) => [c[0], c[1]] as [number, number],
  );

  return {
    coordinates,
    distanceMeters: feature.properties.summary.distance,
    durationSeconds: feature.properties.summary.duration,
    ascentMeters: feature.properties.ascent ?? 0,
  };
}

/** Compute the [west, south, east, north] bounding box of a set of coordinates. */
export function routeBounds(
  coords: [number, number][],
): [number, number, number, number] {
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  for (const [lng, lat] of coords) {
    if (lng < west) west = lng;
    if (lat < south) south = lat;
    if (lng > east) east = lng;
    if (lat > north) north = lat;
  }
  return [west, south, east, north];
}

export function metersToMiles(m: number): string {
  return (m / 1609.344).toFixed(1);
}

export function secondsToMinutes(s: number): string {
  return Math.round(s / 60).toString();
}

export function metersToFeet(m: number): string {
  return Math.round(m * 3.28084).toString();
}
