export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id?: number;
  admin2_id?: number;
  admin3_id?: number;
  admin4_id?: number;
  timezone: string;
  population?: number;
  postcodes?: string[];
  country_id?: number;
  country: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
}

export interface WeatherData {
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    us_aqi?: number;
    uv_index?: number;
    visibility?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    visibility: number[];
    relative_humidity_2m: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_probability_max: number[];
  };
  current_units: any;
  hourly_units: any;
  daily_units: any;
}

export async function searchCity(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 2) return [];
  
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=5&language=en&format=json`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch city data");
  }

  const data = await response.json();
  return data.results || [];
}

export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
    ].join(","),
    hourly: ["temperature_2m", "weather_code", "visibility", "relative_humidity_2m"].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_probability_max",
    ].join(","),
    timezone: "auto",
  });

  // Fetch Weather Data
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const weatherData = await weatherResponse.json();

  // Fetch Air Quality Data (separate API endpoint)
  const aqiParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "us_aqi",
  });

  const aqiResponse = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${aqiParams.toString()}`
  );

  if (aqiResponse.ok) {
    const aqiData = await aqiResponse.json();
    if (aqiData.current && aqiData.current.us_aqi) {
      weatherData.current.us_aqi = aqiData.current.us_aqi;
    }
  }

  return weatherData;
}

export const weatherCodes: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "Sun" },
  1: { label: "Mainly clear", icon: "SunDim" },
  2: { label: "Partly cloudy", icon: "CloudSun" },
  3: { label: "Overcast", icon: "Cloud" },
  45: { label: "Fog", icon: "CloudFog" },
  48: { label: "Depositing rime fog", icon: "CloudFog" },
  51: { label: "Light drizzle", icon: "CloudDrizzle" },
  53: { label: "Moderate drizzle", icon: "CloudDrizzle" },
  55: { label: "Dense drizzle", icon: "CloudDrizzle" },
  56: { label: "Light freezing drizzle", icon: "CloudHail" },
  57: { label: "Dense freezing drizzle", icon: "CloudHail" },
  61: { label: "Slight rain", icon: "CloudRain" },
  63: { label: "Moderate rain", icon: "CloudRain" },
  65: { label: "Heavy rain", icon: "CloudRain" },
  66: { label: "Light freezing rain", icon: "CloudHail" },
  67: { label: "Heavy freezing rain", icon: "CloudHail" },
  71: { label: "Slight snow fall", icon: "CloudSnow" },
  73: { label: "Moderate snow fall", icon: "CloudSnow" },
  75: { label: "Heavy snow fall", icon: "CloudSnow" },
  77: { label: "Snow grains", icon: "CloudSnow" },
  80: { label: "Slight rain showers", icon: "CloudRain" },
  81: { label: "Moderate rain showers", icon: "CloudRain" },
  82: { label: "Violent rain showers", icon: "CloudRain" },
  85: { label: "Slight snow showers", icon: "CloudSnow" },
  86: { label: "Heavy snow showers", icon: "CloudSnow" },
  95: { label: "Thunderstorm", icon: "CloudLightning" },
  96: { label: "Thunderstorm with slight hail", icon: "CloudLightning" },
  99: { label: "Thunderstorm with heavy hail", icon: "CloudLightning" },
};

export async function getCityName(lat: number, lon: number): Promise<string> {
  try {
    // Using BigDataCloud's free reverse geocoding API (no CORS issues)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    
    if (!response.ok) {
      console.warn("Reverse geocoding failed:", response.status);
      return "Unknown Location";
    }
    
    const data = await response.json();
    
    // Extract city and country from the response
    const city = data.city || data.locality || data.principalSubdivision;
    const country = data.countryName;
    
    if (city && country) {
      return `${city}, ${country}`;
    } else if (city) {
      return city;
    } else if (country) {
      return country;
    }
    
    return "Unknown Location";
  } catch (error) {
    console.error("Failed to reverse geocode:", error);
    return "Unknown Location";
  }
}
