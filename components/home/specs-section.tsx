import { FeatureIcon } from "@/components/home/features-section";

export function SpecsSection() {
  return (
    <div id="specs" className="home_device-specification-cards">
      <div className="padding-global">
        <div className="container-large">
          <div className="home_model_label_container hide-above-lanscape">
            <div data-reveal="block" className="home_model_label_wrap">
              <div className="home_model_label_number">
                <FeatureIcon name="Single Mint" />
              </div>
              <div className="home_model_label_text">
                {"One Wallet"}
              </div>
            </div>
            <div data-reveal="block" className="home_model_label_wrap">
              <div className="home_model_label_number">
                <FeatureIcon name="Rarity" />
              </div>
              <div className="home_model_label_text">
                {"Fixed Rank"}
              </div>
            </div>
            <div data-reveal="block" className="home_model_label_wrap">
              <div className="home_model_label_number">
                <FeatureIcon name="Procedural" />
              </div>
              <div className="home_model_label_text">
                {"The Seed"}
              </div>
            </div>
            <div data-reveal="block" className="home_model_label_wrap">
              <div className="home_model_label_number">
                <FeatureIcon name="Verify" />
              </div>
              <div className="home_model_label_text">
                {"Open Verify"}
              </div>
            </div>
          </div>
          <div className="home_specification-component">
            <div className="section_features-header-component">
              <div data-reveal="scramble" className="section_features-eyebrow">
                {"THE MINT"}
              </div>
              <h2 data-reveal="text" className="home_specification-heading">
                {"One wallet. Rank fixed. Seed written once."}
              </h2>
            </div>
            <div className="home_features-card-component">
              <div data-reveal="block" className="home_features-card">
                <div className="home_icon-text-wrapper">
                  <div className="card-num-btn">
                    <FeatureIcon name="Single Mint" />
                  </div>
                  <h3 className="card_specification-heading hide-above-lanscape">
                    {"One Wallet"}
                  </h3>
                </div>
                <div className="card_specification-content">
                  <h3 className="card_specification-heading hide-mobile-landscape">
                    {"One Wallet"}
                  </h3>
                  <div className="card_specification-description">
                    {"One Solana wallet hatches one cat. That address is the record."}
                  </div>
                </div>
                <img src="/cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed53_card.avif" loading="lazy" alt="" className="card-svg" />
              </div>
              <div data-reveal="block" className="home_features-card">
                <div className="home_icon-text-wrapper">
                  <div className="card-num-btn">
                    <FeatureIcon name="Rarity" />
                  </div>
                  <h3 className="card_specification-heading hide-above-lanscape">
                    {"Fixed Rank"}
                  </h3>
                </div>
                <div className="card_specification-content">
                  <h3 className="card_specification-heading hide-mobile-landscape">
                    {"Fixed Rank"}
                  </h3>
                  <div className="card_specification-description">
                    {"Common through Legendary. The rank is written at hatch and does not move."}
                  </div>
                </div>
                <img src="/cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed53_card.avif" loading="lazy" alt="" className="card-svg" />
              </div>
              <div data-reveal="block" className="home_features-card">
                <div className="home_icon-text-wrapper">
                  <div className="card-num-btn">
                    <FeatureIcon name="Procedural" />
                  </div>
                  <h3 className="card_specification-heading hide-above-lanscape">
                    {"The Seed"}
                  </h3>
                </div>
                <div className="card_specification-content">
                  <h3 className="card_specification-heading hide-mobile-landscape">
                    {"The Seed"}
                  </h3>
                  <div className="card_specification-description">
                    {"Coat, mutations, and rank are written once. The coat never re-rolls."}
                  </div>
                </div>
                <img src="/cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed53_card.avif" loading="lazy" alt="" className="card-svg" />
              </div>
              <div data-reveal="block" className="home_features-card">
                <div className="home_icon-text-wrapper">
                  <div className="card-num-btn">
                    <FeatureIcon name="Verify" />
                  </div>
                  <h3 className="card_specification-heading hide-above-lanscape">
                    {"Open Verify"}
                  </h3>
                </div>
                <div className="card_specification-content">
                  <h3 className="card_specification-heading hide-mobile-landscape">
                    {"Open Verify"}
                  </h3>
                  <div className="card_specification-description">
                    {"Any wallet recomputes the DNA. It is not stored."}
                  </div>
                </div>
                <img src="/cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed53_card.avif" loading="lazy" alt="" className="card-svg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
