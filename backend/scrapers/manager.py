import asyncio
from typing import Dict, Any, List
from .zes_scraper import ZesTariffScraper
from .trugo_scraper import TrugoTariffScraper
from .esarj_scraper import EsarjTariffScraper
from database import update_network_tariffs, log_scrape_event, get_all_networks

SCRAPERS = [
    ZesTariffScraper(),
    TrugoTariffScraper(),
    EsarjTariffScraper()
]

async def run_all_scrapers() -> List[Dict[str, Any]]:
    networks_by_id = {n["id"]: n for n in get_all_networks()}
    results = []
    
    for scraper in SCRAPERS:
        net_id = scraper.network_id()
        try:
            tariff_data = await scraper.fetch_current_tariffs()
            old_net = networks_by_id.get(net_id, {})
            old_rate = old_net.get("dc_180kw_plus_rate_tl", 10.5)
            new_rate = tariff_data.get("dc_180kw_plus_rate_tl", 10.5)

            update_network_tariffs(
                network_id=net_id,
                tariffs=tariff_data,
                updated_at=tariff_data.get("updated_at", "")
            )

            log_scrape_event(
                network_id=net_id,
                timestamp=tariff_data.get("updated_at", ""),
                status=tariff_data.get("status", "ok"),
                message=tariff_data.get("message", "Güncellendi"),
                old_rate=old_rate,
                new_rate=new_rate
            )

            results.append(tariff_data)
        except Exception as e:
            results.append({
                "network_id": net_id,
                "status": "error",
                "message": f"Hata oluştu: {str(e)}"
            })

    return results

