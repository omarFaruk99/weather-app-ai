"use client";

import { CurrentWeather } from "@/components/current-weather";
import { Forecast } from "@/components/forecast";
import { SearchBox } from "@/components/search-box";
import { getWeather, type GeocodingResult, type WeatherData } from "@/lib/api";
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
      try {
        // Default to Dhaka, Bangladesh
        const data = await getWeather(23.8103, 90.4125);
        setWeather(data);
        setCity("Dhaka, Bangladesh");
      } catch (err) {
        setError("Failed to load weather data");
      } finally {
        setLoading(false);
      }
    }
    initWeather();
  }, []);

  const handleCitySelect = (result: GeocodingResult) => {
    fetchWeather(result.latitude, result.longitude, result.name);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-2xl backdrop-blur-sm border border-primary/20">
              <CloudSun className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Weather<span className="text-primary">App</span></h1>
          </div>
          <SearchBox onCitySelect={handleCitySelect} />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-200 bg-red-900/20 p-6 rounded-3xl border border-red-500/20 backdrop-blur-md">
            {error}
          </div>
        ) : weather ? (
          <div className="space-y-8">
            <CurrentWeather data={weather} city={city} />
            <Forecast data={weather} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
