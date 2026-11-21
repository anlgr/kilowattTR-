'use client';

import React, { useState } from 'react';
import { ChargingNetwork } from '../types';
import { Zap, ShieldCheck, ExternalLink, ArrowUpDown, Clock, Info, CheckCircle2 } from 'lucide-react';

interface TariffHubProps {
  networks: ChargingNetwork[];
  onTriggerScrape: () => void;
  isScraping: boolean;
  scrapeStatusMessage?: string | null;
}

export const TariffHub: React.FC<TariffHubProps> = ({
  networks,
  onTriggerScrape,
  isScraping,
  scrapeStatusMessage
}) => {
  const [selectedSpeedFilter, setSelectedSpeedFilter] = useState<'all' | 'ac' | 'dc' | 'hpc'>('all');
  const [sortAscending, setSortAscending] = useState<boolean>(true);

  // Filter & sort
  const sortedNetworks = [...networks].sort((a, b) => {
    const valA = selectedSpeedFilter === 'ac' ? a.ac_rate_tl : a.dc_180kw_plus_rate_tl;
    const valB = selectedSpeedFilter === 'ac' ? b.ac_rate_tl : b.dc_180kw_plus_rate_tl;
    return sortAscending ? valA - valB : valB - valA;
  });

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" /> Resmi & Doğrulanmış EPDK & Operatör Verileri
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Türkiye Şarj Ağları & Güncel kWh Fiyatları
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              ZES, Trugo, Eşarj, Voltrun ve ev elektriği tarifelerini tek merkezden anlık karşılaştırın. 
              Operatörlerin güncel AC (22 kW), DC Hızlı ve HPC (180-300 kW) birim fiyatları.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={onTriggerScrape}
              disabled={isScraping}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              <Zap className={`h-4 w-4 ${isScraping ? 'animate-bounce' : ''}`} />
              <span>{isScraping ? 'Fiyatlar Çekiliyor...' : 'Canlı Fiyatları Yenile'}</span>
            </button>
            <span className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> Son güncelleme: Bugün
            </span>
          </div>
        </div>

        {scrapeStatusMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/50 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{scrapeStatusMessage}</span>
          </div>
        )}
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 mr-2">Şarj Hızı Filtresi:</span>
          {[
            { id: 'all', label: 'Tüm Seviyeler' },
            { id: 'ac', label: 'AC (22 kW)' },
            { id: 'dc', label: 'DC Hızlı (60-120 kW)' },
            { id: 'hpc', label: 'Ultra Hızlı HPC (180+ kW)' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedSpeedFilter(f.id as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedSpeedFilter === f.id
                  ? 'bg-slate-700 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSortAscending(!sortAscending)}
          className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-850"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-cyan-400" />
          <span>Fiyat Sıralaması: {sortAscending ? 'En Düşük Fiyat' : 'En Yüksek Fiyat'}</span>
        </button>
      </div>

      {/* Operator Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sortedNetworks.map((net) => {
          const isHome = net.id.startsWith('home');
          return (
            <div
              key={net.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-cyan-950/20"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: net.logo_color || '#00d084' }}
                      />
                      <h3 className="font-bold text-white text-base tracking-wide">
                        {net.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                      {net.coverage_note}
                    </p>
                  </div>
                  {net.station_count > 0 && (
                    <span className="shrink-0 rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                      {net.station_count.toLocaleString('tr-TR')} İstasyon
                    </span>
                  )}
                  {isHome && (
                    <span className="shrink-0 rounded-full bg-purple-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300 border border-purple-800">
                      Ev Tipi
                    </span>
                  )}
                </div>

                {/* Rates Breakdown */}
                <div className="mt-5 space-y-2.5">
                  {/* AC Rate */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 font-semibold">
                        AC
                      </span>
                      <span className="text-xs text-slate-300">22 kW Soket</span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      {net.ac_rate_tl.toFixed(2)} <span className="text-xs font-normal text-slate-400">₺/kWh</span>
                    </span>
                  </div>

                  {/* DC 60 kW */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-blue-400 font-semibold">
                        DC
                      </span>
                      <span className="text-xs text-slate-300">60 kW Hızlı</span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      {net.dc_60kw_rate_tl.toFixed(2)} <span className="text-xs font-normal text-slate-400">₺/kWh</span>
                    </span>
                  </div>

                  {/* DC 180kW+ Ultra HPC */}
                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-cyan-950/30 to-blue-950/30 p-2.5 border border-cyan-800/40">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-cyan-900/80 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 font-semibold border border-cyan-700/50">
                        HPC
                      </span>
                      <span className="text-xs text-cyan-200 font-medium">180 - 300 kW Ultra</span>
                    </div>
                    <span className="text-sm font-bold text-cyan-300 font-mono">
                      {net.dc_180kw_plus_rate_tl.toFixed(2)} <span className="text-xs font-normal text-cyan-500/80">₺/kWh</span>
                    </span>
                  </div>
                </div>

                {/* Extra info pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {net.member_discount_percent > 0 && (
                    <span className="rounded-md bg-emerald-950/80 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-800/60">
                      %{net.member_discount_percent} Üye İndirimi
                    </span>
                  )}
                  {net.overtime_fee_tl_min > 0 && (
                    <span className="rounded-md bg-amber-950/60 px-2 py-0.5 text-[11px] text-amber-300/90 border border-amber-800/50">
                      İşgal: {net.overtime_fee_tl_min.toFixed(2)} ₺/dk
                    </span>
                  )}
                  {net.supported_sockets?.map((sock, i) => (
                    <span key={i} className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
                      {sock}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                <span>Güncellenme: {net.updated_at}</span>
                {net.website && (
                  <a
                    href={net.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>Resmi Tarife</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Insights Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-300 flex items-start gap-3">
        <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-100">Şarj Ağı İpuçları:</p>
          <p>
            • Evde gece tarifesi (22:00-06:00) 1.75 ₺/kWh ile en ekonomik şarj yöntemidir (100 km maliyeti yaklaşık 29 ₺).
          </p>
          <p>
            • Otoyol seyahatlerinde Trugo ve ZES yüksek güçlü (180 kW+) HPC soketleriyle 10% → 80% dolum yaklaşık 20-28 dakikada tamamlanır.
          </p>
          <p>
            • Şarj bittikten sonra istasyon önünde beklemelerde operatörler dakika başına 0.40 - 0.60 ₺ arası aşırı işgal ücreti uygulamaktadır.
          </p>
        </div>
      </div>
    </div>
  );
};

