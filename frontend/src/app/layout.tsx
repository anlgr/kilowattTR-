import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KilowattTR | Sürücünün EV & Mobilite Portalı",
  description: "Türkiye'deki elektrikli araçların gerçek menzil verileri, ZES, Trugo, Eşarj güncel kWh tarifeleri ve akıllı şarj maliyet hesaplayıcısı.",
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
      <body className="min-h-screen bg-[#f5f6f8] text-slate-900 antialiased selection:bg-[#0284c7] selection:text-white">
        {children}
      </body>
    </html>
  );
}
