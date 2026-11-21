from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import os
import uvicorn

from database import (
    init_db,
    get_all_vehicles,
    get_vehicle_by_id,
    get_all_networks,
    get_scrape_logs
)
from models import (
    ChargingCostRequest,
    ChargingCostResponse,
    SavingsComparisonRequest,
    SavingsComparisonResponse,
    RoutePlannerRequest,
    RoutePlannerResponse
)
from calculator import (
    calculate_charging_cost,
    calculate_savings_comparison,
    plan_route,
    POPULAR_ROUTES
)
from scrapers.manager import run_all_scrapers

app = FastAPI(
    title="KilowattTR API",
    description="Türkiye Elektrikli Araçlar, Şarj Ağları ve Maliyet Hesaplama API'si",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "app": "KilowattTR - EV & Mobilite Veri Merkezi",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/vehicles")
def list_vehicles(brand: Optional[str] = None, popular_only: Optional[bool] = False):
    vehicles = get_all_vehicles()
    if brand:
        vehicles = [v for v in vehicles if v["brand"].lower() == brand.lower()]
    if popular_only:
        vehicles = [v for v in vehicles if v.get("popular")]
    return vehicles

@app.get("/api/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id: str):
    v = get_vehicle_by_id(vehicle_id)
    if not v:
        raise HTTPException(status_code=404, detail="Araç bulunamadı.")
    return v

@app.get("/api/networks")
def list_networks():
    return get_all_networks()

@app.get("/api/popular-routes")
def get_routes():
    return POPULAR_ROUTES

@app.post("/api/calculator/cost", response_model=ChargingCostResponse)
def calculate_cost(req: ChargingCostRequest):
    try:
        return calculate_charging_cost(
            vehicle_id=req.vehicle_id,
            start_soc_percent=req.start_soc_percent,
            target_soc_percent=req.target_soc_percent,
            charging_location=req.charging_location,
            charger_type=req.charger_type,
            use_member_discount=req.use_member_discount
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/calculator/savings", response_model=SavingsComparisonResponse)
def calculate_savings(req: SavingsComparisonRequest):
    try:
        return calculate_savings_comparison(
            vehicle_id=req.vehicle_id,
            annual_km=req.annual_km,
            fuel_type=req.fuel_type,
            fuel_consumption_l_100km=req.fuel_consumption_l_100km,
            fuel_price_tl_per_liter=req.fuel_price_tl_per_liter,
            home_charging_ratio=req.home_charging_ratio,
            dc_fast_charging_ratio=req.dc_fast_charging_ratio
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/calculator/route", response_model=RoutePlannerResponse)
def calculate_route(req: RoutePlannerRequest):
    try:
        return plan_route(
            vehicle_id=req.vehicle_id,
            route_name=req.route_name,
            distance_km=req.distance_km,
            departure_soc_percent=req.departure_soc_percent,
            min_arrival_soc_percent=req.min_arrival_soc_percent,
            driving_style=req.driving_style,
            weather_condition=req.weather_condition,
            preferred_network=req.preferred_network
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/scrape/trigger")
async def trigger_scrape(background_tasks: BackgroundTasks):
    results = await run_all_scrapers()
    return {"message": "Tarife scraper'ları çalıştırıldı.", "results": results}

@app.get("/api/scrape/logs")
def scrape_logs():
    return get_scrape_logs()

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

