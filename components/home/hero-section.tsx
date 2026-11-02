import { HeroCircles } from "./hero-circles";

export function HeroSection() {
  return (
    <div id="hero" className="section-hero-wrapper">
      <div id="section-hero" className="section_home-intelligence">
        <HeroCircles />
        <div className="padding-global">
          <div className="container-full">
            <div className="section_home-component">
              <div id="hero-logo-container" className="section_home-heading-wrapper">
                <div id="start-target" className="section_neoconda-wrapper">
                  <div id="hero-logo-source" className="neoconda_hero-source">
                    <div id="app" className="canvas" />
                  </div>
                </div>
                <div id="hero-content" className="section_home-content-wrapper">
                  <div className="padding-global">
                    <div className="container-large">
                      <div className="home_cta-wrapper">
                        <div className="section_home-secondary-text">
                          {"Every cat has a life of its own. "}
                          <span className="section_highlight-txt">
                            {"— one Solana wallet, settled in the arena."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-cats" aria-hidden="true">
          <img src="/cat1.svg" alt="" />
          <img src="/cat2.svg" alt="" />
          <img src="/cat3.svg" alt="" />
          <img src="/cat4.svg" alt="" />
          <img src="/cat5.svg" alt="" />
          <img src="/cat6.svg" alt="" />
          <img src="/cat7.svg" alt="" />
        </div>
      </div>
    </div>
  );
}
