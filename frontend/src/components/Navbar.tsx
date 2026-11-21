'use client';

import React from 'react';
import { Zap, Gauge, DollarSign, MapPin, RefreshCw, Radio } from 'lucide-react';

interface NavbarProps {
  activeTab: 'tariffs' | 'vehicles' | 'calculator' | 'routes';
  setActiveTab: (tab: 'tariffs' | 'vehicles' | 'calculator' | 'routes') => void;
  onRefreshTariffs: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefreshTariffs,
  isRefreshing
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      {/* Top micro-bar for market indicators */}
      <div className="hidden border-b border-slate-850/60 bg-slate-900/40 px-4 py-1.5 text-xs text-slate-400 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Radio className="h-3 w-3 animate-pulse" /> Canlı Veri Merkezi
            </span>
            <span className="text-slate-600">|</span>
            <span>EPDK Ev Tarifesi: <strong className="text-slate-200">1.75 - 2.60 ₺/kWh</strong></span>
            <span className="text-slate-600">|</span>
            <span>Ort. Hızlı DC: <strong className="text-cyan-400">10.45 ₺/kWh</strong></span>
            <span className="text-slate-600">|</span>
            <span>Benzin (Kurşunsuz 95): <strong className="text-amber-400">43.50 ₺/L</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Türkiye EV Parkı: <strong>140.000+</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">Tasarruf Oranı: <strong>~%72</strong></span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
            <Zap className="h-6 w-6 text-black fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                Kilowatt<span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">TR</span>
              </h1>
              <span className="rounded-full bg-cyan-950/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-700/50">
                v2.4 CANLI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Türkiye EV & Şarj Ağı Veri Merkezi
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800/90">
          <button
            onClick={() => setActiveTab('tariffs')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
              activeTab === 'tariffs'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Şarj Tarifeleri</span>
          </button>

          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
              activeTab === 'vehicles'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="h-4 w-4" />
            <span>Gerçek Menzil</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
              activeTab === 'calculator'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Maliyet & Tasarruf</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
              activeTab === 'routes'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Rota Planlayıcı</span>
          </button>
        </nav>

        {/* Live Scraper Trigger Button */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={onRefreshTariffs}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-cyan-500/50 hover:bg-slate-800 active:scale-95 disabled:opacity-60"
            title="ZES, Trugo ve Eşarj web sitelerinden anlık tarife çek"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Taranıyor...' : 'Tarifeleri Doğrula'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

