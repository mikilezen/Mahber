import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://www.mahber.social"),
  title: {
    default: "Mahber Platform | Community Infrastructure for Ethiopia",
    template: "%s | Mahber Platform",
  },
  description:
    "Mahber ethiopian community mahber socail titok trend for discovering, ranking, and managing Ethiopian communities at million-scale.",
  keywords: [
    "mahber",
    "ethiopian communities",
    "Mahber social",
    "tiktok mahber",
    "social media",
    "Mikiyas Zenebe",
  ],
  openGraph: {
    title: "Mahber Social",
    description:
      "SEO-ready and performance-optimized community platform architecture for massive scale.",
    url: "https://www.mahber.social",
    siteName: "Mahber Platform",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahber Platform",
    description: "Build and scale Ethiopian communities with production-grade Next.js architecture.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem('mahber-theme') === 'light' ? 'light' : 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
