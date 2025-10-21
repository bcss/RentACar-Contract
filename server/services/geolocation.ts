interface GeolocationData {
  country?: string;
  city?: string;
  region?: string;
}

export async function getGeolocation(ipAddress: string): Promise<GeolocationData> {
  if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('::ffff:127.')) {
    return {
      country: 'localhost',
      city: 'localhost',
      region: 'localhost',
    };
  }

  try {
    const cleanIp = ipAddress.replace('::ffff:', '');
    
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

    return {
      country: data.country || undefined,
      city: data.city || undefined,
      region: data.regionName || undefined,
    };
  } catch (error) {
    console.error(`Error fetching geolocation for IP ${ipAddress}:`, error);
    return {};
  }
}
