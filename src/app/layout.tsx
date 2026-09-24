import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import "./globals.css";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('segunda-aura-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-segunda-aura.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo-segunda-aura.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
