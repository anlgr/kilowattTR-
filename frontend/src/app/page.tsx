'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Gauge,
  Calculator,
  Newspaper,
  BatteryCharging,
  TrendingUp,
  Snowflake,
  Sun,
  Navigation,
  ShieldCheck,
  Radio,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  Layers,
  Check,
  Search,
  Sparkles,
  Fuel,
  X,
  User,
  Share2,
  Flame,
  Award,
  ArrowRight
} from 'lucide-react';
import { FALLBACK_VEHICLES } from '../data/fallbackData';
import { TURKIYE_CITIES, computeCityRoute } from '../data/turkiyeCities';
import { Vehicle } from '../types';

interface ScrapedOperator {
  id: string;
  name: string;
  short_name: string;
  logo_color: string;
  ac_rate_tl: number;
  dc_60kw_rate_tl: number;
  dc_120kw_rate_tl: number;
  dc_180kw_plus_rate_tl: number;
  member_discount_percent: number;
  overtime_fee_tl_min: number;
  station_count: number;
  supported_sockets: string[];
  source_url: string;
  status: string;
  updated_at: string;
}

interface TariffPayload {
  metadata: {
    title: string;
    display_date: string;
    currency: string;
    unit: string;
  };
  operators: ScrapedOperator[];
  residential: ScrapedOperator[];
  all_tariffs: ScrapedOperator[];
}

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  source?: string;
  url?: string;
  date: string;
  read_time?: string;
  tag: string;
  tagBg: string;
  imageUrl: string;
}

interface NewsPayload {
  metadata: {
    source: string;
    is_live: boolean;
    updated_at: string;
    total_count: number;
  };
  hero_slides: NewsArticle[];
  news_list: NewsArticle[];
  all_articles: NewsArticle[];
}

interface ChargeLogEntry {
  id: string;
  date: string;
  vehicleName: string;
  operatorName: string;
  socRange: string;
  kwh: number;
  costTl: number;
  savedTl: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'tum' | 'hesaplayici' | 'rota' | 'sihirbaz' | 'gundem' | 'menzil' | 'tarifeler'>('tum');
  const [tariffData, setTariffData] = useState<TariffPayload | null>(null);

  const navigateToSection = (
    tab: 'tum' | 'hesaplayici' | 'rota' | 'sihirbaz' | 'gundem' | 'menzil' | 'tarifeler',
    sectionId?: string
  ) => {
    setActiveTab(tab);
    if (!sectionId || sectionId === 'ana-sayfa') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const [newsData, setNewsData] = useState<NewsPayload | null>(null);
  const [isRefreshingNews, setIsRefreshingNews] = useState<boolean>(false);
  const [vehicles] = useState<Vehicle[]>(FALLBACK_VEHICLES);

  // Hero Slider
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Calculator State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('togg-t10x-v2-long-range');
  const [startSoc, setStartSoc] = useState<number>(15);
  const [targetSoc, setTargetSoc] = useState<number>(80);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('trugo');
  const [socketPowerType, setSocketPowerType] = useState<'ac' | 'dc_60' | 'dc_hpc'>('dc_hpc');
  const [applyDiscount, setApplyDiscount] = useState<boolean>(true);

  // Range Guide State
  const [rangeMode, setRangeMode] = useState<'highway' | 'winter' | 'city' | 'wltp'>('highway');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [compareItems, setCompareItems] = useState<Vehicle[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Akıllı EV Seçim Sihirbazı State
  const [wizardMaxBudget, setWizardMaxBudget] = useState<number>(2500000);
  const [wizardMinHighwayKm, setWizardMinHighwayKm] = useState<number>(330);
  const [wizardPriority, setWizardPriority] = useState<'uzun-yol' | 'fiyat-performans' | 'hizli-sarj' | 'performans'>('uzun-yol');
  const [wizardDriveFilter, setWizardDriveFilter] = useState<'all' | 'tek-motor' | 'awd'>('all');

  // Akıllı Eşleşme Puanlama Motoru
  const wizardRecommendations = (() => {
    const scored = vehicles
      .filter((v) => {
        if (wizardDriveFilter === 'awd' && v.drive_type !== 'AWD') return false;
        if (wizardDriveFilter === 'tek-motor' && v.drive_type === 'AWD') return false;
        return true;
      })
      .map((v) => {
        let score = 78;
        const reasons: string[] = [];

        // 1. Bütçe Uyumu
        if (v.price_try <= wizardMaxBudget) {
          score += 10;
          const budgetDiff = wizardMaxBudget - v.price_try;
          if (budgetDiff >= 250000) {
            score += 3;
            reasons.push(`Bütçenizin ${Math.round(budgetDiff / 1000)} Bin ₺ altında`);
          } else {
            reasons.push('Bütçe limitinize tam uyumlu');
          }
        } else {
          const overRatio = (v.price_try - wizardMaxBudget) / wizardMaxBudget;
          score -= Math.min(35, Math.round(overRatio * 80));
        }

        // 2. Otoyol Menzil Uyumu
        if (v.real_range_highway_km >= wizardMinHighwayKm) {
          score += 8;
          reasons.push(`${v.real_range_highway_km} km gerçek otoyol menzili`);
        } else {
          const deficit = wizardMinHighwayKm - v.real_range_highway_km;
          score -= Math.min(25, Math.round(deficit / 5));
        }

        // 3. Kullanıcı Önceliği Puanı
        if (wizardPriority === 'uzun-yol') {
          score += Math.round((v.real_range_highway_km - 300) / 14);
          if (v.battery_net_kwh >= 75) reasons.push(`${v.battery_net_kwh} kWh büyük batarya`);
        } else if (wizardPriority === 'fiyat-performans') {
          const rangePerMillion = v.real_range_highway_km / (v.price_try / 1000000);
          score += Math.round((rangePerMillion - 160) / 8);
          if (v.avg_consumption_kwh_100km <= 16.0) {
            reasons.push(`${v.avg_consumption_kwh_100km} kWh/100km düşük tüketim`);
          }
        } else if (wizardPriority === 'hizli-sarj') {
          score += Math.round((v.max_dc_charging_power_kw - 120) / 10);
          if (v.charging_time_dc_10_to_80_min <= 28) {
            reasons.push(`%10-%80 sadece ${v.charging_time_dc_10_to_80_min} dk (${v.max_dc_charging_power_kw} kW DC)`);
          }
        } else if (wizardPriority === 'performans') {
          score += Math.round((450 - v.acceleration_0_100_s * 40) / 18);
          if (v.motor_power_hp >= 218) {
            reasons.push(`${v.motor_power_hp} BG • 0-100: ${v.acceleration_0_100_s} sn`);
          }
        }

        if (v.trunk_capacity_liters >= 480 && reasons.length < 3) {
          reasons.push(`${v.trunk_capacity_liters} L geniş bagaj hacmi`);
        }

        const matchPercent = Math.max(55, Math.min(99, score));
        return {
          vehicle: v,
          matchPercent,
          reasons: reasons.slice(0, 3),
        };
      });

    scored.sort((a, b) => b.matchPercent - a.matchPercent);
    return scored.slice(0, 3);
  })();

  // "Aracım" (Kişisel EV Garajım & Şarj Defteri) State
  const [isGarageOpen, setIsGarageOpen] = useState<boolean>(false);
  const [myPlate, setMyPlate] = useState<string>('34 TOG 2026');
  const [myOdometerKm, setMyOdometerKm] = useState<number>(14500);
  const [myBatterySoh, setMyBatterySoh] = useState<number>(98);
  const [myMonthlyKm, setMyMonthlyKm] = useState<number>(1500);
  const [myHomeChargeRatio, setMyHomeChargeRatio] = useState<number>(70);
  const [chargeLogs, setChargeLogs] = useState<ChargeLogEntry[]>([
    {
      id: 'sample-1',
      date: '20.11.2026',
      vehicleName: 'Togg T10X',
      operatorName: 'Trugo',
      socRange: '%18 → %80',
      kwh: 55.1,
      costTl: 573,
      savedTl: 412,
    },
    {
      id: 'sample-2',
      date: '16.11.2026',
      vehicleName: 'Togg T10X',
      operatorName: 'Ev (Gece 22-06)',
      socRange: '%25 → %90',
      kwh: 59.6,
      costTl: 104,
      savedTl: 938,
    },
  ]);

  // Load saved garage profile & logs from localStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('kilowatt_my_garage_v1');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.vehicleId) setSelectedVehicleId(parsed.vehicleId);
        if (parsed.plate) setMyPlate(parsed.plate);
        if (typeof parsed.odometerKm === 'number') setMyOdometerKm(parsed.odometerKm);
        if (typeof parsed.batterySoh === 'number') setMyBatterySoh(parsed.batterySoh);
        if (typeof parsed.monthlyKm === 'number') setMyMonthlyKm(parsed.monthlyKm);
        if (typeof parsed.homeChargeRatio === 'number') setMyHomeChargeRatio(parsed.homeChargeRatio);
      }
      const savedLogs = localStorage.getItem('kilowatt_charge_logs_v1');
      if (savedLogs) {
        setChargeLogs(JSON.parse(savedLogs));
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  // Persist garage profile changes
  useEffect(() => {
    try {
      localStorage.setItem(
        'kilowatt_my_garage_v1',
        JSON.stringify({
          vehicleId: selectedVehicleId,
          plate: myPlate,
          odometerKm: myOdometerKm,
          batterySoh: myBatterySoh,
          monthlyKm: myMonthlyKm,
          homeChargeRatio: myHomeChargeRatio,
        })
      );
    } catch {
      // Ignore storage error
    }
  }, [selectedVehicleId, myPlate, myOdometerKm, myBatterySoh, myMonthlyKm, myHomeChargeRatio]);

  const addCurrentChargeToLogbook = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const newEntry: ChargeLogEntry = {
      id: `log-${Date.now()}`,
      date: `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`,
      vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model}`,
      operatorName: selectedOperator.short_name,
      socRange: `%${startSoc} → %${targetSoc}`,
      kwh: billedEnergyKwh,
      costTl: totalCostTl,
      savedTl: savingsDeltaTl,
    };
    const updated = [newEntry, ...chargeLogs];
    setChargeLogs(updated);
    try {
      localStorage.setItem('kilowatt_charge_logs_v1', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setIsGarageOpen(true);
  };

  const removeChargeLog = (id: string) => {
    const updated = chargeLogs.filter((item) => item.id !== id);
    setChargeLogs(updated);
    try {
      localStorage.setItem('kilowatt_charge_logs_v1', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Highway Route Planner State (81 İl + Turizm Merkezleri Manuel Seçim)
  const POPULAR_CITY_PAIRS = [
    { origin: 'İstanbul', destination: 'İzmir', label: 'İstanbul → İzmir' },
    { origin: 'İstanbul', destination: 'Ankara', label: 'İstanbul → Ankara' },
    { origin: 'İstanbul', destination: 'Antalya', label: 'İstanbul → Antalya' },
    { origin: 'Ankara', destination: 'Antalya', label: 'Ankara → Antalya' },
    { origin: 'İstanbul', destination: 'Bodrum (Muğla)', label: 'İstanbul → Bodrum' },
    { origin: 'Ankara', destination: 'İzmir', label: 'Ankara → İzmir' },
  ];

  const [originCity, setOriginCity] = useState<string>('İstanbul');
  const [destinationCity, setDestinationCity] = useState<string>('Ankara');
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(450);
  const [departureSoc, setDepartureSoc] = useState<number>(95);
  const [cruiseSpeed, setCruiseSpeed] = useState<110 | 120 | 130>(120);
  const [routeWeather, setRouteWeather] = useState<'normal' | 'winter' | 'summer'>('normal');

  const handleCityRouteChange = (newOrigin: string, newDest: string) => {
    setOriginCity(newOrigin);
    setDestinationCity(newDest);
    const computed = computeCityRoute(newOrigin, newDest);
    setRouteDistanceKm(computed.distanceKm);
  };

  // Fallback Hero stories
  const defaultHeroSlides: NewsArticle[] = [
    {
      id: 1,
      tag: "ÖNE ÇIKAN HABER",
      tagBg: "bg-red-600 text-white",
      date: "20 Kasım 2026",
      source: "KilowattTR Haber Merkezi",
      url: "https://news.google.com/search?q=elektrikli+otomobil&hl=tr&gl=TR&ceid=TR:tr",
      title: "Türkiye Otoyollarında 300 kW+ HPC Şarj Koridoru Genişliyor: Dinlenme Tesislerinde Kapasite %35 Arttı",
      description: "İstanbul - İzmir (O-5) ve İstanbul - Ankara (O-4) otoyol dinlenme tesislerindeki Trugo ve ZES ultra hızlı şarj istasyonlarının soket sayıları artırılarak seyahat süreleri kısaltıldı.",
      imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 2,
      tag: "TARİFE RAPORU",
      tagBg: "bg-cyan-600 text-white",
      date: "20 Kasım 2026",
      source: "KilowattTR Veri Merkezi",
      url: "https://www.trugo.com.tr",
      title: "ZES, Trugo ve Eşarj Kasım 2026 Tarifeleri Karşılaştırması: En Hızlı ve En Uygun Şarj Hangisi?",
      description: "Operatörlerin resmi sayfalarından çekilen canlı verilere göre DC Ultra HPC tarifeleri 10.40 - 10.99 ₺/kWh seviyesinde dengelendi.",
      imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 3,
      tag: "GERÇEK MENZİL TESTİ",
      tagBg: "bg-emerald-600 text-white",
      date: "20 Kasım 2026",
      source: "EV Test Merkezi",
      url: "https://www.togg.com.tr",
      title: "Togg T10X vs Tesla Model Y vs BYD Seal: 120 km/s Otoyol ve Kış Koşullarında Gerçek Tüketim Testi",
      description: "Fabrika WLTP menzilleri ile gerçek dünya otoyol hızları arasındaki farklar ve soğuk hava batarya optimizasyonu verileri yayında.",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  const heroSlides = newsData?.hero_slides?.length ? newsData.hero_slides : defaultHeroSlides;
  const newsList = newsData?.news_list?.length ? newsData.news_list : defaultHeroSlides;

  // Auto rotate hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Canlı haberleri çeken fonksiyon (/api/news üzerinden anlık RSS, yedek olarak /data/ev_haberleri.json)
  const refreshLiveNews = async () => {
    setIsRefreshingNews(true);
    try {
      const liveRes = await fetch('/api/news', { cache: 'no-store' });
      if (liveRes.ok) {
        const nJson = await liveRes.json();
        if (nJson?.hero_slides?.length) {
          setNewsData(nJson);
          setIsRefreshingNews(false);
          return;
        }
      }
      const staticRes = await fetch('/data/ev_haberleri.json');
      if (staticRes.ok) {
        const sJson = await staticRes.json();
        setNewsData(sJson);
      }
    } catch (err) {
      console.log('Local JSON fallback');
    } finally {
      setIsRefreshingNews(false);
    }
  };

  // Sayfa açılışında ve her 5 dakikada bir haberleri & tarifeleri otomatik güncelle
  useEffect(() => {
    async function loadInitialData() {
      try {
        const tariffRes = await fetch('/data/sarj_tarifeleri.json');
        if (tariffRes.ok) {
          const tJson = await tariffRes.json();
          setTariffData(tJson);
        }
      } catch (err) {
        console.log('Tariff fallback');
      }
      await refreshLiveNews();
    }

    loadInitialData();

    // Her 5 dakikada (300.000 ms) bir arka planda canlı haberleri otomatik yenile
    const newsInterval = setInterval(() => {
      refreshLiveNews();
    }, 5 * 60 * 1000);

    return () => clearInterval(newsInterval);
  }, []);

  const allOperators = tariffData?.all_tariffs || [
    {
      id: "zes",
      name: "ZES (Zorlu Energy Solutions)",
      short_name: "ZES",
      logo_color: "#0099ff",
      ac_rate_tl: 9.99,
      dc_60kw_rate_tl: 12.99,
      dc_120kw_rate_tl: 13.99,
      dc_180kw_plus_rate_tl: 16.49,
      member_discount_percent: 5,
      overtime_fee_tl_min: 1.00,
      station_count: 4450,
      supported_sockets: ["Type 2 (AC 22kW)", "CCS2 (DC Hızlı)", "CHAdeMO"],
      source_url: "https://zes.net/tarifeler",
      status: "verified",
      updated_at: "Kasım 2026"
    },
    {
      id: "trugo",
      name: "Trugo (Togg Şarj Ağı)",
      short_name: "Trugo",
      logo_color: "#00d084",
      ac_rate_tl: 9.95,
      dc_60kw_rate_tl: 12.99,
      dc_120kw_rate_tl: 13.99,
      dc_180kw_plus_rate_tl: 14.98,
      member_discount_percent: 0,
      overtime_fee_tl_min: 1.00,
      station_count: 1150,
      supported_sockets: ["CCS2 (180-300kW Ultra HPC)", "Type 2 (AC 22kW)"],
      source_url: "https://www.trugo.com.tr/fiyatlandirma",
      status: "verified",
      updated_at: "Kasım 2026"
    },
    {
      id: "esarj",
      name: "Eşarj (Enerjisa)",
      short_name: "Eşarj",
      logo_color: "#ff5500",
      ac_rate_tl: 9.40,
      dc_60kw_rate_tl: 11.90,
      dc_120kw_rate_tl: 12.90,
      dc_180kw_plus_rate_tl: 13.50,
      member_discount_percent: 10,
      overtime_fee_tl_min: 1.00,
      station_count: 2350,
      supported_sockets: ["Type 2 (AC)", "CCS2 (DC)", "CHAdeMO"],
      source_url: "https://esarj.com/fiyat-tarifesi",
      status: "verified",
      updated_at: "Kasım 2026"
    },
    {
      id: "home-night",
      name: "Evde Şarj (3 Zamanlı Gece)",
      short_name: "Ev (Gece 22-06)",
      logo_color: "#0284c7",
      ac_rate_tl: 2.35,
      dc_60kw_rate_tl: 2.35,
      dc_120kw_rate_tl: 2.35,
      dc_180kw_plus_rate_tl: 2.35,
      member_discount_percent: 0,
      overtime_fee_tl_min: 0,
      station_count: 0,
      supported_sockets: ["Schuko (2.3kW)", "Wallbox 11kW"],
      source_url: "https://epdk.gov.tr",
      status: "official_epdk",
      updated_at: "EPDK 2026"
    }
  ];

  // Active Vehicle & Operator
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const selectedOperator = allOperators.find((op) => op.id === selectedOperatorId) || allOperators[1];

  // Price computation
  let baseUnitPrice = selectedOperator.dc_180kw_plus_rate_tl;
  let chargerPowerKw = Math.min(180, selectedVehicle.max_dc_charging_power_kw);

  if (socketPowerType === 'ac') {
    baseUnitPrice = selectedOperator.ac_rate_tl;
    chargerPowerKw = selectedVehicle.max_ac_charging_power_kw;
  } else if (socketPowerType === 'dc_60') {
    baseUnitPrice = selectedOperator.dc_60kw_rate_tl;
    chargerPowerKw = Math.min(60, selectedVehicle.max_dc_charging_power_kw);
  }

  if (applyDiscount && selectedOperator.member_discount_percent > 0) {
    baseUnitPrice = baseUnitPrice * (1 - selectedOperator.member_discount_percent / 100);
  }
  baseUnitPrice = Math.round(baseUnitPrice * 100) / 100;

  // Added energy & metrics
  const socDelta = Math.max(0, (targetSoc - startSoc) / 100);
  const netBatteryKwh = selectedVehicle.battery_net_kwh;
  const rawKwh = socDelta * netBatteryKwh;
  const efficiency = socketPowerType === 'ac' ? 0.90 : 0.93;
  const billedEnergyKwh = Math.round((rawKwh / efficiency) * 10) / 10;
  const totalCostTl = Math.round(billedEnergyKwh * baseUnitPrice);
  const addedRangeKm = Math.round((rawKwh / selectedVehicle.avg_consumption_kwh_100km) * 100);
  const costPerKmTl = Math.round((totalCostTl / Math.max(1, addedRangeKm)) * 100) / 100;
  const estMinutes = Math.max(
    12,
    Math.round((rawKwh / (chargerPowerKw * 0.72)) * 60)
  );
  const equivalentGasCostTl = Math.round((addedRangeKm / 100) * 7.5 * 43.50);
  const savingsDeltaTl = Math.max(0, equivalentGasCostTl - totalCostTl);

  // Highway Route Planner Computation
  const computedRoute = computeCityRoute(originCity, destinationCity);
  const activeCorridor = {
    origin: originCity,
    destination: destinationCity,
    highway: computedRoute.highway,
    hubs: computedRoute.hubs,
  };
  const baseHighwayConsumption =
    (selectedVehicle.battery_net_kwh / Math.max(180, selectedVehicle.real_range_highway_km)) * 100;
  const speedMultiplier = cruiseSpeed === 110 ? 0.90 : cruiseSpeed === 130 ? 1.15 : 1.0;
  const weatherMultiplier = routeWeather === 'winter' ? 1.16 : routeWeather === 'summer' ? 1.06 : 1.0;
  const effectiveRouteConsumption = Math.round(baseHighwayConsumption * speedMultiplier * weatherMultiplier * 10) / 10;
  const fullChargeHighwayRangeKm = Math.round((selectedVehicle.battery_net_kwh / effectiveRouteConsumption) * 100);
  const totalRouteEnergyKwh = Math.round((routeDistanceKm / 100) * effectiveRouteConsumption * 10) / 10;

  // Simulate highway stops (keeping minimum 15% safety buffer, charging up to 80% at DC HPC stops)
  const routeSimulation = (() => {
    const netKwh = selectedVehicle.battery_net_kwh;
    const hpcUnitPrice = selectedOperator.dc_180kw_plus_rate_tl * (applyDiscount && selectedOperator.member_discount_percent > 0 ? 1 - selectedOperator.member_discount_percent / 100 : 1);
    const avgDcPowerKw = Math.min(180, selectedVehicle.max_dc_charging_power_kw) * 0.74;

    let currentSoc = departureSoc;
    let coveredKm = 0;
    const stops: Array<{
      stopNumber: number;
      hubName: string;
      networks: string;
      kmMark: number;
      arrivalSoc: number;
      departSoc: number;
      addedKwh: number;
      durationMin: number;
      costTl: number;
    }> = [];

    let stopIndex = 0;
    while (coveredKm < routeDistanceKm && stopIndex < 5) {
      const remainingKm = routeDistanceKm - coveredKm;
      const neededKwhToFinish = (remainingKm / 100) * effectiveRouteConsumption;
      const neededSocToFinish = (neededKwhToFinish / netKwh) * 100;

      // Eğer varışta en az %12 şarj kalıyorsa duraksız tamamla
      if (currentSoc - neededSocToFinish >= 12) {
        currentSoc = Math.max(10, Math.round(currentSoc - neededSocToFinish));
        coveredKm = routeDistanceKm;
        break;
      }

      // Güvenli menzil (%15 batarya rezervine kadar gidilebilecek mesafe)
      const usableSoc = Math.max(15, currentSoc - 16);
      const legRangeKm = Math.round(((usableSoc / 100) * netKwh / effectiveRouteConsumption) * 100);
      const targetStopKm = Math.min(routeDistanceKm - 40, coveredKm + legRangeKm);

      // Koridordaki en uygun dinlenme tesisini seç
      const candidateHub =
        activeCorridor.hubs.find((h) => h.km > coveredKm + 50 && h.km <= coveredKm + legRangeKm + 45) ||
        activeCorridor.hubs[stopIndex % activeCorridor.hubs.length];

      const actualStopKm =
        candidateHub && candidateHub.km > coveredKm + 40 && candidateHub.km < routeDistanceKm - 30
          ? candidateHub.km
          : targetStopKm;

      const legDist = Math.max(50, actualStopKm - coveredKm);
      const usedSoc = Math.min(currentSoc - 10, Math.round((((legDist / 100) * effectiveRouteConsumption) / netKwh) * 100));
      const arrivalSoc = Math.max(10, currentSoc - usedSoc);

      // Kalan yola göre %80 veya yeterli hedef şarj belirle
      const remAfterStopKm = routeDistanceKm - actualStopKm;
      const socNeededAfterStop = Math.ceil((((remAfterStopKm / 100) * effectiveRouteConsumption) / netKwh) * 100) + 18;
      const departSoc = Math.min(85, Math.max(arrivalSoc + 25, Math.min(80, socNeededAfterStop)));

      const addedKwh = Math.round(((departSoc - arrivalSoc) / 100) * netKwh * 10) / 10;
      const billedKwh = addedKwh / 0.93;
      const durationMin = Math.max(12, Math.round((addedKwh / avgDcPowerKw) * 60));
      const costTl = Math.round(billedKwh * hpcUnitPrice);

      stops.push({
        stopNumber: stopIndex + 1,
        hubName: candidateHub ? candidateHub.name : `${ actualStopKm }. km Otoyol HPC Tesisi`,
        networks: candidateHub ? candidateHub.networks : 'Trugo 180kW • ZES 180kW',
        kmMark: actualStopKm,
        arrivalSoc,
        departSoc,
        addedKwh,
        durationMin,
        costTl,
      });

      coveredKm = actualStopKm;
      currentSoc = departSoc;
      stopIndex++;
    }

    const totalChargingMin = stops.reduce((acc, s) => acc + s.durationMin, 0);
    const totalStopCostTl = stops.reduce((acc, s) => acc + s.costTl, 0);
    const drivingHours = Math.floor(routeDistanceKm / cruiseSpeed);
    const drivingMins = Math.round(((routeDistanceKm / cruiseSpeed) - drivingHours) * 60);
    const gasRouteCostTl = Math.round((routeDistanceKm / 100) * 7.4 * 43.50);

    return {
      stops,
      arrivalSoc: currentSoc,
      totalChargingMin,
      totalStopCostTl,
      drivingTimeText: `${drivingHours} sa ${drivingMins} dk`,
      gasRouteCostTl,
      routeSavingsTl: Math.max(0, gasRouteCostTl - totalStopCostTl),
    };
  })();

  // Range Guide filters
  const filteredVehicles = vehicles.filter((v) => {
    const query = searchTerm.toLowerCase();
    const matchSearch =
      v.brand.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query) ||
      v.trim.toLowerCase().includes(query);
    const matchBrand = selectedBrand === 'all' || v.brand === selectedBrand;
    return matchSearch && matchBrand;
  });

  const brands = ['all', ...Array.from(new Set(vehicles.map((v) => v.brand)))];

  const getRangeByMode = (v: Vehicle) => {
    switch (rangeMode) {
      case 'highway':
        return { val: v.real_range_highway_km, title: 'Otoyol (120 km/s)', badge: 'Gerçek Seyahat' };
      case 'winter':
        return { val: v.real_range_winter_km, title: 'Kış (-5°C)', badge: 'Isıtma Devrede' };
      case 'city':
        return { val: v.real_range_city_km, title: 'Şehir İçi', badge: 'Rejenerasyon Yüksek' };
      case 'wltp':
      default:
        return { val: v.wltp_range_km, title: 'WLTP Fabrika', badge: 'Laboratuvar' };
    }
  };

  const toggleCompare = (v: Vehicle) => {
    if (compareItems.some((item) => item.id === v.id)) {
      setCompareItems(compareItems.filter((item) => item.id !== v.id));
    } else {
      if (compareItems.length >= 3) {
        alert("En fazla 3 aracı aynı anda karşılaştırabilirsiniz.");
        return;
      }
      setCompareItems([...compareItems, v]);
    }
  };

  return (
    <div id="ana-sayfa" className="min-h-screen bg-[#f5f6f8] text-slate-800 flex flex-col justify-between selection:bg-[#0284c7] selection:text-white">
      {/* 1. TOP MICRO TICKER */}
      <div className="border-b border-slate-200 bg-white px-4 py-1.5 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-cyan-700 font-bold">
              <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-600" /> CANLI PİYASA
            </span>
            <span className="text-slate-300">|</span>
            <span>EPDK Ev Gece: <strong className="text-emerald-700 font-mono">2.35 ₺/kWh</strong></span>
            <span className="text-slate-300">|</span>
            <span>Trugo HPC: <strong className="text-slate-800 font-mono">14.98 ₺/kWh</strong></span>
            <span className="text-slate-300">|</span>
            <span>ZES DC / HPC: <strong className="text-slate-800 font-mono">12.99 – 16.49 ₺/kWh</strong></span>
            <span className="text-slate-300">|</span>
            <span>Eşarj DC: <strong className="text-orange-700 font-mono">13.50 ₺/kWh</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500">
            <span>21 Kasım 2026</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600 font-semibold">sarj_tarifeleri.json Aktif</span>
          </div>
        </div>
      </div>

      {/* 2. PURE WHITE HEADER (OTOPARK.COM STYLE) */}
      <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-col lg:flex-row items-center justify-between gap-5">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('tum')}>
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-700 text-white shadow-md shadow-cyan-600/20">
              <Zap className="h-8 w-8 fill-current" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-mono flex items-center">
                KILOWATT<span className="text-cyan-600">TR</span>
                <span className="ml-2 rounded-md bg-cyan-50 px-2 py-0.5 text-xs font-bold text-cyan-700 border border-cyan-200 font-sans">
                  .COM
                </span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 mt-0.5">
                S Ü R Ü C Ü N Ü N &nbsp; E V &nbsp; R E H B E R İ
              </p>
            </div>
          </div>

          {/* Right Banner Leaderboard (Otopark style automotive sponsor ad) */}
          <div className="w-full lg:w-[680px] h-[80px] rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-cyan-50/50 p-3 px-5 flex items-center justify-between shadow-xs relative overflow-hidden group">
            <div className="flex items-center gap-4 z-10">
              <div className="rounded-xl bg-slate-900 text-white px-3 py-2 font-black text-xs font-mono shadow-sm">
                TOGG T10X
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="text-cyan-700">Uzun Menzilli Yerli Akıllı Cihaz:</span> 523 km WLTP
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Trugo 180 kW+ HPC istasyonlarında %20'den %80'e 28 dakikada şarj
                </div>
              </div>
            </div>
            <a
              href="#hesaplayici"
              onClick={() => setActiveTab('hesaplayici')}
              className="z-10 rounded-xl bg-slate-900 hover:bg-cyan-700 px-4 py-2 text-xs font-bold text-white shadow-sm whitespace-nowrap transition-colors"
            >
              Hemen Hesapla →
            </a>
          </div>
        </div>
      </div>

      {/* 3. SLEEK DARK HORIZONTAL NAVIGATION BAR (OTOPARK.COM STYLE) */}
      <nav className="sticky top-0 z-50 bg-[#1e232d] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Main Links (Native Anchor + Smooth Scroll) */}
          <div className="flex items-center space-x-1 sm:space-x-1 py-1 overflow-x-auto">
            <a
              href="#ana-sayfa"
              onClick={() => navigateToSection('tum', 'ana-sayfa')}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'tum'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Ana Sayfa
            </a>

            <a
              href="#hesaplayici"
              onClick={() => navigateToSection('hesaplayici', 'hesaplayici')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'hesaplayici'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Şarj Maliyeti Hesaplayıcı</span>
            </a>

            <a
              href="#rota-planlayici"
              onClick={() => navigateToSection('rota', 'rota-planlayici')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'rota'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Navigation className="h-3.5 w-3.5 text-cyan-400" />
              <span>Uzun Yol Rota Planlayıcı</span>
            </a>

            <a
              href="#ev-sihirbazi"
              onClick={() => navigateToSection('sihirbaz', 'ev-sihirbazi')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'sihirbaz'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>EV Seçim Sihirbazı</span>
            </a>

            <a
              href="#gundem"
              onClick={() => navigateToSection('gundem', 'gundem')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'gundem'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Newspaper className="h-3.5 w-3.5" />
              <span>EV Gündem</span>
            </a>

            <a
              href="#menzil"
              onClick={() => navigateToSection('menzil', 'menzil')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'menzil'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Gauge className="h-3.5 w-3.5" />
              <span>Menzil Rehberi</span>
            </a>

            <a
              href="#tarifeler"
              onClick={() => navigateToSection('tarifeler', 'tarifeler')}
              className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'tarifeler'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-200 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <span>Tarifeler</span>
            </a>
          </div>

          {/* Right Nav: Search Input + User Login */}
          <div className="flex items-center gap-3 py-1.5">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Araç veya marka ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigateToSection('menzil', 'menzil');
                  }
                }}
                className="w-48 lg:w-56 rounded-lg border border-slate-600 bg-slate-800/80 py-1.5 pl-3 pr-8 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
              />
              <a
                href="#menzil"
                onClick={() => navigateToSection('menzil', 'menzil')}
                title="Menzil Rehberinde Ara"
                className="absolute right-2.5 top-2 text-slate-400 hover:text-cyan-400 cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsGarageOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white transition-colors border border-cyan-500 shadow-2xs cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-white" />
              <span>Aracım • {selectedVehicle.model}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 4. MAIN EDITORIAL CONTENT (2/3 CONTENT + 1/3 SIDEBAR) */}
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 flex-1">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ======================================================== */}
          {/* LEFT 8 COLUMNS: HERO SLIDER, CALCULATOR & MAIN CONTENT   */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-7">
            {/* FEATURED EDITORIAL HERO SLIDER */}
            <div className="relative h-[360px] sm:h-[400px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md group">
              <img
                src={heroSlides[currentSlide]?.imageUrl}
                alt={heroSlides[currentSlide]?.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />

              {/* Left & Right Arrow Controls (Transparent) */}
              <button
                type="button"
                onClick={() =>
                  setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
                }
                aria-label="Önceki Haber"
                title="Önceki Haber"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white/75 hover:text-white border border-white/15 backdrop-blur-[2px] opacity-40 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
                }
                aria-label="Sonraki Haber"
                title="Sonraki Haber"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white/75 hover:text-white border border-white/15 backdrop-blur-[2px] opacity-40 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Slider Content */}
              <div className="absolute bottom-6 left-6 right-6 z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${heroSlides[currentSlide]?.tagBg || 'bg-cyan-600 text-white'}`}>
                    {heroSlides[currentSlide]?.tag}
                  </span>
                  {heroSlides[currentSlide]?.source && (
                    <span className="rounded-md bg-white/15 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-cyan-300 border border-white/15">
                      {heroSlides[currentSlide].source}
                    </span>
                  )}
                  <span className="text-xs text-slate-300 font-medium">
                    {heroSlides[currentSlide]?.date}
                  </span>
                </div>

                <a
                  href={heroSlides[currentSlide]?.url || '#gundem'}
                  target={heroSlides[currentSlide]?.url ? '_blank' : undefined}
                  rel="noreferrer"
                  className="block group/title"
                >
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-sm group-hover/title:text-cyan-300 transition-colors">
                    {heroSlides[currentSlide]?.title}
                  </h1>
                </a>

                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-2xl font-normal">
                  {heroSlides[currentSlide]?.description}
                </p>

                {/* Dot navigation + Slide Counter */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {heroSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 transition-all rounded-full cursor-pointer ${
                          currentSlide === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-500 hover:bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="rounded-md bg-white/10 backdrop-blur-[2px] border border-white/10 px-2 py-0.5 text-[11px] font-mono font-bold text-white/80">
                    {currentSlide + 1} / {heroSlides.length}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION: ŞARJ MALİYETİ HESAPLAYICI (CRISP WHITE CARD) */}
            <div id="hesaplayici" className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-800 border border-cyan-200 mb-2">
                    <Calculator className="h-3.5 w-3.5 text-cyan-700" /> Resmi Tarife Hesaplayıcı
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Elektrikli Araç Şarj Maliyeti Hesaplayıcı
                  </h2>
                </div>
                <div className="text-right text-xs text-slate-500 hidden sm:block">
                  <div>Kaynak: <strong className="text-slate-800 font-mono">sarj_tarifeleri.json</strong></div>
                  <div className="text-emerald-700 font-bold">● Güncel Fiyatlar</div>
                </div>
              </div>

              {/* Calculator Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                      Araç Modeli:
                    </label>
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 font-semibold focus:border-cyan-600 focus:bg-white focus:outline-none transition-colors"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model} ({v.trim}) • Net {v.battery_net_kwh} kWh
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Range Sliders (1'er 1'er hassas adım) */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-600 font-medium">Başlangıç Şarjı:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStartSoc((prev) => Math.max(0, prev - 1))}
                            className="h-5 w-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors"
                            title="%1 Azalt"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-cyan-700 min-w-[36px] text-center">%{startSoc}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.min(99, startSoc + 1);
                              setStartSoc(next);
                              if (next >= targetSoc) setTargetSoc(Math.min(100, next + 1));
                            }}
                            className="h-5 w-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors"
                            title="%1 Artır"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="99"
                        step="1"
                        value={startSoc}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setStartSoc(val);
                          if (val >= targetSoc) setTargetSoc(Math.min(100, val + 1));
                        }}
                        className="w-full accent-cyan-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-600 font-medium">Hedeflenen Şarjı:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTargetSoc((prev) => Math.max(startSoc + 1, prev - 1))}
                            className="h-5 w-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors"
                            title="%1 Azalt"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-emerald-700 min-w-[36px] text-center">%{targetSoc}</span>
                          <button
                            type="button"
                            onClick={() => setTargetSoc((prev) => Math.min(100, prev + 1))}
                            className="h-5 w-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors"
                            title="%1 Artır"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={targetSoc}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val > startSoc) setTargetSoc(val);
                        }}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Operator grid */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                      Şarj Operatörü:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {allOperators.map((op) => (
                        <button
                          key={op.id}
                          onClick={() => setSelectedOperatorId(op.id)}
                          className={`rounded-xl p-2.5 text-left text-xs transition-all border ${
                            selectedOperatorId === op.id
                              ? 'border-cyan-600 bg-cyan-50/80 text-cyan-900 font-bold shadow-xs'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: op.logo_color }} />
                            <span className="truncate">{op.short_name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 font-semibold">
                            {op.dc_180kw_plus_rate_tl.toFixed(2)} ₺/kWh
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Outcome Result Card */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
                      <span className="text-slate-500 uppercase font-bold tracking-wider">Hesaplama Özeti</span>
                      <span className="rounded-md bg-cyan-100 text-cyan-800 px-2 py-0.5 font-mono font-bold">
                        %{startSoc} → %{targetSoc}
                      </span>
                    </div>

                    {/* Big Price Tag */}
                    <div className="my-5 text-center rounded-xl bg-white p-5 border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500 font-semibold block uppercase">Ödenecek Tutar</span>
                      <div className="flex items-baseline justify-center gap-1 my-1">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">
                          {totalCostTl.toLocaleString('tr-TR')}
                        </span>
                        <span className="text-xl font-bold text-cyan-700">₺</span>
                      </div>
                      <span className="text-xs text-cyan-800 font-mono font-bold">
                        {baseUnitPrice.toFixed(2)} ₺ / kWh ({selectedOperator.short_name})
                      </span>
                    </div>

                    {/* Stats 2x2 */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                        <span className="text-slate-500 block text-[10px]">Çekilen Enerji</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{billedEnergyKwh} kWh</span>
                      </div>
                      <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                        <span className="text-slate-500 block text-[10px]">Kazanılan Menzil</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">+{addedRangeKm} km</span>
                      </div>
                      <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                        <span className="text-slate-500 block text-[10px]">km Başı Maliyet</span>
                        <span className="font-mono font-bold text-cyan-800 text-sm">{costPerKmTl} ₺/km</span>
                      </div>
                      <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                        <span className="text-slate-500 block text-[10px]">Tahmini Süre</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">~{estMinutes} dk</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
                      <span>Benzinli araca göre net kazanç:</span>
                      <strong className="font-mono text-emerald-800 font-black">+{savingsDeltaTl.toLocaleString('tr-TR')} ₺</strong>
                    </div>
                    <button
                      type="button"
                      onClick={addCurrentChargeToLogbook}
                      className="w-full rounded-xl bg-slate-900 hover:bg-cyan-700 py-2.5 px-4 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <BatteryCharging className="h-4 w-4 text-cyan-400" />
                      <span>Bu Dolumu &ldquo;Aracım&rdquo; Şarj Defterine Kaydet</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: UZUN YOL & OTOYOL ŞARJ ROTA PLANLAYICI */}
            <div id="rota-planlayici" className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 mb-2">
                    <Navigation className="h-3.5 w-3.5 text-emerald-700" /> Otoyol Dinlenme Tesisleri & HPC Simülatörü
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Uzun Yol & Otoyol Şarj Rota Planlayıcı
                  </h2>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>Seçili Araç: <strong className="text-slate-900">{selectedVehicle.brand} {selectedVehicle.model}</strong></div>
                  <div className="text-cyan-700 font-mono font-bold">
                    Tüketim ({cruiseSpeed} km/s): {effectiveRouteConsumption} kWh/100km
                  </div>
                </div>
              </div>

              {/* Manual 81-City Origin & Destination Selector */}
              <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Başlangıç ve Varış Şehrini Seçin (81 İl & Tatil Beldeleri):
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-800">
                    {activeCorridor.highway}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-11 gap-2.5 items-end">
                  {/* Origin City */}
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Nereden (Çıkış Şehri):
                    </label>
                    <select
                      value={originCity}
                      onChange={(e) => handleCityRouteChange(e.target.value, destinationCity)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-bold text-slate-900 focus:border-cyan-600 focus:outline-none shadow-2xs cursor-pointer"
                    >
                      {TURKIYE_CITIES.map((c) => (
                        <option key={`orig-${c.plate}`} value={c.name}>
                          {c.plate} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Swap Direction Button */}
                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleCityRouteChange(destinationCity, originCity)}
                      title="Başlangıç ve Varış Şehrini Değiştir"
                      className="h-10 w-full sm:w-10 rounded-xl border border-slate-300 bg-white hover:bg-cyan-600 hover:text-white hover:border-cyan-600 text-slate-700 font-black flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                    >
                      ⇄
                    </button>
                  </div>

                  {/* Destination City */}
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Nereye (Varış Şehri):
                    </label>
                    <select
                      value={destinationCity}
                      onChange={(e) => handleCityRouteChange(originCity, e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-bold text-slate-900 focus:border-cyan-600 focus:outline-none shadow-2xs cursor-pointer"
                    >
                      {TURKIYE_CITIES.map((c) => (
                        <option key={`dest-${c.plate}`} value={c.name}>
                          {c.plate} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Popular Shortcuts */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Hızlı Seçim:</span>
                  {POPULAR_CITY_PAIRS.map((pair) => {
                    const isActive = originCity === pair.origin && destinationCity === pair.destination;
                    return (
                      <button
                        key={pair.label}
                        type="button"
                        onClick={() => handleCityRouteChange(pair.origin, pair.destination)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors border cursor-pointer ${
                          isActive
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pair.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controls: Distance, Departure SoC, Speed, Weather */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Toplam Yol Mesafesi:</span>
                      <span className="font-mono font-bold text-cyan-700">{routeDistanceKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1800"
                      step="1"
                      value={routeDistanceKm}
                      onChange={(e) => setRouteDistanceKm(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Yola Çıkış Şarjı (Başlangıç):</span>
                      <span className="font-mono font-bold text-emerald-700">%{departureSoc}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="1"
                      value={departureSoc}
                      onChange={(e) => setDepartureSoc(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">Otoyol Seyir Hızı:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([110, 120, 130] as const).map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setCruiseSpeed(spd)}
                          className={`rounded-lg py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                            cruiseSpeed === spd
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {spd} km/s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">Mevsim & Klima / Isıtma:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRouteWeather('normal')}
                        className={`rounded-lg py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                          routeWeather === 'normal'
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        20°C Bahar
                      </button>
                      <button
                        type="button"
                        onClick={() => setRouteWeather('winter')}
                        className={`rounded-lg py-1.5 text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                          routeWeather === 'winter'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Snowflake className="h-3 w-3" /> 0°C Kış
                      </button>
                      <button
                        type="button"
                        onClick={() => setRouteWeather('summer')}
                        className={`rounded-lg py-1.5 text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                          routeWeather === 'summer'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Sun className="h-3 w-3" /> 35°C Yaz
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[11px] text-slate-500 block">Şarj Molası Sayısı</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {routeSimulation.stops.length === 0 ? 'Duraksız' : `${routeSimulation.stops.length} Durak`}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    Tek şarj menzili: ~{fullChargeHighwayRangeKm} km
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[11px] text-slate-500 block">Toplam Şarj Süresi</span>
                  <span className="text-lg font-black text-cyan-700 font-mono">
                    {routeSimulation.totalChargingMin === 0 ? '0 dk' : `~${routeSimulation.totalChargingMin} dk`}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Sürüş: {routeSimulation.drivingTimeText}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-[11px] text-slate-500 block">Yol Şarj Maliyeti</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {routeSimulation.totalStopCostTl} ₺
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Toplam tüketim: {totalRouteEnergyKwh} kWh
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
                  <span className="text-[11px] text-emerald-800 font-semibold block">Benzinliye Göre Fark</span>
                  <span className="text-lg font-black text-emerald-700 font-mono">
                    +{routeSimulation.routeSavingsTl.toLocaleString('tr-TR')} ₺
                  </span>
                  <span className="text-[10px] text-emerald-800 block">
                    Benzinli: ~{routeSimulation.gasRouteCostTl.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>

              {/* Visual Stop-by-Stop Timeline */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Adım Adım Otoyol Şarj Planı ({activeCorridor.origin} → {activeCorridor.destination})</span>
                  <span className="text-[11px] text-slate-500 font-normal">Operatör: {selectedOperator.short_name} HPC</span>
                </div>

                <div className="space-y-2.5">
                  {/* Origin */}
                  <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-slate-200 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-6 w-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-[11px]">
                        Ç
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{activeCorridor.origin} Çıkış</div>
                        <div className="text-[11px] text-slate-500">0. km • {activeCorridor.highway}</div>
                      </div>
                    </div>
                    <span className="rounded-md bg-emerald-100 text-emerald-800 px-2.5 py-1 font-mono font-bold">
                      Başlangıç: %{departureSoc}
                    </span>
                  </div>

                  {/* Charging Stops */}
                  {routeSimulation.stops.length === 0 ? (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-medium flex items-center justify-between">
                      <span>✓ Seçtiğiniz araç bu rotayı duraksız (şarj molası vermeden) tamamlayabiliyor!</span>
                      <span className="font-mono font-bold">Menzil: {fullChargeHighwayRangeKm} km</span>
                    </div>
                  ) : (
                    routeSimulation.stops.map((stop) => (
                      <div
                        key={stop.stopNumber}
                        className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-white p-3.5 border border-cyan-200 shadow-2xs gap-2 text-xs"
                      >
                        <div className="flex items-start sm:items-center gap-2.5">
                          <span className="h-6 w-6 rounded-full bg-amber-500 text-white font-black flex items-center justify-center text-[11px] shrink-0">
                            {stop.stopNumber}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{stop.hubName}</span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                                {stop.kmMark}. km
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">{stop.networks}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <span className="rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-1 font-mono font-bold">
                            %{stop.arrivalSoc} → %{stop.departSoc}
                          </span>
                          <span className="rounded-md bg-slate-100 text-slate-800 px-2 py-1 font-mono font-semibold">
                            +{stop.addedKwh} kWh • ~{stop.durationMin} dk
                          </span>
                          <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 font-mono font-black">
                            {stop.costTl} ₺
                          </span>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Destination */}
                  <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-slate-200 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-6 w-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[11px]">
                        V
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{activeCorridor.destination} Varış</div>
                        <div className="text-[11px] text-slate-500">{routeDistanceKm}. km • Yolculuk Tamamlandı</div>
                      </div>
                    </div>
                    <span className="rounded-md bg-slate-100 text-slate-800 px-2.5 py-1 font-mono font-bold">
                      Varış Şarjı: %{routeSimulation.arrivalSoc}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: EV GÜNDEM HABERLERİ GRID (CANLI BESLEME) */}
            <div id="gundem" className="scroll-mt-20 space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-red-600" /> EV Gündem & Son Haberler
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Otomatik (5 dk)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kaynak: <strong className="text-slate-700">{newsData?.metadata?.source || 'Google News TR EV RSS'}</strong>
                    {newsData?.metadata?.updated_at && ` • Son Kontrol: ${newsData.metadata.updated_at}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={refreshLiveNews}
                    disabled={isRefreshingNews}
                    className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Radio className={`h-3.5 w-3.5 text-cyan-600 ${isRefreshingNews ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingNews ? 'Güncelleniyor...' : 'Şimdi Yenile'}</span>
                  </button>
                  <a
                    href="https://news.google.com/search?q=elektrikli+otomobil+T%C3%BCrkiye&hl=tr&gl=TR&ceid=TR:tr"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-700 font-bold cursor-pointer hover:underline flex items-center gap-1"
                  >
                    Tüm Haberler <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {newsList.map((article) => (
                  <a
                    key={article.id}
                    href={article.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden group hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 w-full overflow-hidden relative">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className={`absolute top-3 left-3 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${article.tagBg || 'bg-cyan-600 text-white'}`}>
                          {article.tag}
                        </span>
                        {article.source && (
                          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white">
                            {article.source}
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span>{article.date} • {article.read_time || '4 dk okuma'}</span>
                          <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-cyan-700 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {article.description}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* SECTION: HANGİ ELEKTRİKLİ ARACI ALMALIYIM? (AKILLI EV SEÇİM SİHİRBAZI) */}
            <div id="ev-sihirbazi" className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Akıllı Karar Destek Asistanı
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Hangi Elektrikli Aracı Almalıyım? (EV Seçim Sihirbazı)
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  Katalogdaki <strong className="text-slate-800">{vehicles.length} model</strong> arasından anlık puanlama
                </span>
              </div>

              {/* Sihirbaz Kriter Kontrolleri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-4">
                  {/* Bütçe Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-semibold">Maksimum Bütçeniz:</span>
                      <span className="font-mono font-black text-cyan-700 text-sm">
                        {(wizardMaxBudget / 1000000).toFixed(2)} Milyon ₺
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1800000"
                      max="5000000"
                      step="25000"
                      value={wizardMaxBudget}
                      onChange={(e) => setWizardMaxBudget(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        { label: '2.0 M ₺', val: 2000000 },
                        { label: '2.5 M ₺', val: 2500000 },
                        { label: '3.5 M ₺', val: 3500000 },
                        { label: '5.0 M ₺ (Tümü)', val: 5000000 },
                      ].map((b) => (
                        <button
                          key={b.val}
                          type="button"
                          onClick={() => setWizardMaxBudget(b.val)}
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold border transition-colors cursor-pointer ${
                            wizardMaxBudget === b.val
                              ? 'bg-cyan-600 text-white border-cyan-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minimum Otoyol Menzili */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-semibold">En Az Gerçek Otoyol Menzili (120 km/s):</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        {wizardMinHighwayKm} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="450"
                      step="5"
                      value={wizardMinHighwayKm}
                      onChange={(e) => setWizardMinHighwayKm(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Kullanım Önceliği */}
                  <div>
                    <span className="text-xs text-slate-600 font-semibold block mb-1.5">
                      Birincil Kullanım Önceliğiniz:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'uzun-yol', label: 'Uzun Yol & Menzil' },
                        { id: 'fiyat-performans', label: 'Fiyat / Performans' },
                        { id: 'hizli-sarj', label: 'En Hızlı DC Şarj' },
                        { id: 'performans', label: 'Güç & Hızlanma' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setWizardPriority(p.id as 'uzun-yol' | 'fiyat-performans' | 'hizli-sarj' | 'performans')
                          }
                          className={`rounded-xl py-2 px-3 text-xs font-bold border transition-all text-left cursor-pointer ${
                            wizardPriority === p.id
                              ? 'border-cyan-600 bg-cyan-50 text-cyan-950 shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Çekiş Tipi */}
                  <div>
                    <span className="text-xs text-slate-600 font-semibold block mb-1.5">
                      Çekiş Sistemi Tercihi:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'all', label: 'Fark Etmez' },
                        { id: 'tek-motor', label: 'RWD / FWD (Verimli)' },
                        { id: 'awd', label: '4x4 AWD (Çift Motor)' },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setWizardDriveFilter(d.id as 'all' | 'tek-motor' | 'awd')}
                          className={`rounded-xl py-2 px-2.5 text-xs font-bold border transition-all text-center cursor-pointer ${
                            wizardDriveFilter === d.id
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* En Uygun 3 Araç Öneri Kartları */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span>Kriterlerinize En Uygun 3 Elektrikli Araç</span>
                  <span className="text-[11px] text-cyan-700 font-normal">Aracı seçerek garajınıza ekleyebilirsiniz</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {wizardRecommendations.map((rec, idx) => {
                    const v = rec.vehicle;
                    const isCurrent = v.id === selectedVehicleId;
                    return (
                      <div
                        key={`wiz-${v.id}`}
                        className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                          idx === 0
                            ? 'border-cyan-500 bg-gradient-to-b from-cyan-50/50 to-white shadow-sm ring-1 ring-cyan-500/20'
                            : 'border-slate-200 bg-white hover:shadow-sm'
                        }`}
                      >
                        <div>
                          {/* Top Badge & Match Score */}
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                idx === 0
                                  ? 'bg-cyan-600 text-white'
                                  : idx === 1
                                  ? 'bg-slate-800 text-white'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              #{idx + 1} {idx === 0 ? 'En İyi Eşleşme' : 'Öneri'}
                            </span>
                            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 font-mono text-xs font-black">
                              %{rec.matchPercent} Uyum
                            </span>
                          </div>

                          {/* Image & Title */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-14 w-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                              <img src={v.image_url} alt={v.model} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold text-cyan-700 uppercase">{v.brand}</div>
                              <div className="text-sm font-black text-slate-900 truncate">{v.model}</div>
                              <div className="text-[11px] text-slate-500 truncate">{v.trim}</div>
                            </div>
                          </div>

                          {/* Key Stats */}
                          <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Fiyat</span>
                              <strong className="font-mono text-slate-900">{(v.price_try / 1000000).toFixed(2)} M ₺</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Otoyol Menzil</span>
                              <strong className="font-mono text-cyan-800">{v.real_range_highway_km} km</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Net Batarya</span>
                              <strong className="font-mono text-slate-900">{v.battery_net_kwh} kWh</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">DC Şarj / Güç</span>
                              <strong className="font-mono text-emerald-700">{v.max_dc_charging_power_kw} kW • {v.motor_power_hp} BG</strong>
                            </div>
                          </div>

                          {/* Personalized Reasons */}
                          <div className="space-y-1 mb-4">
                            {rec.reasons.map((reason, rIdx) => (
                              <div key={rIdx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedVehicleId(v.id)}
                          className={`w-full rounded-xl py-2 px-3 text-xs font-bold transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 hover:bg-cyan-700 text-white'
                          }`}
                        >
                          {isCurrent ? '✓ Garajımda Seçili Araç' : 'Bu Aracı Seç & Hesapla'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION: MENZİL REHBERİ (VEHICLE GRID) */}
            <div id="menzil" className="scroll-mt-20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-3">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-cyan-700" /> Menzil Rehberi & Gerçek Tüketim
                </h2>

                {/* Range mode buttons */}
                <div className="flex rounded-lg bg-slate-200/80 p-1">
                  <button
                    onClick={() => setRangeMode('highway')}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      rangeMode === 'highway' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Otoyol (120 km/s)
                  </button>
                  <button
                    onClick={() => setRangeMode('winter')}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      rangeMode === 'winter' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kış (-5°C)
                  </button>
                  <button
                    onClick={() => setRangeMode('city')}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      rangeMode === 'city' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Şehir İçi
                  </button>
                  <button
                    onClick={() => setRangeMode('wltp')}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      rangeMode === 'wltp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    WLTP
                  </button>
                </div>
              </div>

              {/* Brand Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors border ${
                      selectedBrand === brand
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {brand === 'all' ? `Tüm Modeller (${vehicles.length})` : brand}
                  </button>
                ))}
              </div>

              {/* Vehicle Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredVehicles.map((vehicle) => {
                  const rangeData = getRangeByMode(vehicle);
                  const isSelected = compareItems.some((c) => c.id === vehicle.id);

                  return (
                    <div
                      key={vehicle.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="flex gap-4">
                        <div className="h-20 w-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={vehicle.image_url}
                            alt={vehicle.model}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wide">{vehicle.brand}</span>
                            <span className="font-mono text-xs font-bold text-slate-900">{(vehicle.price_try / 1000000).toFixed(2)} M ₺</span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm truncate">{vehicle.model}</h3>
                          <p className="text-[11px] text-slate-500 truncate">{vehicle.trim}</p>

                          <div className="mt-2 flex items-baseline justify-between text-xs">
                            <span className="text-slate-500 text-[10px]">{rangeData.title}:</span>
                            <span className="font-mono font-extrabold text-slate-900">{rangeData.val} km</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Net: <strong className="text-slate-800 font-mono">{vehicle.battery_net_kwh} kWh</strong></span>
                        <span>Maks: <strong className="text-emerald-700 font-mono">{vehicle.max_dc_charging_power_kw} kW</strong></span>
                        <button
                          onClick={() => toggleCompare(vehicle)}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${
                            isSelected ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ Kıyasta' : '+ Kıyasla'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT 4 COLUMNS: OTOPARK.COM EXACT SIDEBAR WIDGETS       */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. "BİZİ TAKİP EDİN!" (OTOPARK.COM STYLE 4 SOCIAL TILES) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Bizi Takip Edin!</span>
                  <Share2 className="h-4 w-4 text-cyan-700" />
                </h3>
              </div>

              {/* 4 Social Counter Tiles */}
              <div className="grid grid-cols-2 gap-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#1877F2] p-3 text-white flex flex-col justify-between hover:opacity-90 transition-opacity shadow-xs"
                >
                  <div className="text-sm font-black">f</div>
                  <div className="mt-2">
                    <div className="text-xs font-black font-mono">64.147</div>
                    <div className="text-[10px] opacity-80">Takipçi</div>
                  </div>
                </a>

                {/* X / Twitter */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#000000] p-3 text-white flex flex-col justify-between hover:opacity-90 transition-opacity shadow-xs"
                >
                  <div className="text-sm font-black">𝕏</div>
                  <div className="mt-2">
                    <div className="text-xs font-black font-mono">48.920</div>
                    <div className="text-[10px] opacity-80">Takipçi</div>
                  </div>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#FF0000] p-3 text-white flex flex-col justify-between hover:opacity-90 transition-opacity shadow-xs"
                >
                  <div className="text-sm font-black">▶</div>
                  <div className="mt-2">
                    <div className="text-xs font-black font-mono">558k</div>
                    <div className="text-[10px] opacity-80">Abone</div>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-3 text-white flex flex-col justify-between hover:opacity-90 transition-opacity shadow-xs"
                >
                  <div className="text-sm font-black">📷</div>
                  <div className="mt-2">
                    <div className="text-xs font-black font-mono">135k</div>
                    <div className="text-[10px] opacity-80">Takipçi</div>
                  </div>
                </a>
              </div>
            </div>

            {/* 2. CANLI ŞARJ TARİFELERİ WIDGET */}
            <div id="tarifeler" className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-cyan-700" /> Güncel Şarj Tarifeleri
                </h3>
                <span className="text-[10px] text-emerald-700 font-bold">CANLI</span>
              </div>

              <div className="space-y-2.5">
                {allOperators.map((op) => (
                  <div
                    key={op.id}
                    className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: op.logo_color }} />
                      <div>
                        <div className="font-bold text-slate-900">{op.short_name}</div>
                        <div className="text-[10px] text-slate-500">{op.station_count > 0 ? `${op.station_count} İstasyon` : 'Mesken'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-cyan-800 text-sm">
                        {op.dc_180kw_plus_rate_tl.toFixed(2)} ₺
                      </div>
                      <div className="text-[10px] text-slate-500">kWh başına</div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="#hesaplayici"
                onClick={() => setActiveTab('hesaplayici')}
                className="mt-4 block w-full rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white hover:bg-cyan-700 transition-colors"
              >
                Maliyetini Hesapla →
              </a>
            </div>

            {/* 3. EN ÇOK KARŞILAŞTIRILAN EV'LER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" /> Popüler Elektrikli Araçlar
                </h3>
              </div>

              <div className="space-y-2.5">
                {vehicles.slice(0, 5).map((veh, i) => (
                  <div
                    key={veh.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-slate-400 text-sm w-4">#{i + 1}</span>
                      <div>
                        <div className="font-bold text-slate-900">{veh.brand} {veh.model}</div>
                        <div className="text-[10px] text-slate-500">{veh.wltp_range_km} km WLTP</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {(veh.price_try / 1000000).toFixed(2)} M ₺
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. AKARYAKIT VS ELEKTRİK BİLGİ KUTUSU */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
                100 KM YOL MALİYETİ
              </span>
              <div className="text-lg font-black text-slate-900">
                Evde Şarj: <span className="text-emerald-700 font-mono">~28 ₺</span>
              </div>
              <div className="text-xs text-slate-600">
                Benzinli (7.5L @ 43.50 ₺): <strong className="text-slate-800 font-mono">~326 ₺</strong>
              </div>
              <div className="text-[11px] text-slate-600 pt-1">
                Elektrikli araç evden şarj edildiğinde <strong className="text-emerald-900">10 kattan fazla</strong> yakıt tasarrufu sağlar.
              </div>
            </div>
          </div>
        </div>

        {/* COMPARISON MODAL */}
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="absolute top-5 right-5 rounded-lg bg-slate-100 p-2 text-slate-500 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-4">Yan Yana Araç Kıyaslaması</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-3">Teknik Özellik</th>
                      {compareItems.map((c) => (
                        <th key={c.id} className="p-3 font-bold text-cyan-800 text-sm">
                          {c.brand} {c.model}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">WLTP Menzili</td>
                      {compareItems.map((c) => (
                        <td key={c.id} className="p-3 font-mono font-bold text-slate-900">{c.wltp_range_km} km</td>
                      ))}
                    </tr>
                    <tr className="bg-cyan-50/50">
                      <td className="p-3 font-semibold text-cyan-800">Otoyol (120 km/s)</td>
                      {compareItems.map((c) => (
                        <td key={c.id} className="p-3 font-mono font-extrabold text-cyan-800">{c.real_range_highway_km} km</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Kış (-5°C)</td>
                      {compareItems.map((c) => (
                        <td key={c.id} className="p-3 font-mono font-bold text-blue-700">{c.real_range_winter_km} km</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Net Batarya</td>
                      {compareItems.map((c) => (
                        <td key={c.id} className="p-3 font-mono text-slate-900">{c.battery_net_kwh} kWh</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Maks DC Hız</td>
                      {compareItems.map((c) => (
                        <td key={c.id} className="p-3 font-mono font-bold text-emerald-700">{c.max_dc_charging_power_kw} kW</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-600">Fiyat</td>
                      {compareItems.map((c) => (
                        <td key={c.id} className="p-3 font-mono font-bold text-emerald-700">{(c.price_try / 1000000).toFixed(2)} M ₺</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* "ARACIM" — KİŞİSEL EV GARAJI, BATARYA SAĞLIĞI (SoH) & ŞARJ DEFTERİ MODAL */}
        {isGarageOpen && (() => {
          const sohFactor = myBatterySoh / 100;
          const currentUsableKwh = Math.round(selectedVehicle.battery_net_kwh * sohFactor * 10) / 10;
          const sohCityRange = Math.round(selectedVehicle.real_range_city_km * sohFactor);
          const sohHighwayRange = Math.round(selectedVehicle.real_range_highway_km * sohFactor);
          const sohWinterRange = Math.round(selectedVehicle.real_range_winter_km * sohFactor);

          // Yıllık Maliyet & Tasarruf Karnesi
          const annualKm = myMonthlyKm * 12;
          const annualKwhNeeded = (annualKm / 100) * selectedVehicle.avg_consumption_kwh_100km / 0.92;
          const blendedKwhRate = (myHomeChargeRatio / 100) * 1.95 + ((100 - myHomeChargeRatio) / 100) * 10.60;
          const annualEvCostTl = Math.round(annualKwhNeeded * blendedKwhRate);
          const annualGasCostTl = Math.round((annualKm / 100) * 7.5 * 43.50);
          const annualNetSavingsTl = Math.max(0, annualGasCostTl - annualEvCostTl);
          const threeYearSavingsTl = annualNetSavingsTl * 3;
          const estimatedAnnualMtvTl = selectedVehicle.motor_power_hp > 240 ? 14850 : 6920;

          // Şarj Defteri Toplamları
          const totalLoggedKwh = Math.round(chargeLogs.reduce((acc, l) => acc + l.kwh, 0) * 10) / 10;
          const totalLoggedCostTl = chargeLogs.reduce((acc, l) => acc + l.costTl, 0);
          const totalLoggedSavedTl = chargeLogs.reduce((acc, l) => acc + l.savedTl, 0);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
              <div className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl my-auto max-h-[92vh] overflow-y-auto space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-sm">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900">Aracım & Kişisel EV Garajım</h3>
                        <span className="rounded-md bg-slate-900 text-white px-2.5 py-0.5 font-mono text-xs font-bold border border-slate-700">
                          {myPlate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Seçimleriniz tarayıcı hafızasına otomatik kaydedilir ve tüm hesaplayıcılarla senkronize çalışır.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGarageOpen(false)}
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 p-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* 1. KİŞİSEL GARAJ & ARAÇ AYARLARI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase">
                      Garajdaki Elektrikli Aracım:
                    </label>
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-cyan-600 focus:outline-none cursor-pointer"
                    >
                      {vehicles.map((v) => (
                        <option key={`garage-${v.id}`} value={v.id}>
                          {v.brand} {v.model} ({v.trim})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase">
                      Plaka veya Araç Takma Adı:
                    </label>
                    <input
                      type="text"
                      value={myPlate}
                      onChange={(e) => setMyPlate(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
                      placeholder="34 TOG 2026"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase">
                      Güncel Kilometre (KM Sayacı):
                    </label>
                    <input
                      type="number"
                      value={myOdometerKm}
                      onChange={(e) => setMyOdometerKm(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-cyan-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. BATARYA SAĞLIĞI (SoH %) & KONDİSYON SİMÜLATÖRÜ + YILLIK KARNE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Batarya Sağlığı (SoH) Kartı */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <BatteryCharging className="h-4 w-4 text-emerald-600" /> Batarya Sağlığı (SoH) & Menzil
                      </span>
                      <span className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 font-mono text-xs font-black">
                        SoH: %{myBatterySoh}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">Batarya Sağlık Yüzdesi (SoH):</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {currentUsableKwh} kWh / {selectedVehicle.battery_net_kwh} kWh
                        </span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="100"
                        step="1"
                        value={myBatterySoh}
                        onChange={(e) => setMyBatterySoh(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Şehir İçi</span>
                        <span className="font-mono font-black text-slate-900 text-sm">{sohCityRange} km</span>
                        <span className="text-[10px] text-slate-400 block">Sıfır: {selectedVehicle.real_range_city_km}</span>
                      </div>
                      <div className="rounded-lg bg-cyan-50/60 p-2.5 border border-cyan-200">
                        <span className="text-[10px] text-cyan-800 font-semibold block">Otoyol 120</span>
                        <span className="font-mono font-black text-cyan-900 text-sm">{sohHighwayRange} km</span>
                        <span className="text-[10px] text-cyan-700 block">Sıfır: {selectedVehicle.real_range_highway_km}</span>
                      </div>
                      <div className="rounded-lg bg-blue-50/60 p-2.5 border border-blue-200">
                        <span className="text-[10px] text-blue-800 font-semibold block">Kış (-5°C)</span>
                        <span className="font-mono font-black text-blue-900 text-sm">{sohWinterRange} km</span>
                        <span className="text-[10px] text-blue-700 block">Sıfır: {selectedVehicle.real_range_winter_km}</span>
                      </div>
                    </div>
                  </div>

                  {/* Yıllık Tasarruf & MTV Karnesi */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-cyan-600" /> Yıllık Tasarruf & MTV Karnesi
                      </span>
                      <span className="text-[11px] font-mono font-bold text-cyan-700">
                        {(annualKm).toLocaleString('tr-TR')} km/yıl
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600">Aylık Sürüş:</span>
                          <span className="font-mono font-bold text-slate-900">{myMonthlyKm} km</span>
                        </div>
                        <input
                          type="range"
                          min="500"
                          max="5000"
                          step="100"
                          value={myMonthlyKm}
                          onChange={(e) => setMyMonthlyKm(Number(e.target.value))}
                          className="w-full accent-cyan-600 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600">Ev Şarj Oranı:</span>
                          <span className="font-mono font-bold text-emerald-700">%{myHomeChargeRatio}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={myHomeChargeRatio}
                          onChange={(e) => setMyHomeChargeRatio(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Yıllık Elektrik</span>
                        <span className="font-mono font-black text-slate-900 text-xs">
                          {annualEvCostTl.toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="text-[10px] text-slate-400 block">MTV: ~{estimatedAnnualMtvTl.toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 font-bold block">1 Yıllık Kazanç</span>
                        <span className="font-mono font-black text-emerald-700 text-xs">
                          +{annualNetSavingsTl.toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="text-[10px] text-emerald-700 block">Benzinliye Göre</span>
                      </div>
                      <div className="rounded-lg bg-cyan-50 p-2.5 border border-cyan-200">
                        <span className="text-[10px] text-cyan-800 font-bold block">3 Yıllık Kazanç</span>
                        <span className="font-mono font-black text-cyan-800 text-xs">
                          +{threeYearSavingsTl.toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="text-[10px] text-cyan-700 block">Net Amortisman</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. KİŞİSEL ŞARJ DEFTERİ (GEÇMİŞ DOLUM KAYITLARI) */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Kişisel Şarj Defterim ({chargeLogs.length} Dolum Kaydı)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Toplam Tüketim: <strong className="font-mono text-slate-800">{totalLoggedKwh} kWh</strong> •
                        Toplam Ödenen: <strong className="font-mono text-slate-800"> {totalLoggedCostTl.toLocaleString('tr-TR')} ₺</strong> •
                        Toplam Net Tasarruf: <strong className="font-mono text-emerald-700"> +{totalLoggedSavedTl.toLocaleString('tr-TR')} ₺</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addCurrentChargeToLogbook}
                      className="rounded-lg bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      + Mevcut Hesaplamayı Ekle ({totalCostTl} ₺)
                    </button>
                  </div>

                  {chargeLogs.length === 0 ? (
                    <div className="rounded-lg bg-white p-4 text-center text-xs text-slate-500 border border-slate-200">
                      Henüz kayıtlı şarj işleminiz bulunmuyor. Üstteki butona tıklayarak ilk dolum kaydınızı ekleyebilirsiniz.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {chargeLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex flex-wrap items-center justify-between rounded-lg bg-white p-2.5 px-3.5 border border-slate-200 text-xs gap-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] text-slate-400">{log.date}</span>
                            <span className="font-bold text-slate-900">{log.vehicleName}</span>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                              {log.operatorName} ({log.socRange})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-600">{log.kwh} kWh</span>
                            <span className="font-mono font-bold text-slate-900">{log.costTl} ₺</span>
                            <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 font-mono text-[11px] font-bold">
                              +{log.savedTl} ₺ Kazanç
                            </span>
                            <button
                              type="button"
                              onClick={() => removeChargeLog(log.id)}
                              title="Kaydı Sil"
                              className="text-slate-400 hover:text-red-600 cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </main>

      {/* 5. FOOTER */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-700 text-white shadow-xs">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 font-mono text-base">KILOWATT<span className="text-cyan-700">TR</span></span>
                <p className="text-[11px] text-slate-400">© 2026 Türkiye Elektrikli Araç & Şarj Portalı. Tüm hakları saklıdır.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                EPDK Lisanslı Şarj Operatörleri Doğrulaması
              </span>
              <span className="text-slate-300">•</span>
              <span>Canlı Tarife Verisi: <code className="text-cyan-800 font-mono">sarj_tarifeleri.json</code></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
