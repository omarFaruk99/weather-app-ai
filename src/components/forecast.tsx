import { WeatherData } from "@/lib/api";
import { ChevronLeft, ChevronRight, Droplets, Sunrise, Sunset } from "lucide-react";
import { useRef } from "react";
import { useUnit } from "./unit-context";
import { WeatherIcon } from "./weather-icon";

interface ForecastProps {
  data: WeatherData;
}

export function Forecast({ data }: ForecastProps) {
  const { daily, hourly } = data;
  const { unit } = useUnit();
  const scrollRef = useRef<HTMLDivElement>(null);

  const convertTemp = (temp: number) => {
    if (unit === "fahrenheit") {
      return Math.round((temp * 9) / 5 + 32);
    }
    return Math.round(temp);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Get next 24 hours for hourly forecast
  const next24Hours = hourly.time.slice(0, 24).map((time, i) => ({
    time: new Date(time),
    temp: convertTemp(hourly.temperature_2m[i]),
    code: hourly.weather_code[i],
    humidity: hourly.relative_humidity_2m[i],
  }));

  // Get next 7 days for daily forecast
  const next7Days = daily.time.map((time, i) => ({
    time: new Date(time),
    max: convertTemp(daily.temperature_2m_max[i]),
    min: convertTemp(daily.temperature_2m_min[i]),
    code: daily.weather_code[i],
    rainProb: daily.precipitation_probability_max?.[i] || 0,
    sunrise: daily.sunrise?.[i] ? new Date(daily.sunrise[i]) : null,
    sunset: daily.sunset?.[i] ? new Date(daily.sunset[i]) : null,
  }));

  return (
    <div className="flex flex-col gap-3 md:gap-4 w-full h-full animate-slide-up">
      {/* Hourly Forecast */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-[2rem] p-3 md:p-4 lg:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base md:text-lg lg:text-xl font-bold text-white">
            Hourly Forecast
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-all active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-all active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1">
          {next24Hours.map((hour, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-2.5 rounded-lg hover:bg-white/5 transition-all duration-300 group min-w-[60px] md:min-w-[70px]"
            >
              <span className="text-[10px] md:text-xs font-medium text-blue-200/80 group-hover:text-white transition-colors whitespace-nowrap">
                {hour.time.toLocaleTimeString("en-US", { hour: "numeric" })}
              </span>
              <WeatherIcon code={hour.code} className="h-6 w-6 md:h-8 md:w-8 text-primary group-hover:scale-110 transition-transform drop-shadow-md" />
              <span className="font-bold text-sm md:text-base text-white">{hour.temp}°</span>
              <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-medium text-blue-300/80">
                <Droplets className="h-2 w-2 md:h-2.5 md:w-2.5" />
                <span>{hour.humidity}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-[2rem] p-3 md:p-4 lg:p-5 shadow-xl flex-1 flex flex-col min-h-0">
        <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 md:mb-3 text-white">
          7-Day Forecast
        </h3>
        <div className="flex flex-col gap-1.5 md:gap-2 overflow-y-auto scrollbar-hide flex-1">
          {next7Days.map((day, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 p-2.5 md:p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group"
            >
              {/* Main row */}
              <div className="flex items-center justify-between">
                <span className="w-16 md:w-20 font-bold text-blue-100 group-hover:text-white transition-colors text-xs md:text-sm">
                  {i === 0 ? "Today" : day.time.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <div className="flex items-center gap-2 md:gap-3 flex-1 justify-center">
                  <WeatherIcon code={day.code} className="h-6 w-6 md:h-7 md:w-7 text-primary drop-shadow-md" />
                  {day.rainProb > 0 && (
                    <div className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-400" />
                      <span className="text-[10px] md:text-xs font-bold text-blue-200">
                        {day.rainProb}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 md:gap-3 w-20 md:w-24 justify-end">
                  <span className="font-bold text-sm md:text-base lg:text-lg text-white">{day.max}°</span>
                  <span className="text-xs md:text-sm text-blue-200/60 font-medium">{day.min}°</span>
                </div>
              </div>
              
              {/* Additional info row */}
              <div className="flex items-center justify-between text-[10px] md:text-xs text-blue-200/70 pl-16 md:pl-20">
                <div className="flex items-center gap-3 md:gap-4">
                  {day.sunrise && (
                    <div className="flex items-center gap-1">
                      <Sunrise className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      <span>{day.sunrise.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                    </div>
                  )}
                  {day.sunset && (
                    <div className="flex items-center gap-1">
                      <Sunset className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      <span>{day.sunset.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
