import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Kicaoi — Idle Farm on Celo",
  description: "Plant. Wait. Harvest. A tiny onchain farm for MiniPay.",
  // Talent App (Proof of Ship) project ownership verification.
  other: {
    "talentapp:project_verification":
      "e906895d50adb29108b7411a9d4a3bf12db84d264231196f2886142ad86050f37cdf7c895e721bea2bed91922ee21b88914a16bcc48ce7c5af1097f9189e3ca1",
  },
};

// Mobile-first: lock width and prevent zoom jank inside the MiniPay browser.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0E140C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
