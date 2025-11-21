import { weatherCodes } from "@/lib/api";
import {
    Cloud,
    CloudDrizzle,
    CloudFog,
    CloudHail,
    CloudLightning,
    CloudRain,
    CloudSnow,
    CloudSun,
    Sun,
    SunDim,
} from "lucide-react";

interface WeatherIconProps {
  code: number;
  className?: string;
}

const iconMap: Record<string, any> = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudHail,
  CloudSnow,
  CloudLightning,
};

export function WeatherIcon({ code, className }: WeatherIconProps) {
  const weatherInfo = weatherCodes[code];
  const IconComponent = weatherInfo ? iconMap[weatherInfo.icon] : Sun;

  return <IconComponent className={className} />;
}
