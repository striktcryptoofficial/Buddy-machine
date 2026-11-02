import home from "@/content/home.json";
import type { PageContent } from "@/lib/page-content";
import { AboutSection } from "@/components/home/about-section";
import { BootSite } from "@/components/home/boot-site";
import { CursorTrail } from "@/components/home/cursor-trail";
import { CtaSection } from "@/components/home/cta-section";
import { FeaturesSection } from "@/components/home/features-section";
import { GlobalStyles } from "@/components/home/global-styles";
import { HeadStyles } from "@/components/home/head-styles";
import { HeroSection } from "@/components/home/hero-section";
import { LandingPace } from "@/components/home/landing-pace";
import { PageEmbed } from "@/components/home/page-embed";
import { Preloader } from "@/components/home/preloader";
import { SiteCanvas } from "@/components/home/site-canvas";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteNav } from "@/components/home/site-nav";
import { SectionPixels } from "@/components/home/section-pixels";
import { SpecsSection } from "@/components/home/specs-section";

const page = home as PageContent;

export function HomeView() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html:
            'try{history.scrollRestoration="manual";if(location.hash)history.replaceState(null,"",location.pathname+location.search);scrollTo(0,0)}catch(e){}',
        }}
      />
      <HeadStyles />
      <LandingPace />
      <Preloader />
      <div className="page-wrapper">
        <SiteCanvas />
        <GlobalStyles />
        <main className="main-wrapper">
          <SiteNav />
          <HeroSection />
          <AboutSection />
          <FeaturesSection />
          <SpecsSection />
          <CtaSection />
          <SiteFooter />
          <PageEmbed />
        </main>
        <SectionPixels />
        <CursorTrail />
      </div>
      <BootSite pageId="home" scripts={page.scripts} />
    </>
  );
}
