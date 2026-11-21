'use client';

import React from 'react';
import { Vehicle } from '../types';
import { X, Check, Zap, BatteryCharging, Gauge, Snowflake, Navigation, ShieldCheck } from 'lucide-react';

interface VehicleComparisonModalProps {
  vehicles: Vehicle[];
  onClose: () => void;
}

export const VehicleComparisonModal: React.FC<VehicleComparisonModalProps> = ({
  vehicles,
  onClose
}) => {
  if (!vehicles || vehicles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg bg-slate-800/80 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/80 px-3 py-1 text-xs text-cyan-400 border border-cyan-800/60 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> Detaylı Teknik Kıyaslama
          </div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Elektrikli Araç Karşılaştırma Tablosu
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Seçilen modellerin batarya mimarisi, gerçek otoyol menzilleri ve şarj kabiliyetleri.
          </p>
        </div>

        {/* Vehicles Header Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center relative overflow-hidden"
            >
              <div className="h-28 w-full overflow-hidden rounded-lg bg-slate-950 mb-3">
                <img
                  src={v.image_url}
                  alt={v.model}
                  className="h-full w-full object-cover opacity-85"
                />
              </div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{v.brand}</span>
              <h3 className="font-bold text-white text-base">{v.model}</h3>
              <p className="text-xs text-slate-400 truncate">{v.trim}</p>
              <p className="mt-2 font-mono text-sm font-semibold text-emerald-400">
                {(v.price_try / 1000000).toFixed(2)} Milyon ₺
              </p>
            </div>
          ))}
        </div>

        {/* Spec Comparison Matrix */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-slate-800">
              {/* WLTP Range */}
              <tr className="bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-300 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-cyan-400" /> Fabrika WLTP Menzili
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 font-mono text-slate-100 font-bold">
                    {v.wltp_range_km} km
                  </td>
                ))}
              </tr>

              {/* Highway Range (120 km/h) */}
              <tr className="bg-cyan-950/20">
                <td className="p-3 font-semibold text-cyan-300 flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-cyan-400" /> Otoyol Menzili (120 km/h)
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 font-mono text-cyan-300 font-extrabold text-sm">
                    {v.real_range_highway_km} km
                  </td>
                ))}
              </tr>

              {/* Winter Range */}
              <tr>
                <td className="p-3 font-semibold text-slate-300 flex items-center gap-2">
                  <Snowflake className="h-4 w-4 text-blue-400" /> Kış Menzili (-5°C Isıtma Açık)
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 font-mono text-slate-200">
                    {v.real_range_winter_km} km
                  </td>
                ))}
              </tr>

              {/* Battery Capacity */}
              <tr className="bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-300">Batarya Net / Brüt</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 font-mono text-slate-200">
                    <strong className="text-white">{v.battery_net_kwh}</strong> / {v.battery_gross_kwh} kWh
                  </td>
                ))}
              </tr>

              {/* DC Max Charge Power */}
              <tr>
                <td className="p-3 font-semibold text-slate-300 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" /> Maksimum DC Şarj Hızı
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 font-mono font-bold text-emerald-400 text-sm">
                    {v.max_dc_charging_power_kw} kW
                  </td>
                ))}
              </tr>

              {/* 10-80% Charge Duration */}
              <tr className="bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-300 flex items-center gap-2">
                  <BatteryCharging className="h-4 w-4 text-cyan-400" /> %10 - %80 Dolum Süresi
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 font-mono font-bold text-cyan-300">
                    {v.charging_time_dc_10_to_80_min} dakika
                  </td>
                ))}
              </tr>

              {/* Consumption */}
              <tr>
                <td className="p-3 font-semibold text-slate-300">Ortalama Tüketim</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 font-mono text-slate-200">
                    {v.avg_consumption_kwh_100km} kWh / 100km
                  </td>
                ))}
              </tr>

              {/* 0-100 Acceleration */}
              <tr className="bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-300">0 - 100 km/s Hızlanma</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 font-mono text-slate-200 font-bold">
                    {v.acceleration_0_100_s} saniye
                  </td>
                ))}
              </tr>

              {/* Drive Type & Power */}
              <tr>
                <td className="p-3 font-semibold text-slate-300">Çekiş & Motor Gücü</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-slate-200">
                    {v.drive_type} • {v.motor_power_hp} HP
                  </td>
                ))}
              </tr>

              {/* Trunk */}
              <tr className="bg-slate-950/40">
                <td className="p-3 font-semibold text-slate-300">Bagaj Kapasitesi</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 font-mono text-slate-200">
                    {v.trunk_capacity_liters} Litre
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

