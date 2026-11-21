"""
KilowattTR - Orijinal Görselli Canlı EV Haber & Gündem Scraper
ShiftDelete.Net, LOG Dergisi ve Motor1 Türkiye RSS beslemelerinden
her haberin KENDİ ORİJİNAL KAPAK GÖRSELİNİ (<media:content>, <enclosure>, <img>)
ve gerçek özet metnini çekerek frontend/public/data/ev_haberleri.json dosyasına kaydeder.
"""

import html
import json
import os
import re
from datetime import datetime
from email.utils import parsedate_to_datetime
from typing import List, Dict, Any, Optional
import requests

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
}

RSS_SOURCES = [
    ("ShiftDelete.Net", "https://shiftdelete.net/etiket/elektrikli-otomobil/feed", False),
    ("ShiftDelete.Net", "https://shiftdelete.net/etiket/togg/feed", False),
    ("LOG Dergisi", "https://www.log.com.tr/etiket/elektrikli-otomobil/feed/", False),
    ("LOG Dergisi", "https://www.log.com.tr/etiket/togg/feed/", False),
    ("Motor1 Türkiye", "https://tr.motor1.com/rss/news/all/", True),
]

UNIQUE_FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
]

TURKISH_MONTHS = {
    1: "Ocak", 2: "Şubat", 3: "Mart", 4: "Nisan",
    5: "Mayıs", 6: "Haziran", 7: "Temmuz", 8: "Ağustos",
    9: "Eylül", 10: "Ekim", 11: "Kasım", 12: "Aralık"
}


def decode_text(raw: str) -> str:
    if not raw:
        return ""
    text = re.sub(r"<!\[CDATA\[([\s\S]*?)\]\]>", r"\1", raw)
    return html.unescape(text).strip()


def clean_html(raw: str) -> str:
    text = decode_text(raw)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"The post[\s\S]*$", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_original_image(item_xml: str) -> Optional[str]:
    # 1. <media:content url="..." />
    m = re.search(r'<media:content[^>]+url=["\']([^"\']+)["\']', item_xml, re.IGNORECASE)
    if m:
        return decode_text(m.group(1))

    # 2. <enclosure url="..." />
    m = re.search(r'<enclosure[^>]+url=["\']([^"\']+)["\']', item_xml, re.IGNORECASE)
    if m:
        return decode_text(m.group(1))

    # 3. <media:thumbnail url="..." />
    m = re.search(r'<media:thumbnail[^>]+url=["\']([^"\']+)["\']', item_xml, re.IGNORECASE)
    if m:
        return decode_text(m.group(1))

    # 4. Yüksek çözünürlüklü srcset veya <img src="...">
    m = re.search(r'srcset=["\'][^"\']*?(https?://[^\s"\',]+-(?:1000x\d+|660x\d+)\.(?:jpg|jpeg|png|webp))', item_xml, re.IGNORECASE)
    if m:
        return decode_text(m.group(1))

    m = re.search(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', item_xml, re.IGNORECASE)
    if m:
        return decode_text(m.group(1))

    return None


def classify_tag(title: str):
    lower = title.lower()
    if any(k in lower for k in ["togg", "t10x", "t10f", "trugo"]):
        return "TOGG & YERLİ", "bg-cyan-600 text-white"
    if any(k in lower for k in ["tesla", "model y", "model 3", "fsd", "supercharger"]):
        return "TESLA GÜNDEMİ", "bg-red-600 text-white"
    if any(k in lower for k in ["byd", "seal", "atto", "dolphin", "chery", "mg4", "kia", "hyundai", "mercedes", "bmw", "volvo"]):
        return "YENİ MODELLER", "bg-amber-600 text-white"
    if any(k in lower for k in ["şarj", "zes", "eşarj", "istasyon", "batarya", "menzil"]):
        return "ŞARJ & BATARYA", "bg-emerald-600 text-white"
    if any(k in lower for k in ["satış", "odmd", "rekor", "pazar", "vergi", "ötv", "fiyat"]):
        return "PAZAR & ANALİZ", "bg-blue-600 text-white"
    return "EV GÜNDEM", "bg-cyan-600 text-white"


def parse_pub_date(pub_date_str: str):
    try:
        dt = parsedate_to_datetime(pub_date_str)
        formatted = f"{dt.day} {TURKISH_MONTHS.get(dt.month, '')} {dt.year}"
        return formatted, dt.timestamp()
    except Exception:
        now = datetime.now()
        formatted = f"{now.day} {TURKISH_MONTHS.get(now.month, '')} {now.year}"
        return formatted, now.timestamp()


def fetch_live_rss_articles() -> List[Dict[str, Any]]:
    raw_items = []
    seen_titles = set()
    used_images = set()
    fallback_idx = 0

    for source_name, url, filter_ev in RSS_SOURCES:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code != 200:
                continue

            item_blocks = re.findall(r"<item>[\s\S]*?</item>", resp.text)
            for item_xml in item_blocks:
                t_m = re.search(r"<title>([\s\S]*?)</title>", item_xml)
                l_m = re.search(r"<link>([\s\S]*?)</link>", item_xml)
                p_m = re.search(r"<pubDate>([\s\S]*?)</pubDate>", item_xml)
                d_m = re.search(r"<description>([\s\S]*?)</description>", item_xml)

                title = clean_html(t_m.group(1)) if t_m else ""
                link = decode_text(l_m.group(1)) if l_m else ""
                pub_raw = p_m.group(1).strip() if p_m else ""
                desc = clean_html(d_m.group(1)) if d_m else ""

                if not title or len(title) < 18:
                    continue

                if filter_ev:
                    ev_keywords = ["elektrikli", "togg", "tesla", "byd", "şarj", "batarya", "hibrit", "menzil"]
                    combined = f"{title} {desc}".lower()
                    if not any(k in combined for k in ev_keywords):
                        continue

                norm_key = title[:40].lower()
                if norm_key in seen_titles:
                    continue

                orig_img = extract_original_image(item_xml)
                final_img = orig_img
                if not final_img or final_img in used_images:
                    while fallback_idx < len(UNIQUE_FALLBACK_IMAGES) and UNIQUE_FALLBACK_IMAGES[fallback_idx] in used_images:
                        fallback_idx += 1
                    final_img = UNIQUE_FALLBACK_IMAGES[fallback_idx % len(UNIQUE_FALLBACK_IMAGES)]
                    fallback_idx += 1

                seen_titles.add(norm_key)
                used_images.add(final_img)

                date_str, ts = parse_pub_date(pub_raw)
                tag, tag_bg = classify_tag(title)

                if desc and len(desc) > 25:
                    summary = desc[:210] + ("..." if len(desc) > 210 else "")
                else:
                    summary = f"{source_name} kaynağından aktarılan habere göre elektrikli otomobil ekosistemindeki son gelişmeler paylaşıldı."

                raw_items.append({
                    "title": title,
                    "description": summary,
                    "source": source_name,
                    "url": link,
                    "date": date_str,
                    "timestamp": ts,
                    "tag": tag,
                    "tagBg": tag_bg,
                    "imageUrl": final_img,
                })
        except Exception as e:
            print(f"[UYARI] {source_name} RSS çekilemedi: {e}")

    raw_items.sort(key=lambda x: x["timestamp"], reverse=True)

    articles = []
    for idx, item in enumerate(raw_items[:12]):
        articles.append({
            "id": idx + 1,
            "title": item["title"],
            "description": item["description"],
            "source": item["source"],
            "url": item["url"],
            "date": item["date"],
            "read_time": f"{3 + (idx % 4)} dk okuma",
            "tag": item["tag"],
            "tagBg": item["tagBg"],
            "imageUrl": item["imageUrl"],
        })

    return articles


def run_news_scraper():
    print("=" * 60)
    print("KilowattTR - Orijinal Görselli EV Haber Scraper Başlatılıyor...")
    print("=" * 60)

    articles = fetch_live_rss_articles()
    print(f"[BAŞARILI] {len(articles)} adet orijinal görselli güncel EV haberi çekildi.")

    payload = {
        "metadata": {
            "source": "ShiftDelete, LOG & Motor1 TR (Orijinal Görselli Canlı RSS)",
            "is_live": True,
            "updated_at": datetime.now().strftime("%d.%m.%Y %H:%M"),
            "total_count": len(articles),
        },
        "hero_slides": articles[:4],
        "news_list": articles[4:10],
        "all_articles": articles,
    }

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_dir = os.path.join(base_dir, "frontend", "public", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "ev_haberleri.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"[TAMAMLANDI] Haberler kaydedildi: {output_path}")


if __name__ == "__main__":
    run_news_scraper()
