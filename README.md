# ⚡ KilowattTR - EV & Mobilite Veri Merkezi

Türkiye'deki elektrikli araçların (EV) gerçek dünya menzil verilerini, şarj ağlarının (ZES, Trugo, Eşarj, Voltrun, Astor) güncel kWh tarifelerini, akıllı dolum maliyeti ve yakıt tasarrufu simülatörlerini sunan modern web platformu.

---

## 🚀 Proje Mimarisi & Özellikler

### 1. ⚡ Şarj Ağı & Canlı Tarife Takip Merkezi
- **Operatörler:** ZES, Trugo (Togg Şarj Ağı), Eşarj (Enerjisa), Voltrun, Astor Şarj ve EPDK Mesken (Ev Tek Zamanlı & 3 Zamanlı Gece).
- **Tarife Kırılımları:**
  - AC (22 kW) Tip 2
  - DC Hızlı (60 kW)
  - DC Ultra HPC (180 kW - 300 kW+)
- **Soket Desteği & İstasyon Sayıları:** Türkiye genelindeki güncel istasyon adetleri, üye indirimleri ve dakikalık aşırı işgal bedelleri.
- **Canlı Web Scraper:** Operatörlerin resmi fiyat sayfalarından anlık tarife çekme ve doğrulama mimarisi.

### 2. 🚗 EV Kataloğu & Gerçek Menzil Karşılaştırma
- **Türkiye Pazarındaki Popüler Modeller:**
  - Togg T10X V2 Uzun Menzil & V1 Standart Menzil
  - Tesla Model Y Arkadan İtiş (SR RWD) & Long Range AWD
  - BYD Atto 3, BYD Dolphin, BYD Seal AWD
  - MG4 Electric (Luxury)
  - Hyundai Ioniq 5 & Kia EV6
  - Renault Megane E-Tech & Volvo EX30 Ultra
- **Gerçek Dünya Koşul Filtreleri:**
  - **WLTP (Fabrika)** laboratuvar verisi
  - **Şehir İçi** (Yüksek rejenerasyonlu kullanım)
  - **Otoyol 120 km/s** (Sürekli yüksek hız rüzgar direnci)
  - **Kış Koşulları (-5°C)** (Kabin ısıtma ve batarya kondisyonlama açık)
- **Yan Yana Araç Karşılaştırma:** 2 veya 3 aracı batarya (net/brüt), şarj eğrisi, 10-80% süresi ve tüketim açısından kıyaslama.

### 3. 🧮 Akıllı Şarj & Tasarruf Hesaplayıcısı
- **Şarj Dolum Tutarı:** Aracın mevcut şarjından (% SoC) hedef şarja dolumunda şebekeden çekilen kWh, kazanılan menzil, ₺ tutarı ve tahmini dakika hesabı.
- **Benzin/Dizel vs Elektrik Tasarrufu:** Yıllık kilometre, akaryakıt litre fiyatı (43.50 ₺/L) ve ev/istasyon şarj dağılımına göre yıllık net tasarruf ve 5 yıllık kümülatif kazanç projeksiyonu.

### 4. 🗺️ Akıllı Otoyol & Dinlenme Tesisi Rota Planlayıcısı
- İstanbul-İzmir, İstanbul-Ankara, Ankara-Antalya, İstanbul-Bodrum otoyol güzergahları.
- Hava durumu (Kış, Ilıman, Yaz) ve sürüş temposuna göre yol üstündeki Trugo ve ZES yüksek güçlü HPC şarj duraklarının simülasyonu.

---

## 🛠️ Teknoloji Yığını

- **Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons (Karanlık Mod varsayılan).
- **Backend:** Python 3.11+, FastAPI, Uvicorn, Pydantic, HTTPX, BeautifulSoup4, Playwright desteği.
- **Veritabanı:** SQLite (`backend/kilowatt.db`) yerel depolama ve otomatik seed mekanizması.

---

## 📦 Kurulum ve Çalıştırma

### Adım 1: Backend (FastAPI) Başlatma
```bash
# Python bağımlılıklarını yükleyin
pip install -r backend/requirements.txt

# Backend sunucusunu başlatın (Port: 8000)
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Veya Windows üzerinde doğrudan `start_backend.bat` dosyasına çift tıklayabilirsiniz.*

API Dokümantasyonu (Swagger): `http://127.0.0.1:8000/docs`

---

### Adım 2: Frontend (Next.js) Başlatma
```bash
cd frontend

# Bağımlılıklar kurulu değilse
npm install

# Geliştirme sunucusunu başlatın (Port: 3000)
npm run dev
```
*Veya Windows üzerinde doğrudan `start_frontend.bat` dosyasına çift tıklayabilirsiniz.*

Web Arayüzü: `http://localhost:3000`

