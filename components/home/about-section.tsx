export function AboutSection() {
  return (
    <div id="about" className="section-relative-wrap">
      <div className="section_about-device">
        <div className="padding-global">
          <div className="container-large">
            <div className="section_about-component">
              <div className="section_about-left">
                <div id="target" className="canvas-target-block" />
              </div>
              <div className="section_about-right">
                <div className="section_about-content">
                  <div data-reveal="scramble" className="section_about-eyebrow">
                    {"ABOUT THE MACHINE"}
                  </div>
                  <h2 data-reveal="text" className="section_about-heading">
                    {"One Solana wallet. One cat. Procedural coat, fixed rarity, crystals and SOL."}
                  </h2>
                  <div data-reveal="text" className="section_about-description">
                    {"The seed writes the coat, the mutations, and the rank: Common, Uncommon, Rare, Legendary. The coat never re-rolls, and breeding is closed. Traits drift with treatment. Asleep, hungry, or tired, she can refuse a fight. Scraps pay in crystals. Challenges can settle in SOL. With enough of a life, the form evolves. The rank does not."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="spacer" />
      <div className="grid-container hide" />
      <div className="overlay-left" />
    </div>
  );
}
