import { WeatherData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Droplets, Eye, Gauge, Leaf, Sun, Wind } from "lucide-react";
import { useUnit } from "./unit-context";
import { WeatherIcon } from "./weather-icon";

interface CurrentWeatherProps {
  data: WeatherData;
  city: string;
}

export function CurrentWeather({ data, city }: CurrentWeatherProps) {
  const { current, daily } = data;
  const { unit, toggleUnit } = useUnit();

  const convertTemp = (temp: number) => {
    if (unit === "fahrenheit") {
      return Math.round((temp * 9) / 5 + 32);
    }
    return Math.round(temp);
  };

  const temp = convertTemp(current.temperature_2m);
  const high = convertTemp(daily.temperature_2m_max[0]);
  const low = convertTemp(daily.temperature_2m_min[0]);

  const getAqiLabel = (aqi?: number) => {
    if (!aqi) return "N/A";
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  const getAqiColor = (aqi?: number) => {
    if (!aqi) return "text-muted-foreground";
    if (aqi <= 50) return "text-green-400";
    if (aqi <= 100) return "text-yellow-400";
    if (aqi <= 150) return "text-orange-400";
    if (aqi <= 200) return "text-red-400";
    if (aqi <= 300) return "text-purple-400";
    return "text-rose-900";
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="relative overflow-hidden rounded-[2rem] bg-card/40 p-8 text-foreground border border-white/10 shadow-2xl backdrop-blur-md">
        {/* Header with Unit Toggle */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-5xl font-bold tracking-tight text-white">{city}</h2>
            <p className="text-xl text-blue-100/80 mt-2 font-medium">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-4">
             <button
              onClick={toggleUnit}
              className="flex items-center gap-1 bg-black/40 rounded-full p-1.5 border border-white/10 backdrop-blur-md transition-all active:scale-95 hover:bg-black/60 shadow-lg"
            >
              <span className={cn("px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300", unit === "celsius" ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-white")}>°C</span>
              <span className={cn("px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300", unit === "fahrenheit" ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-white")}>°F</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            
            <div className="flex items-center gap-8 mt-2">
              <span className="text-9xl font-bold tracking-tighter text-white drop-shadow-lg">
                {temp}°
              </span>
              <div className="flex flex-col items-center gap-3">
                <WeatherIcon code={current.weather_code} className="h-20 w-20 text-primary drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]" />
                <span className="text-2xl font-medium text-white">
                  {weatherCodes[current.weather_code]?.label || "Clear"}
                </span>
              </div>
            </div>

            <div className="flex gap-8 text-xl font-medium text-blue-100/80">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-6 w-6 text-red-400" />
                <span>High: <span className="text-white">{high}°</span></span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown className="h-6 w-6 text-blue-400" />
                <span>Low: <span className="text-white">{low}°</span></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricCard icon={Wind} label="Wind" value={`${current.wind_speed_10m} km/h`} />
            <MetricCard icon={Droplets} label="Humidity" value={`${current.relative_humidity_2m}%`} />
            <MetricCard icon={Gauge} label="Pressure" value={`${current.surface_pressure} hPa`} />
            <MetricCard icon={Sun} label="UV Index" value={daily.uv_index_max[0]} />
            <MetricCard icon={Eye} label="Visibility" value={`${(current.visibility || 0) / 1000} km`} />
            <div className="bg-white/10 rounded-2xl p-6 flex flex-col gap-2 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all duration-300 group shadow-lg">
              <div className="flex items-center gap-2 text-blue-200 group-hover:text-primary transition-colors">
                <Leaf className="h-5 w-5" />
                <span className="text-sm font-medium">Air Quality</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">{current.us_aqi || "N/A"}</span>
                <span className={cn("text-sm font-bold mt-1", getAqiColor(current.us_aqi))}>
                  {getAqiLabel(current.us_aqi)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 flex flex-col gap-2 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all duration-300 group shadow-lg">
      <div className="flex items-center gap-2 text-blue-200 group-hover:text-primary transition-colors">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-3xl font-bold text-white">{value}</span>
    </div>
  );
}

import { weatherCodes } from "@/lib/api";
