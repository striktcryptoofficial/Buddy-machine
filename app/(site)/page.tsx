import type { Metadata } from "next";
import { HomeView } from "@/components/home/home-view";
import home from "@/content/home.json";
import type { PageContent } from "@/lib/page-content";

const page = home as PageContent;

export const metadata: Metadata = {
  description: page.description,
};

export default function HomePage() {
  return <HomeView />;
}
