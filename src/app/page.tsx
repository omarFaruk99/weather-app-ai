"use client";

import { CurrentWeather } from "@/components/current-weather";
import { Forecast } from "@/components/forecast";
import { SearchBox } from "@/components/search-box";
import { getCityName, getWeather, type GeocodingResult, type WeatherData } from "@/lib/api";
import { CloudSun, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState<string>("London");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number, cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeather(lat, lon);
      setWeather(data);
      setCity(cityName);
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initWeather() {
      setLoading(true);
      
      // Function to load default location (Dhaka)
      const loadDefaultLocation = async () => {
        try {
          const data = await getWeather(23.8103, 90.4125);
          setWeather(data);
          setCity("Dhaka, Bangladesh");
        } catch (err) {
          setError("Failed to load weather data");
        } finally {
          setLoading(false);
        }
      };

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const weatherData = await getWeather(latitude, longitude);
              setWeather(weatherData);
              
              // Try to get city name, but don't fail if it doesn't work
              try {
                const cityName = await getCityName(latitude, longitude);
                setCity(cityName);
              } catch (geoError) {
                console.warn("Reverse geocoding failed, using coordinates:", geoError);
                setCity(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
              }
            } catch (err) {
              console.error("Error fetching location data:", err);
              await loadDefaultLocation();
            } finally {
              setLoading(false);
            }
          },
          async (error) => {
            console.warn("Geolocation denied or failed:", error);
            await loadDefaultLocation();
          }
        );
      } else {
        console.warn("Geolocation not supported");
        await loadDefaultLocation();
      }
    }
    initWeather();
  }, []);

  const handleCitySelect = (result: GeocodingResult) => {
    fetchWeather(result.latitude, result.longitude, result.name);
  };

  return (
    <main className="min-h-screen md:h-screen w-full p-3 md:p-4 lg:p-5 overflow-y-auto md:overflow-hidden flex flex-col bg-transparent text-foreground transition-all duration-500 relative z-10">
      <div className="w-full max-w-[1600px] mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="flex-none flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 md:mb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/20 p-2 rounded-xl backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
              <CloudSun className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Weather<span className="text-primary">App</span></h1>
          </div>
          <SearchBox onCitySelect={handleCitySelect} />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-red-200 bg-red-900/20 p-6 rounded-3xl border border-red-500/20 backdrop-blur-md">
              {error}
            </div>
          </div>
        ) : weather ? (
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            {/* Left Column: Current Weather */}
            <div className="md:col-span-5 h-full overflow-y-auto scrollbar-hide">
              <CurrentWeather data={weather} city={city} />
            </div>
            
            {/* Right Column: Forecast */}
            <div className="md:col-span-7 h-full overflow-y-auto scrollbar-hide">
              <Forecast data={weather} />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
