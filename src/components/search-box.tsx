"use client";

import { searchCity, type GeocodingResult } from "@/lib/api";
import { Loader2, MapPin, MapPinned } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchBoxProps {
  onCitySelect: (city: GeocodingResult) => void;
}

export function SearchBox({ onCitySelect }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const data = await searchCity(query);
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md z-50">
      <div className="relative group">
        <MapPinned className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10 drop-shadow-lg group-focus-within:text-primary transition-colors pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city..."
          className="w-full h-12 pl-12 pr-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all shadow-lg relative z-0"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary z-10" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <ul className="py-2">
            {results.map((city) => (
              <li
                key={city.id}
                onClick={() => {
                  onCitySelect(city);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-4 transition-colors group"
              >
                <div className="bg-white/5 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white">{city.name}</span>
                  <span className="text-xs text-muted-foreground group-hover:text-gray-300">
                    {[city.admin1, city.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
