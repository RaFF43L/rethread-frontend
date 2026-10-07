import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { UserSessionProvider } from "@/features/auth/context/UserSessionProvider";
import { FavoritesProvider } from "@/features/products/context/FavoritesProvider";
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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
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
  themeColor: "#F7F6F2",
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
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <UserSessionProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
          </UserSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
