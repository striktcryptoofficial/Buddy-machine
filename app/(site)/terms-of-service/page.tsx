import type { Metadata } from "next";
import { BootSite } from "@/components/home/boot-site";
import { TermsView } from "@/components/legal/terms-view";
import terms from "@/content/terms.json";
import type { PageContent } from "@/lib/page-content";

const page = terms as PageContent;

export const metadata: Metadata = {
  title: "Terms",
  description: page.description,
};

export default function TermsPage() {
  return (
    <>
      <TermsView />
      <BootSite pageId="terms" scripts={page.scripts} />
    </>
  );
}
