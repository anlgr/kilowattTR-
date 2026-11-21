'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle, RoutePlannerResponse } from '../types';
import { calculateRoutePlan } from '../lib/api';
import { MapPin, Navigation, Snowflake, Sun, Clock, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface RoutePlannerProps {
  vehicles: Vehicle[];
}

const PRESET_ROUTES = [
  { name: 'İstanbul - İzmir Otoyolu', distance_km: 479, description: 'Osmangazi Köprüsü ve O-5 Otoyolu' },
  { name: 'İstanbul - Ankara Otoyolu', distance_km: 448, description: 'Kuzey Marmara & Anadolu Otoyolu' },
  { name: 'Ankara - Antalya (Afyon üzerinden)', distance_km: 485, description: 'D200 ve D650 güzergahı' },
  { name: 'İstanbul - Bodrum', distance_km: 690, description: 'İzmir otoyolu ve Söke-Milas hattı' },
  { name: 'İzmir - Antalya', distance_km: 450, description: 'Aydın - Denizli otoyolu üzerinden' },
  { name: 'İstanbul - Bursa', distance_km: 155, description: 'Kısa mesafe tek şarj rotası' }
];

export const RoutePlanner: React.FC<RoutePlannerProps> = ({ vehicles }) => {
  const [selectedRoute, setSelectedRoute] = useState(PRESET_ROUTES[0]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'togg-t10x-v2-long-range');
  const [departureSoc, setDepartureSoc] = useState<number>(90);
  const [minArrivalSoc, setMinArrivalSoc] = useState<number>(15);
  const [weatherCondition, setWeatherCondition] = useState<string>('mild');
  const [drivingStyle, setDrivingStyle] = useState<string>('normal');
  const [planResult, setPlanResult] = useState<RoutePlannerResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedVehicleId) return;
    setIsLoading(true);
    calculateRoutePlan({
      vehicle_id: selectedVehicleId,
      route_name: selectedRoute.name,
      distance_km: selectedRoute.distance_km,
      departure_soc_percent: departureSoc,
      min_arrival_soc_percent: minArrivalSoc,
      driving_style: drivingStyle,
      weather_condition: weatherCondition,
      preferred_network: 'all'
    }).then((res) => {
      setPlanResult(res);
      setIsLoading(false);
    });
  }, [selectedRoute, selectedVehicleId, departureSoc, minArrivalSoc, weatherCondition, drivingStyle]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3 py-1 text-xs font-semibold text-cyan-400 w-fit">
            <Navigation className="h-3.5 w-3.5" /> Akıllı Otoyol & Dinlenme Tesisi Simülatörü
          </div>
          <h2 className="text-2xl font-bold text-white">Elektrikli Araç Rota & Şarj Planlayıcı</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Hava sıcaklığı, otoyol hızı ve batarya eğrisine göre yolculuğunuzun durak sayılarını, bekleme sürelerini ve maliyetini planlayın.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Controls */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md lg:col-span-5 space-y-5">
          {/* Route Selector */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Popüler Rota Güzergahı:
            </label>
            <div className="space-y-2">
              {PRESET_ROUTES.map((r) => (
                <button
                  key={r.name}
                  onClick={() => setSelectedRoute(r)}
                  className={`w-full rounded-xl p-3 text-left transition-all border ${
                    selectedRoute.name === r.name
                      ? 'border-cyan-500 bg-cyan-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs">{r.name}</span>
                    <span className="font-mono text-cyan-400 text-xs font-bold">{r.distance_km} km</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{r.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Selector */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Yola Çıkılacak Araç:
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.trim}) - {v.battery_net_kwh} kWh
                </option>
              ))}
            </select>
          </div>

          {/* Weather Toggle */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Hava Durumu & Sıcaklık:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'winter', label: 'Kış (-5°C)', icon: Snowflake, note: '+%25 Tüketim' },
                { id: 'mild', label: 'Ilıman (20°C)', icon: Sun, note: 'Standart' },
                { id: 'summer', label: 'Yaz (35°C)', icon: Sun, note: '+%10 Klima' }
              ].map((w) => {
                const Icon = w.icon;
                return (
                  <button
                    key={w.id}
                    onClick={() => setWeatherCondition(w.id)}
                    className={`rounded-xl p-2 text-center text-xs border transition-all ${
                      weatherCondition === w.id
                        ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-semibold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 mx-auto mb-1" />
                    <span>{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Departure & Arrival SoC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Çıkış Şarjı (%):</span>
              <input
                type="number"
                min="50"
                max="100"
                value={departureSoc}
                onChange={(e) => setDepartureSoc(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-center text-xs font-mono text-cyan-400 font-bold focus:outline-none"
              />
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Güvenlik Payı (%):</span>
              <input
                type="number"
                min="10"
                max="30"
                value={minArrivalSoc}
                onChange={(e) => setMinArrivalSoc(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-center text-xs font-mono text-emerald-400 font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Route Output Results */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  Rota Özeti
                </span>
                <h3 className="text-xl font-bold text-white">{selectedRoute.name}</h3>
                <p className="text-xs text-slate-400">
                  Mesafe: <strong className="text-slate-200">{selectedRoute.distance_km} km</strong> • Efektif Tüketim:{' '}
                  <strong className="text-cyan-300">{planResult?.effective_consumption_kwh_100km} kWh/100km</strong>
                </p>
              </div>

              {/* Total Time Badge */}
              <div className="rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-right">
                <span className="text-[10px] text-slate-400 block">Toplam Seyahat Süresi</span>
                <span className="text-base font-bold font-mono text-white flex items-center gap-1 justify-end">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  {planResult ? `${Math.floor(planResult.total_trip_time_min / 60)}s ${planResult.total_trip_time_min % 60}dk` : '...'}
                </span>
                <span className="text-[10px] text-slate-500">
                  (Sürüş: {planResult ? Math.floor(planResult.total_driving_time_min / 60) : 0}s + Şarj: {planResult?.total_charge_time_min}dk)
                </span>
              </div>
            </div>

            {/* Stops Timeline */}
            <div className="mt-6 space-y-4">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-cyan-400" />
                Önerilen Şarj Durakları ({planResult?.stops_count || 0} Durak):
              </span>

              {planResult && planResult.stops_count === 0 ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block">Duraksız Ulaşılabilir!</span>
                    Aracınızın batarya kapasitesi ve başlangıç şarjı bu rotayı ara şarj yapmadan tamamlamak için yeterlidir.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {planResult?.stops.map((stop) => (
                    <div
                      key={stop.stop_index}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-950 text-xs font-bold text-cyan-400 border border-cyan-800 font-mono">
                          #{stop.stop_index}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{stop.location_name}</h4>
                          <span className="text-[11px] text-slate-400">
                            Ağ: <strong className="text-cyan-400">{stop.network_name}</strong> • Mesafe: KM {stop.distance_from_start_km}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="rounded-lg bg-slate-900 px-2.5 py-1 text-center border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Şarj Aralığı</span>
                          <span className="font-mono font-bold text-white">
                            %{stop.arrival_soc_percent} → %{stop.target_soc_percent}
                          </span>
                        </div>

                        <div className="rounded-lg bg-slate-900 px-2.5 py-1 text-center border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Süre</span>
                          <span className="font-mono font-bold text-cyan-300">
                            {stop.charge_duration_min} dk
                          </span>
                        </div>

                        <div className="rounded-lg bg-slate-900 px-2.5 py-1 text-center border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Maliyet</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {stop.estimated_cost_tl} ₺
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trip Cost Comparison Banner */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/30 p-4 text-center">
                <span className="text-[11px] text-slate-400 block">Toplam Rota Şarj Maliyeti</span>
                <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
                  {planResult?.total_charging_cost_tl.toLocaleString('tr-TR')} ₺
                </span>
                <span className="text-[10px] text-cyan-500/80">Otoyol HPC DC tarifeleri ile</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                <span className="text-[11px] text-slate-400 block">Muadil Benzinli Maliyeti</span>
                <span className="text-2xl font-bold font-mono text-slate-300 mt-1 block">
                  {planResult?.equivalent_fuel_cost_tl.toLocaleString('tr-TR')} ₺
                </span>
                <span className="text-[10px] text-slate-500">7.5L / 100km @ 43.50 ₺/L</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-3 text-[11px] text-slate-400 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              Rota planlaması Türkiye O-5 (İstanbul-İzmir) ve O-4 (İstanbul-Ankara) üzerindeki Trugo ve ZES yüksek güçlü şarj koridorları esas alınarak hesaplanmıştır.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

