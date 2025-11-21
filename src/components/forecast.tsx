import { WeatherData } from "@/lib/api";
import { Droplets } from "lucide-react";
import { useUnit } from "./unit-context";
import { WeatherIcon } from "./weather-icon";

interface ForecastProps {
  data: WeatherData;
}

export function Forecast({ data }: ForecastProps) {
  const { daily, hourly } = data;
  const { unit } = useUnit();

  const convertTemp = (temp: number) => {
    if (unit === "fahrenheit") {
      return Math.round((temp * 9) / 5 + 32);
    }
    return Math.round(temp);
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
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full animate-slide-up">
      {/* Hourly Forecast */}
      <div className="lg:col-span-2 bg-card/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 shadow-xl">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
          Hourly Forecast
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {next24Hours.map((hour, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
            >
              <span className="text-xs font-medium text-blue-200/80 group-hover:text-white transition-colors">
                {hour.time.toLocaleTimeString("en-US", { hour: "numeric" })}
              </span>
              <WeatherIcon code={hour.code} className="h-8 w-8 text-primary group-hover:scale-110 transition-transform drop-shadow-md" />
              <span className="font-bold text-lg text-white">{hour.temp}°</span>
              <div className="flex items-center gap-1 text-[10px] font-medium text-blue-300/80">
                <Droplets className="h-2.5 w-2.5" />
                <span>{hour.humidity}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 shadow-xl">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
          7-Day Forecast
        </h3>
        <div className="flex flex-col gap-3">
          {next7Days.map((day, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group"
            >
              <span className="w-24 font-medium text-blue-100 group-hover:text-white transition-colors text-lg">
                {i === 0 ? "Today" : day.time.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <div className="flex items-center gap-3">
                <WeatherIcon code={day.code} className="h-8 w-8 text-primary drop-shadow-md" />
                {day.rainProb > 0 && (
                  <span className="text-xs font-bold text-blue-200 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-500/20">
                    {day.rainProb}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 w-28 justify-end">
                <span className="font-bold text-xl text-white">{day.max}°</span>
                <span className="text-lg text-blue-200/60 font-medium">{day.min}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
