import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Crosshair } from 'lucide-react';

interface InteractiveMapProps {
  latitude: number | null;
  longitude: number | null;
  address?: string;
  technicianLat?: number | null;
  technicianLon?: number | null;
  technicianName?: string;
  distanceKm?: number;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lon: number) => void;
  heightClass?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  latitude,
  longitude,
  address,
  technicianLat,
  technicianLon,
  technicianName,
  distanceKm,
  interactive = false,
  onLocationSelect,
  heightClass = 'h-52',
}) => {
  const [currentLat, setCurrentLat] = useState<number>(latitude || 12.9716);
  const [currentLon, setCurrentLon] = useState<number>(longitude || 77.5946);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Small simulated offset around current lat/lon
    const newLat = Number((currentLat + (0.5 - y) * 0.04).toFixed(4));
    const newLon = Number((currentLon + (x - 0.5) * 0.04).toFixed(4));
    setCurrentLat(newLat);
    setCurrentLon(newLon);
    if (onLocationSelect) {
      onLocationSelect(newLat, newLon);
    }
  };

  return (
    <div
      id="interactive-map-container"
      onClick={handleMapClick}
      className={`relative w-full ${heightClass} rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 shadow-inner select-none ${
        interactive ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      {/* Map Background Grid and Road Lines Simulation */}
      <div className="absolute inset-0 opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#0f172a" />
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          {/* Simulated arterial routes */}
          <path d="M 0 60 Q 150 90 300 40 T 600 120" fill="none" stroke="#0284c7" strokeWidth="3" opacity="0.6" />
          <path d="M 120 0 Q 140 100 200 240" fill="none" stroke="#0ea5e9" strokeWidth="2.5" opacity="0.5" />
          <path d="M 280 0 Q 310 120 380 260" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />
        </svg>
      </div>

      {/* Map HUD Header */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/85 backdrop-blur border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 shadow">
          <Navigation className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>
            {latitude && longitude
              ? `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`
              : 'Bangalore Metro Service Zone'}
          </span>
        </div>

        {distanceKm !== undefined && (
          <div className="px-2.5 py-1 bg-emerald-500/20 backdrop-blur border border-emerald-500/40 rounded-lg text-xs font-semibold text-emerald-300">
            {distanceKm} km away
          </div>
        )}
      </div>

      {/* Customer Location Pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 pointer-events-none">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-10 h-10 bg-sky-500/30 rounded-full animate-ping" />
          <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <MapPin className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="mt-1 px-2 py-0.5 bg-slate-900/90 border border-sky-500/40 rounded text-[11px] font-semibold text-sky-300 whitespace-nowrap shadow-md">
          Service Location
        </div>
      </div>

      {/* Technician Pin if assigned */}
      {technicianLat && technicianLon && (
        <div className="absolute top-[35%] right-[25%] flex flex-col items-center z-20 pointer-events-none">
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <Compass className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="mt-1 px-1.5 py-0.5 bg-slate-900/90 border border-emerald-500/40 rounded text-[10px] font-medium text-emerald-300 whitespace-nowrap shadow">
            {technicianName || 'Technician'}
          </div>
        </div>
      )}

      {/* Connecting route line simulation */}
      {technicianLat && technicianLon && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
          <line
            x1="50%"
            y1="50%"
            x2="75%"
            y2="35%"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.8"
          />
        </svg>
      )}

      {/* Footer Address bar */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg text-xs text-slate-300 z-10 pointer-events-none">
        <span className="truncate max-w-[80%] text-[11px] font-medium text-slate-300">
          {address || 'Indiranagar 100ft Rd, Bangalore'}
        </span>
        {interactive && (
          <span className="text-[10px] text-sky-400 flex items-center gap-1 font-medium">
            <Crosshair className="w-3 h-3" /> Click map to adjust pin
          </span>
        )}
      </div>
    </div>
  );
};
