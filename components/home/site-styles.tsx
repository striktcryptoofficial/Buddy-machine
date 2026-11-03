export function SiteStyles() {
  return (
    <>
      <link
        rel="stylesheet"
        href="/cdn/69d660abd07691d10eb7ed1f/css/neoconda-site-latest-2.webflow.shared.18607252c.min.css"
      />
      <link rel="stylesheet" href="/vendor/fonts/mosaic.css" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@700&display=swap"
      />
      <style>{`html,body{margin:0;background:#0e0e0e;color:#fff}
html:has(#preloader),html:has(#preloader) body{overflow:hidden !important}
.hero-field{opacity:0}
html:not(:has(#preloader)) .hero-field{animation:hero-field-in .9s ease .2s forwards}
@keyframes hero-field-in{to{opacity:1}}
.logo_preloader img{width:100%;height:auto;display:block}
.nav_logo{width:3.15rem;height:auto;object-fit:contain}
.footer_logo{container-type:inline-size}
.footer_brand{display:flex;align-items:center;gap:1.2cqi;width:100%;color:#3e3e3e;text-decoration:none}
.footer_brand img{height:17.5cqi;width:auto;display:block;flex:none;filter:brightness(0.4588)}
.footer_brand span{font-size:17.5cqi;line-height:.78;color:#3e3e3e;white-space:nowrap}
.home_getupdate-content-image>.home_neoconda-skelton{width:100%;height:auto;aspect-ratio:313/523}
.card-number-wrap{flex:none;width:max-content}
.card-num-btn{width:4.15rem;height:4.15rem;flex:none}
.card-num-btn svg{width:62%;height:62%;display:block}
.home_fetures-image{width:4.15rem}
.home_model_label_number svg{width:1.15rem;height:1.15rem;display:block}
#hero,#section-hero{background:#0e0e0e}
#section-hero{isolation:isolate}
.hero-scene{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;background:#0e0e0e}
.solana-sticker{position:absolute;z-index:3;aspect-ratio:1;pointer-events:none}
.solana-sticker svg{width:100%;height:100%;display:block;animation:solana-spin 10s linear infinite}
@keyframes solana-spin{to{transform:rotate(1turn)}}
.section_middle-slider{width:min(34vh,24rem)}
.home_defence-content-wrap{bottom:1.5%}
#scroll-video{display:block;width:100%;height:auto;aspect-ratio:9/18}
#section-hero #app{z-index:2}
.nav_fixed .padding-global{padding-left:1.88rem;padding-right:1.88rem}
.nav_container{max-width:none;width:100%}
.nav_container>.nav_menu{flex:1;width:auto}
.nav-explore{flex:none;margin-left:1.25rem;margin-right:0}
#features :is(.features-bg,.features-bg-mobile,.features-bg-mob){filter:url(#features-plate)}
.home_image-wrapper>.video-code-embed{position:relative}
#lottiee-section .home_image-wrapper,#scope-2 .home_image-wrapper{position:relative;z-index:8}
.lottie-container{position:relative;z-index:8}
.lottie-container dotlottie-player{opacity:0 !important;visibility:hidden !important}
.feature-chevrons{position:absolute;left:0;right:0;top:calc(48.5svh - 5.75rem);height:11.5rem;display:grid;grid-template-columns:minmax(0,1fr) min(58vw,42rem) minmax(0,1fr);align-items:center;pointer-events:none;visibility:hidden;z-index:2}
.feature-chevrons__side{display:flex;align-items:center;gap:0.4vw;height:67%;min-width:0;min-height:0;overflow:hidden}
.feature-chevrons__side:first-child{justify-content:flex-end;padding-right:0.6vw}
.feature-chevrons__side:last-child{justify-content:flex-start;padding-left:0.6vw}
.feature-chevrons__side svg{height:100%;width:auto;max-width:18%;max-height:100%;display:block;flex:none;opacity:0;transform-origin:center center}
#features .stroke-wrap,#features .section-content-wrap{background-color:#7E7EFF}
#features :is(.card-text,.home_defence-description,.home_secure-text){color:rgba(255,255,255,.88)}
#section-hero .section_home-content-wrapper{bottom:12rem}
#section-hero .section_home-secondary-text{display:none}
.hero-cats{position:absolute;left:0;right:0;bottom:-0.25rem;z-index:-1;display:flex;justify-content:space-between;align-items:flex-end;padding:0 2vw;pointer-events:none}
.hero-cats img{width:min(11vw,130px);height:auto;display:block;opacity:0;filter:blur(18px);pointer-events:auto;transform-origin:center bottom;transition:transform .55s cubic-bezier(.34,1.56,.64,1)}
.hero-cats img:hover{transform:scale(1.1)}
.hero-cats.is-in img{animation:hero-cat-in .9s cubic-bezier(.22,1,.36,1) forwards}
.hero-cats.is-in img:nth-child(2){animation-delay:.08s}
.hero-cats.is-in img:nth-child(3){animation-delay:.16s}
.hero-cats.is-in img:nth-child(4){animation-delay:.24s}
.hero-cats.is-in img:nth-child(5){animation-delay:.32s}
.hero-cats.is-in img:nth-child(6){animation-delay:.4s}
.hero-cats.is-in img:nth-child(7){animation-delay:.48s}
@keyframes hero-cat-in{from{opacity:0;filter:blur(18px)}to{opacity:1;filter:blur(0)}}
@media (prefers-reduced-motion:reduce){.hero-cats img{opacity:1;filter:none;animation:none;transform:none;transition:none}}
.hero-cats{display:none}
body, body *{
  font-family:"Geist",ui-sans-serif,system-ui,sans-serif !important;
}
body :is(h1,h2,h3,h4,h5,h6),
body :is(h1,h2,h3,h4,h5,h6) *,
body :is([class*="eyebrow"],.nav_menu_link,.nav_timer,.nav_time-text,.card-num-btn,.footer_policy-text,.polygon-btn,button,.w-button,input[type="submit"]),
body :is([class*="eyebrow"],.nav_menu_link,.card-num-btn,.polygon-btn,button,.w-button) *{
  font-family:"PixelOperator",ui-monospace,monospace !important;
  font-weight:400 !important;
  letter-spacing:.04em !important;
}
.footer_brand span{
  font-family:"Silkscreen",monospace !important;
  font-weight:700 !important;
  letter-spacing:0 !important;
}
#nc-cc{
  --nc-display:"PixelOperator",ui-monospace,monospace !important;
  --nc-mono:"Geist",ui-sans-serif,system-ui,sans-serif !important;
}
@media screen and (min-width:992px){
  .nav_menu_link{font-size:1.5rem !important}
  .home_features-card-component{grid-template-columns:repeat(4,1fr)}
}
@media screen and (min-width:768px){
  .home-sticky-wrap{height:510svh}
  .home_absolute{top:7.5rem}
  .home_explode-canvas{width:100%;height:100%;min-height:0}
}
.page-wrapper{position:relative}
.section-pxt{position:absolute;left:0;right:0;bottom:0;z-index:0;display:grid;pointer-events:none}
.section-pxt__t{display:block;visibility:hidden;background:var(--pxt-color,#000);min-width:0;min-height:0;font-size:0;line-height:0}
.section-pxt__t.is-on{visibility:visible}
.cursor-trail{position:fixed;inset:0;z-index:1000;pointer-events:none;mix-blend-mode:difference}
.cursor-trail i{position:absolute;top:0;left:0;width:14px;height:14px;background:#fff;visibility:hidden}
.cursor-trail i.is-on{visibility:visible}`}</style>
    </>
  );
}
