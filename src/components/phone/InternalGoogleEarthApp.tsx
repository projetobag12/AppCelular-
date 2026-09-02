import React, { useState } from 'react';
import {
  Globe2,
  Layers,
  Compass,
  Search,
  MapPin,
  Mountain,
  Eye,
  Crosshair,
  Satellite,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Navigation2
} from 'lucide-react';

interface Landmark {
  id: string;
  name: string;
  coords: string;
  altitude: string;
  category: string;
  desc: string;
  previewUrl: string;
}

const SAMPLE_LOCATIONS: Landmark[] = [
  {
    id: 'loc-1',
    name: 'Centro Operacional Logístico (Hub Principal)',
    coords: '23°32\'51.4"S 46°38\'10.2"W',
    altitude: '760m sobre o nível do mar',
    category: 'Infraestrutura Empresa',
    desc: 'Visão orbital e mapeamento 3D do galpão logístico e pátio de triagem.',
    previewUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'loc-2',
    name: 'Torre de Distribuição & Relevo Anhanguera',
    coords: '23°18\'40.1"S 46°52\'33.8"W',
    altitude: '920m (Pico Geográfico)',
    category: 'Telecom & Cobertura',
    desc: 'Inspeção de relevo e visada óptica para antenas e sinal 4G/5G.',
    previewUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'loc-3',
    name: 'Área Metropolitana & Eixo Comercial Sul',
    coords: '23°35\'08.0"S 46°41\'20.0"W',
    altitude: '780m',
    category: 'Rotas Comerciais',
    desc: 'Levantamento de densidade viária e corredores de entrega.',
    previewUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80',
  },
];

export const InternalGoogleEarthApp: React.FC = () => {
  const [selectedLoc, setSelectedLoc] = useState<Landmark>(SAMPLE_LOCATIONS[0]);
  const [viewMode, setViewMode] = useState<'3d' | 'satellite' | 'terrain'>('3d');
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(14);

  const filteredLocations = SAMPLE_LOCATIONS.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0F1115] text-slate-100 select-none">
      {/* Top Search & Satellite Header */}
      <div className="bg-[#16191E] border-b border-slate-800 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                Google Earth Pro
                <span className="text-[9px] bg-blue-950 text-blue-300 px-1.5 py-0.2 rounded border border-blue-800/60 font-mono">
                  MDM Enforced
                </span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode(viewMode === '3d' ? 'satellite' : viewMode === 'satellite' ? 'terrain' : '3d')}
              className="px-2 py-1 bg-[#1A1D23] hover:bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-200 flex items-center gap-1 font-medium"
            >
              <Layers className="w-3 h-3 text-blue-400" />
              {viewMode.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar coordenadas, sites ou relevo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F1115] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main 3D Satellite Globe Viewport */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden flex flex-col justify-between p-3">
        {/* Mock Realistic Satellite Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `url('${selectedLoc.previewUrl}')`,
            filter: 'brightness(0.75) contrast(1.1)',
          }}
        ></div>

        {/* Orbit Grid Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-transparent to-[#0F1115]/60 pointer-events-none"></div>

        {/* HUD Top Coordinates */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-[#12141A]/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-300 shadow">
            <span className="text-blue-400 font-semibold">GPS: </span> {selectedLoc.coords}
          </div>
          <div className="bg-[#12141A]/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1 text-[10px] font-mono text-emerald-400 shadow flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-400 animate-spin" /> {selectedLoc.altitude}
          </div>
        </div>

        {/* Center Target Crosshair */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border border-blue-400/60 flex items-center justify-center animate-pulse">
            <Crosshair className="w-6 h-6 text-blue-400/80" />
          </div>
          <span className="mt-1 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white border border-slate-700">
            {selectedLoc.name}
          </span>
        </div>

        {/* Floating Globe Controls (Zoom & Orientation) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 20))}
            className="w-8 h-8 rounded-lg bg-[#16191E]/90 hover:bg-[#1A1D23] border border-slate-700 flex items-center justify-center text-slate-200 shadow"
            title="Aproximar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 5))}
            className="w-8 h-8 rounded-lg bg-[#16191E]/90 hover:bg-[#1A1D23] border border-slate-700 flex items-center justify-center text-slate-200 shadow"
            title="Afastar"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMeasuring(!isMeasuring)}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center shadow transition ${
              isMeasuring
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-[#16191E]/90 hover:bg-[#1A1D23] border-slate-700 text-slate-200'
            }`}
            title="Régua de Medição"
          >
            <Mountain className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Drawer: Quick Location Selector */}
        <div className="relative z-10 bg-[#16191E]/95 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 space-y-2 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Locais & Sites Salvos ({filteredLocations.length})
            </span>
            <span className="text-[9px] text-blue-400 font-mono">Zoom: {zoomLevel}x</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filteredLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLoc(loc)}
                className={`flex-shrink-0 text-left p-2 rounded-lg border transition text-xs max-w-[170px] ${
                  selectedLoc.id === loc.id
                    ? 'bg-blue-950/80 border-blue-500 text-white'
                    : 'bg-[#12141A] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <p className="font-semibold truncate text-[11px]">{loc.name}</p>
                <p className="text-[9px] text-slate-400 truncate">{loc.category}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
