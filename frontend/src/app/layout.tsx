import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KilowattTR | Türkiye Elektrikli Araç, Şarj Maliyeti & Menzil Portalı",
  description:
    "KilowattTR: Türkiye'deki elektrikli araçların (Togg T10X, Togg T10F, Tesla Model Y, BYD) gerçek menzil verileri, ZES, Trugo, Eşarj güncel kWh tarifeleri, 81 il uzun yol şarj rota planlayıcısı ve maliyet hesaplayıcısı.",
  keywords: [
    "KilowattTR",
    "kilowatt tr",
    "elektrikli araç şarj maliyeti hesaplama",
    "Togg T10X menzil",
    "Togg T10F menzil",
    "Trugo şarj fiyatları 2026",
    "ZES şarj fiyatları 2026",
    "Eşarj tarifeleri",
    "elektrikli araç uzun yol rota planlayıcı",
    "elektrikli otomobil haberleri",
  ],
  verification: {
    google: "d7jp6XvH4wiu_voqDUBpsyHKmrIBrQEuHTss1t3E6KM",
  },
  openGraph: {
    title: "KilowattTR | Sürücünün EV & Mobilite Rehberi",
    description:
      "Türkiye'deki elektrikli araçların gerçek otoyol/kış menzilleri, canlı ZES-Trugo-Eşarj kWh tarifeleri ve 81 il şarj rota planlayıcısı.",
    type: "website",
    locale: "tr_TR",
    siteName: "KilowattTR",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        <meta
          name="google-site-verification"
          content="d7jp6XvH4wiu_voqDUBpsyHKmrIBrQEuHTss1t3E6KM"
        />
      </head>
      <body className="min-h-screen bg-[#f5f6f8] text-slate-900 antialiased selection:bg-[#0284c7] selection:text-white">
        {children}
      </body>
    </html>
  );
}
