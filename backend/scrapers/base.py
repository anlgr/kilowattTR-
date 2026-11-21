from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseTariffScraper(ABC):
    @abstractmethod
    def network_id(self) -> str:
        """Returns unique identifier for network, e.g. zes, trugo, esarj"""
        pass

    @abstractmethod
    async def fetch_current_tariffs(self) -> Dict[str, Any]:
        """
        Fetches current live tariffs from the network website or API.
        Returns dict with:
        {
            "network_id": str,
            "ac_rate_tl": float,
            "dc_60kw_rate_tl": float,
            "dc_120kw_rate_tl": float,
            "dc_180kw_plus_rate_tl": float,
            "source_url": str,
            "status": "success" | "fallback",
            "message": str
        }
        """
        pass

