import { WeatherData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Cloud, Droplets, Eye, Gauge, Leaf, Sun, Sunrise, Sunset, Thermometer, Umbrella, Wind } from "lucide-react";
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

  // Calculate sun position percentage (0-100) based on current time
  const calculateSunPosition = () => {
    const now = new Date();
    const sunrise = new Date(daily.sunrise[0]);
    const sunset = new Date(daily.sunset[0]);
    
    const totalDaylight = sunset.getTime() - sunrise.getTime();
    const elapsed = now.getTime() - sunrise.getTime();
    
    if (elapsed < 0) return 0; // Before sunrise
    if (elapsed > totalDaylight) return 100; // After sunset
    
    return (elapsed / totalDaylight) * 100;
  };

  const sunPosition = calculateSunPosition();
  const isDaytime = sunPosition > 0 && sunPosition < 100;

  return (
    <div className="w-full h-full animate-fade-in flex flex-col">
      <div className="relative flex-1 overflow-y-auto scrollbar-hide rounded-[2rem] bg-black/20 p-3 md:p-4 lg:p-5 text-foreground border border-white/10 shadow-2xl backdrop-blur-md flex flex-col gap-3 md:gap-4">
        {/* Header with Unit Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white">{city}</h2>
            <p className="text-sm md:text-base text-blue-100/80 mt-0.5 font-medium">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
             <button
              onClick={toggleUnit}
              className="flex items-center gap-0.5 bg-black/40 rounded-full p-1 border border-white/10 backdrop-blur-md transition-all active:scale-95 hover:bg-black/60 shadow-lg"
            >
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300", unit === "celsius" ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-white")}>°C</span>
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300", unit === "fahrenheit" ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-white")}>°F</span>
            </button>
          </div>
        </div>

        {/* Main Weather Display */}
        <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
              <span className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white drop-shadow-lg">
                {temp}°
              </span>
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <WeatherIcon code={current.weather_code} className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 text-primary drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]" />
                <span className="text-sm md:text-base lg:text-lg font-medium text-white text-center">
                  {weatherCodes[current.weather_code]?.label || "Clear"}
                </span>
              </div>
            </div>

            <div className="flex gap-4 md:gap-5 text-sm md:text-base lg:text-lg font-medium text-blue-100/80">
              <div className="flex items-center gap-1.5">
                <ArrowUp className="h-4 w-4 md:h-5 md:w-5 text-red-400" />
                <span>High: <span className="text-white">{high}°</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowDown className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                <span>Low: <span className="text-white">{low}°</span></span>
              </div>
            </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-2.5 lg:gap-3">
            <MetricCard icon={Wind} label="Wind" value={`${current.wind_speed_10m} km/h`} />
            <MetricCard icon={Droplets} label="Humidity" value={`${current.relative_humidity_2m}%`} />
            <MetricCard icon={Gauge} label="Pressure" value={`${current.surface_pressure} hPa`} />
            <MetricCard icon={Sun} label="UV Index" value={daily.uv_index_max[0]} />
            <MetricCard icon={Eye} label="Visibility" value={`${(current.visibility || 0) / 1000} km`} />
            <MetricCard icon={Thermometer} label="Feels Like" value={`${Math.round(current.apparent_temperature)}°`} />
            <MetricCard icon={Cloud} label="Cloud Cover" value={`${current.cloud_cover}%`} />
            <MetricCard icon={Umbrella} label="Precipitation" value={`${current.precipitation} mm`} />
            <div className="bg-white/5 rounded-xl p-3 md:p-3.5 lg:p-4 flex flex-col gap-0.5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 group shadow-lg">
              <div className="flex items-center gap-1.5 text-blue-200 group-hover:text-primary transition-colors">
                <Leaf className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-xs font-medium">Air Quality</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-bold text-white">{current.us_aqi || "N/A"}</span>
                <span className={cn("text-xs font-bold mt-0.5", getAqiColor(current.us_aqi))}>
                  {getAqiLabel(current.us_aqi)}
                </span>
              </div>
            </div>
          </div>

        {/* Sunrise/Sunset Arc - Only on large screens */}
        <div className="hidden lg:block">
          <div className="relative w-full h-32 bg-gradient-to-b from-blue-900/20 via-orange-500/10 to-transparent rounded-2xl p-4 border border-white/5 overflow-visible">
            {/* Sky gradient background */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className={cn(
                "absolute inset-0 transition-opacity duration-1000",
                isDaytime 
                  ? "bg-gradient-to-r from-blue-400/20 via-yellow-300/20 to-orange-400/20" 
                  : "bg-gradient-to-r from-indigo-900/30 via-purple-800/20 to-blue-900/30"
              )} />
            </div>

            {/* Arc path */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
              {/* Glow effect under the arc */}
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FDB813" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#FFD700" stopOpacity="1" />
                  <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Arc line */}
              <path
                d="M 15 50 Q 100 10, 185 50"
                fill="none"
                stroke="url(#arcGradient)"
                strokeWidth="3"
                filter="url(#glow)"
                className="drop-shadow-lg"
              />
            </svg>
            
            {/* Sun position */}
            <div 
              className="absolute top-0 w-full h-full group"
              style={{
                left: `${sunPosition}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="relative group pointer-events-auto">
                {/* Sun with realistic glow */}
                <div 
                  className="absolute transition-all duration-500 hover:scale-150 cursor-pointer"
                  style={{
                    left: '50%',
                    top: `${55 - Math.sin((sunPosition / 100) * Math.PI) * 40}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Outer glow rings */}
                  <div className={cn(
                    "absolute inset-0 rounded-full blur-xl transition-all duration-500",
                    isDaytime 
                      ? "bg-yellow-400/40 w-16 h-16 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" 
                      : "bg-blue-400/20 w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                  )} />
                  
                  {/* Middle glow */}
                  <div className={cn(
                    "absolute inset-0 rounded-full blur-md transition-all duration-500",
                    isDaytime 
                      ? "bg-yellow-300/60 w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" 
                      : "bg-blue-300/30 w-10 h-10 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                  )} />
                  
                  {/* Sun core */}
                  <div className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
                    isDaytime 
                      ? "bg-gradient-to-br from-yellow-200 via-yellow-400 to-orange-500 shadow-yellow-400/80" 
                      : "bg-gradient-to-br from-blue-300 via-blue-400 to-indigo-500 shadow-blue-400/40"
                  )}>
                    {/* Sun rays animation */}
                    {isDaytime && (
                      <>
                        <div className="absolute inset-0 animate-spin-slow">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-0.5 h-3 bg-gradient-to-t from-yellow-300 to-transparent"
                              style={{
                                left: '50%',
                                top: '-12px',
                                transform: `translateX(-50%) rotate(${i * 45}deg)`,
                                transformOrigin: 'center 22px'
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    <Sun className={cn("h-5 w-5 relative z-10", isDaytime ? "text-yellow-900" : "text-blue-100")} />
                  </div>
                </div>
                
                {/* Enhanced Tooltip - Positioned to the right of sun */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 ml-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-[100] group-hover:scale-105 whitespace-nowrap pointer-events-auto">
                  <div className="bg-gradient-to-br from-black/95 to-black/90 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-3.5 shadow-2xl shadow-yellow-500/20">
                    <div className="text-xs text-white space-y-2">
                      <div className="font-bold text-center mb-2 text-yellow-300 text-sm">
                        {isDaytime ? "☀️ Daytime" : sunPosition === 0 ? "🌅 Before Sunrise" : "🌙 After Sunset"}
                      </div>
                      <div className="flex items-center justify-between gap-3 bg-white/5 rounded-lg p-1.5">
                        <span className="text-orange-300 flex items-center gap-1">
                          <Sunrise className="h-3.5 w-3.5" /> Sunrise
                        </span>
                        <span className="font-bold text-orange-200">{new Date(daily.sunrise[0]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 bg-white/5 rounded-lg p-1.5">
                        <span className="text-red-300 flex items-center gap-1">
                          <Sunset className="h-3.5 w-3.5" /> Sunset
                        </span>
                        <span className="font-bold text-red-200">{new Date(daily.sunset[0]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-yellow-500/20">
                        <span className="text-yellow-200 flex items-center gap-1">
                          <span className="text-base">⏱️</span> Daylight
                        </span>
                        <span className="font-bold text-yellow-100">
                          {(() => {
                            const sunrise = new Date(daily.sunrise[0]);
                            const sunset = new Date(daily.sunset[0]);
                            const hours = Math.floor((sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60));
                            const minutes = Math.floor(((sunset.getTime() - sunrise.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
                            return `${hours}h ${minutes}m`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sunrise marker - Live emoji design */}
            <div className="absolute left-4 bottom-3 flex flex-col items-center z-10 group/sunrise">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full mb-1.5">
                {/* Animated pulsing glow background */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/40 via-orange-400/40 to-amber-500/40 animate-pulse blur-xl"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300/30 to-yellow-500/30 blur-lg group-hover/sunrise:blur-2xl transition-all"></div>
                
                {/* Rotating rays effect */}
                <div className="absolute inset-0 animate-spin-slow opacity-50">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-4 bg-gradient-to-t from-yellow-400/60 to-transparent rounded-full"
                      style={{
                        left: '50%',
                        top: '-8px',
                        transform: `translateX(-50%) rotate(${i * 45}deg)`,
                        transformOrigin: 'center 40px'
                      }}
                    />
                  ))}
                </div>
                
                {/* Main emoji with backdrop */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300/20 to-orange-400/20 backdrop-blur-sm border border-yellow-400/30 group-hover/sunrise:border-yellow-400/60 transition-all group-hover/sunrise:scale-110">
                  <span className="text-3xl group-hover/sunrise:scale-110 transition-transform filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">🌅</span>
                </div>
              </div>
              <span className="text-[11px] text-amber-300 font-bold bg-black/70 px-2.5 py-1 rounded-full backdrop-blur-sm border border-amber-400/40 group-hover/sunrise:border-amber-400/70 group-hover/sunrise:bg-black/80 transition-all shadow-lg">
                {new Date(daily.sunrise[0]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            
            {/* Sunset marker - Live emoji design */}
            <div className="absolute right-4 bottom-3 flex flex-col items-center z-10 group/sunset">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full mb-1.5">
                {/* Animated pulsing glow background */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/40 via-red-400/40 to-pink-500/40 animate-pulse blur-xl" style={{ animationDelay: '1s' }}></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-300/30 to-pink-500/30 blur-lg group-hover/sunset:blur-2xl transition-all"></div>
                
                {/* Rotating rays effect */}
                <div className="absolute inset-0 animate-spin-slow opacity-50" style={{ animationDelay: '0.5s' }}>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-4 bg-gradient-to-t from-red-400/60 to-transparent rounded-full"
                      style={{
                        left: '50%',
                        top: '-8px',
                        transform: `translateX(-50%) rotate(${i * 45}deg)`,
                        transformOrigin: 'center 40px'
                      }}
                    />
                  ))}
                </div>
                
                {/* Main emoji with backdrop */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-300/20 to-red-400/20 backdrop-blur-sm border border-red-400/30 group-hover/sunset:border-red-400/60 transition-all group-hover/sunset:scale-110">
                  <span className="text-3xl group-hover/sunset:scale-110 transition-transform filter drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]">🌇</span>
                </div>
              </div>
              <span className="text-[11px] text-rose-300 font-bold bg-black/70 px-2.5 py-1 rounded-full backdrop-blur-sm border border-rose-400/40 group-hover/sunset:border-rose-400/70 group-hover/sunset:bg-black/80 transition-all shadow-lg">
                {new Date(daily.sunset[0]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 md:p-3.5 lg:p-4 flex flex-col gap-0.5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 group shadow-lg">
      <div className="flex items-center gap-1.5 text-blue-200 group-hover:text-primary transition-colors">
        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-xl md:text-2xl font-bold text-white">{value}</span>
    </div>
  );
}

import { weatherCodes } from "@/lib/api";
