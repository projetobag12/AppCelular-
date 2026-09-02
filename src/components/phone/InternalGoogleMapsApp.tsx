import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Route,
  Compass,
  Layers,
  Fuel,
  Volume2,
  Building,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  ArrowLeft
} from 'lucide-react';
import { CorporateDevice } from '../../types';

interface RouteOption {
  id: string;
  name: string;
  category: 'cliente' | 'filial' | 'cd' | 'posto';
  distance: string;
  eta: string;
  trafficStatus: 'Livre' | 'Moderado' | 'Intenso';
  via: string;
  address: string;
  coords: { lat: number; lng: number };
}

const PRESET_ROUTES: RouteOption[] = [
  {
    id: 'r1',
    name: 'Cliente Rede Estrela do Sul',
    category: 'cliente',
    distance: '14.2 km',
    eta: '22 min',
    trafficStatus: 'Livre',
    via: 'Via Marginal Pinheiros e Av. Santo Amaro',
    address: 'Av. Santo Amaro, 3450 - Moema, SP',
    coords: { lat: -23.6050, lng: -46.6780 },
  },
  {
    id: 'r2',
    name: 'Centro de Distribuição Cajamar',
    category: 'cd',
    distance: '38.5 km',
    eta: '45 min',
    trafficStatus: 'Moderado',
    via: 'Rod. Anhanguera (SP-330) km 38',
    address: 'Rod. Anhanguera, km 38 - Distrito Industrial, Cajamar - SP',
    coords: { lat: -23.4350, lng: -46.8520 },
  },
  {
    id: 'r3',
    name: 'Galpão Panamericana de Alimentos',
    category: 'filial',
    distance: '8.7 km',
    eta: '16 min',
    trafficStatus: 'Livre',
    via: 'Av. das Nações Unidas',
    address: 'Av. das Nações Unidas, 12901 - Brooklin, SP',
    coords: { lat: -23.6010, lng: -46.6970 },
  },
  {
    id: 'r4',
    name: 'Posto Conveniado Rede Ipiranga Frota',
    category: 'posto',
    distance: '3.2 km',
    eta: '6 min',
    trafficStatus: 'Livre',
    via: 'Av. Brigadeiro Luís Antônio',
    address: 'Av. Brigadeiro Luís Antônio, 2800 - Jardim Paulista, SP',
    coords: { lat: -23.5710, lng: -46.6430 },
  },
];

interface InternalGoogleMapsAppProps {
  device?: CorporateDevice;
  onRecordIncident?: (eventType: any, details: string, target?: string, severity?: 'low' | 'medium' | 'high' | 'critical') => void;
}

export const InternalGoogleMapsApp: React.FC<InternalGoogleMapsAppProps> = ({
  device,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption>(PRESET_ROUTES[0]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'traffic'>('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDestinations, setShowDestinations] = useState(false);
  
  // Real-time animated movement simulation
  const [simProgress, setSimProgress] = useState(25);
  const [currentSpeed, setCurrentSpeed] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setSimProgress((prev) => {
        const next = prev + 1.2;
        return next > 95 ? 10 : next;
      });
      setCurrentSpeed((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.min(Math.max(prev + delta, 32), 55);
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const baseLat = device?.latitude ?? -23.5615;
  const baseLng = device?.longitude ?? -46.6559;
  const currentLat = (baseLat + (simProgress * 0.0004)).toFixed(5);
  const currentLng = (baseLng - (simProgress * 0.0003)).toFixed(5);

  const filteredRoutes = PRESET_ROUTES.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0F1115] text-slate-100 select-none overflow-hidden relative font-sans">
      {/* Search and Navigation Bar */}
      <div className="bg-[#16191E] border-b border-slate-800 p-2.5 space-y-2 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
            <MapPin className="w-4 h-4" />
          </div>

          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Para onde vamos? (buscar cliente ou rota)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDestinations(true)}
              className="w-full bg-[#101319] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            onClick={() => setShowDestinations(!showDestinations)}
            className={`p-2 rounded-xl text-xs font-semibold border transition ${
              showDestinations
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Lista de Destinos Rápidos"
          >
            <Route className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-[#10141C]">
        {/* Map Layers */}
        {mapLayer === 'satellite' ? (
          <div className="absolute inset-0 bg-[#0d1c16] opacity-95">
            <div className="absolute inset-0 bg-[radial-gradient(#153e2d_2px,transparent_2px)] [background-size:24px_24px] opacity-70"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>
          </div>
        ) : mapLayer === 'traffic' ? (
          <div className="absolute inset-0 bg-[#13161c]">
            <div className="absolute inset-0 bg-[radial-gradient(#2a3441_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#12161F]">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
          </div>
        )}

        {/* Street Road Visuals */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 420">
          <line x1="20" y1="80" x2="340" y2="80" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          <line x1="20" y1="200" x2="340" y2="200" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
          <line x1="20" y1="320" x2="340" y2="320" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="20" x2="100" y2="400" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          <line x1="260" y1="20" x2="260" y2="400" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />

          {/* Highway Path */}
          <path
            d="M 50 360 Q 130 250 200 210 T 310 90"
            stroke={mapLayer === 'traffic' ? '#eab308' : '#334155'}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />

          {/* Navigation Line */}
          <path
            d="M 50 360 Q 130 250 200 210 T 310 90"
            stroke="#3b82f6"
            strokeWidth="6"
            strokeDasharray={isNavigating ? '8 4' : 'none'}
            className={isNavigating ? 'animate-pulse' : ''}
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Current Location & Layer Switcher Bar */}
        <div className="relative z-20 m-2.5 flex items-center justify-between gap-2">
          <div className="bg-[#16191E]/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
            <div>
              <p className="text-[11px] font-bold text-white leading-tight">Você está aqui</p>
              <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[150px]">Av. Paulista, 1000 - SP</p>
            </div>
          </div>

          <div className="flex gap-1 bg-[#16191E]/90 p-1 rounded-xl border border-slate-700/80 shadow">
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2 py-1 rounded-lg text-[9px] font-semibold transition ${
                mapLayer === 'streets' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ruas
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2 py-1 rounded-lg text-[9px] font-semibold transition ${
                mapLayer === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satélite
            </button>
            <button
              onClick={() => setMapLayer('traffic')}
              className={`px-2 py-1 rounded-lg text-[9px] font-semibold transition ${
                mapLayer === 'traffic' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Trânsito
            </button>
          </div>
        </div>

        {/* Moving GPS Location Marker (Puck) */}
        <div
          className="absolute z-20 flex flex-col items-center transition-all duration-1000"
          style={{
            left: `${35 + (simProgress * 0.58)}%`,
            top: `${80 - (simProgress * 0.65)}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-8 h-8 rounded-full bg-blue-500/20 animate-ping absolute -top-1"></div>
          <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <Navigation className="w-4 h-4 rotate-45" />
          </div>
        </div>

        {/* Destination Pin */}
        <div className="absolute right-7 top-16 z-20 flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl animate-bounce border-2 border-white">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="bg-black/95 text-[9px] font-bold text-white px-2 py-0.5 rounded border border-slate-700 shadow mt-1 whitespace-nowrap">
            {selectedRoute.name.split(' ')[0]} {selectedRoute.name.split(' ')[1] || ''}
          </span>
        </div>

        {/* Active Navigation Turn Prompt */}
        {isNavigating && (
          <div className="relative z-30 mx-2.5 bg-blue-950/95 border border-blue-600 rounded-2xl p-3 shadow-2xl space-y-1 text-white animate-in slide-in-from-top-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-400 rotate-45 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold leading-tight">Em 300 metros:</h4>
                  <p className="text-[11px] text-blue-200 leading-tight">Continue em frente na {selectedRoute.via.split(' e ')[0]}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-blue-800 px-2 py-0.5 rounded">
                  {selectedRoute.eta}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Destinations Overlay Drawer if opened */}
        {showDestinations && (
          <div className="absolute inset-0 bg-[#0F1115]/95 z-40 p-3 flex flex-col justify-between overflow-y-auto animate-in fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Route className="w-4 h-4 text-blue-400" />
                  Destinos da Empresa
                </h4>
                <button
                  onClick={() => setShowDestinations(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
                >
                  Fechar ✕
                </button>
              </div>

              <div className="space-y-2">
                {filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => {
                      setSelectedRoute(route);
                      setShowDestinations(false);
                      setIsNavigating(true);
                    }}
                    className="bg-[#16191E] border border-slate-800 hover:border-blue-500 rounded-xl p-3 flex items-center justify-between cursor-pointer transition"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">{route.name}</h5>
                      <p className="text-[10px] text-slate-400">{route.address}</p>
                      <p className="text-[9px] text-slate-500">{route.via}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-mono font-bold text-blue-400">{route.eta}</p>
                      <span className="text-[9px] bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-md">
                        Navegar →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Destination Controller Card */}
        <div className="relative z-30 m-2.5 bg-[#16191E]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] bg-blue-950 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-800/60">
                Destino
              </span>
              <h4 className="text-xs font-bold text-white mt-1">{selectedRoute.name}</h4>
              <p className="text-[10px] text-slate-400 truncate max-w-[220px]">{selectedRoute.address}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-black text-blue-400 font-mono leading-none">{selectedRoute.eta}</p>
              <p className="text-[9px] text-slate-400 font-mono">{selectedRoute.distance}</p>
            </div>
          </div>

          <button
            onClick={() => setIsNavigating(!isNavigating)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg ${
              isNavigating
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <Navigation className="w-4 h-4" />
            {isNavigating ? 'Encerrar Navegação' : 'Iniciar Navegação GPS'}
          </button>
        </div>
      </div>
    </div>
  );
};
