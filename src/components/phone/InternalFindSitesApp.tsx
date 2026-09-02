import React, { useState } from 'react';
import {
  Radio,
  Search,
  MapPin,
  Compass,
  Signal,
  TowerControl,
  Layers,
  Route,
  CheckCircle,
  ExternalLink,
  Info,
  Building2
} from 'lucide-react';

interface SiteItem {
  id: string;
  code: string;
  name: string;
  operator: string;
  type: 'Torre Telecom' | 'Site Cliente VIP' | 'Hub Distribuição' | 'Antena Repetidora';
  lat: string;
  lng: string;
  distance: string;
  status: 'Operacional' | 'Em Manutenção' | 'Vistoria Agendada';
  signalLevel: 'Excelente (-68 dBm)' | 'Bom (-75 dBm)' | 'Instável (-92 dBm)';
}

const SAMPLE_SITES: SiteItem[] = [
  {
    id: 's1',
    code: 'SITE-SP-4409',
    name: 'Torre Cajamar Sul (Micro-ondas & 5G)',
    operator: 'AlfaTelecom / Vivo / Claro',
    type: 'Torre Telecom',
    lat: '-23.3541',
    lng: '-46.8722',
    distance: '3.4 km',
    status: 'Operacional',
    signalLevel: 'Excelente (-68 dBm)',
  },
  {
    id: 's2',
    code: 'SITE-SP-2210',
    name: 'Estrela do Sul Hub Central',
    operator: 'Cliente Contratante',
    type: 'Site Cliente VIP',
    lat: '-23.5489',
    lng: '-46.6388',
    distance: '11.8 km',
    status: 'Operacional',
    signalLevel: 'Bom (-75 dBm)',
  },
  {
    id: 's3',
    code: 'SITE-SP-8831',
    name: 'Repetidora Serra dos Cristais',
    operator: 'Infraestrutura Interna',
    type: 'Antena Repetidora',
    lat: '-23.2910',
    lng: '-46.9104',
    distance: '18.2 km',
    status: 'Vistoria Agendada',
    signalLevel: 'Instável (-92 dBm)',
  },
  {
    id: 's4',
    code: 'SITE-SP-1094',
    name: 'CD Panamericana Armazém 02',
    operator: 'Cliente Contratante',
    type: 'Hub Distribuição',
    lat: '-23.4901',
    lng: '-46.7219',
    distance: '7.1 km',
    status: 'Operacional',
    signalLevel: 'Excelente (-68 dBm)',
  },
];

export const InternalFindSitesApp: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedSite, setSelectedSite] = useState<SiteItem>(SAMPLE_SITES[0]);
  const [filterType, setFilterType] = useState<string>('todos');

  const filteredSites = SAMPLE_SITES.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.operator.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'todos' || s.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-full bg-[#0F1115] text-slate-100 select-none">
      {/* Top FindSites Header */}
      <div className="bg-[#16191E] border-b border-slate-800 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/40 flex items-center justify-center font-bold">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                FindSites Field & Towers
                <span className="text-[9px] bg-violet-950 text-violet-300 px-1.5 py-0.2 rounded border border-violet-800/60 font-mono">
                  v3.4
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Signal className="w-3 h-3 text-violet-400" /> GPS RF Ativo
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar ID do Site (ex: SITE-SP-4409), cliente ou torre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F1115] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Selected Site Detail Card */}
      <div className="p-3 bg-[#12141A] border-b border-slate-800 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-violet-400 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-800/60">
                {selectedSite.code}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {selectedSite.type}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mt-1.5">{selectedSite.name}</h4>
            <p className="text-[10px] text-slate-400">{selectedSite.operator}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-400">{selectedSite.distance}</span>
            <p className="text-[9px] text-slate-400">Raio em Linha Reta</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-800/80 font-mono">
          <div className="bg-[#16191E] p-1.5 rounded border border-slate-800 text-slate-300">
            <span className="text-slate-500 block text-[9px]">Coordenadas:</span>
            {selectedSite.lat}, {selectedSite.lng}
          </div>
          <div className="bg-[#16191E] p-1.5 rounded border border-slate-800 text-slate-300">
            <span className="text-slate-500 block text-[9px]">Potência de Sinal:</span>
            <span className="text-violet-300">{selectedSite.signalLevel}</span>
          </div>
        </div>
      </div>

      {/* List of Sites in Region */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
        <div className="p-2 bg-[#0F1115] text-[10px] font-semibold text-slate-400 flex items-center justify-between">
          <span>Sites e Antenas Encontrados ({filteredSites.length})</span>
          <span className="text-violet-400">Ordenado por Proximidade</span>
        </div>

        {filteredSites.map((site) => (
          <div
            key={site.id}
            onClick={() => setSelectedSite(site)}
            className={`p-3 transition cursor-pointer flex items-center justify-between ${
              selectedSite.id === site.id
                ? 'bg-violet-950/40 border-l-2 border-violet-500'
                : 'hover:bg-[#16191E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1A1D23] border border-slate-700 flex items-center justify-center text-violet-400 flex-shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white font-mono">{site.code}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      site.status === 'Operacional'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                    }`}
                  >
                    {site.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[170px] mt-0.5">{site.name}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-violet-400 font-bold block">{site.distance}</span>
              <span className="text-[9px] text-slate-500">Distância</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
