import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "kilowatt.db")

INITIAL_VEHICLES = [
    {
        "id": "togg-t10x-v2-long-range",
        "brand": "Togg",
        "model": "T10X",
        "trim": "V2 RWD Uzun Menzil",
        "release_year": 2024,
        "battery_gross_kwh": 88.5,
        "battery_net_kwh": 82.5,
        "wltp_range_km": 523,
        "real_range_city_km": 580,
        "real_range_highway_km": 395,
        "real_range_winter_km": 360,
        "real_range_summer_km": 440,
        "avg_consumption_kwh_100km": 16.9,
        "max_dc_charging_power_kw": 180,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 28,
        "acceleration_0_100_s": 7.8,
        "drive_type": "RWD",
        "motor_power_hp": 218,
        "trunk_capacity_liters": 441,
        "price_try": 1823000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "togg-t10x-v1-standard",
        "brand": "Togg",
        "model": "T10X",
        "trim": "V1 RWD Standart Menzil",
        "release_year": 2024,
        "battery_gross_kwh": 52.4,
        "battery_net_kwh": 49.0,
        "wltp_range_km": 314,
        "real_range_city_km": 350,
        "real_range_highway_km": 240,
        "real_range_winter_km": 215,
        "real_range_summer_km": 275,
        "avg_consumption_kwh_100km": 16.7,
        "max_dc_charging_power_kw": 150,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 28,
        "acceleration_0_100_s": 7.4,
        "drive_type": "RWD",
        "motor_power_hp": 218,
        "trunk_capacity_liters": 441,
        "price_try": 1432600,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "togg-t10f-v2-long-range",
        "brand": "Togg",
        "model": "T10F",
        "trim": "V2 RWD Uzun Menzil (Fastback)",
        "release_year": 2025,
        "battery_gross_kwh": 88.5,
        "battery_net_kwh": 82.5,
        "wltp_range_km": 600,
        "real_range_city_km": 645,
        "real_range_highway_km": 460,
        "real_range_winter_km": 415,
        "real_range_summer_km": 515,
        "avg_consumption_kwh_100km": 15.1,
        "max_dc_charging_power_kw": 180,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 28,
        "acceleration_0_100_s": 7.2,
        "drive_type": "RWD",
        "motor_power_hp": 218,
        "trunk_capacity_liters": 500,
        "price_try": 1860000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "togg-t10f-v1-standard",
        "brand": "Togg",
        "model": "T10F",
        "trim": "V1 RWD Standart Menzil (Fastback)",
        "release_year": 2025,
        "battery_gross_kwh": 52.4,
        "battery_net_kwh": 49.0,
        "wltp_range_km": 350,
        "real_range_city_km": 385,
        "real_range_highway_km": 270,
        "real_range_winter_km": 240,
        "real_range_summer_km": 310,
        "avg_consumption_kwh_100km": 14.9,
        "max_dc_charging_power_kw": 180,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 28,
        "acceleration_0_100_s": 7.2,
        "drive_type": "RWD",
        "motor_power_hp": 218,
        "trunk_capacity_liters": 500,
        "price_try": 1475000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "togg-t10f-awd-dual-motor",
        "brand": "Togg",
        "model": "T10F",
        "trim": "V2 AWD Çift Motor (435 BG)",
        "release_year": 2025,
        "battery_gross_kwh": 88.5,
        "battery_net_kwh": 82.5,
        "wltp_range_km": 530,
        "real_range_city_km": 565,
        "real_range_highway_km": 410,
        "real_range_winter_km": 370,
        "real_range_summer_km": 460,
        "avg_consumption_kwh_100km": 16.6,
        "max_dc_charging_power_kw": 180,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 28,
        "acceleration_0_100_s": 4.6,
        "drive_type": "AWD",
        "motor_power_hp": 435,
        "trunk_capacity_liters": 500,
        "price_try": 2290000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "tesla-model-y-sr-rwd",
        "brand": "Tesla",
        "model": "Model Y",
        "trim": "Arkadan İtiş (SR RWD - TR Özel)",
        "release_year": 2024,
        "battery_gross_kwh": 60.0,
        "battery_net_kwh": 57.5,
        "wltp_range_km": 455,
        "real_range_city_km": 490,
        "real_range_highway_km": 345,
        "real_range_winter_km": 310,
        "real_range_summer_km": 395,
        "avg_consumption_kwh_100km": 15.7,
        "max_dc_charging_power_kw": 170,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 25,
        "acceleration_0_100_s": 6.9,
        "drive_type": "RWD",
        "motor_power_hp": 220,
        "trunk_capacity_liters": 854,
        "price_try": 1791000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "tesla-model-y-lr-awd",
        "brand": "Tesla",
        "model": "Model Y",
        "trim": "Long Range Çift Motor AWD",
        "release_year": 2024,
        "battery_gross_kwh": 78.1,
        "battery_net_kwh": 75.0,
        "wltp_range_km": 533,
        "real_range_city_km": 560,
        "real_range_highway_km": 410,
        "real_range_winter_km": 375,
        "real_range_summer_km": 465,
        "avg_consumption_kwh_100km": 16.9,
        "max_dc_charging_power_kw": 250,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 27,
        "acceleration_0_100_s": 5.0,
        "drive_type": "AWD",
        "motor_power_hp": 514,
        "trunk_capacity_liters": 854,
        "price_try": 3120000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "byd-atto-3-design",
        "brand": "BYD",
        "model": "Atto 3",
        "trim": "Design 150 kW",
        "release_year": 2024,
        "battery_gross_kwh": 60.48,
        "battery_net_kwh": 60.48,
        "wltp_range_km": 420,
        "real_range_city_km": 470,
        "real_range_highway_km": 310,
        "real_range_winter_km": 285,
        "real_range_summer_km": 360,
        "avg_consumption_kwh_100km": 16.0,
        "max_dc_charging_power_kw": 88,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 44,
        "acceleration_0_100_s": 7.3,
        "drive_type": "FWD",
        "motor_power_hp": 204,
        "trunk_capacity_liters": 440,
        "price_try": 1490000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "byd-seal-awd",
        "brand": "BYD",
        "model": "Seal",
        "trim": "Excellence AWD 390 kW",
        "release_year": 2024,
        "battery_gross_kwh": 82.5,
        "battery_net_kwh": 82.5,
        "wltp_range_km": 520,
        "real_range_city_km": 550,
        "real_range_highway_km": 405,
        "real_range_winter_km": 365,
        "real_range_summer_km": 450,
        "avg_consumption_kwh_100km": 18.2,
        "max_dc_charging_power_kw": 150,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 37,
        "acceleration_0_100_s": 3.8,
        "drive_type": "AWD",
        "motor_power_hp": 530,
        "trunk_capacity_liters": 400,
        "price_try": 2340000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "byd-dolphin-comfort",
        "brand": "BYD",
        "model": "Dolphin",
        "trim": "Design 150 kW",
        "release_year": 2024,
        "battery_gross_kwh": 60.48,
        "battery_net_kwh": 60.48,
        "wltp_range_km": 427,
        "real_range_city_km": 485,
        "real_range_highway_km": 320,
        "real_range_winter_km": 290,
        "real_range_summer_km": 370,
        "avg_consumption_kwh_100km": 15.9,
        "max_dc_charging_power_kw": 88,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 40,
        "acceleration_0_100_s": 7.0,
        "drive_type": "FWD",
        "motor_power_hp": 204,
        "trunk_capacity_liters": 345,
        "price_try": 1280000,
        "popular": False,
        "image_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "mg4-luxury",
        "brand": "MG",
        "model": "MG4 Electric",
        "trim": "Luxury 64 kWh",
        "release_year": 2024,
        "battery_gross_kwh": 64.0,
        "battery_net_kwh": 61.7,
        "wltp_range_km": 435,
        "real_range_city_km": 480,
        "real_range_highway_km": 330,
        "real_range_winter_km": 300,
        "real_range_summer_km": 380,
        "avg_consumption_kwh_100km": 16.0,
        "max_dc_charging_power_kw": 135,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 26,
        "acceleration_0_100_s": 7.9,
        "drive_type": "RWD",
        "motor_power_hp": 204,
        "trunk_capacity_liters": 363,
        "price_try": 1415000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "hyundai-ioniq-5-progressive",
        "brand": "Hyundai",
        "model": "Ioniq 5",
        "trim": "Progressive 84 kWh AWD",
        "release_year": 2024,
        "battery_gross_kwh": 84.0,
        "battery_net_kwh": 80.0,
        "wltp_range_km": 570,
        "real_range_city_km": 610,
        "real_range_highway_km": 420,
        "real_range_winter_km": 380,
        "real_range_summer_km": 480,
        "avg_consumption_kwh_100km": 17.5,
        "max_dc_charging_power_kw": 260,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 18,
        "acceleration_0_100_s": 5.1,
        "drive_type": "AWD",
        "motor_power_hp": 325,
        "trunk_capacity_liters": 527,
        "price_try": 2540000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "kia-ev6-long-range",
        "brand": "Kia",
        "model": "EV6",
        "trim": "Prestige Long Range AWD",
        "release_year": 2024,
        "battery_gross_kwh": 77.4,
        "battery_net_kwh": 74.0,
        "wltp_range_km": 506,
        "real_range_city_km": 540,
        "real_range_highway_km": 395,
        "real_range_winter_km": 360,
        "real_range_summer_km": 440,
        "avg_consumption_kwh_100km": 17.2,
        "max_dc_charging_power_kw": 240,
        "max_ac_charging_power_kw": 11,
        "charging_time_dc_10_to_80_min": 18,
        "acceleration_0_100_s": 5.2,
        "drive_type": "AWD",
        "motor_power_hp": 325,
        "trunk_capacity_liters": 490,
        "price_try": 2650000,
        "popular": False,
        "image_url": "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "renault-megane-e-tech-iconic",
        "brand": "Renault",
        "model": "Megane E-Tech",
        "trim": "Iconic EV60 220hp",
        "release_year": 2024,
        "battery_gross_kwh": 60.0,
        "battery_net_kwh": 60.0,
        "wltp_range_km": 450,
        "real_range_city_km": 480,
        "real_range_highway_km": 325,
        "real_range_winter_km": 295,
        "real_range_summer_km": 380,
        "avg_consumption_kwh_100km": 15.8,
        "max_dc_charging_power_kw": 130,
        "max_ac_charging_power_kw": 22,
        "charging_time_dc_10_to_80_min": 30,
        "acceleration_0_100_s": 7.4,
        "drive_type": "FWD",
        "motor_power_hp": 220,
        "trunk_capacity_liters": 440,
        "price_try": 1650000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "volvo-ex30-single-er",
        "brand": "Volvo",
        "model": "EX30",
        "trim": "Single Motor Extended Range Ultra",
        "release_year": 2024,
        "battery_gross_kwh": 69.0,
        "battery_net_kwh": 64.0,
        "wltp_range_km": 476,
        "real_range_city_km": 510,
        "real_range_highway_km": 360,
        "real_range_winter_km": 325,
        "real_range_summer_km": 415,
        "avg_consumption_kwh_100km": 15.7,
        "max_dc_charging_power_kw": 153,
        "max_ac_charging_power_kw": 22,
        "charging_time_dc_10_to_80_min": 26,
        "acceleration_0_100_s": 5.3,
        "drive_type": "RWD",
        "motor_power_hp": 272,
        "trunk_capacity_liters": 318,
        "price_try": 1980000,
        "popular": True,
        "image_url": "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80"
    },
    {
        "id": "bmw-ix1-edrive20",
        "brand": "BMW",
        "model": "iX1",
        "trim": "eDrive20 xLine",
        "release_year": 2024,
        "battery_gross_kwh": 66.5,
        "battery_net_kwh": 64.7,
        "wltp_range_km": 475,
        "real_range_city_km": 505,
        "real_range_highway_km": 355,
        "real_range_winter_km": 315,
        "real_range_summer_km": 410,
        "avg_consumption_kwh_100km": 16.2,
        "max_dc_charging_power_kw": 130,
        "max_ac_charging_power_kw": 22,
        "charging_time_dc_10_to_80_min": 29,
        "acceleration_0_100_s": 8.6,
        "drive_type": "FWD",
        "motor_power_hp": 204,
        "trunk_capacity_liters": 490,
        "price_try": 2840000,
        "popular": False,
        "image_url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80"
    }
]

INITIAL_NETWORKS = [
    {
        "id": "zes",
        "name": "ZES (Zorlu Energy Solutions)",
        "short_name": "ZES",
        "logo_color": "#0099ff",
        "accent_color": "blue",
        "station_count": 4200,
        "ac_rate_tl": 7.49,
        "dc_60kw_rate_tl": 9.49,
        "dc_120kw_rate_tl": 10.49,
        "dc_180kw_plus_rate_tl": 10.99,
        "member_discount_percent": 5,
        "overtime_fee_tl_min": 0.50,
        "supported_sockets": ["Type 2 (AC)", "CCS2 (DC)", "CHAdeMO"],
        "coverage_note": "81 ilin tamamında yaygın istasyon ağı, AVM ve otoyol dinlenme tesislerinde yüksek kapsama.",
        "website": "https://zes.net",
        "updated_at": "2024-11-15"
    },
    {
        "id": "trugo",
        "name": "Trugo (Togg Şarj Ağı)",
        "short_name": "Trugo",
        "logo_color": "#00d084",
        "accent_color": "emerald",
        "station_count": 800,
        "ac_rate_tl": 6.95,
        "dc_60kw_rate_tl": 8.95,
        "dc_120kw_rate_tl": 9.85,
        "dc_180kw_plus_rate_tl": 10.40,
        "member_discount_percent": 0,
        "overtime_fee_tl_min": 0.50,
        "supported_sockets": ["CCS2 (180-300kW HPC)", "Type 2 (AC)"],
        "coverage_note": "Tüm ana arter ve otoyollarda 180kW+ ultra hızlı şarj cihazları, Togg sahiplerine özel entegrasyon.",
        "website": "https://trugo.com.tr",
        "updated_at": "2024-11-16"
    },
    {
        "id": "esarj",
        "name": "Eşarj (Enerjisa)",
        "short_name": "Eşarj",
        "logo_color": "#ff5500",
        "accent_color": "orange",
        "station_count": 2100,
        "ac_rate_tl": 7.20,
        "dc_60kw_rate_tl": 9.20,
        "dc_120kw_rate_tl": 10.20,
        "dc_180kw_plus_rate_tl": 10.80,
        "member_discount_percent": 10,
        "overtime_fee_tl_min": 0.60,
        "supported_sockets": ["Type 2 (AC)", "CCS2 (DC)", "CHAdeMO"],
        "coverage_note": "Enerjisa güvencesiyle Türkiye'nin ilk şarj operatörü, Shell istasyonlarında yaygın HPC şarj noktaları.",
        "website": "https://esarj.com",
        "updated_at": "2024-11-14"
    },
    {
        "id": "voltrun",
        "name": "Voltrun",
        "short_name": "Voltrun",
        "logo_color": "#10b981",
        "accent_color": "teal",
        "station_count": 750,
        "ac_rate_tl": 7.10,
        "dc_60kw_rate_tl": 9.30,
        "dc_120kw_rate_tl": 10.30,
        "dc_180kw_plus_rate_tl": 10.70,
        "member_discount_percent": 0,
        "overtime_fee_tl_min": 0.40,
        "supported_sockets": ["Type 2 (AC)", "CCS2 (DC)"],
        "coverage_note": "Şehir içi otoparklar, plazalar ve otellerde geniş AC ve DC istasyonları.",
        "website": "https://voltrun.com",
        "updated_at": "2024-11-10"
    },
    {
        "id": "astor-sarj",
        "name": "Astor Şarj",
        "short_name": "Astor",
        "logo_color": "#ef4444",
        "accent_color": "red",
        "station_count": 450,
        "ac_rate_tl": 6.80,
        "dc_60kw_rate_tl": 8.80,
        "dc_120kw_rate_tl": 9.80,
        "dc_180kw_plus_rate_tl": 10.20,
        "member_discount_percent": 5,
        "overtime_fee_tl_min": 0.50,
        "supported_sockets": ["CCS2 (DC 200kW+)", "Type 2 (AC)"],
        "coverage_note": "Yerli trafo üreticisi Astor'un otoyol koridorlarındaki yüksek güçlü istasyonları.",
        "website": "https://astorsarj.com",
        "updated_at": "2024-11-12"
    },
    {
        "id": "home-ac",
        "name": "Evde Şarj (Standart Mesken)",
        "short_name": "Ev (Gündüz)",
        "logo_color": "#8b5cf6",
        "accent_color": "purple",
        "station_count": 0,
        "ac_rate_tl": 2.60,
        "dc_60kw_rate_tl": 2.60,
        "dc_120kw_rate_tl": 2.60,
        "dc_180kw_plus_rate_tl": 2.60,
        "member_discount_percent": 0,
        "overtime_fee_tl_min": 0,
        "supported_sockets": ["Schuko (2.3kW)", "Wallbox (7.4-11kW)"],
        "coverage_note": "EPDK 2024 mesken kademeli elektrik tarifesi (240 kWh altı ~2.60 TL, üstü ~3.90 TL).",
        "website": "https://epdk.gov.tr",
        "updated_at": "2024-11-01"
    },
    {
        "id": "home-night",
        "name": "Evde Şarj (3 Zamanlı Gece)",
        "short_name": "Ev (Gece 22:00-06:00)",
        "logo_color": "#06b6d4",
        "accent_color": "cyan",
        "station_count": 0,
        "ac_rate_tl": 1.75,
        "dc_60kw_rate_tl": 1.75,
        "dc_120kw_rate_tl": 1.75,
        "dc_180kw_plus_rate_tl": 1.75,
        "member_discount_percent": 0,
        "overtime_fee_tl_min": 0,
        "supported_sockets": ["Schuko", "Wallbox 11kW"],
        "coverage_note": "Gece 22:00 - 06:00 saatleri arası indirimli tarife (en ekonomik şarj yöntemi).",
        "website": "https://epdk.gov.tr",
        "updated_at": "2024-11-01"
    }
]

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Vehicles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        trim TEXT NOT NULL,
        release_year INTEGER,
        battery_gross_kwh REAL,
        battery_net_kwh REAL,
        wltp_range_km INTEGER,
        real_range_city_km INTEGER,
        real_range_highway_km INTEGER,
        real_range_winter_km INTEGER,
        real_range_summer_km INTEGER,
        avg_consumption_kwh_100km REAL,
        max_dc_charging_power_kw INTEGER,
        max_ac_charging_power_kw INTEGER,
        charging_time_dc_10_to_80_min INTEGER,
        acceleration_0_100_s REAL,
        drive_type TEXT,
        motor_power_hp INTEGER,
        trunk_capacity_liters INTEGER,
        price_try REAL,
        popular BOOLEAN,
        image_url TEXT
    )
    """)

    # Charging Networks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS networks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        short_name TEXT NOT NULL,
        logo_color TEXT,
        accent_color TEXT,
        station_count INTEGER,
        ac_rate_tl REAL,
        dc_60kw_rate_tl REAL,
        dc_120kw_rate_tl REAL,
        dc_180kw_plus_rate_tl REAL,
        member_discount_percent REAL,
        overtime_fee_tl_min REAL,
        supported_sockets TEXT,
        coverage_note TEXT,
        website TEXT,
        updated_at TEXT
    )
    """)

    # Scrape logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scrape_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        network_id TEXT,
        timestamp TEXT,
        status TEXT,
        message TEXT,
        old_rate REAL,
        new_rate REAL
    )
    """)

    # Check if vehicles table is empty, then seed
    cursor.execute("SELECT COUNT(*) FROM vehicles")
    if cursor.fetchone()[0] == 0:
        for v in INITIAL_VEHICLES:
            cursor.execute("""
            INSERT INTO vehicles VALUES (
                :id, :brand, :model, :trim, :release_year, :battery_gross_kwh, :battery_net_kwh,
                :wltp_range_km, :real_range_city_km, :real_range_highway_km, :real_range_winter_km,
                :real_range_summer_km, :avg_consumption_kwh_100km, :max_dc_charging_power_kw,
                :max_ac_charging_power_kw, :charging_time_dc_10_to_80_min, :acceleration_0_100_s,
                :drive_type, :motor_power_hp, :trunk_capacity_liters, :price_try, :popular, :image_url
            )
            """, v)

    # Check if networks table is empty, then seed
    cursor.execute("SELECT COUNT(*) FROM networks")
    if cursor.fetchone()[0] == 0:
        for net in INITIAL_NETWORKS:
            cursor.execute("""
            INSERT INTO networks VALUES (
                :id, :name, :short_name, :logo_color, :accent_color, :station_count,
                :ac_rate_tl, :dc_60kw_rate_tl, :dc_120kw_rate_tl, :dc_180kw_plus_rate_tl,
                :member_discount_percent, :overtime_fee_tl_min, :supported_sockets,
                :coverage_note, :website, :updated_at
            )
            """, {
                **net,
                "supported_sockets": json.dumps(net["supported_sockets"])
            })

    conn.commit()
    conn.close()

def get_all_vehicles() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles ORDER BY brand ASC, model ASC")
    rows = cursor.fetchall()
    vehicles = [dict(row) for row in rows]
    conn.close()
    return vehicles

def get_vehicle_by_id(vehicle_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE id = ?", (vehicle_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_all_networks() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM networks ORDER BY station_count DESC")
    rows = cursor.fetchall()
    networks = []
    for r in rows:
        d = dict(r)
        try:
            d["supported_sockets"] = json.loads(d["supported_sockets"])
        except Exception:
            d["supported_sockets"] = []
        networks.append(d)
    conn.close()
    return networks

def update_network_tariffs(network_id: str, tariffs: Dict[str, float], updated_at: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE networks
    SET ac_rate_tl = :ac_rate_tl,
        dc_60kw_rate_tl = :dc_60kw_rate_tl,
        dc_120kw_rate_tl = :dc_120kw_rate_tl,
        dc_180kw_plus_rate_tl = :dc_180kw_plus_rate_tl,
        updated_at = :updated_at
    WHERE id = :id
    """, {
        "id": network_id,
        "ac_rate_tl": tariffs.get("ac_rate_tl", 7.5),
        "dc_60kw_rate_tl": tariffs.get("dc_60kw_rate_tl", 9.5),
        "dc_120kw_rate_tl": tariffs.get("dc_120kw_rate_tl", 10.5),
        "dc_180kw_plus_rate_tl": tariffs.get("dc_180kw_plus_rate_tl", 10.9),
        "updated_at": updated_at
    })
    conn.commit()
    conn.close()

def log_scrape_event(network_id: str, timestamp: str, status: str, message: str, old_rate: float, new_rate: float):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO scrape_logs (network_id, timestamp, status, message, old_rate, new_rate)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (network_id, timestamp, status, message, old_rate, new_rate))
    conn.commit()
    conn.close()

def get_scrape_logs() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scrape_logs ORDER BY id DESC LIMIT 50")
    rows = cursor.fetchall()
    logs = [dict(r) for r in rows]
    conn.close()
    return logs

