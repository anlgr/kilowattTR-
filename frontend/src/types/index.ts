export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  trim: string;
  release_year: number;
  battery_gross_kwh: number;
  battery_net_kwh: number;
  wltp_range_km: number;
  real_range_city_km: number;
  real_range_highway_km: number;
  real_range_winter_km: number;
  real_range_summer_km: number;
  avg_consumption_kwh_100km: number;
  max_dc_charging_power_kw: number;
  max_ac_charging_power_kw: number;
  charging_time_dc_10_to_80_min: number;
  acceleration_0_100_s: number;
  drive_type: 'RWD' | 'FWD' | 'AWD';
  motor_power_hp: number;
  trunk_capacity_liters: number;
  price_try: number;
  popular: boolean;
  image_url: string;
}

export interface ChargingNetwork {
  id: string;
  name: string;
  short_name: string;
  logo_color: string;
  accent_color: string;
  station_count: number;
  ac_rate_tl: number;
  dc_60kw_rate_tl: number;
  dc_120kw_rate_tl: number;
  dc_180kw_plus_rate_tl: number;
  member_discount_percent: number;
  overtime_fee_tl_min: number;
  supported_sockets: string[];
  coverage_note: string;
  website: string;
  updated_at: string;
}

export interface ChargingCostResponse {
  vehicle_name: string;
  battery_net_kwh: number;
  energy_added_kwh: number;
  range_added_km: number;
  unit_price_tl_per_kwh: number;
  total_cost_tl: number;
  cost_per_km_tl: number;
  estimated_charging_time_min: number;
  charger_speed_kw: number;
  discount_applied_percent: number;
}

export interface SavingsComparisonResponse {
  annual_km: number;
  ice_annual_fuel_cost_tl: number;
  ice_cost_per_km_tl: number;
  ev_annual_charging_cost_tl: number;
  ev_cost_per_km_tl: number;
  annual_savings_tl: number;
  savings_percent: number;
  payback_comparison_note: string;
}

export interface ChargingStop {
  stop_index: number;
  location_name: string;
  distance_from_start_km: number;
  arrival_soc_percent: number;
  target_soc_percent: number;
  charge_duration_min: number;
  energy_added_kwh: number;
  estimated_cost_tl: number;
  network_name: string;
}

export interface RoutePlannerResponse {
  route_name: string;
  distance_km: number;
  vehicle_name: string;
  weather_condition: string;
  effective_consumption_kwh_100km: number;
  total_energy_needed_kwh: number;
  stops_count: number;
  stops: ChargingStop[];
  total_charge_time_min: number;
  total_driving_time_min: number;
  total_trip_time_min: number;
  total_charging_cost_tl: number;
  equivalent_fuel_cost_tl: number;
}

