import type { Metadata } from "next";
import { HatchWipe } from "@/components/home/hatch-wipe";

const description =
  "A cat with a life of its own. Hatch one from your wallet, keep it, and take it into the arena.";

export const metadata: Metadata = {
  title: {
    default: "Buddy",
    template: "%s · Buddy",
  },
  description,
  applicationName: "Buddy",
  icons: {
    icon: [
      { url: "/brand/favicon.png", type: "image/png", sizes: "64x64", media: "(prefers-color-scheme: light)" },
      { url: "/brand/favicon-dark.png", type: "image/png", sizes: "64x64", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "Buddy",
    description,
    siteName: "Buddy",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/vendor/fonts/mosaic.css" />
      </head>
      <body>
        {children}
        <HatchWipe />
      </body>
    </html>
  );
}
