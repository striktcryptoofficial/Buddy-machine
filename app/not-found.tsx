import { BootSite } from "@/components/home/boot-site";
import { SiteStyles } from "@/components/home/site-styles";
import { NotFoundView } from "@/components/legal/not-found-view";
import notFoundPage from "@/content/not-found.json";
import type { PageContent } from "@/lib/page-content";

const page = notFoundPage as PageContent;

export default function NotFound() {
  return (
    <>
      <SiteStyles />
      <NotFoundView />
      <BootSite pageId="not-found" scripts={page.scripts} />
    </>
  );
}
