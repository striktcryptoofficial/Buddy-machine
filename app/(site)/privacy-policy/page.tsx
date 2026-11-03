import type { Metadata } from "next";
import { BootSite } from "@/components/home/boot-site";
import { PrivacyView } from "@/components/legal/privacy-view";
import privacy from "@/content/privacy.json";
import type { PageContent } from "@/lib/page-content";

const page = privacy as PageContent;

export const metadata: Metadata = {
  title: "Privacy",
  description: page.description,
};

export default function PrivacyPage() {
  return (
    <>
      <PrivacyView />
      <BootSite pageId="privacy" scripts={page.scripts} />
    </>
  );
}
