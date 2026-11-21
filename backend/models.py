from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ChargingCostRequest(BaseModel):
    vehicle_id: str
    start_soc_percent: float = Field(default=10.0, ge=0, le=100)
    target_soc_percent: float = Field(default=80.0, ge=0, le=100)
    charging_location: str = Field(default="zes", description="zes, trugo, esarj, home-ac, home-night, etc.")
    charger_type: str = Field(default="dc_fast", description="ac, dc_60kw, dc_fast, dc_ultra")
    use_member_discount: bool = True

class ChargingCostResponse(BaseModel):
    vehicle_name: str
    battery_net_kwh: float
    energy_added_kwh: float
    range_added_km: float
    unit_price_tl_per_kwh: float
    total_cost_tl: float
    cost_per_km_tl: float
    estimated_charging_time_min: int
    charger_speed_kw: float
    discount_applied_percent: float

class SavingsComparisonRequest(BaseModel):
    vehicle_id: str
    annual_km: float = Field(default=15000, gt=0)
    fuel_type: str = Field(default="gasoline", description="gasoline or diesel")
    fuel_consumption_l_100km: float = Field(default=7.5, gt=0)
    fuel_price_tl_per_liter: float = Field(default=43.50, gt=0)
    home_charging_ratio: float = Field(default=0.70, ge=0, le=1.0)
    dc_fast_charging_ratio: float = Field(default=0.30, ge=0, le=1.0)

class SavingsComparisonResponse(BaseModel):
    annual_km: float
    ice_annual_fuel_cost_tl: float
    ice_cost_per_km_tl: float
    ev_annual_charging_cost_tl: float
    ev_cost_per_km_tl: float
    annual_savings_tl: float
    savings_percent: float
    payback_comparison_note: str

class RoutePlannerRequest(BaseModel):
    vehicle_id: str
    route_name: str
    distance_km: float
    departure_soc_percent: float = Field(default=90.0, ge=20, le=100)
    min_arrival_soc_percent: float = Field(default=15.0, ge=5, le=50)
    driving_style: str = Field(default="normal", description="eco, normal, fast")
    weather_condition: str = Field(default="mild", description="winter, mild, summer")
    preferred_network: str = Field(default="all", description="all, zes, trugo, esarj")

class ChargingStop(BaseModel):
    stop_index: int
    location_name: str
    distance_from_start_km: float
    arrival_soc_percent: float
    target_soc_percent: float
    charge_duration_min: int
    energy_added_kwh: float
    estimated_cost_tl: float
    network_name: str

class RoutePlannerResponse(BaseModel):
    route_name: str
    distance_km: float
    vehicle_name: str
    weather_condition: str
    effective_consumption_kwh_100km: float
    total_energy_needed_kwh: float
    stops_count: int
    stops: List[ChargingStop]
    total_charge_time_min: int
    total_driving_time_min: int
    total_trip_time_min: int
    total_charging_cost_tl: float
    equivalent_fuel_cost_tl: float

