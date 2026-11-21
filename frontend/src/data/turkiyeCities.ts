export interface TurkiyeCity {
  plate: string;
  name: string;
  lat: number;
  lng: number;
  hubName: string;
  networks: string;
}

export interface RouteHubStop {
  name: string;
  km: number;
  networks: string;
}

export const TURKIYE_CITIES: TurkiyeCity[] = [
  { plate: '01', name: 'Adana', lat: 37.0000, lng: 35.3213, hubName: 'Adana Ceyhan / Otoyol HPC Hub', networks: 'Trugo 300kW • ZES 180kW • Eşarj 240kW' },
  { plate: '02', name: 'Adıyaman', lat: 37.7648, lng: 38.2786, hubName: 'Adıyaman Merkez HPC İstasyonu', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '03', name: 'Afyonkarahisar', lat: 38.7507, lng: 30.5567, hubName: 'Afyon İkbal Thermal Mega Şarj Hub', networks: 'Trugo 300kW • ZES 300kW • Eşarj 240kW' },
  { plate: '04', name: 'Ağrı', lat: 39.7191, lng: 43.0503, hubName: 'Ağrı Doğubayazıt Yolu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '05', name: 'Amasya', lat: 40.6499, lng: 35.8353, hubName: 'Amasya Merzifon Dinlenme Tesisi HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '06', name: 'Ankara', lat: 39.9334, lng: 32.8597, hubName: 'Ankara Gölbaşı / Polatlı Otoyol HPC', networks: 'Trugo 300kW • ZES 300kW • Eşarj 240kW' },
  { plate: '07', name: 'Antalya', lat: 36.8969, lng: 30.7133, hubName: 'Antalya Döşemealtı / Kepez HPC Hub', networks: 'Trugo 300kW • ZES 180kW • Eşarj 180kW' },
  { plate: '08', name: 'Artvin', lat: 41.1828, lng: 41.8183, hubName: 'Artvin Hopa Sahil Yolu HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '09', name: 'Aydın', lat: 37.8560, lng: 27.8416, hubName: 'Aydın Söke / Çine Otoyol HPC', networks: 'Trugo 180kW • ZES 180kW • Eşarj 180kW' },
  { plate: '10', name: 'Balıkesir', lat: 39.6484, lng: 27.8826, hubName: 'Oksijen O-68 Susurluk HPC Hub', networks: 'Trugo 300kW • Eşarj 240kW • ZES 180kW' },
  { plate: '11', name: 'Bilecik', lat: 40.1451, lng: 29.9799, hubName: 'Bilecik Bozüyük Dinlenme Tesisi HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '12', name: 'Bingöl', lat: 38.8854, lng: 40.4966, hubName: 'Bingöl Merkez HPC İstasyonu', networks: 'Trugo 180kW • ZES 120kW' },
  { plate: '13', name: 'Bitlis', lat: 38.4006, lng: 42.1095, hubName: 'Bitlis Tatvan HPC İstasyonu', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '14', name: 'Bolu', lat: 40.7392, lng: 31.6089, hubName: 'Bolu Highway Outlet Ultra HPC Hub', networks: 'Trugo 300kW • ZES 300kW • Eşarj 180kW' },
  { plate: '15', name: 'Burdur', lat: 37.7203, lng: 30.2908, hubName: 'Burdur Bucak Dinlenme Tesisi HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '16', name: 'Bursa', lat: 40.1885, lng: 29.0610, hubName: 'Oksijen O-37 Orhangazi / Bursa HPC', networks: 'Trugo 300kW • ZES 180kW • Eşarj 240kW' },
  { plate: '17', name: 'Çanakkale', lat: 40.1553, lng: 26.4142, hubName: '1915 Çanakkale Köprüsü Gelibolu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '18', name: 'Çankırı', lat: 40.6013, lng: 33.6134, hubName: 'Çankırı Ilgaz Yolu HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '19', name: 'Çorum', lat: 40.5506, lng: 34.9556, hubName: 'Çorum Sungurlu Karadeniz Yolu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '20', name: 'Denizli', lat: 37.7765, lng: 29.0864, hubName: 'Denizli Pamukkale / Honaz HPC', networks: 'ZES 180kW • Trugo 180kW • Eşarj 180kW' },
  { plate: '21', name: 'Diyarbakır', lat: 37.9144, lng: 40.2306, hubName: 'Diyarbakır Kayapınar HPC Hub', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '22', name: 'Edirne', lat: 41.6818, lng: 26.5623, hubName: 'Edirne TEM Gişeler HPC Hub', networks: 'ZES 180kW • Trugo 180kW • Eşarj 180kW' },
  { plate: '23', name: 'Elazığ', lat: 38.6810, lng: 39.2264, hubName: 'Elazığ Malatya Yolu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '24', name: 'Erzincan', lat: 39.7500, lng: 39.5000, hubName: 'Erzincan E-80 Karayolu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '25', name: 'Erzurum', lat: 39.9000, lng: 41.2700, hubName: 'Erzurum MNG / Aziziye HPC Hub', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '26', name: 'Eskişehir', lat: 39.7767, lng: 30.5206, hubName: 'Eskişehir Sivrihisar Dinlenme Tesisi HPC', networks: 'Trugo 300kW • ZES 180kW' },
  { plate: '27', name: 'Gaziantep', lat: 37.0662, lng: 37.3833, hubName: 'Gaziantep Nurdağı Otoyol HPC Hub', networks: 'Trugo 180kW • ZES 180kW • Eşarj 180kW' },
  { plate: '28', name: 'Giresun', lat: 40.9128, lng: 38.3895, hubName: 'Giresun Bulancak Sahil Yolu HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '29', name: 'Gümüşhane', lat: 40.4386, lng: 39.5086, hubName: 'Gümüşhane Zigana Yolu HPC', networks: 'Trugo 180kW • ZES 120kW' },
  { plate: '30', name: 'Hakkari', lat: 37.5833, lng: 43.7333, hubName: 'Hakkari Yüksekova HPC', networks: 'ZES 120kW • Trugo 180kW' },
  { plate: '31', name: 'Hatay', lat: 36.4018, lng: 36.3498, hubName: 'Hatay İskenderun / Dörtyol Otoyol HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '32', name: 'Isparta', lat: 37.7648, lng: 30.5566, hubName: 'Isparta Keçiborlu Kavşağı HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '33', name: 'Mersin', lat: 36.8121, lng: 34.6415, hubName: 'Mersin Tarsus / Pozantı Otoyol HPC', networks: 'Trugo 300kW • ZES 180kW • Eşarj 180kW' },
  { plate: '34', name: 'İstanbul', lat: 41.0082, lng: 28.9784, hubName: 'İstanbul Ataşehir / Kuzey Marmara HPC', networks: 'Trugo 300kW • ZES 300kW • Eşarj 240kW' },
  { plate: '35', name: 'İzmir', lat: 38.4237, lng: 27.1428, hubName: 'İzmir Bornova / Selçuk Otoyol HPC Hub', networks: 'Trugo 300kW • ZES 300kW • Eşarj 240kW' },
  { plate: '36', name: 'Kars', lat: 40.6167, lng: 43.1000, hubName: 'Kars Sarıkamış HPC İstasyonu', networks: 'Trugo 180kW • ZES 120kW' },
  { plate: '37', name: 'Kastamonu', lat: 41.3887, lng: 33.7827, hubName: 'Kastamonu Ilgaz Tüneli HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '38', name: 'Kayseri', lat: 38.7312, lng: 35.4787, hubName: 'Kayseri Kocasinan Kuzey Çevreyolu HPC', networks: 'Trugo 180kW • ZES 180kW • Eşarj 180kW' },
  { plate: '39', name: 'Kırklareli', lat: 41.7333, lng: 27.2167, hubName: 'Kırklareli Lüleburgaz D-100 HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '40', name: 'Kırşehir', lat: 39.1425, lng: 34.1709, hubName: 'Kırşehir Mucur Karayolu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '41', name: 'Kocaeli', lat: 40.8533, lng: 29.8815, hubName: 'Kocaeli Körfez / Gebze Otoyol HPC', networks: 'Trugo 300kW • ZES 180kW • Eşarj 180kW' },
  { plate: '42', name: 'Konya', lat: 37.8667, lng: 32.4833, hubName: 'Konya Selçuklu / Kulu Kavşağı HPC Hub', networks: 'Trugo 300kW • ZES 180kW • Eşarj 180kW' },
  { plate: '43', name: 'Kütahya', lat: 39.4167, lng: 29.9833, hubName: 'Kütahya Zafer Dinlenme Tesisleri HPC', networks: 'ZES 180kW • Eşarj 180kW • Trugo 180kW' },
  { plate: '44', name: 'Malatya', lat: 38.3552, lng: 38.3095, hubName: 'Malatya Darende Karayolu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '45', name: 'Manisa', lat: 38.6191, lng: 27.4289, hubName: 'Oksijen O-204 Manisa Akhisar / Kula HPC', networks: 'ZES 180kW • Trugo 180kW • Eşarj 180kW' },
  { plate: '46', name: 'Kahramanmaraş', lat: 37.5858, lng: 36.9371, hubName: 'Kahramanmaraş Türkoğlu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '47', name: 'Mardin', lat: 37.3212, lng: 40.7245, hubName: 'Mardin Kızıltepe İpekyolu HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '48', name: 'Muğla', lat: 37.2153, lng: 28.3636, hubName: 'Muğla Yatağan / Milas HPC Hub', networks: 'Trugo 180kW • ZES 180kW • Eşarj 180kW' },
  { plate: '49', name: 'Muş', lat: 38.9462, lng: 41.7539, hubName: 'Muş Merkez HPC İstasyonu', networks: 'Trugo 180kW • ZES 120kW' },
  { plate: '50', name: 'Nevşehir', lat: 38.6939, lng: 34.6857, hubName: 'Nevşehir Kapadokya / Avanos HPC', networks: 'ZES 180kW • Trugo 180kW • Eşarj 180kW' },
  { plate: '51', name: 'Niğde', lat: 37.9667, lng: 34.6833, hubName: 'Niğde Ankara-Adana Otoyolu Eminlik HPC', networks: 'Trugo 300kW • ZES 180kW' },
  { plate: '52', name: 'Ordu', lat: 40.9839, lng: 37.8764, hubName: 'Ordu Fatsa Karadeniz Sahil Yolu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '53', name: 'Rize', lat: 41.0201, lng: 40.5234, hubName: 'Rize Çayeli Sahil Yolu HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '54', name: 'Sakarya', lat: 40.7569, lng: 30.3783, hubName: 'Sapanca / Hendek Otoyol Dinlenme Tesisi HPC', networks: 'Trugo 300kW • ZES 180kW • Eşarj 180kW' },
  { plate: '55', name: 'Samsun', lat: 41.2867, lng: 36.3300, hubName: 'Samsun Havza / Kavak Karayolu HPC Hub', networks: 'Trugo 180kW • ZES 180kW • Eşarj 180kW' },
  { plate: '56', name: 'Siirt', lat: 37.9333, lng: 41.9500, hubName: 'Siirt Kurtalan Yolu HPC', networks: 'Trugo 180kW • ZES 120kW' },
  { plate: '57', name: 'Sinop', lat: 42.0231, lng: 35.1531, hubName: 'Sinop Boyabat Yolu HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '58', name: 'Sivas', lat: 39.7477, lng: 37.0179, hubName: 'Sivas Yıldızeli / Cumhuriyet HPC Hub', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '59', name: 'Tekirdağ', lat: 40.9833, lng: 27.5167, hubName: 'Tekirdağ Çorlu / Malkara Otoyol HPC', networks: 'ZES 180kW • Trugo 180kW • Eşarj 180kW' },
  { plate: '60', name: 'Tokat', lat: 40.3167, lng: 36.5500, hubName: 'Tokat Turhal Karayolu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '61', name: 'Trabzon', lat: 41.0015, lng: 39.7178, hubName: 'Trabzon Yomra / Akçaabat Sahil HPC Hub', networks: 'Trugo 180kW • ZES 180kW • Eşarj 180kW' },
  { plate: '62', name: 'Tunceli', lat: 39.1079, lng: 39.5401, hubName: 'Tunceli Merkez HPC İstasyonu', networks: 'Trugo 180kW • ZES 120kW' },
  { plate: '63', name: 'Şanlıurfa', lat: 37.1591, lng: 38.7969, hubName: 'Şanlıurfa Birecik Otoyol Dinlenme Tesisi HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '64', name: 'Uşak', lat: 38.6823, lng: 29.4082, hubName: 'Uşak Banaz / Kula Dinlenme Tesisi HPC', networks: 'ZES 180kW • Trugo 180kW • Eşarj 180kW' },
  { plate: '65', name: 'Van', lat: 38.4891, lng: 43.4089, hubName: 'Van Edremit / Erciş HPC Hub', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '66', name: 'Yozgat', lat: 39.8181, lng: 34.8147, hubName: 'Yozgat Yerköy / Sorgun E-88 HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '67', name: 'Zonguldak', lat: 41.4564, lng: 31.7987, hubName: 'Zonguldak Ereğli / Devrek HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '68', name: 'Aksaray', lat: 38.3687, lng: 34.0370, hubName: 'Aksaray Ağaçlı / Ortaköy Otoyol HPC Hub', networks: 'Trugo 300kW • ZES 180kW • Eşarj 180kW' },
  { plate: '69', name: 'Bayburt', lat: 40.2552, lng: 40.2249, hubName: 'Bayburt Kop Geçidi Yolu HPC', networks: 'Trugo 180kW • ZES 120kW' },
  { plate: '70', name: 'Karaman', lat: 37.1759, lng: 33.2287, hubName: 'Karaman Sertavul Yolu HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '71', name: 'Kırıkkale', lat: 39.8468, lng: 33.5153, hubName: 'Kırıkkale Yahşihan Dinlenme Tesisi HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '72', name: 'Batman', lat: 37.8812, lng: 41.1351, hubName: 'Batman Merkez HPC İstasyonu', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '73', name: 'Şırnak', lat: 37.5164, lng: 42.4611, hubName: 'Şırnak Cizre İpekyolu HPC', networks: 'Trugo 180kW • ZES 120kW' },
  { plate: '74', name: 'Bartın', lat: 41.6344, lng: 32.3375, hubName: 'Bartın Amasra Kavşağı HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '75', name: 'Ardahan', lat: 41.1105, lng: 42.7022, hubName: 'Ardahan Merkez HPC İstasyonu', networks: 'Trugo 180kW • ZES 120kW' },
  { plate: '76', name: 'Iğdır', lat: 39.9167, lng: 44.0333, hubName: 'Iğdır Merkez HPC İstasyonu', networks: 'Trugo 180kW • ZES 120kW' },
  { plate: '77', name: 'Yalova', lat: 40.6500, lng: 29.2667, hubName: 'Yalova Osmangazi Köprüsü Çıkışı Oksijen HPC', networks: 'Trugo 300kW • ZES 180kW • Eşarj 240kW' },
  { plate: '78', name: 'Karabük', lat: 41.2061, lng: 32.6204, hubName: 'Karabük Gerede-Samsun Bağlantı Otoyolu HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '79', name: 'Kilis', lat: 36.7184, lng: 37.1212, hubName: 'Kilis Merkez HPC İstasyonu', networks: 'ZES 180kW • Trugo 120kW' },
  { plate: '80', name: 'Osmaniye', lat: 37.0742, lng: 36.2478, hubName: 'Osmaniye Bahçe / Toprakkale Otoyol HPC', networks: 'Trugo 180kW • ZES 180kW' },
  { plate: '81', name: 'Düzce', lat: 40.8438, lng: 31.1565, hubName: 'Düzce Kaynaşlı TEM Otoyol HPC Hub', networks: 'Trugo 300kW • ZES 180kW • Eşarj 180kW' },
  // Popüler Turizm Merkezleri
  { plate: '48-B', name: 'Bodrum (Muğla)', lat: 37.0344, lng: 27.4305, hubName: 'Bodrum Torba / Güvercinlik HPC Hub', networks: 'Trugo 180kW • ZES 180kW • Eşarj 180kW' },
  { plate: '48-M', name: 'Marmaris (Muğla)', lat: 36.8550, lng: 28.2742, hubName: 'Marmaris Gökova Kavşağı HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '48-F', name: 'Fethiye (Muğla)', lat: 36.6217, lng: 29.1164, hubName: 'Fethiye Göcek Tüneli Çıkışı HPC', networks: 'ZES 180kW • Trugo 180kW' },
  { plate: '35-C', name: 'Çeşme / Alaçatı (İzmir)', lat: 38.3229, lng: 26.3028, hubName: 'Çeşme Otoyolu Urla / Alaçatı HPC Hub', networks: 'ZES 300kW • Trugo 180kW • Eşarj 180kW' },
  { plate: '07-A', name: 'Alanya (Antalya)', lat: 36.5437, lng: 31.9998, hubName: 'Alanya Manavgat D-400 HPC Hub', networks: 'ZES 180kW • Trugo 180kW' },
];

// Bilinen ana otoyol rotaları için tam karayolu mesafeleri ve özel dinlenme tesisleri
const KNOWN_CORRIDORS: Record<string, { distanceKm: number; highway: string; hubs: RouteHubStop[] }> = {
  'İstanbul|İzmir': {
    distanceKm: 480,
    highway: 'O-5 Otoyolu (Osmangazi Köprüsü)',
    hubs: [
      { name: 'Oksijen O-37 Orhangazi HPC', km: 85, networks: 'Trugo 300kW • ZES 180kW' },
      { name: 'Oksijen O-68 Susurluk HPC Hub', km: 245, networks: 'Trugo 300kW • Eşarj 240kW • ZES 180kW' },
      { name: 'Oksijen O-204 Manisa Akhisar', km: 365, networks: 'ZES 180kW • Trugo 180kW' },
    ],
  },
  'İstanbul|Ankara': {
    distanceKm: 450,
    highway: 'O-4 Anadolu Otoyolu',
    hubs: [
      { name: 'Sapanca Otoyol Dinlenme Tesisi', km: 135, networks: 'Trugo 180kW • ZES 180kW' },
      { name: 'Bolu Highway Outlet Ultra HPC Hub', km: 265, networks: 'Trugo 300kW • ZES 300kW • Eşarj 180kW' },
      { name: 'Kızılcahamam / Akıncı Gişeler HPC', km: 385, networks: 'ZES 180kW • Trugo 180kW' },
    ],
  },
  'İstanbul|Antalya': {
    distanceKm: 695,
    highway: 'Osmangazi - Kütahya - Afyon - Burdur',
    hubs: [
      { name: 'Oksijen O-37 Orhangazi / Bursa', km: 115, networks: 'Trugo 300kW • ZES 180kW' },
      { name: 'Kütahya Zafer Dinlenme Tesisleri', km: 315, networks: 'ZES 180kW • Eşarj 180kW' },
      { name: 'Afyon İkbal Thermal Mega Şarj Hub', km: 420, networks: 'Trugo 300kW • ZES 300kW • Eşarj 240kW' },
      { name: 'Burdur / Bucak HPC İstasyonu', km: 605, networks: 'Trugo 180kW • ZES 180kW' },
    ],
  },
  'Ankara|Antalya': {
    distanceKm: 515,
    highway: 'Polatlı - Afyonkarahisar - Akseki',
    hubs: [
      { name: 'Sivrihisar / Polatlı HPC Tesisi', km: 140, networks: 'Trugo 180kW • ZES 180kW' },
      { name: 'Afyonkarahisar İkbal / Park Hub', km: 260, networks: 'Trugo 300kW • ZES 300kW • Eşarj 180kW' },
      { name: 'Akseki / Manavgat Yolu HPC', km: 430, networks: 'ZES 180kW • Trugo 180kW' },
    ],
  },
  'İstanbul|Bodrum (Muğla)': {
    distanceKm: 710,
    highway: 'O-5 İzmir - Aydın Otoyolu',
    hubs: [
      { name: 'Oksijen O-68 Susurluk HPC Hub', km: 245, networks: 'Trugo 300kW • ZES 180kW' },
      { name: 'İzmir Bornova / Selçuk Otoyol Hub', km: 510, networks: 'ZES 300kW • Eşarj 240kW • Trugo 180kW' },
      { name: 'Söke / Milas HPC İstasyonu', km: 625, networks: 'Trugo 180kW • ZES 180kW' },
    ],
  },
  'Ankara|İzmir': {
    distanceKm: 585,
    highway: 'E-96 Afyon - Uşak - Turgutlu Koridoru',
    hubs: [
      { name: 'Sivrihisar Dinlenme Tesisi HPC', km: 140, networks: 'Trugo 180kW • ZES 180kW' },
      { name: 'Afyonkarahisar Mega Şarj Hub', km: 260, networks: 'Trugo 300kW • ZES 300kW' },
      { name: 'Uşak / Kula Dinlenme Tesisi HPC', km: 445, networks: 'ZES 180kW • Eşarj 180kW' },
    ],
  },
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function computeCityRoute(originName: string, destName: string): {
  distanceKm: number;
  highway: string;
  hubs: RouteHubStop[];
} {
  if (originName === destName) {
    return {
      distanceKm: 150,
      highway: `${originName} Şehir İçi & Çevre Otoyolu`,
      hubs: [{ name: `${originName} Merkez HPC Şarj Hub`, km: 75, networks: 'Trugo 180kW • ZES 180kW' }],
    };
  }

  // 1. Doğrudan bilinen koridor kontrolü
  const directKey = `${originName}|${destName}`;
  if (KNOWN_CORRIDORS[directKey]) {
    return KNOWN_CORRIDORS[directKey];
  }

  // 2. Ters yön bilinen koridor kontrolü (Örn: İzmir -> İstanbul)
  const reverseKey = `${destName}|${originName}`;
  if (KNOWN_CORRIDORS[reverseKey]) {
    const rev = KNOWN_CORRIDORS[reverseKey];
    return {
      distanceKm: rev.distanceKm,
      highway: rev.highway,
      hubs: [...rev.hubs]
        .reverse()
        .map((h) => ({
          name: h.name,
          km: Math.max(40, rev.distanceKm - h.km),
          networks: h.networks,
        })),
    };
  }

  // 3. Herhangi iki şehir arasında coğrafi karayolu mesafesi ve güzergah üstü şarj merkezlerini hesapla
  const originCity = TURKIYE_CITIES.find((c) => c.name === originName) || TURKIYE_CITIES[33];
  const destCity = TURKIYE_CITIES.find((c) => c.name === destName) || TURKIYE_CITIES[5];

  const airDistKm = haversineKm(originCity.lat, originCity.lng, destCity.lat, destCity.lng);
  const roadDistanceKm = Math.max(85, Math.round(airDistKm * 1.27));

  // Başlangıç ve varış vektörü üzerindeki ara illeri bul
  const dLat = destCity.lat - originCity.lat;
  const dLng = destCity.lng - originCity.lng;
  const segLenSq = dLat * dLat + dLng * dLng;

  const candidates: Array<{ city: TurkiyeCity; progress: number; crossKm: number }> = [];

  for (const city of TURKIYE_CITIES) {
    if (city.name === originName || city.name === destName || city.plate.includes('-')) continue;
    const t =
      segLenSq > 0
        ? ((city.lat - originCity.lat) * dLat + (city.lng - originCity.lng) * dLng) / segLenSq
        : 0;
    if (t < 0.12 || t > 0.88) continue;

    const projLat = originCity.lat + t * dLat;
    const projLng = originCity.lng + t * dLng;
    const crossKm = haversineKm(city.lat, city.lng, projLat, projLng);

    if (crossKm <= 85) {
      candidates.push({ city, progress: t, crossKm });
    }
  }

  candidates.sort((a, b) => a.progress - b.progress);

  // Birbirine çok yakın olanları seyrelt
  const selectedHubs: RouteHubStop[] = [];
  let lastKm = 0;
  for (const cand of candidates) {
    const kmMark = Math.round(cand.progress * roadDistanceKm);
    if (kmMark - lastKm >= 75 && roadDistanceKm - kmMark >= 50) {
      selectedHubs.push({
        name: cand.city.hubName,
        km: kmMark,
        networks: cand.city.networks,
      });
      lastKm = kmMark;
    }
  }

  if (selectedHubs.length === 0) {
    const midKm = Math.round(roadDistanceKm / 2);
    selectedHubs.push({
      name: `${originName} - ${destName} Karayolu Dinlenme Tesisi HPC`,
      km: midKm,
      networks: 'Trugo 180kW • ZES 180kW • Eşarj 180kW',
    });
  }

  const viaNames = selectedHubs
    .slice(0, 3)
    .map((h) => h.name.split(' ')[0])
    .join(' - ');

  return {
    distanceKm: roadDistanceKm,
    highway: `${originName} → ${viaNames ? viaNames + ' → ' : ''}${destName} Karayolu`,
    hubs: selectedHubs,
  };
}
