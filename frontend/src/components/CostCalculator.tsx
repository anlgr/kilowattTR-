'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle, ChargingNetwork, ChargingCostResponse, SavingsComparisonResponse } from '../types';
import { calculateChargingCost, calculateSavings } from '../lib/api';
import { Zap, DollarSign, Calculator, BatteryCharging, ArrowRight, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface CostCalculatorProps {
  vehicles: Vehicle[];
  networks: ChargingNetwork[];
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  vehicles,
  networks,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'fill' | 'savings'>('fill');

  // Charge Fill State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'togg-t10x-v2-long-range');
  const [startSoc, setStartSoc] = useState<number>(15);
  const [targetSoc, setTargetSoc] = useState<number>(80);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('trugo');
  const [chargerType, setChargerType] = useState<string>('dc_fast');
  const [useDiscount, setUseDiscount] = useState<boolean>(true);
  const [fillResult, setFillResult] = useState<ChargingCostResponse | null>(null);
  const [isLoadingFill, setIsLoadingFill] = useState<boolean>(false);

  // Savings State
  const [annualKm, setAnnualKm] = useState<number>(15000);
  const [fuelType, setFuelType] = useState<string>('gasoline');
  const [fuelConsumption, setFuelConsumption] = useState<number>(7.5);
  const [fuelPrice, setFuelPrice] = useState<number>(43.50);
  const [homeRatio, setHomeRatio] = useState<number>(70);
  const [savingsResult, setSavingsResult] = useState<SavingsComparisonResponse | null>(null);
  const [isLoadingSavings, setIsLoadingSavings] = useState<boolean>(false);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Run fill calculation whenever inputs change
  useEffect(() => {
    if (!selectedVehicleId) return;
    setIsLoadingFill(true);
    calculateChargingCost({
      vehicle_id: selectedVehicleId,
      start_soc_percent: startSoc,
      target_soc_percent: targetSoc,
      charging_location: selectedNetworkId,
      charger_type: chargerType,
      use_member_discount: useDiscount
    }).then((res) => {
      setFillResult(res);
      setIsLoadingFill(false);
    });
  }, [selectedVehicleId, startSoc, targetSoc, selectedNetworkId, chargerType, useDiscount]);

  // Run savings calculation whenever inputs change
  useEffect(() => {
    if (!selectedVehicleId) return;
    setIsLoadingSavings(true);
    calculateSavings({
      vehicle_id: selectedVehicleId,
      annual_km: annualKm,
      fuel_type: fuelType,
      fuel_consumption_l_100km: fuelConsumption,
      fuel_price_tl_per_liter: fuelPrice,
      home_charging_ratio: homeRatio / 100,
      dc_fast_charging_ratio: (100 - homeRatio) / 100
    }).then((res) => {
      setSavingsResult(res);
      setIsLoadingSavings(false);
    });
  }, [selectedVehicleId, annualKm, fuelType, fuelConsumption, fuelPrice, homeRatio]);

  return (
    <div className="space-y-8">
      {/* Sub navigation */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('fill')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm transition-all ${
              activeSubTab === 'fill'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BatteryCharging className="h-4 w-4" />
            <span>Şarj Dolum Tutarı</span>
          </button>
          <button
            onClick={() => setActiveSubTab('savings')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold sm:text-sm transition-all ${
              activeSubTab === 'savings'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Benzin vs Elektrik Tasarruf Simülatörü</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'fill' ? (
        /* Fill Cost Calculator */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controls Panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md lg:col-span-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="h-5 w-5 text-cyan-400" /> Şarj Dolum Parametreleri
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Aracınızı ve şarj edeceğiniz ağı seçin; anlık dolum süresi ve maliyeti hesaplansın.
              </p>
            </div>

            {/* Vehicle Selector */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Araç Modeli Seçin:
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} - {v.trim} ({v.battery_net_kwh} kWh)
                  </option>
                ))}
              </select>
            </div>

            {/* SoC Sliders */}
            <div className="space-y-4 rounded-xl bg-slate-950/60 p-4 border border-slate-800">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Mevcut Şarj Yüzdesi (Başlangıç):</span>
                  <span className="font-mono font-bold text-cyan-400">%{startSoc}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={startSoc}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStartSoc(val);
                    if (val >= targetSoc) setTargetSoc(val + 10);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Hedeflenen Şarj Yüzdesi (Bitiş):</span>
                  <span className="font-mono font-bold text-emerald-400">%{targetSoc}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={targetSoc}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > startSoc) setTargetSoc(val);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  İpucu: Batarya ömrü ve şarj hızı optimizasyonu için %80 üzeri DC dolum önerilmez.
                </span>
              </div>
            </div>

            {/* Network Selector */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Şarj Yeri / Operatör:
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {networks.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNetworkId(n.id)}
                    className={`rounded-xl p-2.5 text-left text-xs transition-all border ${
                      selectedNetworkId === n.id
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold truncate">{n.short_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {n.dc_180kw_plus_rate_tl.toFixed(2)} ₺/kWh
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Charger Type */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Soket Tipi:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ac', label: 'AC (22 kW)' },
                  { id: 'dc_60kw', label: 'DC (60 kW)' },
                  { id: 'dc_ultra', label: 'HPC (180+ kW)' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setChargerType(type.id)}
                    className={`rounded-xl p-2 text-center text-xs font-medium border transition-colors ${
                      chargerType === type.id
                        ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Member Discount Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="discountCheck"
                checked={useDiscount}
                onChange={(e) => setUseDiscount(e.target.checked)}
                className="h-4 w-4 rounded accent-cyan-500"
              />
              <label htmlFor="discountCheck" className="text-xs text-slate-300 cursor-pointer">
                Operatör üyelik indirimini uygula (varsa)
              </label>
            </div>
          </div>

          {/* Results Display Panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    Hesaplama Özeti
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {fillResult?.vehicle_name || selectedVehicle.model}
                  </h3>
                </div>
                <div className="rounded-xl bg-cyan-950/80 px-3 py-1 text-xs text-cyan-300 border border-cyan-800/60 font-mono">
                  %{startSoc} → %{targetSoc} Dolum
                </div>
              </div>

              {/* Big Primary Metric: Total Cost */}
              <div className="mt-6 rounded-2xl border border-cyan-900/50 bg-gradient-to-br from-cyan-950/40 via-slate-950 to-slate-900/50 p-6 text-center shadow-xl">
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Tahmini Toplam Şarj Tutarı
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                    {fillResult ? fillResult.total_cost_tl.toLocaleString('tr-TR') : '...'}
                  </span>
                  <span className="text-lg font-bold text-cyan-400">₺</span>
                </div>
                <span className="mt-2 inline-block rounded-full bg-slate-800 px-3 py-0.5 text-xs font-mono text-cyan-300">
                  Birim: {fillResult?.unit_price_tl_per_kwh.toFixed(2)} ₺ / kWh
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                  <span className="text-slate-400 block text-[11px]">Eklenecek Enerji</span>
                  <span className="text-base font-bold font-mono text-white mt-1 block">
                    {fillResult?.energy_added_kwh} kWh
                  </span>
                  <span className="text-[10px] text-slate-500">Şebekeden çekilen</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                  <span className="text-slate-400 block text-[11px]">Kazanılacak Menzil</span>
                  <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                    +{fillResult?.range_added_km} km
                  </span>
                  <span className="text-[10px] text-slate-500">Karma ortalama tüketim</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                  <span className="text-slate-400 block text-[11px]">Kilometre Başına Maliyet</span>
                  <span className="text-base font-bold font-mono text-cyan-300 mt-1 block">
                    {fillResult?.cost_per_km_tl} ₺ / km
                  </span>
                  <span className="text-[10px] text-slate-500">Benzinli: ~3.25 ₺/km</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                  <span className="text-slate-400 block text-[11px]">Tahmini Şarj Süresi</span>
                  <span className="text-base font-bold font-mono text-white mt-1 block">
                    ~{fillResult?.estimated_charging_time_min} dakika
                  </span>
                  <span className="text-[10px] text-slate-500">{fillResult?.charger_speed_kw} kW azami</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-950/70 p-3 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Hesaplama %92 şarj kayıp verimliliği ve batarya şarj eğrisi yavaşlaması göz önüne alınarak yapılmıştır.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Annual Savings vs ICE Simulator */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controls */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md lg:col-span-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" /> Yakıt Tasarrufu Simülasyonu
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Yılda yaptığınız kilometreye göre benzinli/dizel araç ile elektrikli araç arasındaki net tasarrufu görün.
              </p>
            </div>

            {/* Annual KM Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Yıllık Yapılan Kilometre:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {annualKm.toLocaleString('tr-TR')} km
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="2500"
                value={annualKm}
                onChange={(e) => setAnnualKm(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>5.000 km</span>
                <span>15.000 km (TR Ort.)</span>
                <span>30.000 km</span>
                <span>50.000 km</span>
              </div>
            </div>

            {/* ICE Fuel Spec */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Kıyaslanan İçten Yanmalı Tüketimi:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={fuelConsumption}
                    onChange={(e) => setFuelConsumption(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">L / 100km</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Akaryakıt Litre Fiyatı:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">₺ / Litre</span>
                </div>
              </div>
            </div>

            {/* Home vs DC Ratio Slider */}
            <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Şarj Alışkanlığı Dağılımı:</span>
                <span className="text-cyan-400 font-semibold font-mono">
                  %{homeRatio} Evde • %{100 - homeRatio} Dışarıda DC
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={homeRatio}
                onChange={(e) => setHomeRatio(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Tamamen Dışarıda DC (%10.45 ₺)</span>
                <span>Tamamen Evde Gece (%1.75 ₺)</span>
              </div>
            </div>
          </div>

          {/* Savings Outcome */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    Yıllık Tasarruf Raporu
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {annualKm.toLocaleString('tr-TR')} km / Yıl Kıyaslaması
                  </h3>
                </div>
                <div className="rounded-xl bg-emerald-950/80 px-3 py-1 text-xs text-emerald-300 border border-emerald-800/60 font-mono">
                  %{savingsResult?.savings_percent} Tasarruf
                </div>
              </div>

              {/* Big Savings Metric */}
              <div className="mt-6 rounded-2xl border border-emerald-900/50 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900/50 p-6 text-center shadow-xl">
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Yıllık Cepte Kalan Net Yakıt Tasarrufu
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400 font-mono tracking-tight">
                    {savingsResult ? savingsResult.annual_savings_tl.toLocaleString('tr-TR') : '...'}
                  </span>
                  <span className="text-lg font-bold text-emerald-300">₺</span>
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  5 Yılda Toplam:{' '}
                  <strong className="text-white font-mono">
                    {savingsResult ? (savingsResult.annual_savings_tl * 5).toLocaleString('tr-TR') : '...'} ₺
                  </strong>
                </span>
              </div>

              {/* Comparison Side-by-Side */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {/* ICE Cost */}
                <div className="rounded-xl border border-red-950/80 bg-red-950/20 p-4">
                  <span className="text-xs font-semibold text-red-400 block">Benzin / Dizel Araç</span>
                  <div className="mt-2 text-xl font-bold font-mono text-white">
                    {savingsResult ? savingsResult.ice_annual_fuel_cost_tl.toLocaleString('tr-TR') : '...'} ₺
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    km başı: {savingsResult?.ice_cost_per_km_tl} ₺
                  </span>
                </div>

                {/* EV Cost */}
                <div className="rounded-xl border border-emerald-950/80 bg-emerald-950/20 p-4">
                  <span className="text-xs font-semibold text-emerald-400 block">Elektrikli Araç (EV)</span>
                  <div className="mt-2 text-xl font-bold font-mono text-white">
                    {savingsResult ? savingsResult.ev_annual_charging_cost_tl.toLocaleString('tr-TR') : '...'} ₺
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    km başı: {savingsResult?.ev_cost_per_km_tl} ₺
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-400 border-t border-slate-800 pt-4">
              {savingsResult?.payback_comparison_note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

