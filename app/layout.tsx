import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cutcycle-dataworks.vercel.app"),
  title: "CutCycle DataWorks — Automated Machining Intelligence",
  description: "An interactive manufacturing simulation for production, telemetry, quality, and fault diagnostics.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CutCycle DataWorks — Automated Machining Intelligence",
    description: "Explore a live manufacturing simulation with production, telemetry, OEE, quality, and fault diagnostics.",
    url: "/",
    siteName: "CutCycle DataWorks",
    type: "website",
    images: [
      {
        url: "/screenshots/factory-overview.png",
        width: 1600,
        height: 1000,
        alt: "CutCycle DataWorks interactive 3D manufacturing cell",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CutCycle DataWorks — Automated Machining Intelligence",
    description: "Explore a live manufacturing simulation with production, telemetry, OEE, quality, and fault diagnostics.",
    images: ["/screenshots/factory-overview.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b1117",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
