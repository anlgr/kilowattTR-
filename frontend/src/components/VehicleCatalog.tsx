'use client';

import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Search, Gauge, BatteryCharging, Zap, Snowflake, Sun, Navigation, Check, Layers, SlidersHorizontal } from 'lucide-react';

interface VehicleCatalogProps {
  vehicles: Vehicle[];
  onOpenCompare: (selected: Vehicle[]) => void;
}

export const VehicleCatalog: React.FC<VehicleCatalogProps> = ({
  vehicles,
  onOpenCompare,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedDriveType, setSelectedDriveType] = useState<string>('all');
  const [compareList, setCompareList] = useState<Vehicle[]>([]);
  const [rangeMode, setRangeMode] = useState<'wltp' | 'city' | 'highway' | 'winter'>('highway');

  // Available brands list
  const brands = ['all', ...Array.from(new Set(vehicles.map((v) => v.brand)))];

  // Filter logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.trim.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || v.brand === selectedBrand;
    const matchesDrive = selectedDriveType === 'all' || v.drive_type === selectedDriveType;
    return matchesSearch && matchesBrand && matchesDrive;
  });

  const toggleCompare = (vehicle: Vehicle) => {
    if (compareList.some((v) => v.id === vehicle.id)) {
      setCompareList(compareList.filter((v) => v.id !== vehicle.id));
    } else {
      if (compareList.length >= 3) {
        alert("En fazla 3 aracı aynı anda karşılaştırabilirsiniz.");
        return;
      }
      setCompareList([...compareList, vehicle]);
    }
  };

  const getActiveRange = (v: Vehicle) => {
    switch (rangeMode) {
      case 'city':
        return { val: v.real_range_city_km, label: 'Şehir İçi', badge: 'Rejenerasyon Yüksek' };
      case 'highway':
        return { val: v.real_range_highway_km, label: 'Otoyol (120 km/h)', badge: 'Gerçek Seyahat' };
      case 'winter':
        return { val: v.real_range_winter_km, label: 'Kış (-5°C)', badge: 'Isıtma Devrede' };
      case 'wltp':
      default:
        return { val: v.wltp_range_km, label: 'WLTP Fabrika', badge: 'Laboratuvar' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
              <Gauge className="h-3.5 w-3.5" /> Gerçek Koşul Test Verileri
            </div>
            <h2 className="text-2xl font-bold text-white">Elektrikli Araç Kataloğu & Gerçek Menzil</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Katalogdaki WLTP değerleri ile otoyol (120 km/s) ve kış (-5°C) koşullarındaki gerçek dünya tüketimlerini inceleyin.
            </p>
          </div>

          {/* Quick Range Mode Switcher */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">Menzil Karşılaştırma Modu:</span>
            <div className="flex rounded-xl bg-slate-950/90 p-1 border border-slate-800">
              <button
                onClick={() => setRangeMode('highway')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  rangeMode === 'highway' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Navigation className="h-3.5 w-3.5" /> Otoyol (120 km/h)
              </button>
              <button
                onClick={() => setRangeMode('city')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  rangeMode === 'city' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="h-3.5 w-3.5" /> Şehir İçi
              </button>
              <button
                onClick={() => setRangeMode('winter')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  rangeMode === 'winter' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Snowflake className="h-3.5 w-3.5" /> Kış (-5°C)
              </button>
              <button
                onClick={() => setRangeMode('wltp')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  rangeMode === 'wltp' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                WLTP Fabrika
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Search Box */}
          <div className="relative sm:col-span-6">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Model ara (örn: Togg T10X, Model Y, Atto 3, Ioniq 5)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Brand Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">Tüm Markalar ({vehicles.length})</option>
              {brands.filter((b) => b !== 'all').map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Drive Type */}
          <div className="sm:col-span-3">
            <select
              value={selectedDriveType}
              onChange={(e) => setSelectedDriveType(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">Çekiş Tipi (Tümü)</option>
              <option value="RWD">RWD (Arkadan İtiş)</option>
              <option value="AWD">AWD (Dört Çeker)</option>
              <option value="FWD">FWD (Önden Çekiş)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => {
          const isSelected = compareList.some((v) => v.id === vehicle.id);
          const activeRange = getActiveRange(vehicle);
          const rangeRatio = Math.round((activeRange.val / vehicle.wltp_range_km) * 100);

          return (
            <div
              key={vehicle.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? 'border-cyan-500 bg-slate-900/90 shadow-xl shadow-cyan-500/20'
                  : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div>
                {/* Vehicle Header & Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={vehicle.image_url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-95"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Brand & Trim Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="rounded-md bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md border border-slate-700/60">
                      {vehicle.brand}
                    </span>
                    {vehicle.popular && (
                      <span className="rounded-md bg-cyan-950/90 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-700/50">
                        Popüler
                      </span>
                    )}
                  </div>

                  {/* Compare Checkbox Button */}
                  <button
                    onClick={() => toggleCompare(vehicle)}
                    className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-black font-semibold shadow-lg shadow-cyan-500/40'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    <Check className={`h-3.5 w-3.5 ${isSelected ? 'block' : 'hidden'}`} />
                    <span>{isSelected ? 'Seçildi' : 'Karşılaştır'}</span>
                  </button>

                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{vehicle.model}</h3>
                      <p className="text-xs text-slate-300">{vehicle.trim}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-cyan-400">
                      {(vehicle.price_try / 1000000).toFixed(2)} M ₺
                    </span>
                  </div>
                </div>

                {/* Range Spotlight Panel */}
                <div className="p-5">
                  <div className="rounded-xl border border-cyan-900/40 bg-gradient-to-br from-cyan-950/40 via-slate-950/60 to-slate-900/40 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300 flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                        {activeRange.label} Menzili:
                      </span>
                      <span className="text-[10px] text-cyan-400/90 font-mono">
                        %{rangeRatio} WLTP
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                          {activeRange.val}
                        </span>
                        <span className="text-xs font-medium text-slate-400">km</span>
                      </div>
                      <div className="text-right text-[11px] text-slate-400">
                        Fabrika WLTP: <strong className="text-slate-200">{vehicle.wltp_range_km} km</strong>
                      </div>
                    </div>

                    {/* Progress Bar comparing to WLTP */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, rangeRatio)}%` }}
                      />
                    </div>
                  </div>

                  {/* Technical Spec Matrix */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Batarya (Net/Brüt)</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {vehicle.battery_net_kwh} / {vehicle.battery_gross_kwh} kWh
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Maks. DC Hız</span>
                      <span className="font-mono font-semibold text-emerald-400 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> {vehicle.max_dc_charging_power_kw} kW
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">%10 - %80 Şarj Süresi</span>
                      <span className="font-mono font-semibold text-cyan-300 flex items-center gap-1">
                        <BatteryCharging className="h-3 w-3" /> {vehicle.charging_time_dc_10_to_80_min} dk
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Tüketim (Ort.)</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {vehicle.avg_consumption_kwh_100km} kWh/100km
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Row */}
              <div className="border-t border-slate-800/80 bg-slate-950/40 px-5 py-2.5 text-[11px] text-slate-400 flex items-center justify-between">
                <span>0-100: <strong className="text-slate-200">{vehicle.acceleration_0_100_s}s</strong></span>
                <span>Çekiş: <strong className="text-slate-200">{vehicle.drive_type}</strong></span>
                <span>Bagaj: <strong className="text-slate-200">{vehicle.trunk_capacity_liters} L</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Comparison Bar if vehicles selected */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-2xl border border-cyan-500/50 bg-slate-950/95 p-3 px-5 shadow-2xl backdrop-blur-xl ring-1 ring-cyan-500/20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
              <Layers className="h-4 w-4" /> Karşılaştırma ({compareList.length}/3):
            </span>
            <div className="flex items-center gap-2">
              {compareList.map((c) => (
                <span
                  key={c.id}
                  className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-white border border-slate-700 flex items-center gap-1"
                >
                  {c.brand} {c.model}
                  <button
                    onClick={() => toggleCompare(c)}
                    className="ml-1 text-slate-400 hover:text-red-400 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCompare(compareList)}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 hover:brightness-110"
            >
              Yan Yana Karşılaştır
            </button>
            <button
              onClick={() => setCompareList([])}
              className="text-xs text-slate-400 hover:text-slate-200 px-2"
            >
              Temizle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

