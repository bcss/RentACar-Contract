interface GeolocationData {
  country?: string;
  city?: string;
  region?: string;
}

const geoCache = new Map<string, { data: GeolocationData; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function getGeolocation(ipAddress: string): Promise<GeolocationData> {
  if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('::ffff:127.')) {
    return {
      country: 'localhost',
      city: 'localhost',
      region: 'localhost',
    };
  }

  const cleanIp = ipAddress.replace('::ffff:', '');

  const cached = geoCache.get(cleanIp);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,message,country,city,regionName`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      console.warn(`Geolocation API returned ${response.status} for IP ${cleanIp}`);
      return {};
    }

    const data = await response.json();

    if (data.status === 'fail') {
      console.warn(`Geolocation API failed for IP ${cleanIp}: ${data.message}`);
      return {};
    }

    const geoData = {
      country: data.country || undefined,
      city: data.city || undefined,
      region: data.regionName || undefined,
    };

    geoCache.set(cleanIp, {
      data: geoData,
      timestamp: Date.now(),
    });

    return geoData;
  } catch (error) {
    console.error(`Error fetching geolocation for IP ${ipAddress}:`, error);
    return {};
  }
}

export function clearGeoCache(): void {
  geoCache.clear();
}
