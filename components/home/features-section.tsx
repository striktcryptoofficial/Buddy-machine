function FeatureChevron({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 120 160" aria-hidden="true">
      <path
        d="M16 12 L100 80 L16 148 L16 125 L71 80 L16 35 Z"
        fill={filled ? "#000" : "#fff"}
        fillRule="evenodd"
      />
    </svg>
  );
}

export function FeatureIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.15,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "Single Mint") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
        <circle cx="16.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "Hunger") {
    return (
      <svg {...common}>
        <path d="M5 10h14" />
        <path d="M7 10c.5 5 2.2 8 5 8s4.5-3 5-8" />
      </svg>
    );
  }
  if (name === "Live Mood") {
    return (
      <svg {...common}>
        <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" />
        <circle cx="12" cy="12" r="2.4" />
      </svg>
    );
  }
  if (name === "Training") {
    return (
      <svg {...common}>
        <path d="M6.5 8v8M17.5 8v8M3.5 10v4M20.5 10v4M6.5 12h11" />
      </svg>
    );
  }
  if (name === "Field Work") {
    return (
      <svg {...common}>
        <path d="M12 3l5 8-5 10L7 11l5-8z" />
        <path d="M7 11h10" />
      </svg>
    );
  }
  if (name === "Procedural") {
    return (
      <svg {...common}>
        <circle cx="6" cy="7" r="2" />
        <circle cx="18" cy="7" r="2" />
        <circle cx="12" cy="17" r="2" />
        <path d="M8 8.2 10.2 15.2M16 8.2 13.8 15.2M8 7h8" />
      </svg>
    );
  }
  if (name === "Trust") {
    return (
      <svg {...common}>
        <path d="M12 3 19 6v6c0 4.2-2.8 7.2-7 8.8C7.8 19.2 5 16.2 5 12V6l7-3z" />
      </svg>
    );
  }
  if (name === "Battle Record") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M9.2 11.2 8 21l4-2.2L16 21l-1.2-9.8" />
      </svg>
    );
  }
  if (name === "The Voice") {
    return (
      <svg {...common}>
        <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
      </svg>
    );
  }
  if (name === "Pet") {
    return (
      <svg {...common}>
        <path d="M8 11V7a1.4 1.4 0 0 1 2.8 0V11" />
        <path d="M11 10.2V6.2a1.4 1.4 0 0 1 2.8 0V11" />
        <path d="M14 11V8a1.4 1.4 0 0 1 2.8 0v5.2c0 3.4-2 6.3-5.4 6.3h-.6C8 19.5 6 17.4 6 14.6V12a1.4 1.4 0 0 1 2.8 0" />
      </svg>
    );
  }
  if (name === "Energy") {
    return (
      <svg {...common}>
        <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9z" />
      </svg>
    );
  }
  if (name === "Feed") {
    return (
      <svg {...common}>
        <path d="M5 11h14" />
        <path d="M7 11c.5 5 2.2 8 5 8s4.5-3 5-8" />
        <path d="M12 4v4M10 6l2 2 2-2" />
      </svg>
    );
  }
  if (name === "Personality") {
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
        <circle cx="9" cy="7" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="8" cy="17" r="1.7" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "Rarity") {
    return (
      <svg {...common}>
        <path d="M12 2.5 19 9.5 12 21.5 5 9.5 12 2.5z" />
        <path d="M5 9.5h14" />
      </svg>
    );
  }
  if (name === "Evolve") {
    return (
      <svg {...common}>
        <path d="M12 20V6" />
        <path d="m7 11 5-5 5 5" />
        <path d="M5 20h14" />
      </svg>
    );
  }
  if (name === "Match History") {
    return (
      <svg {...common}>
        <path d="M9 7h11M9 12h11M9 17h11" />
        <circle cx="4.5" cy="7" r="1.15" fill="currentColor" stroke="none" />
        <circle cx="4.5" cy="12" r="1.15" fill="currentColor" stroke="none" />
        <circle cx="4.5" cy="17" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "Verify") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
        <path d="m8.4 11.1 2 2 3.6-4" />
      </svg>
    );
  }
  if (name === "Sealed Hatch") {
    return (
      <svg {...common}>
        <rect x="6" y="11" width="12" height="9" rx="1.5" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }
  return null;
}

export function FeaturesSection() {
  return (
    <>
    <div id="features-padding" className="section_features-padding">
      <div id="features" className="section_home-features">
        <div className="section_clip-path-wrap">
          <div className="stroke-wrap">
            <div className="section_features-header-component">
              <div data-reveal="scramble" className="section_features-eyebrow">
                {"FEATURES"}
              </div>
              <h2 data-reveal="text" className="section_features-heading">
                {"One Solana Mint. Ranked at Hatch. Settled in the Arena."}
              </h2>
            </div>
            <div className="section-content-wrap">
              <div className="sticky-block">
                <section className="sticky-block-grid">
                  <div className="section_middle-slider">
                    <div className="w-embed">
                      <video id="scroll-video" muted playsInline preload="none" style={{"width":"100%","height":"auto","display":"block"}} />
                    </div>
                  </div>
                </section>
              </div>
              <div className="home_defence-sticky">
                <div className="section_relative-block">
                  <div className="home_features-wrapper">
                    <div className="relative-block">
                      <div id="scope-1" className="home_sticky-wrapper">
                        <div className="padding-global">
                          <div className="container-large">
                            <div className="home_grid-wrapper">
                              <div className="section_left-slider-wrap hide-mobile-landscape">
                                <div className="section_slider-card">
                                  <div className="card-number-wrap">
                                    <div className="card-num-btn">
                                      <FeatureIcon name="Single Mint" />
                                    </div>
                                  </div>
                                  <div className="card-content">
                                    <h3 className="card-heading-name">
                                      {"Single Mint"}
                                    </h3>
                                    <div className="card-text">
                                      {"One Solana wallet mints one cat. The coat never re-rolls. Breeding is closed."}
                                      <br />
                                    </div>
                                  </div>
                                </div>
                                <div className="section_slider-card">
                                  <div className="card-number-wrap">
                                    <div className="card-num-btn">
                                      <FeatureIcon name="Procedural" />
                                    </div>
                                  </div>
                                  <div className="card-content">
                                    <h3 className="card-heading-name">
                                      {"Procedural"}
                                    </h3>
                                    <div className="card-text">
                                      {"Coat, pattern, eyes, and mutations generate once from the wallet seed."}
                                    </div>
                                  </div>
                                </div>
                                <div className="section_slider-card">
                                  <div className="card-number-wrap">
                                    <div className="card-num-btn">
                                      <FeatureIcon name="Rarity" />
                                    </div>
                                  </div>
                                  <div className="card-content">
                                    <h3 className="card-heading-name">
                                      {"Rarity"}
                                    </h3>
                                    <div className="card-text">
                                      {"Common, Uncommon, Rare, Legendary. Rarer seeds carry the mutations."}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="section_middle-slider">
                                <div className="hide-above-lanscape w-embed">
                                  <video src="/media/3dtest/neoconda-test/videos/Responsive-screen1.webm" muted autoPlay playsInline loop preload="none" style={{"width":"100%","height":"auto","display":"block"}} />
                                </div>
                              </div>
                              <div className="section_bottom-slider hide-mobile-landscape">
                                <div className="section_slider-card">
                                  <div className="card-number-wrap">
                                    <div className="card-num-btn">
                                      <FeatureIcon name="Battle Record" />
                                    </div>
                                  </div>
                                  <div className="card-content">
                                    <h3 className="card-heading-name">
                                      {"Battle Record"}
                                    </h3>
                                    <div className="card-text">
                                      {"Scraps, staredowns, machines, and the throne. Crystals in the pot. SOL on the challenge."}
                                    </div>
                                  </div>
                                </div>
                                <div className="section_slider-card">
                                  <div className="card-number-wrap">
                                    <div className="card-num-btn">
                                      <FeatureIcon name="Field Work" />
                                    </div>
                                  </div>
                                  <div className="card-content">
                                    <h3 className="card-heading-name">
                                      {"Field Work"}
                                    </h3>
                                    <div className="card-text">
                                      {"Mining returns crystals. Hungry, tired, or asleep, she can refuse."}
                                    </div>
                                  </div>
                                </div>
                                <div className="section_slider-card">
                                  <div className="card-number-wrap">
                                    <div className="card-num-btn">
                                      <FeatureIcon name="Evolve" />
                                    </div>
                                  </div>
                                  <div className="card-content">
                                    <h3 className="card-heading-name">
                                      {"Evolve"}
                                    </h3>
                                    <div className="card-text">
                                      {"The form can evolve. Same seed, same rank. The voice has more room."}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="section_responsive-wrapper">
                                <div id="mob-res" className="section_responsive-text-animation">
                                  <div className="section_slider-card">
                                    <div className="card-number-wrap">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Single Mint" />
                                      </div>
                                    </div>
                                    <div className="card-content">
                                      <h3 className="card-heading-name">
                                        {"Single Mint"}
                                      </h3>
                                      <div className="card-text">
                                        {"One Solana wallet mints one cat. The coat never re-rolls. Breeding is closed."}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="section_slider-card">
                                    <div className="card-number-wrap">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Procedural" />
                                      </div>
                                    </div>
                                    <div className="card-content">
                                      <h3 className="card-heading-name">
                                        {"Procedural"}
                                      </h3>
                                      <div className="card-text">
                                        {"Coat, pattern, eyes, and mutations generate once from the wallet seed."}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="section_slider-card">
                                    <div className="card-number-wrap">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Rarity" />
                                      </div>
                                    </div>
                                    <div className="card-content">
                                      <h3 className="card-heading-name">
                                        {"Rarity"}
                                      </h3>
                                      <div className="card-text">
                                        {"Common, Uncommon, Rare, Legendary. Rarer seeds carry the mutations."}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="section_slider-card">
                                    <div className="card-number-wrap">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Battle Record" />
                                      </div>
                                    </div>
                                    <div className="card-content">
                                      <h3 className="card-heading-name">
                                        {"Battle Record"}
                                      </h3>
                                      <div className="card-text">
                                        {"Scraps, staredowns, machines, and the throne. Crystals in the pot. SOL on the challenge."}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="section_slider-card">
                                    <div className="card-number-wrap">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Field Work" />
                                      </div>
                                    </div>
                                    <div className="card-content">
                                      <h3 className="card-heading-name">
                                        {"Field Work"}
                                      </h3>
                                      <div className="card-text">
                                        {"Mining returns crystals. Hungry, tired, or asleep, she can refuse."}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="section_slider-card">
                                    <div className="card-number-wrap">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Evolve" />
                                      </div>
                                    </div>
                                    <div className="card-content">
                                      <h3 className="card-heading-name">
                                        {"Evolve"}
                                      </h3>
                                      <div className="card-text">
                                        {"The form can evolve. Same seed, same rank. The voice has more room."}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div id="trigger-1" className="section-dummy hide-mobile-landscape" />
                    </div>
                    <div id="lottiee-section" className="relative-block">
                      <div className="feature-chevrons" aria-hidden="true">
                        <div className="feature-chevrons__side">
                          {Array.from({ length: 5 }, (_, i) => <FeatureChevron key={i} />)}
                        </div>
                        <div className="feature-chevrons__gap" />
                        <div className="feature-chevrons__side">
                          {Array.from({ length: 5 }, (_, i) => <FeatureChevron key={i} filled />)}
                        </div>
                      </div>
                      <div id="scope-2" className="home_defence-component">
                        <div className="home_image-wrapper">
                          <div className="video-code-embed w-embed">
                            <div className="lottie-container">
                              <dotlottie-player src="/media/3dtest/neoconda-test/2026-july-13/neoconda-line.json" background="transparent" speed="1" style={{"width":"100%","height":"100%"}} direction="1" playMode="normal" preserveAspectRatio="xMidYMid slice" />
                            </div>
                            <style dangerouslySetInnerHTML={{ __html: "\n  .lottie-container {\n    width: 100%;\n  }\n" }} />
                          </div>
                          <div data-reveal="block" className="hide-above-lanscape w-embed">
                            <video src="/media/3dtest/neoconda-test/videos/res_screen-2.webm" muted autoPlay playsInline loop preload="none" style={{"width":"100%","height":"auto","display":"block"}} />
                          </div>
                        </div>
                        <div data-reveal="block" className="home_defence-content-wrap">
                          <h3 data-reveal="text" className="home_defence-heading">
                            {"The Form Can Evolve"}
                          </h3>
                          <div data-reveal="text" className="home_defence-description">
                            {"Care can move the form. The seed, the rank, and the wallet stay. When the form changes, the voice has more room. Hunger, energy, and fatigue still decide the fight."}
                          </div>
                        </div>
                        <div className="divider-line-wrapper">
                          <div className="divider-line" />
                        </div>
                      </div>
                      <div id="trigger-2" className="section-dummy three-hundred-vh hide-mobile-landscape" />
                      <div id="router-details" className="relative-block">
                        <div className="home_secure-component-parent">
                          <div className="padding-global">
                            <div className="container-large">
                              <div className="home_secure-component">
                                <div className="home_securre-content-left">
                                  <div className="section_slider-card">
                                    <div data-reveal="block" className="card-content">
                                      <div className="card-header">
                                        <div data-reveal="fade" className="svg-wrap" />
                                        <h3 className="card-heading-name">
                                          {"The Condition"}
                                        </h3>
                                      </div>
                                      <div className="card-text">
                                        {"Hunger, energy, and fatigue are live. They decide if a scrap is accepted."}
                                      </div>
                                    </div>
                                  </div>
                                  <div data-reveal="block" className="home_secure-features">
                                    <div className="home_fetures-image">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Hunger" />
                                      </div>
                                    </div>
                                    <div className="home_secure-features-content">
                                      <div data-reveal="text" className="home_secure-text">
                                        <span className="span-highlight">
                                          {"Hunger:"}
                                        </span>
                                        {" Hunger climbs on a clock. Cross it and she can refuse the scrap until she is fed."}
                                      </div>
                                    </div>
                                  </div>
                                  <div data-reveal="block" className="home_secure-features">
                                    <div className="home_fetures-image">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Energy" />
                                      </div>
                                    </div>
                                    <div className="home_secure-features-content">
                                      <div data-reveal="text" className="home_secure-text">
                                        <span className="span-highlight">
                                          {"Energy:"}
                                        </span>
                                        {" Energy is spent on drills and entry. Run it out and the arena holds her."}
                                      </div>
                                    </div>
                                  </div>
                                  <div data-reveal="block" className="home_secure-features">
                                    <div className="home_fetures-image">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Live Mood" />
                                      </div>
                                    </div>
                                    <div className="home_secure-features-content">
                                      <div data-reveal="text" className="home_secure-text">
                                        <span className="span-highlight">
                                          {"Mood State:"}
                                        </span>
                                        {" In a staredown, the shyer or hungrier cat looks away. Affection and introversion are read."}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="divider-line-wrapper">
                                    <div className="divider-line is-alt" />
                                  </div>
                                </div>
                                <div id="w-node-_8f6b3661-4f78-9faf-7a59-75479c026463-0eb7ed1e" className="home_image-wrapper hide-new" />
                                <div id="w-node-_957be803-c1ab-a353-0d16-836339404663-0eb7ed1e" className="home_securre-content-right">
                                  <div data-reveal="block" className="section_slider-card">
                                    <div className="card-content">
                                      <div className="card-header">
                                        <div data-reveal="fade" className="svg-wrap" />
                                        <h3 data-reveal="text" className="card-heading-name">
                                          {"The Record"}
                                        </h3>
                                      </div>
                                      <div data-reveal="text" className="card-text">
                                        {"The voice reads scraps, crystals brought home, and the days the condition failed."}
                                      </div>
                                    </div>
                                  </div>
                                  <div data-reveal="block" className="home_secure-features">
                                    <div className="home_fetures-image">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="The Voice" />
                                      </div>
                                    </div>
                                    <div className="home_secure-features-content">
                                      <div data-reveal="text" className="home_secure-text">
                                        <span className="span-highlight">
                                          {"Battle Commentary:"}
                                        </span>
                                        {" Commentary comes from the stats. Vigor and mischief carry a scrap. The seed stays if she evolves."}
                                      </div>
                                    </div>
                                  </div>
                                  <div data-reveal="block" className="home_secure-features">
                                    <div className="home_fetures-image">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Match History" />
                                      </div>
                                    </div>
                                    <div className="home_secure-features-content">
                                      <div data-reveal="text" className="home_secure-text">
                                        <span className="span-highlight">
                                          {"Match History:"}
                                        </span>
                                        {" Wins, losses, and refused fights are stored. The next scrap reads that history."}
                                      </div>
                                    </div>
                                  </div>
                                  <div data-reveal="block" className="home_secure-features">
                                    <div className="home_fetures-image">
                                      <div className="card-num-btn">
                                        <FeatureIcon name="Evolve" />
                                      </div>
                                    </div>
                                    <div className="home_secure-features-content">
                                      <div data-reveal="text" className="home_secure-text">
                                        <span className="span-highlight">
                                          {"The Form:"}
                                        </span>
                                        {" The form can evolve. Seed, rank, and wallet stay. The voice has more room."}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div id="trigger-3" className="section-dummy three" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="stroke-line left w-embed">
              <svg width="100%" height="100%" viewBox="0 0 1 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="0.5" y1="0" x2="0.5" y2="100" stroke="#FFEBEB" strokeOpacity="0.28" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className="stroke-line right w-embed">
              <svg width="100%" height="100%" viewBox="0 0 1 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="0.5" y1="0" x2="0.5" y2="100" stroke="#FFEBEB" strokeOpacity="0.28" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <img src="/cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed6c_features-top.avif" loading="lazy" sizes="(max-width: 2788px) 100vw, 2788px" srcSet="/cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed6c_features-top-p-500.avif 500w, /cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed6c_features-top-p-800.avif 800w, /cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed6c_features-top-p-1080.avif 1080w, /cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed6c_features-top.avif 2788w" alt="Black stylized arrow pointing left with a curved bottom edge." className="features-bg top" />
            <img src="/cdn/69d660abd07691d10eb7ed1f/69d660acd07691d10eb7f2a0_Mobile-top.png" loading="lazy" sizes="100vw" srcSet="/cdn/69d660abd07691d10eb7ed1f/69d660acd07691d10eb7f2a0_Mobile-top-p-500.png 500w, /cdn/69d660abd07691d10eb7ed1f/69d660acd07691d10eb7f2a0_Mobile-top.png 736w" alt="Black stylized arrow pointing left with a curved bottom edge." className="features-bg-mobile top" />
            <img src="/cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed72_features-bottom.avif" loading="lazy" sizes="(max-width: 2788px) 100vw, 2788px" srcSet="/cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed72_features-bottom-p-500.avif 500w, /cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed72_features-bottom-p-800.avif 800w, /cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed72_features-bottom.avif 2788w" alt="Black abstract shape with smooth curves and a pointed diagonal edge on the right side." className="features-bg bottom" />
            <img src="/cdn/69d660abd07691d10eb7ed1f/69d660acd07691d10eb7f29e_Mobile-bottom.png" loading="lazy" sizes="100vw" srcSet="/cdn/69d660abd07691d10eb7ed1f/69d660acd07691d10eb7f29e_Mobile-bottom-p-500.png 500w, /cdn/69d660abd07691d10eb7ed1f/69d660acd07691d10eb7f29e_Mobile-bottom.png 736w" alt="Black abstract shape with smooth curves and a pointed diagonal edge on the right side." className="features-bg-mob bottom" />
          </div>
        </div>
      </div>
    </div>

    <div id="section1" className="home-sticky-wrap">
      <div id="text-animation" className="home_text-animation">
        <div className="home_text-component">
          <div className="home_text-animation-component">
            <div className="home_text-animation-wrap">
              <h3 className="home_text-animate hide-mobile-landscape">
                {"Crystals in. SOL on the line. "}
              </h3>
            </div>
            <div className="home_absolute">
              <h2 data-reveal="text" className="home_explode-res_heading">
                {"Crystals in. SOL on the line. "}
              </h2>
              <div id="canvas-explode" className="home_explode-canvas">
                <div id="labels-container" className="home-labels-container" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid-container" />
        <div className="overlay-both" />
      </div>
    </div>
    </>
  );
}
