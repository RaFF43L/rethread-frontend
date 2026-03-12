import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Segunda Aura Brechó - Moda Sustentável",
  description: "Peças únicas de moda sustentável com estilo. Encontre roupas de qualidade no melhor brechó.",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://brecho.segundaaura.com.br'),
  openGraph: {
    title: "Segunda Aura Brechó - Moda Sustentável",
    description: "Peças únicas de moda sustentável com estilo. Encontre roupas de qualidade no melhor brechó.",
    siteName: "Segunda Aura Brechó",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Segunda Aura Brechó - Moda Sustentável",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Segunda Aura Brechó",
    description: "Peças únicas de moda sustentável com estilo.",
    images: ["/opengraph-image"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Segunda Aura",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#D4988C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/logo-segunda-aura.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-segunda-aura.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
