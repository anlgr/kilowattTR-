from typing import Dict, Any, List
import math
from database import get_vehicle_by_id, get_all_networks

def calculate_charging_cost(
    vehicle_id: str,
    start_soc_percent: float,
    target_soc_percent: float,
    charging_location: str,
    charger_type: str,
    use_member_discount: bool
) -> Dict[str, Any]:
    vehicle = get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise ValueError(f"Vehicle with id '{vehicle_id}' not found")

    networks = {n["id"]: n for n in get_all_networks()}
    net = networks.get(charging_location)
    
    if not net:
        # Fallback to ZES
        net = networks.get("zes", {
            "name": "Standart DC",
            "ac_rate_tl": 7.49,
            "dc_60kw_rate_tl": 9.49,
            "dc_120kw_rate_tl": 10.49,
            "dc_180kw_plus_rate_tl": 10.99,
            "member_discount_percent": 0
        })

    # Pick rate based on charger type
    if charger_type == "ac":
        base_rate = net.get("ac_rate_tl", 7.20)
        power_kw = min(net.get("max_ac_kw", 22), vehicle.get("max_ac_charging_power_kw", 11))
    elif charger_type == "dc_60kw":
        base_rate = net.get("dc_60kw_rate_tl", 9.40)
        power_kw = min(60, vehicle.get("max_dc_charging_power_kw", 150))
    elif charger_type == "dc_ultra":
        base_rate = net.get("dc_180kw_plus_rate_tl", 10.90)
        power_kw = min(300, vehicle.get("max_dc_charging_power_kw", 180))
    else:  # dc_fast (120-180kW)
        base_rate = net.get("dc_120kw_rate_tl", 10.40)
        power_kw = min(150, vehicle.get("max_dc_charging_power_kw", 150))

    discount = 0.0
    if use_member_discount and net.get("member_discount_percent"):
        discount = net["member_discount_percent"]
    
    unit_price = round(base_rate * (1 - (discount / 100)), 2)

    battery_net = vehicle["battery_net_kwh"]
    delta_soc = max(0.0, (target_soc_percent - start_soc_percent) / 100.0)
    
    # 90% charging efficiency for AC, 92% for DC
    efficiency = 0.90 if charger_type == "ac" else 0.93
    raw_energy = delta_soc * battery_net
    grid_energy = round(raw_energy / efficiency, 2)
    
    total_cost = round(grid_energy * unit_price, 2)

    # Range added based on average consumption
    avg_cons = vehicle.get("avg_consumption_kwh_100km", 16.5)
    range_added = round((raw_energy / avg_cons) * 100, 1)

    cost_per_km = round(total_cost / max(1.0, range_added), 2)

    # Charging time estimation (accounting for tapering above 80%)
    avg_charging_speed = power_kw * 0.75  # realistic curve factor
    time_hours = raw_energy / max(1.0, avg_charging_speed)
    if target_soc_percent > 80:
        over_80_soc = (target_soc_percent - max(80.0, start_soc_percent)) / 100.0
        extra_penalty_hours = (over_80_soc * battery_net) / (power_kw * 0.3)
        time_hours += extra_penalty_hours
    
    time_minutes = int(max(10, round(time_hours * 60)))

    return {
        "vehicle_name": f"{vehicle['brand']} {vehicle['model']} ({vehicle['trim']})",
        "battery_net_kwh": battery_net,
        "energy_added_kwh": grid_energy,
        "range_added_km": range_added,
        "unit_price_tl_per_kwh": unit_price,
        "total_cost_tl": total_cost,
        "cost_per_km_tl": cost_per_km,
        "estimated_charging_time_min": time_minutes,
        "charger_speed_kw": power_kw,
        "discount_applied_percent": discount
    }

def calculate_savings_comparison(
    vehicle_id: str,
    annual_km: float,
    fuel_type: str,
    fuel_consumption_l_100km: float,
    fuel_price_tl_per_liter: float,
    home_charging_ratio: float,
    dc_fast_charging_ratio: float
) -> Dict[str, Any]:
    vehicle = get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise ValueError(f"Vehicle with id '{vehicle_id}' not found")

    # ICE (Benzin / Dizel) Cost
    ice_liters_per_km = fuel_consumption_l_100km / 100.0
    ice_cost_per_km = ice_liters_per_km * fuel_price_tl_per_liter
    ice_annual_cost = round(ice_cost_per_km * annual_km, 2)

    # EV Cost
    # Home AC avg 2.20 TL (mix of day/night), DC fast avg 10.40 TL
    home_kwh_cost = 2.30
    dc_kwh_cost = 10.40
    
    total_ratio = home_charging_ratio + dc_fast_charging_ratio
    norm_home = home_charging_ratio / max(0.001, total_ratio)
    norm_dc = dc_fast_charging_ratio / max(0.001, total_ratio)
    
    blended_kwh_cost = (norm_home * home_kwh_cost) + (norm_dc * dc_kwh_cost)

    ev_cons_per_km = vehicle.get("avg_consumption_kwh_100km", 16.5) / 100.0
    ev_cost_per_km = round(ev_cons_per_km * blended_kwh_cost, 2)
    ev_annual_cost = round(ev_cost_per_km * annual_km, 2)

    annual_savings = round(ice_annual_cost - ev_annual_cost, 2)
    savings_pct = round((annual_savings / max(1.0, ice_annual_cost)) * 100, 1)

    note = (
        f"Evden şarj ağırlıklı (%{int(norm_home * 100)}) kullanımda yılda yaklaşık "
        f"{int(annual_savings):,} ₺ tasarruf elde edilir. 5 yıllık toplam yakıt tasarrufu "
        f"{int(annual_savings * 5):,} ₺ seviyesine ulaşır."
    )

    return {
        "annual_km": annual_km,
        "ice_annual_fuel_cost_tl": ice_annual_cost,
        "ice_cost_per_km_tl": round(ice_cost_per_km, 2),
        "ev_annual_charging_cost_tl": ev_annual_cost,
        "ev_cost_per_km_tl": ev_cost_per_km,
        "annual_savings_tl": annual_savings,
        "savings_percent": savings_pct,
        "payback_comparison_note": note
    }

POPULAR_ROUTES = [
    {"name": "İstanbul - İzmir Otoyolu", "distance_km": 479, "avg_speed_kmh": 115},
    {"name": "İstanbul - Ankara Otoyolu", "distance_km": 448, "avg_speed_kmh": 110},
    {"name": "Ankara - Antalya (Afyon üzerinden)", "distance_km": 485, "avg_speed_kmh": 100},
    {"name": "İstanbul - Bodrum", "distance_km": 690, "avg_speed_kmh": 110},
    {"name": "İzmir - Antalya", "distance_km": 450, "avg_speed_kmh": 95},
    {"name": "İstanbul - Bursa", "distance_km": 155, "avg_speed_kmh": 105}
]

def plan_route(
    vehicle_id: str,
    route_name: str,
    distance_km: float,
    departure_soc_percent: float,
    min_arrival_soc_percent: float,
    driving_style: str,
    weather_condition: str,
    preferred_network: str
) -> Dict[str, Any]:
    vehicle = get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise ValueError(f"Vehicle with id '{vehicle_id}' not found")

    base_cons = vehicle.get("avg_consumption_kwh_100km", 16.5)

    # Adjust consumption based on weather and style
    weather_factor = 1.0
    if weather_condition == "winter":
        weather_factor = 1.25  # +25% consumption in cold
    elif weather_condition == "summer":
        weather_factor = 1.10  # +10% for air conditioning
    
    style_factor = 1.0
    if driving_style == "eco":
        style_factor = 0.90
    elif driving_style == "fast":
        style_factor = 1.20  # high speed highway driving
    
    effective_cons = round(base_cons * weather_factor * style_factor, 1)

    usable_battery = vehicle["battery_net_kwh"]
    total_energy_needed = (distance_km / 100.0) * effective_cons

    departure_energy = (departure_soc_percent / 100.0) * usable_battery
    min_buffer_energy = (min_arrival_soc_percent / 100.0) * usable_battery

    # Realistic highway range on a full battery under these conditions:
    realistic_100_range = (usable_battery / effective_cons) * 100.0
    
    # Range of departure charge leaving min_buffer:
    first_leg_range = ((departure_energy - min_buffer_energy) / effective_cons) * 100.0

    stops = []
    total_charge_time = 0
    total_charging_cost = 0.0

    networks = [n for n in get_all_networks() if n["station_count"] > 0]
    network_names = [n["name"] for n in networks] or ["Trugo", "ZES", "Eşarj"]

    if first_leg_range >= distance_km:
        # No stops needed!
        pass
    else:
        # Stops needed
        remaining_km = distance_km
        current_distance = 0
        leg = 1
        
        while remaining_km > 0:
            if leg == 1:
                # First leg: can use up to first_leg_range
                leg_distance = min(remaining_km, max(120, first_leg_range * 0.85))
            else:
                # Normal leg: 10% to 80% charge (70% battery window)
                leg_distance = min(remaining_km, realistic_100_range * 0.65)

            current_distance += leg_distance
            remaining_km -= leg_distance

            if remaining_km <= (realistic_100_range * 0.5):
                # We can reach destination with what we charge or without another stop
                # Let's add the stop if we haven't reached destination yet
                if remaining_km > 0:
                    net_choice = network_names[(leg - 1) % len(network_names)]
                    energy_to_add = round((remaining_km / 100.0) * effective_cons + min_buffer_energy, 1)
                    target_soc = min(85, int(((energy_to_add) / usable_battery) * 100 + 15))
                    charge_time = int(max(15, (energy_to_add / (vehicle.get("max_dc_charging_power_kw", 150) * 0.7)) * 60))
                    cost = round(energy_to_add * 10.45, 1)
                    
                    stops.append({
                        "stop_index": leg,
                        "location_name": f"Oksijen / Dinlenme Tesisi KM {int(current_distance)}",
                        "distance_from_start_km": round(current_distance, 1),
                        "arrival_soc_percent": 18,
                        "target_soc_percent": target_soc,
                        "charge_duration_min": charge_time,
                        "energy_added_kwh": energy_to_add,
                        "estimated_cost_tl": cost,
                        "network_name": net_choice
                    })
                    total_charge_time += charge_time
                    total_charging_cost += cost
                break
            else:
                # Intermediate stop (15% -> 80%)
                net_choice = network_names[(leg - 1) % len(network_names)]
                energy_to_add = round(usable_battery * 0.65, 1)
                charge_time = int(max(20, (energy_to_add / (vehicle.get("max_dc_charging_power_kw", 150) * 0.72)) * 60))
                cost = round(energy_to_add * 10.45, 1)

                stops.append({
                    "stop_index": leg,
                    "location_name": f"Hızlı Şarj İstasyonu KM {int(current_distance)}",
                    "distance_from_start_km": round(current_distance, 1),
                    "arrival_soc_percent": 15,
                    "target_soc_percent": 80,
                    "charge_duration_min": charge_time,
                    "energy_added_kwh": energy_to_add,
                    "estimated_cost_tl": cost,
                    "network_name": net_choice
                })
                total_charge_time += charge_time
                total_charging_cost += cost
                leg += 1

    driving_speed = 105 if driving_style != "fast" else 125
    driving_time_min = int((distance_km / driving_speed) * 60)
    total_trip_time_min = driving_time_min + total_charge_time

    # Equivalent ICE fuel cost (7.5L / 100km @ 43.5 TL)
    ice_fuel_cost = round((distance_km / 100.0) * 7.5 * 43.50, 1)

    return {
        "route_name": route_name,
        "distance_km": distance_km,
        "vehicle_name": f"{vehicle['brand']} {vehicle['model']} ({vehicle['trim']})",
        "weather_condition": weather_condition,
        "effective_consumption_kwh_100km": effective_cons,
        "total_energy_needed_kwh": round(total_energy_needed, 1),
        "stops_count": len(stops),
        "stops": stops,
        "total_charge_time_min": total_charge_time,
        "total_driving_time_min": driving_time_min,
        "total_trip_time_min": total_trip_time_min,
        "total_charging_cost_tl": round(total_charging_cost, 2),
        "equivalent_fuel_cost_tl": ice_fuel_cost
    }

