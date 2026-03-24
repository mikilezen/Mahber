import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://mahber.platform"),
  title: {
    default: "Mahber Platform | Community Infrastructure for Ethiopia",
    template: "%s | Mahber Platform",
  },
  description:
    "Mahber Platform is a production-ready Next.js foundation for discovering, ranking, and managing Ethiopian communities at million-scale.",
  keywords: [
    "mahber",
    "ethiopian communities",
    "next.js platform",
    "community platform",
    "social infrastructure",
  ],
  openGraph: {
    title: "Mahber Platform",
    description:
      "SEO-ready and performance-optimized community platform architecture for massive scale.",
    url: "https://mahber.platform",
    siteName: "Mahber Platform",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahber Platform",
    description: "Build and scale Ethiopian communities with production-grade Next.js architecture.",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0d1b2a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
