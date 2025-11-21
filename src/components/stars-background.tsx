"use client";

import { useEffect, useState } from "react";

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function StarsBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      const count = 75; // Number of stars

      for (let i = 0; i < count; i++) {
        newStars.push({
          id: i,
          top: Math.random() * 100,
          left: Math.random() * 100,
          size: Math.random() * 2 + 1, // 1px to 3px
          duration: Math.random() * 3 + 2, // 2s to 5s
          delay: Math.random() * 5, // 0s to 5s
          opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`,
          }}
        />
      ))}
    </div>
  );
}
