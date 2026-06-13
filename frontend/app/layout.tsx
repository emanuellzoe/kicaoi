import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Kicaoi — Idle Farm on Celo",
  description: "Plant. Wait. Harvest. A tiny onchain farm for MiniPay.",
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
