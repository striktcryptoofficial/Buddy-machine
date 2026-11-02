import type { Metadata } from "next";
import { HatchWipe } from "@/components/home/hatch-wipe";

export const metadata: Metadata = {
  title: {
    default: "Buddy",
    template: "%s",
  },
  description:
    "One Solana wallet. One cat. Procedural DNA, fixed rarity, crystals, and SOL arena.",
  icons: {
    icon: "/cdn/69d660abd07691d10eb7ed1f/69d660acd07691d10eb7f25c_favicon.png",
    apple: "/cdn/69d660abd07691d10eb7ed1f/69d660acd07691d10eb7f25d_webclip2.png",
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
