export function PrivacyView() {
  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: "\n/* ---- your existing styles ---- */\n.no-scroll { overflow: hidden !important; }\n@media screen and (max-width: 991px) {\n  .nav_menu_link { opacity: 0; transform: translateY(30px); }\n}\n\n/* ---- cookie consent ---- */\n#nc-cc, #nc-cc *, #nc-cc *::before, #nc-cc *::after { box-sizing: border-box; }\n\n#nc-cc {\n  --nc-accent:   #1FE477;\n  --nc-accent-2: #56FF8E;\n  --nc-glass:    rgba(13, 13, 13, .90);\n  --nc-raise:    #262626;\n  --nc-raise-hi: #333333;\n  --nc-ink:      #FFFFFF;\n  --nc-body:     #ADADAD;\n  --nc-dim:      #737373;\n  --nc-line:     rgba(255, 255, 255, .11);\n  --nc-notch:    18px;\n  --nc-display: \"Space Grotesk\", \"Neuehaasunicaw 1 G\", \"Helvetica Neue\", system-ui, -apple-system, sans-serif;\n  --nc-mono:    \"Jetbrainsmono Variable\", \"JetBrains Mono\", ui-monospace, SFMono-Regular, Menlo, monospace;\n\n  position: fixed;\n  left: 1.75rem;\n  bottom: 1.75rem;\n  width: min(25rem, calc(100vw - 3.5rem));\n  z-index: 2147483000;\n  font-family: var(--nc-display);\n  color: var(--nc-ink);\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n#nc-cc[hidden] { display: none !important; }\n\n.nc-drop {\n  filter: drop-shadow(0 20px 48px rgba(0, 0, 0, .7)) drop-shadow(0 0 36px rgba(31, 228, 119, .07));\n  transition: transform .4s cubic-bezier(.16, .84, .32, 1), opacity .3s ease;\n}\n#nc-cc.nc-enter .nc-drop { transform: translateY(18px); opacity: 0; }\n\n.nc-chassis {\n  padding: 1px;\n  background: linear-gradient(140deg, var(--nc-accent) 0%, rgba(31,228,119,.5) 8%, var(--nc-line) 28%, var(--nc-line) 100%);\n  clip-path: polygon(var(--nc-notch) 0, 100% 0, 100% calc(100% - var(--nc-notch)), calc(100% - var(--nc-notch)) 100%, 0 100%, 0 var(--nc-notch));\n}\n.nc-panel {\n  background: var(--nc-glass);\n  -webkit-backdrop-filter: blur(28px) saturate(125%);\n  backdrop-filter: blur(28px) saturate(125%);\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .05);\n  clip-path: polygon(calc(var(--nc-notch) - 1px) 0, 100% 0, 100% calc(100% - var(--nc-notch) + 1px), calc(100% - var(--nc-notch) + 1px) 100%, 0 100%, 0 calc(var(--nc-notch) - 1px));\n}\n\n.nc-rail {\n  display: flex; align-items: center; gap: .5625rem;\n  padding: .75rem 1.125rem .6875rem calc(var(--nc-notch) + .5rem);\n  border-bottom: 1px solid var(--nc-line);\n  background: rgba(255, 255, 255, .028);\n}\n.nc-tick {\n  width: 4px; height: .6875rem; background: var(--nc-accent); flex: 0 0 auto;\n  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 2px) 100%, 0 100%);\n  box-shadow: 0 0 8px rgba(31, 228, 119, .55);\n}\n.nc-rail-label { font-size: .65rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--nc-ink); }\n.nc-rail-spacer { flex: 1 1 auto; }\n.nc-back {\n  appearance: none; background: none; border: 0; padding: 0; cursor: pointer; font: inherit;\n  font-size: .625rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--nc-dim);\n  transition: color .18s ease;\n}\n.nc-back:hover { color: var(--nc-accent); }\n\n.nc-body { padding: 1.1875rem; }\n.nc-title {\n  font-size: 1.25rem; font-weight: 700; letter-spacing: -.03em; line-height: 1.15;\n  color: var(--nc-ink); margin: 0 0 .5625rem;\n}\n.nc-copy {\n  font-size: .8125rem; font-weight: 400; line-height: 1.55; color: var(--nc-body);\n  margin: 0 0 1.1875rem; text-wrap: pretty;\n}\n.nc-copy a { color: var(--nc-body); font-weight: 500; text-decoration: underline; text-decoration-color: rgba(255,255,255,.3); text-underline-offset: 2px; }\n.nc-copy a:hover { color: var(--nc-accent); text-decoration-color: var(--nc-accent); }\n\n.nc-actions { display: flex; gap: .5rem; }\n.nc-btn {\n  --b: var(--nc-raise);\n  flex: 1 1 0; min-width: 0;\n  appearance: none; border: 0; padding: 1px; cursor: pointer; font: inherit;\n  background: var(--nc-line);\n  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);\n  transition: background .18s ease;\n}\n.nc-btn > span {\n  display: flex; align-items: center; justify-content: center;\n  min-height: 2.75rem; padding: 0 .75rem;\n  background: var(--b);\n  clip-path: polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px);\n  font-size: .6875rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap;\n  color: var(--nc-ink);\n  transition: background .18s ease, color .18s ease;\n}\n.nc-btn:hover { background: rgba(255,255,255,.22); }\n.nc-btn:hover > span { background: var(--nc-raise-hi); }\n.nc-btn--primary { --b: var(--nc-accent); background: var(--nc-accent); }\n.nc-btn--primary > span { color: #060606; }\n.nc-btn--primary:hover, .nc-btn--primary:hover > span { background: var(--nc-accent-2); }\n\n.nc-link {\n  appearance: none; background: none; border: 0; padding: .875rem 0 0; margin: 0; cursor: pointer; font: inherit;\n  font-size: .625rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--nc-dim);\n  display: inline-flex; align-items: center; gap: .4375rem;\n  transition: color .18s ease;\n}\n.nc-link:hover { color: var(--nc-accent); }\n.nc-link i { font-style: normal; transition: transform .18s ease; }\n.nc-link:hover i { transform: translateX(3px); }\n\n#nc-cc :focus-visible { outline: 2px solid var(--nc-accent); outline-offset: 2px; }\n\n.nc-view[hidden] { display: none; }\n.nc-list { margin: 0 0 1.1875rem; max-height: 44vh; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.16) transparent; }\n.nc-row {\n  display: grid; grid-template-columns: 1.625rem 1fr auto; column-gap: .625rem; align-items: start;\n  padding: .9375rem .5rem .9375rem .375rem; margin: 0 -.5rem 0 -.375rem;\n  border-bottom: 1px solid var(--nc-line);\n  transition: background .18s ease;\n}\n.nc-row:hover { background: rgba(255,255,255,.022); }\n.nc-row:first-child { padding-top: 0; }\n.nc-row:last-child { border-bottom: 0; padding-bottom: 0; }\n.nc-idx { font-family: var(--nc-mono); font-size: .6875rem; font-weight: 500; color: var(--nc-dim); padding-top: .0625rem; }\n.nc-name { font-size: .6875rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--nc-ink); }\n.nc-desc { font-size: .75rem; font-weight: 400; line-height: 1.5; color: var(--nc-body); margin: .4375rem 0 0; }\n.nc-vendors { font-family: var(--nc-mono); font-size: .5625rem; letter-spacing: .1em; text-transform: uppercase; color: var(--nc-dim); margin: .5rem 0 0; }\n.nc-always { font-family: var(--nc-mono); font-size: .5625rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--nc-accent); padding-top: .125rem; white-space: nowrap; }\n\n.nc-switch {\n  appearance: none; border: 1px solid var(--nc-line); background: var(--nc-raise);\n  width: 2.625rem; height: 1.4375rem; flex: 0 0 auto; padding: 0; cursor: pointer; position: relative;\n  transition: background .18s ease, border-color .18s ease;\n}\n.nc-switch::after {\n  content: \"\"; position: absolute; top: 2px; left: 2px;\n  width: 1.0625rem; height: calc(1.4375rem - 6px); background: #6E6E6E;\n  transition: transform .22s cubic-bezier(.16, .84, .32, 1), background .18s ease, box-shadow .18s ease;\n}\n.nc-switch:hover { border-color: rgba(255,255,255,.26); }\n.nc-switch[aria-checked=\"true\"] { background: rgba(31, 228, 119, .13); border-color: var(--nc-accent); }\n.nc-switch[aria-checked=\"true\"]::after { background: var(--nc-accent); transform: translateX(1.1875rem); box-shadow: 0 0 10px rgba(31, 228, 119, .5); }\n\n@media (max-width: 640px) {\n  #nc-cc { left: .75rem; right: .75rem; bottom: calc(.75rem + env(safe-area-inset-bottom, 0px)); width: auto; }\n  .nc-body { padding: 1.0625rem 1rem 1rem; }\n  .nc-title { font-size: 1.1875rem; }\n  .nc-actions { flex-direction: column; }\n  .nc-btn { width: 100%; }\n  .nc-btn > span { min-height: 2.9375rem; }\n  .nc-list { max-height: 38vh; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  #nc-cc .nc-drop, #nc-cc .nc-switch::after, #nc-cc .nc-btn, #nc-cc .nc-btn > span, #nc-cc .nc-link i, #nc-cc .nc-row { transition: none !important; }\n  #nc-cc.nc-enter .nc-drop { transform: none; opacity: 1; }\n}\n" }} />

    <div id="preloader" className="preloader-wrapper is-two" />

    <div id="page" className="page-wrapper">
      <div className="global-styles w-embed">
        <style dangerouslySetInnerHTML={{ __html: "\n  /* Make text look crisper and more legible in all browsers */\n  body {\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n    font-smoothing: antialiased;\n    text-rendering: optimizeLegibility;\n  }\n\n  /* Focus state style for keyboard navigation for the focusable elements */\n  *[tabindex]:focus-visible,\n  input[type='file']:focus-visible {\n    outline: 0.125rem solid #4d65ff;\n    outline-offset: 0.125rem;\n  }\n\n  /* Set color style to inherit */\n  .inherit-color * {\n    color: inherit;\n  }\n\n  /* Get rid of top margin on first element in any rich text element */\n  .w-richtext > :not(div):first-child,\n  .w-richtext > div:first-child > :first-child {\n    margin-top: 0 !important;\n  }\n\n  /* Get rid of bottom margin on last element in any rich text element */\n  .w-richtext > :last-child,\n  .w-richtext ol li:last-child,\n  .w-richtext ul li:last-child {\n    margin-bottom: 0 !important;\n  }\n\n  /* Make sure containers never lose their center alignment */\n  .container-medium,\n  .container-small,\n  .container-large {\n    margin-right: auto !important;\n    margin-left: auto !important;\n  }\n\n  /* \nMake the following elements inherit typography styles from the parent and not have hardcoded values. \nImportant: You will not be able to style for example \"All Links\" in Designer with this CSS applied.\nUncomment this CSS to use it in the project. Leave this message for future hand-off.\n*/\n  /*\na,\n.w-input,\n.w-select,\n.w-tab-link,\n.w-nav-link,\n.w-dropdown-btn,\n.w-dropdown-toggle,\n.w-dropdown-link {\n  color: inherit;\n  text-decoration: inherit;\n  font-size: inherit;\n}\n*/\n\n  /* Apply \"...\" after 3 lines of text */\n  .text-style-3lines {\n    display: -webkit-box;\n    overflow: hidden;\n    -webkit-line-clamp: 3;\n    -webkit-box-orient: vertical;\n  }\n\n  /* Apply \"...\" after 2 lines of text */\n  .text-style-2lines {\n    display: -webkit-box;\n    overflow: hidden;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n  }\n\n  /* These classes are never overwritten */\n  .hide {\n    display: none !important;\n  }\n\n  @media screen and (max-width: 991px) {\n    .hide,\n    .hide-tablet {\n      display: none !important;\n    }\n  }\n\n  @media screen and (max-width: 767px) {\n    .hide-mobile-landscape {\n      display: none !important;\n    }\n  }\n\n  @media screen and (max-width: 479px) {\n    .hide-mobile {\n      display: none !important;\n    }\n  }\n\n  .margin-0 {\n    margin: 0rem !important;\n  }\n\n  .padding-0 {\n    padding: 0rem !important;\n  }\n\n  .spacing-clean {\n    padding: 0rem !important;\n    margin: 0rem !important;\n  }\n\n  .margin-top {\n    margin-right: 0rem !important;\n    margin-bottom: 0rem !important;\n    margin-left: 0rem !important;\n  }\n\n  .padding-top {\n    padding-right: 0rem !important;\n    padding-bottom: 0rem !important;\n    padding-left: 0rem !important;\n  }\n\n  .margin-right {\n    margin-top: 0rem !important;\n    margin-bottom: 0rem !important;\n    margin-left: 0rem !important;\n  }\n\n  .padding-right {\n    padding-top: 0rem !important;\n    padding-bottom: 0rem !important;\n    padding-left: 0rem !important;\n  }\n\n  .margin-bottom {\n    margin-top: 0rem !important;\n    margin-right: 0rem !important;\n    margin-left: 0rem !important;\n  }\n\n  .padding-bottom {\n    padding-top: 0rem !important;\n    padding-right: 0rem !important;\n    padding-left: 0rem !important;\n  }\n\n  .margin-left {\n    margin-top: 0rem !important;\n    margin-right: 0rem !important;\n    margin-bottom: 0rem !important;\n  }\n\n  .padding-left {\n    padding-top: 0rem !important;\n    padding-right: 0rem !important;\n    padding-bottom: 0rem !important;\n  }\n\n  .margin-horizontal {\n    margin-top: 0rem !important;\n    margin-bottom: 0rem !important;\n  }\n\n  .padding-horizontal {\n    padding-top: 0rem !important;\n    padding-bottom: 0rem !important;\n  }\n\n  .margin-vertical {\n    margin-right: 0rem !important;\n    margin-left: 0rem !important;\n  }\n\n  .padding-vertical {\n    padding-right: 0rem !important;\n    padding-left: 0rem !important;\n  }\n" }} />
        <style dangerouslySetInnerHTML={{ __html: "\n  .grid-container {\n    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px);\n    background-size: 30px 30px;\n    background-color: #0e0e0e;\n  }\n\n  .overlay-left {\n    background: radial-gradient(circle at 10% 45%, transparent 10%, #0e0e0e 40%);\n  }\n\n  .overlay-both {\n    background-image: radial-gradient(circle at 10% 50%, transparent 10%, #0e0e0e 40%), radial-gradient(circle at 90% 50%, transparent 10%, #0e0e0e 40%);\n    background-position:\n      left top,\n      right top;\n    background-size: 51% 100%;\n    background-repeat: no-repeat;\n  }\n" }} />
        <style dangerouslySetInnerHTML={{ __html: "\n  .polygon-border-wrapper {\n    clip-path: polygon(10% 0, 100% 0, 100% 71%, 90% 100%, 0 100%, 0 30%);\n\n    cursor: pointer;\n    display: inline-block;\n    transition:\n      transform 0.2s ease,\n      clip-path 0.4s cubic-bezier(0.19, 1, 0.22, 1);\n  }\n\n  .polygon-btn {\n    clip-path: polygon(10% 0, 100% 0, 100% 71%, 90% 100%, 0 100%, 0 30%);\n\n    background-position: 0% 0%;\n\n    /* Add clip-path to the transition list */\n    transition:\n      background-position 0.5s cubic-bezier(0.19, 1, 0.22, 1),\n      color 0.3s ease,\n      clip-path 0.4s cubic-bezier(0.19, 1, 0.22, 1);\n  }\n\n  .card-number-wrap {\n    clip-path: polygon(21.6% 0, 100% 0, 100% 70.4%, 77.8% 100%, 0 100%, 0 29.4%);\n\n    cursor: pointer;\n    display: inline-block;\n    transition:\n      transform 0.2s ease,\n      clip-path 0.4s cubic-bezier(0.19, 1, 0.22, 1);\n  }\n\n  .card-num-btn {\n    clip-path: polygon(21.6% 0, 100% 0, 100% 70.4%, 77.8% 100%, 0 100%, 0 29.4%);\n\n    background-position: 0% 0%;\n\n    transition:\n      background-position 0.5s cubic-bezier(0.19, 1, 0.22, 1),\n      color 0.3s ease,\n      clip-path 0.4s cubic-bezier(0.19, 1, 0.22, 1);\n  }\n  #gridCanvas {\n    position: absolute; /* Or absolute depending on your layout */\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    z-index: -1; /* Keep it behind content */\n    display: block;\n  }\n  .polygon-border-wrapper:hover .polygon-btn {\n    background-color: white;\n  }\n" }} />
        <svg width="0" height="0" style={{"position":"absolute","pointerEvents":"none"}}>
          <defs>
            <clipPath id="responsive-card-clip" clipPathUnits="objectBoundingBox">
              <path stroke="#FFEBEB" strokeOpacity="0.28" transform="scale(0.0007168, 0.0002912)" d="M194.221 119.779C217.539 134.16 247.593 117.385 247.593 89.9884V35C247.593 15.6701 263.263 0 282.593 0H1359.68C1379.01 0 1394.68 15.67 1394.68 35V3372.43C1394.68 3399.37 1365.51 3416.21 1342.18 3402.74L1188.52 3314.03C1165.18 3300.56 1136.02 3317.4 1136.02 3344.35V3398.05C1136.02 3417.38 1120.35 3433.05 1101.02 3433.05H35C15.67 3433.05 0 3417.38 0 3398.05V62.7057C0 35.3093 30.0536 18.5345 53.3721 32.9153L194.221 119.779Z" />
            </clipPath>
          </defs>
        </svg>
        <svg width="0" height="0" style={{"position":"absolute"}}>
          <defs>
            <clipPath id="responsive-card-clip" clipPathUnits="objectBoundingBox">
              <path transform="scale(0.003861, 0.003378)" d="M198.692 44.3338C196.11 46.2325 192.465 44.3882 192.465 41.1826V12.7108C192.465 5.69084 186.774 0 179.754 0L19.5551 0C8.7551 0 -5.81386e-06 8.75511 -5.81386e-06 19.5551L-5.81386e-06 275.901C-5.81386e-06 286.701 8.7551 295.456 19.5551 295.456L239.445 295.456C250.245 295.456 259 286.701 259 275.901L259 19.323C259 11.3089 249.888 6.69833 243.431 11.4451L198.692 44.3338Z" />
            </clipPath>
          </defs>
        </svg>
        <svg aria-hidden="true" style={{"position":"absolute"}}>
          <symbol id="card-bg-shape" viewBox="0 0 259 296" preserveAspectRatio="none">
            <path d="M198.692 44.3338C196.11 46.2325 192.465 44.3882 192.465 41.1826V12.7108C192.465 5.69084 186.774 0 179.754 0L19.5551 0C8.75513 0 3.05176e-05 8.75511 3.05176e-05 19.5551L3.05176e-05 275.901C3.05176e-05 286.701 8.75513 295.456 19.5551 295.456L239.445 295.456C250.245 295.456 259 286.701 259 275.901L259 19.323C259 11.3089 249.888 6.69833 243.431 11.4451L198.692 44.3338Z" fill="url(#paint0_linear_7_992)" />
            <path d="M179.754 0.489258L19.5547 0.489258C9.02504 0.48948 0.489472 9.02503 0.489258 19.5547L0.489258 275.901C0.489489 286.431 9.02504 294.967 19.5547 294.967L239.445 294.967C249.975 294.967 258.511 286.431 258.511 275.901L258.511 19.3232C258.511 11.7099 249.855 7.32948 243.721 11.8389L198.982 44.7275C196.077 46.8636 191.976 44.7889 191.976 41.1826V12.7109C191.976 5.96095 186.504 0.489258 179.754 0.489258Z" stroke="url(#paint1_linear_7_992)" strokeOpacity="0.28" strokeWidth="0.977754" />
            <defs>
              <linearGradient id="paint0_linear_7_992" x1="129.5" y1="0" x2="235.763" y2="198.068" gradientUnits="userSpaceOnUse">
                <stop stopColor="#060606" />
                <stop offset="1" stopColor="#141414" />
              </linearGradient>
              <linearGradient id="paint1_linear_7_992" x1="129.5" y1="0" x2="129.5" y2="295.456" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFEBEB" stopOpacity="0.45" />
                <stop offset="1" stopColor="#8D9992" stopOpacity="0.54" />
              </linearGradient>
            </defs>
          </symbol>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" style={{"display":"none"}}>
          <symbol id="icon-circle" viewBox="0 0 60 60" fill="none">
            <circle cx="29.7574" cy="29.7574" r="29.2574" stroke="#D9D9D9" />
          </symbol>
        </svg>
        <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <symbol id="card-graphic">
            <path d="M198.692 44.3338C196.11 46.2325 192.465 44.3882 192.465 41.1826V12.7108C192.465 5.69084 186.774 0 179.754 0L19.5551 0C8.7551 0 0 8.75511 0 19.5551L0 275.901C0 286.701 8.7551 295.456 19.5551 295.456L239.445 295.456C250.245 295.456 259 286.701 259 275.901L259 19.323C259 11.3089 249.888 6.69833 243.431 11.4451L198.692 44.3338Z" fill="url(#paint0_linear_63_405)" />
            <path d="M179.754 0.489258L19.5547 0.489258C9.02501 0.48948 0.489442 9.02503 0.489227 19.5547L0.489227 275.901C0.489458 286.431 9.02501 294.967 19.5547 294.967L239.445 294.967C249.975 294.967 258.51 286.431 258.511 275.901L258.511 19.3232C258.511 11.7099 249.855 7.32948 243.721 11.8389L198.982 44.7275C196.077 46.8636 191.976 44.7889 191.976 41.1826V12.7109C191.976 5.96095 186.504 0.489258 179.754 0.489258Z" stroke="url(#paint1_linear_63_405)" strokeOpacity="0.28" strokeWidth="0.977754" />
            <defs>
              <linearGradient id="paint0_linear_63_405" x1="129.5" y1="0" x2="235.763" y2="198.068" gradientUnits="userSpaceOnUse">
                <stop stopColor="#060606" />
                <stop offset="1" stopColor="#141414" />
              </linearGradient>
              <linearGradient id="paint1_linear_63_405" x1="129.5" y1="0" x2="129.5" y2="295.456" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFEBEB" stopOpacity="0.45" />
                <stop offset="1" stopColor="#8D9992" stopOpacity="0.54" />
              </linearGradient>
            </defs>
          </symbol>
        </svg>
      </div>
      <main className="main-wrapper">
        <div className="nav_fixed no-fixed">
          <div data-wf--navbar--variant="secondary" data-animation="over-right" data-collapse="medium" data-duration="600" data-easing="ease" data-easing2="ease" role="banner" className="nav_component w-nav">
            <div className="padding-global">
              <div className="nav_container">
                <a href="/" data-wf-native-id-path="ad43a7dc-e35f-2320-39af-52425e607e28:396176c6-906a-9f74-c6d0-8a4663dfdeac" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="396176c6-906a-9f74-c6d0-8a4663dfdeac" data-wf-component-context="%5B%7B%22componentId%22%3A%22396176c6-906a-9f74-c6d0-8a4663dfdea9%22%2C%22instanceId%22%3A%22ad43a7dc-e35f-2320-39af-52425e607e28%22%7D%5D" className="nav_brand w-nav-brand">
                  <img src="/b-logo%20white.svg" alt="Buddy" className="nav_logo" />
                </a>
                <nav role="navigation" className="nav_menu w-nav-menu">
                  <a href="#" data-wf-native-id-path="ad43a7dc-e35f-2320-39af-52425e607e28:396176c6-906a-9f74-c6d0-8a4663dfdeaf" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="396176c6-906a-9f74-c6d0-8a4663dfdeaf" data-wf-component-context="%5B%7B%22componentId%22%3A%22396176c6-906a-9f74-c6d0-8a4663dfdea9%22%2C%22instanceId%22%3A%22ad43a7dc-e35f-2320-39af-52425e607e28%22%7D%5D" className="nav_menu_link w-variant-1b82d794-7efe-e146-dac0-a98de834b770 w-nav-link">
                    {"HOME"}
                  </a>
                  <a href="#" data-wf-native-id-path="ad43a7dc-e35f-2320-39af-52425e607e28:396176c6-906a-9f74-c6d0-8a4663dfdeb1" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="396176c6-906a-9f74-c6d0-8a4663dfdeb1" data-wf-component-context="%5B%7B%22componentId%22%3A%22396176c6-906a-9f74-c6d0-8a4663dfdea9%22%2C%22instanceId%22%3A%22ad43a7dc-e35f-2320-39af-52425e607e28%22%7D%5D" className="nav_menu_link w-variant-1b82d794-7efe-e146-dac0-a98de834b770 w-nav-link">
                    {"ABOUT"}
                  </a>
                  <a href="#" id="nav-logo" data-wf-native-id-path="ad43a7dc-e35f-2320-39af-52425e607e28:f02cc71b-e7d3-6fc2-0549-0a0207eeb824" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="f02cc71b-e7d3-6fc2-0549-0a0207eeb824" data-wf-component-context="%5B%7B%22componentId%22%3A%22396176c6-906a-9f74-c6d0-8a4663dfdea9%22%2C%22instanceId%22%3A%22ad43a7dc-e35f-2320-39af-52425e607e28%22%7D%5D" className="nav_menu_link w-variant-1b82d794-7efe-e146-dac0-a98de834b770 w-nav-link">
                    {"FEATURES"}
                  </a>
                  <a id="nav-logo-destination" data-nav-logo="" data-wf-native-id-path="ad43a7dc-e35f-2320-39af-52425e607e28:7d371829-7698-fcd2-bd56-8ab0ec053633" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="7d371829-7698-fcd2-bd56-8ab0ec053633" data-wf-component-context="%5B%7B%22componentId%22%3A%22396176c6-906a-9f74-c6d0-8a4663dfdea9%22%2C%22instanceId%22%3A%22ad43a7dc-e35f-2320-39af-52425e607e28%22%7D%5D" href="/" className="neoconda-logo w-inline-block">
                    <img src="/cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed31_Neoconda.svg" loading="lazy" id="dummy" alt="Neoconda" />
                  </a>
                  <a href="#" id="spec" data-wf-native-id-path="ad43a7dc-e35f-2320-39af-52425e607e28:721c6865-4a60-c388-bc34-745ab2100ecc" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="721c6865-4a60-c388-bc34-745ab2100ecc" data-wf-component-context="%5B%7B%22componentId%22%3A%22396176c6-906a-9f74-c6d0-8a4663dfdea9%22%2C%22instanceId%22%3A%22ad43a7dc-e35f-2320-39af-52425e607e28%22%7D%5D" className="nav_menu_link w-variant-1b82d794-7efe-e146-dac0-a98de834b770 w-nav-link">
                    {"SPECS"}
                  </a>
                  <a href="#" id="mailing-list" data-wf-native-id-path="ad43a7dc-e35f-2320-39af-52425e607e28:1d3025f9-7657-c39e-286f-f2e287a96e11" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="1d3025f9-7657-c39e-286f-f2e287a96e11" data-wf-component-context="%5B%7B%22componentId%22%3A%22396176c6-906a-9f74-c6d0-8a4663dfdea9%22%2C%22instanceId%22%3A%22ad43a7dc-e35f-2320-39af-52425e607e28%22%7D%5D" className="nav_menu_link w-variant-1b82d794-7efe-e146-dac0-a98de834b770 mailing-list w-nav-link">
                    {"ORDER"}
                  </a>
                  <div className="nav_clip-path hide-above-lanscape">
                    <div className="nav_timer-wrapper">
                      <div className="nav_timer-text">
                        <div className="nav_months-wrapper">
                          <div id="timer-month" className="nav_timer timer-month">
                            {"00"}
                          </div>
                          <div className="nav_time-text">
                            {"Months"}
                          </div>
                        </div>
                        <div className="colon-text">
                          {":"}
                        </div>
                        <div className="home_days-wrapper">
                          <div id="timer-days" className="nav_timer timer-days">
                            {"00"}
                          </div>
                          <div className="nav_time-text">
                            {"Days"}
                          </div>
                        </div>
                        <div className="colon-text">
                          {":"}
                        </div>
                        <div className="home_days-wrapper">
                          <div id="timer-hours" className="nav_timer timer-hours">
                            {"00"}
                          </div>
                          <div className="nav_time-text">
                            {"Hours"}
                          </div>
                        </div>
                      </div>
                      <div className="nav_timer-text svg-absolute">
                        <div className="nav_months-wrapper">
                          <div className="nav_timer abs">
                            {"00"}
                          </div>
                          <div className="nav_time-text abs">
                            {"Months"}
                          </div>
                        </div>
                        <div className="colon-text">
                          {":"}
                        </div>
                        <div className="home_days-wrapper">
                          <div className="nav_timer abs">
                            {"00"}
                          </div>
                          <div className="nav_time-text abs">
                            {"Days"}
                          </div>
                        </div>
                        <div className="colon-text">
                          {":"}
                        </div>
                        <div className="home_days-wrapper">
                          <div className="nav_timer abs">
                            {"00"}
                          </div>
                          <div className="nav_time-text abs">
                            {"Hours"}
                          </div>
                        </div>
                      </div>
                      <img src="/cdn/69d660abd07691d10eb7ed1f/69d660abd07691d10eb7ed2f_timer.svg" loading="lazy" alt="" className="timer-bg" />
                    </div>
                  </div>
                </nav>
                <div className="nav_clip-path hide-mobile-landscape" />
              </div>
            </div>
          </div>
        </div>
        <div className="pp_section-wrapper">
          <div className="padding-global">
            <div className="legal_container">
              <div className="pp_section-content-wrapper">
                <div className="pp_section-content">
                  <div className="pp_section-content-left">
                    <h1 className="pp_section-heading">
                      {"Privacy Policy"}
                    </h1>
                  </div>
                  <div className="pp_section-content-right">
                    <p className="pp_richtext-text">
                      <span className="pp_para-highlight">
                        {"Effective Date:"}
                      </span>
                      {" March 31, 2026 "}
                      <span className="pp_para-highlight">
                        {"Last Updated"}
                      </span>
                      {": March 31, 2026"}
                    </p>
                    <div className="pp_richtext w-richtext">
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"This Privacy Policy is provided by "}
                        <strong>
                          {"NEOCONDA LLC"}
                        </strong>
                        {", a limited liability company (\"we,\" \"us,\" \"our,\" or \"the Company\"), and applies to all visitors and users of the website located at neoconda.com and any associated subdomains (collectively, the \"Site\"). This Privacy Policy describes in detail how we collect, receive, use, store, share, transfer, and process your personal information when you visit or interact with our Site, and explains the rights and choices available to you with respect to your information."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Please read this Privacy Policy carefully before using the Site. By accessing or using the Site, you acknowledge that you have read, understood, and agree to the practices described in this Privacy Policy. If you do not agree with any part of this Privacy Policy, please discontinue your use of the Site immediately."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"This Privacy Policy should be read alongside our Terms of Service, which is also available on our Site."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        {"1. Who We Are"}
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"NEOCONDA LLC is the operator of neoconda.com, a marketing and informational website for the Neoconda cybersecurity device. We are headquartered in the State of California, United States. For the purposes of applicable data protection laws, NEOCONDA LLC is the data controller responsible for your personal information collected through this Site."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"2. Scope of This Privacy Policy"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"This Privacy Policy applies to:"}
                      </p>
                      <ul role="list">
                        <li>
                          {"All pages and subdomains of neoconda.com"}
                        </li>
                        <li>
                          {"Any contact forms or email submission forms hosted on the Site"}
                        </li>
                        <li>
                          {"Analytics and tracking data collected when you browse the Site"}
                        </li>
                        <li>
                          {"Any communications you initiate with us through the Site"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"This Privacy Policy does not apply to:"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Third-party websites, platforms, or services that may be linked to from the Site, including our social media profiles"}
                        </li>
                        <li>
                          {"Any information you independently provide to third parties, such as Google or Microsoft, through your use of their services"}
                        </li>
                        <li>
                          {"Future products, platforms, accounts, or services that NEOCONDA LLC may launch, which will be covered by separate or updated policies at that time"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"3. Information We Collect"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"We collect information in two primary ways: information you voluntarily provide to us, and information that is collected automatically when you visit or interact with the Site."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        {"3.1 Information You Voluntarily Provide"}
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Contact and Email Form Submissions"}
                        </strong>
                        {" When you fill out and submit a contact form or email capture form on the Site, we collect the personal information you choose to provide. This may include:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Your full name"}
                        </li>
                        <li>
                          {"Your email address"}
                        </li>
                        <li>
                          {"Your organization or company name, if provided"}
                        </li>
                        <li>
                          {"The subject of your inquiry"}
                        </li>
                        <li>
                          {"The content of your message"}
                        </li>
                        <li>
                          {"Any other information you choose to include in the body of your submission"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"You are not required to submit this information to browse the Site. Providing this information is entirely voluntary, and you do so with the understanding that we will use it to respond to your inquiry or to send you updates about the Neoconda product launch, as described in this Privacy Policy."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Email Opt-In and Launch Notifications"}
                        </strong>
                        {" If you submit your email address to be notified about our product launch or other updates, we will store your email address for the purpose of sending you those communications. You may withdraw your consent and unsubscribe at any time using the unsubscribe mechanism included in any email we send you, or by contacting us directly."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"3.2 Information Collected Automatically"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"When you visit the Site, certain information about your visit is collected automatically through cookies, pixel tags, and third-party analytics technologies. This information is collected on our behalf by Google and Microsoft, as described below, and is used to help us understand how visitors interact with the Site."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Automatically collected information may include:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Your Internet Protocol (IP) address (which may be used to infer general geographic location such as country or region, but is not used to identify you personally)"}
                        </li>
                        <li>
                          {"Browser type, version, and language settings"}
                        </li>
                        <li>
                          {"Operating system and device type (desktop, mobile, tablet)"}
                        </li>
                        <li>
                          {"Screen resolution and viewport size"}
                        </li>
                        <li>
                          {"The URL of the webpage you visited before arriving at the Site (referrer URL)"}
                        </li>
                        <li>
                          {"The pages you visit on the Site, the order in which you visit them, and the time you spend on each page"}
                        </li>
                        <li>
                          {"Links and elements you click on while browsing the Site"}
                        </li>
                        <li>
                          {"Scroll depth and on-page engagement patterns (via Microsoft Clarity)"}
                        </li>
                        <li>
                          {"Mouse movements and interaction heatmaps (via Microsoft Clarity)"}
                        </li>
                        <li>
                          {"Session replay data, which may capture how you navigate and interact with the Site (via Microsoft Clarity)"}
                        </li>
                        <li>
                          {"Date and time of your visit"}
                        </li>
                        <li>
                          {"Whether you are a new or returning visitor"}
                        </li>
                        <li>
                          {"General traffic source and campaign parameters (e.g., if you arrived from a specific link or referral)"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"This automatically collected information does not, on its own, identify you as a specific individual. However, it may be combined with other data by our analytics providers in accordance with their own privacy policies."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"4. How We Use Your Information"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"We use the information we collect for the following purposes:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Responding to Inquiries"}
                        </strong>
                        {" We use the information submitted through contact forms to respond to your questions, requests, or feedback in a timely and helpful manner."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Product Launch Communications"}
                        </strong>
                        {" If you have provided your email address and opted in to receive communications from us, we may use your email address to notify you when the Neoconda device becomes available, to share pre-launch updates, announcements, pricing information, or other relevant product news."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Analytics and Site Improvement"}
                        </strong>
                        {" We use automatically collected analytics data to understand how visitors navigate the Site, which sections attract the most interest, how long users stay on particular pages, and where users may encounter friction. This helps us improve the design, content, and performance of the Site."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Session Analysis and UX Research"}
                        </strong>
                        {" Data collected through Microsoft Clarity, including session recordings and heatmaps, is used to better understand user behavior on the Site. This data helps us identify usability issues, improve page layouts, and optimize the user experience."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Security and Fraud Prevention"}
                        </strong>
                        {" We may use data collected through analytics tools to detect unusual or suspicious traffic patterns, prevent abuse of our contact forms (such as spam submissions), and protect the integrity and security of the Site."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Legal Compliance"}
                        </strong>
                        {" We may use and retain your information as necessary to comply with applicable laws and regulations, respond to legal process or lawful government requests, enforce our Terms of Service, and protect the rights, property, or safety of NEOCONDA LLC, our users, or others."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Business Operations"}
                        </strong>
                        {" We may use aggregated, non-identifiable analytics data internally for business planning, investor communications, and product development decisions."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5. Cookies and Tracking Technologies"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5.1 What Are Cookies?"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Cookies are small text files that are stored on your device (computer, smartphone, or tablet) when you visit a website. They allow websites and third-party services to recognize your browser, remember your preferences, and collect information about how you use the site. Cookies may be \"session cookies\" (which expire when you close your browser) or \"persistent cookies\" (which remain on your device for a specified period of time)."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5.2 Types of Cookies We Use"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Analytics Cookies"}
                        </strong>
                        {" These cookies are placed by our third-party analytics providers (Google and Microsoft) and allow us to collect information about how visitors use the Site. They help us understand traffic patterns, measure the performance of the Site, and improve content and structure."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Functionality Cookies"}
                        </strong>
                        {" These cookies may be used to remember basic preferences or settings related to the Site. At this time, we do not use any first-party cookies that store personal account information, as the Site does not have user accounts."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Third-Party Cookies"}
                        </strong>
                        {" Google Analytics 4 and Microsoft Clarity each place their own cookies on your device when you visit the Site. These cookies are governed by the respective privacy policies of Google and Microsoft, not by NEOCONDA LLC."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5.3 Google Analytics 4"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Our Site uses Google Analytics 4, a web analytics service provided by Google LLC (\"Google\"). Google Analytics 4 uses cookies and other tracking technologies to collect and report on how visitors interact with the Site. Information generated by these technologies about your use of the Site (including your IP address, which Google may anonymize) is transmitted to and stored on servers operated by Google, including servers located in the United States."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Google may use this data in accordance with its own privacy policies and, in some cases, to personalize ads across its advertising network. You can learn more about how Google uses data collected from sites that use its services by visiting:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Google's Privacy Policy: policies.google.com/privacy"}
                        </li>
                        <li>
                          {"Google's data use explanation: policies.google.com/technologies/partner-sites"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"You can opt out of Google Analytics tracking across all websites by installing the Google Analytics Opt-Out Browser Add-on, available at: tools.google.com/dlpage/gaoptout."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5.4 Microsoft Clarity"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Our Site uses Microsoft Clarity, a behavioral analytics and session recording tool provided by Microsoft Corporation (\"Microsoft\"). Microsoft Clarity collects data about how users interact with the Site, including mouse movements, clicks, scrolling behavior, and session recordings. This data helps us understand how visitors engage with the Site's content and layout."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Data collected by Microsoft Clarity is transmitted to and processed by Microsoft in accordance with its own privacy policy. You can learn more at:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Microsoft's Privacy Policy: privacy.microsoft.com"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Microsoft Clarity's data collection may include session replays, meaning that your interactions with the Site during a visit may be recorded and reviewed by NEOCONDA LLC employees or contractors for the purpose of improving the Site experience."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5.5 Your Cookie Choices"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"You have the right to accept or reject cookies. You may control or disable cookies through your browser's built-in settings. Most browsers allow you to:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"View what cookies are stored on your device"}
                        </li>
                        <li>
                          {"Delete all or specific cookies"}
                        </li>
                        <li>
                          {"Block cookies from all sites or from specific sites"}
                        </li>
                        <li>
                          {"Set your browser to alert you before accepting cookies"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Please note that restricting or disabling cookies may affect the functionality of certain features on the Site. Instructions for managing cookies in common browsers:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Google Chrome: Settings > Privacy and Security > Cookies and other site data"}
                        </li>
                        <li>
                          {"Mozilla Firefox: Settings > Privacy & Security > Cookies and Site Data"}
                        </li>
                        <li>
                          {"Safari: Preferences > Privacy > Manage Website Data"}
                        </li>
                        <li>
                          {"Microsoft Edge: Settings > Cookies and site permissions"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"You may also opt out of interest-based advertising and some analytics tracking by visiting the Digital Advertising Alliance's opt-out page at optout.aboutads.info or the Network Advertising Initiative's opt-out page at optout.networkadvertising.org."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"6. How We Share Your Information"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"NEOCONDA LLC does not sell, rent, lease, or trade your personal information to any third party. We share information only in the limited circumstances described below:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Analytics Service Providers"}
                        </strong>
                        {" We share data with Google (for Google Analytics 4) and Microsoft (for Microsoft Clarity) as necessary to operate those analytics services on our behalf. These providers act as data processors and are contractually required to handle your data in accordance with applicable privacy laws and their own privacy policies."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Legal Requirements"}
                        </strong>
                        {" We may disclose your personal information if we are required to do so by law, court order, or valid legal process, including subpoenas, government investigations, or regulatory inquiries. We may also disclose information where we believe disclosure is necessary to prevent fraud, abuse, or harm to the rights, property, or safety of NEOCONDA LLC, our users, or the public."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Business Transfers"}
                        </strong>
                        {" In the event that NEOCONDA LLC is acquired, merged with another entity, or undergoes a significant corporate transaction such as a sale of assets, your information may be transferred to the acquiring party as part of that transaction. We will provide notice on the Site if such a transfer results in a materially different use of your personal information."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"With Your Consent"}
                        </strong>
                        {" We may share your information with other parties if you have given us explicit consent to do so, such as if you request that we forward your inquiry to a relevant partner or collaborator."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"7. Data Security"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"We take reasonable technical and organizational measures to protect the personal information we collect from unauthorized access, disclosure, alteration, or destruction. These measures include:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Use of HTTPS (SSL/TLS encryption) for all data transmitted through the Site"}
                        </li>
                        <li>
                          {"Limiting access to contact form submissions to authorized personnel only"}
                        </li>
                        <li>
                          {"Regular review of our data practices and security posture"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"However, no method of data transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security of your information. If you believe your information has been compromised, please contact us immediately using the contact details provided at the end of this Privacy Policy."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"8. Data Retention"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Contact Form Data"}
                        </strong>
                        {" Information submitted through contact forms is retained for as long as necessary to respond to your inquiry and to maintain a reasonable record of communications. If you request deletion of your data, we will honor that request in accordance with applicable law."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Email Addresses for Launch Notifications"}
                        </strong>
                        {" If you have opted in to receive product launch communications, we will retain your email address until you unsubscribe or request deletion."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Analytics Data"}
                        </strong>
                        {" Analytics data collected through Google Analytics 4 is retained according to the data retention settings configured in our Google Analytics account, which we set to a maximum of 14 months. Analytics data collected through Microsoft Clarity is retained in accordance with Microsoft's standard data retention policies."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"9. Your Privacy Rights"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Depending on your location and applicable law, you may have certain rights with respect to your personal information. We are committed to honoring these rights to the extent required by applicable law."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"9.1 General Rights"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"You may have the right to:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          <strong>
                            {"Access"}
                          </strong>
                          {": Request a copy of the personal information we hold about you"}
                        </li>
                        <li>
                          <strong>
                            {"Correction"}
                          </strong>
                          {": Request that we correct inaccurate or incomplete information"}
                        </li>
                        <li>
                          <strong>
                            {"Deletion"}
                          </strong>
                          {": Request that we delete your personal information, subject to certain legal limitations"}
                        </li>
                        <li>
                          <strong>
                            {"Restriction"}
                          </strong>
                          {": Request that we limit how we use your personal information in certain circumstances"}
                        </li>
                        <li>
                          <strong>
                            {"Portability"}
                          </strong>
                          {": Request that we provide your personal information in a commonly used, machine-readable format"}
                        </li>
                        <li>
                          <strong>
                            {"Objection"}
                          </strong>
                          {": Object to certain types of data processing, including direct marketing"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"To exercise any of these rights, please contact us at hello@neoconda.com. We will respond to your request within a reasonable timeframe and in accordance with applicable law."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"9.2 California Residents — CCPA Rights"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"If you are a resident of California, you have specific rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA), including:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"The right to know what personal information we collect, use, disclose, and sell"}
                        </li>
                        <li>
                          {"The right to delete personal information we have collected from you"}
                        </li>
                        <li>
                          {"The right to opt out of the sale or sharing of personal information (note: we do not sell personal information)"}
                        </li>
                        <li>
                          {"The right to non-discrimination for exercising your privacy rights"}
                        </li>
                        <li>
                          {"The right to correct inaccurate personal information"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"To exercise your California privacy rights, you or an authorized agent may submit a verifiable consumer request to hello@neoconda.com. We will not discriminate against you for exercising these rights."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"Categories of Personal Information Collected (CCPA)"}
                        </strong>
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"In the preceding 12 months, we have collected the following categories of personal information:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Identifiers (e.g., name, email address, IP address)"}
                        </li>
                        <li>
                          {"Internet or electronic network activity information (e.g., browsing history on the Site, interaction data)"}
                        </li>
                        <li>
                          {"Geolocation data (general, inferred from IP address — country/region level only)"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"We have not sold any personal information, as defined under the CCPA."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"9.3 Nevada Residents"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Nevada residents have the right to opt out of the sale of their personal information. NEOCONDA LLC does not sell personal information. If you have questions, you may contact us at hello@neoconda.com."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"9.4 European and UK Residents (GDPR)"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Although NEOCONDA LLC is a U.S.-based company and the Site is primarily directed to U.S. audiences, if you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, the General Data Protection Regulation (GDPR) or equivalent laws may grant you additional rights, including the right to lodge a complaint with a supervisory authority."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Our lawful bases for processing your data are:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          <strong>
                            {"Legitimate interests"}
                          </strong>
                          {": Analytics and Site improvement"}
                        </li>
                        <li>
                          <strong>
                            {"Consent"}
                          </strong>
                          {": Email opt-in and launch notifications"}
                        </li>
                        <li>
                          <strong>
                            {"Contractual necessity"}
                          </strong>
                          {": Responding to your contact form inquiries"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"If you are located in the EEA or UK and wish to exercise your rights, please contact us at hello@neoconda.com."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"10. Children's Privacy"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"The Site is not directed to, and we do not knowingly collect personal information from, children under the age of 13 in the United States, or under the applicable age of digital consent in other jurisdictions. If you are under the age of 13, please do not use the Site or submit any personal information through it."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"If we become aware that we have inadvertently collected personal information from a child under the age of 13, we will take prompt steps to delete that information from our records. If you are a parent or guardian and believe that your child has submitted personal information to us, please contact us immediately at hello@neoconda.com."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"11. Links to Third-Party Sites and Social Media"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"The Site contains links to our social media profiles and may contain links to other third-party websites or resources. These links are provided solely as a convenience. NEOCONDA LLC does not control and is not responsible for the content, privacy practices, security, or data practices of any third-party platforms or websites. Our Privacy Policy does not apply to any third-party sites you access through links on this Site."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"We encourage you to review the privacy policies of any third-party sites you visit, including but not limited to the platforms hosting our social media presence."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"12. International Data Transfers"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"NEOCONDA LLC is based in the United States, and your information will be stored and processed in the United States. Our analytics service providers, Google and Microsoft, may process data on servers located in multiple countries. By using the Site, you consent to the transfer of your information to the United States and to other countries where our service providers operate, which may have different data protection standards than your country of residence."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"13. Do Not Track"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Some browsers offer a \"Do Not Track\" (DNT) signal that users can enable to request that websites not track their browsing activity. Because there is currently no uniform standard for how websites should respond to DNT signals, our Site does not currently alter its data collection practices in response to DNT signals. We will continue to monitor developments in this area and update this policy if applicable standards are adopted."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"14. Changes to This Privacy Policy"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"We reserve the right to update or modify this Privacy Policy at any time. When we make changes, we will update the \"Last Updated\" date at the top of this page. If we make material changes that significantly affect how we handle your personal information, we will make reasonable efforts to notify you, which may include posting a prominent notice on the Site."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Your continued use of the Site after any changes to this Privacy Policy constitutes your acceptance of the updated Privacy Policy. We encourage you to review this page periodically to stay informed."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"15. Contact Us"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"If you have any questions, concerns, or requests related to this Privacy Policy or our data practices, please contact us:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        <strong>
                          {"NEOCONDA LLC"}
                        </strong>
                        {" Email: hello@neoconda.com Website: neoconda.com"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"We will make every effort to respond to your inquiry promptly and thoroughly."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="launching" className="home_footer-component">
          <div className="padding-global">
            <div className="container-full">
              <div className="home_footer-content">
                <div className="footer_social-terms-wrapper hide-above-lanscape">
                  <div className="footer_social-wrapper" />
                  <div className="footer_link-blocks">
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e71c" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e71c" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="/privacy-policy" aria-current="page" className="footer_policy-text w--current">
                      {"PRIVACY POLICY"}
                    </a>
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e71e" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e71e" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="/terms-of-service" className="footer_policy-text">
                      {"TERMS OF SERVICE"}
                    </a>
                    <div className="footer_social-icons">
                      <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:126bb547-eda1-067b-477c-c92d9ebf1539" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf1539" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://www.instagram.com/neocondaofficial/" target="_blank" className="social-icon_link w-inline-block">
                        <div className="social-icon w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_1200_965)">
                              <path d="M12 2.0709C15.2063 2.0709 15.5859 2.08437 16.8469 2.13828C18.0188 2.1877 18.6516 2.37637 19.0734 2.53359C19.6313 2.74023 20.0344 2.9918 20.4516 3.3916C20.8734 3.7959 21.1313 4.17773 21.3469 4.7123C21.5109 5.1166 21.7078 5.72754 21.7594 6.84609C21.8156 8.05898 21.8297 8.42285 21.8297 11.491C21.8297 14.5637 21.8156 14.9275 21.7594 16.1359C21.7078 17.259 21.5109 17.8654 21.3469 18.2697C21.1313 18.8043 20.8687 19.1906 20.4516 19.5904C20.0297 19.9947 19.6313 20.2418 19.0734 20.4484C18.6516 20.6057 18.0141 20.7943 16.8469 20.8438C15.5813 20.8977 15.2016 20.9111 12 20.9111C8.79375 20.9111 8.41406 20.8977 7.15313 20.8438C5.98125 20.7943 5.34844 20.6057 4.92656 20.4484C4.36875 20.2418 3.96563 19.9902 3.54844 19.5904C3.12656 19.1861 2.86875 18.8043 2.65313 18.2697C2.48906 17.8654 2.29219 17.2545 2.24063 16.1359C2.18438 14.923 2.17031 14.5592 2.17031 11.491C2.17031 8.41836 2.18438 8.05449 2.24063 6.84609C2.29219 5.72305 2.48906 5.1166 2.65313 4.7123C2.86875 4.17773 3.13125 3.79141 3.54844 3.3916C3.97031 2.9873 4.36875 2.74023 4.92656 2.53359C5.34844 2.37637 5.98594 2.1877 7.15313 2.13828C8.41406 2.08437 8.79375 2.0709 12 2.0709ZM12 0C8.74219 0 8.33438 0.0134766 7.05469 0.0673828C5.77969 0.121289 4.90313 0.318945 4.14375 0.601953C3.35156 0.898437 2.68125 1.28926 2.01563 1.93164C1.34531 2.56953 0.9375 3.21191 0.628125 3.9666C0.332812 4.69883 0.126563 5.53437 0.0703125 6.75625C0.0140625 7.98711 0 8.37793 0 11.5C0 14.6221 0.0140625 15.0129 0.0703125 16.2393C0.126563 17.4611 0.332812 18.3012 0.628125 19.0289C0.9375 19.7881 1.34531 20.4305 2.01563 21.0684C2.68125 21.7062 3.35156 22.1016 4.13906 22.3936C4.90313 22.6766 5.775 22.8742 7.05 22.9281C8.32969 22.982 8.7375 22.9955 11.9953 22.9955C15.2531 22.9955 15.6609 22.982 16.9406 22.9281C18.2156 22.8742 19.0922 22.6766 19.8516 22.3936C20.6391 22.1016 21.3094 21.7062 21.975 21.0684C22.6406 20.4305 23.0531 19.7881 23.3578 19.0334C23.6531 18.3012 23.8594 17.4656 23.9156 16.2437C23.9719 15.0174 23.9859 14.6266 23.9859 11.5045C23.9859 8.38242 23.9719 7.9916 23.9156 6.76523C23.8594 5.54336 23.6531 4.70332 23.3578 3.97559C23.0625 3.21191 22.6547 2.56953 21.9844 1.93164C21.3188 1.29375 20.6484 0.898438 19.8609 0.606445C19.0969 0.323437 18.225 0.125781 16.95 0.071875C15.6656 0.0134766 15.2578 0 12 0Z" fill="currentColor" />
                              <path d="M12 5.59277C8.59688 5.59277 5.83594 8.23867 5.83594 11.5C5.83594 14.7613 8.59688 17.4072 12 17.4072C15.4031 17.4072 18.1641 14.7613 18.1641 11.5C18.1641 8.23867 15.4031 5.59277 12 5.59277ZM12 15.3318C9.79219 15.3318 8.00156 13.6158 8.00156 11.5C8.00156 9.38418 9.79219 7.66816 12 7.66816C14.2078 7.66816 15.9984 9.38418 15.9984 11.5C15.9984 13.6158 14.2078 15.3318 12 15.3318Z" fill="currentColor" />
                              <path d="M19.8469 5.35957C19.8469 6.12325 19.2 6.73868 18.4078 6.73868C17.6109 6.73868 16.9688 6.11875 16.9688 5.35957C16.9688 4.5959 17.6156 3.98047 18.4078 3.98047C19.2 3.98047 19.8469 4.60039 19.8469 5.35957Z" fill="currentColor" />
                            </g>
                            <defs>
                              <clipPath id="clip0_1200_965">
                                <rect width="24" height="23" fill="currentColor" />
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                      </a>
                      <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:126bb547-eda1-067b-477c-c92d9ebf153b" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf153b" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://discord.com/" target="_blank" className="social-icon_link w-inline-block">
                        <div className="social-icon w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_1200_963)">
                              <path d="M19.4705 3.98253C18.0045 3.30989 16.4325 2.81432 14.7889 2.53049C14.759 2.52501 14.7291 2.5387 14.7137 2.56608C14.5115 2.92566 14.2875 3.39476 14.1307 3.76348C12.3629 3.49881 10.6041 3.49881 8.87256 3.76348C8.7157 3.38657 8.48363 2.92566 8.28055 2.56608C8.26513 2.53961 8.23523 2.52592 8.2053 2.53049C6.56258 2.81341 4.99058 3.30898 3.52373 3.98253C3.51103 3.988 3.50015 3.99714 3.49292 4.00899C0.511167 8.46367 -0.305661 12.8089 0.0950476 17.1002C0.0968607 17.1212 0.108646 17.1412 0.124965 17.154C2.09224 18.5987 3.99789 19.4758 5.86814 20.0572C5.89808 20.0663 5.92979 20.0553 5.94884 20.0307C6.39125 19.4265 6.78562 18.7895 7.12375 18.1196C7.1437 18.0804 7.12466 18.0338 7.08387 18.0183C6.45834 17.781 5.8627 17.4917 5.28974 17.1631C5.24442 17.1367 5.24079 17.0719 5.28249 17.0408C5.40306 16.9505 5.52366 16.8565 5.63879 16.7616C5.65962 16.7442 5.68865 16.7406 5.71314 16.7515C9.47723 18.4701 13.5523 18.4701 17.272 16.7515C17.2965 16.7397 17.3255 16.7433 17.3472 16.7606C17.4624 16.8556 17.583 16.9505 17.7045 17.0408C17.7462 17.0719 17.7434 17.1367 17.6981 17.1631C17.1252 17.4981 16.5295 17.781 15.9031 18.0174C15.8623 18.0329 15.8442 18.0804 15.8641 18.1196C16.2095 18.7886 16.6039 19.4256 17.0381 20.0298C17.0562 20.0553 17.0889 20.0663 17.1188 20.0572C18.9981 19.4758 20.9038 18.5987 22.871 17.154C22.8883 17.1412 22.8992 17.1221 22.901 17.1011C23.3805 12.1398 22.0977 7.8303 19.5004 4.0099C19.494 3.99714 19.4832 3.988 19.4705 3.98253ZM7.68586 14.4872C6.5526 14.4872 5.61884 13.4468 5.61884 12.1691C5.61884 10.8913 6.53449 9.85093 7.68586 9.85093C8.84625 9.85093 9.77098 10.9005 9.75284 12.1691C9.75284 13.4468 8.83718 14.4872 7.68586 14.4872ZM15.3283 14.4872C14.1951 14.4872 13.2613 13.4468 13.2613 12.1691C13.2613 10.8913 14.1769 9.85093 15.3283 9.85093C16.4887 9.85093 17.4134 10.9005 17.3953 12.1691C17.3953 13.4468 16.4887 14.4872 15.3283 14.4872Z" fill="currentColor" />
                            </g>
                            <defs>
                              <clipPath id="clip0_1200_963">
                                <rect width="23" height="23" fill="currentColor" />
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                      </a>
                      <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:126bb547-eda1-067b-477c-c92d9ebf153d" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf153d" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://www.reddit.com/r/neoconda/" target="_blank" className="social-icon_link w-inline-block">
                        <div className="social-icon w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.3923 4.07833C14.6388 5.12342 15.5773 5.90197 16.6979 5.90197C18.0062 5.90197 19.0669 4.84133 19.0669 3.53302C19.0669 2.2247 18.0062 1.16406 16.6979 1.16406C15.554 1.16406 14.5999 1.97482 14.3778 3.05323C12.462 3.25869 10.966 4.88353 10.966 6.85266C10.966 6.8571 10.966 6.86043 10.966 6.86487C8.88247 6.95261 6.97998 7.54568 5.46953 8.48194C4.90867 8.04769 4.20454 7.78891 3.44043 7.78891C1.6068 7.78891 0.120789 9.27492 0.120789 11.1086C0.120789 12.4391 0.902665 13.5852 2.03217 14.115C2.14212 17.9689 6.34137 21.0686 11.5069 21.0686C16.6724 21.0686 20.8772 17.9655 20.9816 14.1083C22.1022 13.5752 22.8774 12.4324 22.8774 11.1097C22.8774 9.27603 21.3914 7.79002 19.5578 7.79002C18.797 7.79002 18.0962 8.04658 17.5364 8.4775C16.0126 7.53458 14.0891 6.94151 11.9844 6.86265C11.9844 6.85932 11.9844 6.8571 11.9844 6.85377C11.9844 5.44328 13.0329 4.27269 14.3923 4.08055V4.07833ZM5.33626 13.2154C5.39179 12.0115 6.19144 11.0875 7.12103 11.0875C8.05061 11.0875 8.76141 12.0637 8.70588 13.2676C8.65035 14.4715 7.95621 14.9091 7.02551 14.9091C6.09481 14.9091 5.28073 14.4193 5.33626 13.2154ZM15.8938 11.0875C16.8245 11.0875 17.6242 12.0115 17.6786 13.2154C17.7341 14.4193 16.9189 14.9091 15.9893 14.9091C15.0597 14.9091 14.3645 14.4726 14.309 13.2676C14.2534 12.0637 14.9631 11.0875 15.8938 11.0875ZM14.7876 16.0008C14.962 16.0186 15.0731 16.1996 15.0053 16.3618C14.4333 17.729 13.0828 18.6896 11.5069 18.6896C9.93089 18.6896 8.58149 17.729 8.00841 16.3618C7.94066 16.1996 8.05173 16.0186 8.22609 16.0008C9.24786 15.8975 10.3529 15.8409 11.5069 15.8409C12.6608 15.8409 13.7648 15.8975 14.7876 16.0008Z" fill="currentColor" />
                          </svg>
                        </div>
                      </a>
                      <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:126bb547-eda1-067b-477c-c92d9ebf153f" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf153f" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://x.com/neocondaoffic" target="_blank" className="social-icon_link w-inline-block">
                        <div className="social-icon w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5627 1.82422H20.7956L13.7326 9.89673L22.0416 20.8816H15.5357L10.4401 14.2193L4.60951 20.8816H1.37464L8.92919 12.2471L0.958313 1.82422H7.62938L12.2354 7.91379L17.5627 1.82422ZM16.428 18.9465H18.2194L6.65598 3.65764H4.73363L16.428 18.9465Z" fill="currentColor" />
                          </svg>
                        </div>
                      </a>
                      <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:126bb547-eda1-067b-477c-c92d9ebf1541" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf1541" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://www.tiktok.com/@neocondaofficial" target="_blank" className="social-icon_link w-inline-block">
                        <div className="social-icon w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.3612 0H12.485V15.6666C12.485 17.5333 10.9942 19.0667 9.13894 19.0667C7.28368 19.0667 5.79285 17.5333 5.79285 15.6666C5.79285 13.8334 7.25055 12.3333 9.03957 12.2667V8.33335C5.09713 8.39998 1.91669 11.6333 1.91669 15.6666C1.91669 19.7334 5.16338 23 9.17208 23C13.1807 23 16.4274 19.7 16.4274 15.6666V7.63332C17.8851 8.70001 19.6741 9.33334 21.5625 9.36669V5.43333C18.6471 5.33334 16.3612 2.93333 16.3612 0Z" fill="currentColor" />
                          </svg>
                        </div>
                      </a>
                      <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:126bb547-eda1-067b-477c-c92d9ebf1543" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf1543" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://www.youtube.com/@neocondaofficial" target="_blank" className="social-icon_link w-inline-block">
                        <div className="social-icon w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_1200_955)">
                              <path d="M22.7709 6.89961C22.7709 6.89961 22.5463 5.31387 21.8545 4.61758C20.9785 3.70117 19.9992 3.69668 19.55 3.64277C16.3336 3.40918 11.5045 3.40918 11.5045 3.40918H11.4955C11.4955 3.40918 6.66641 3.40918 3.45 3.64277C3.00078 3.69668 2.02148 3.70117 1.14551 4.61758C0.453711 5.31387 0.233594 6.89961 0.233594 6.89961C0.233594 6.89961 0 8.76387 0 10.6236V12.3666C0 14.2264 0.229102 16.0906 0.229102 16.0906C0.229102 16.0906 0.453711 17.6764 1.14102 18.3727C2.01699 19.2891 3.16699 19.2576 3.6791 19.3564C5.5209 19.5316 11.5 19.5855 11.5 19.5855C11.5 19.5855 16.3336 19.5766 19.55 19.3475C19.9992 19.2936 20.9785 19.2891 21.8545 18.3727C22.5463 17.6764 22.7709 16.0906 22.7709 16.0906C22.7709 16.0906 23 14.2309 23 12.3666V10.6236C23 8.76387 22.7709 6.89961 22.7709 6.89961ZM9.12363 14.4824V8.01816L15.3363 11.2615L9.12363 14.4824Z" fill="currentColor" />
                            </g>
                            <defs>
                              <clipPath id="clip0_1200_955">
                                <rect width="23" height="23" fill="currentColor" />
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                      </a>
                      <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:126bb547-eda1-067b-477c-c92d9ebf1545" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf1545" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://t.me/neoconda" target="_blank" className="social-icon_link w-inline-block">
                        <div className="social-icon w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_1200_953)">
                              <path fillRule="evenodd" clipRule="evenodd" d="M24 11.5C24 17.8513 18.6274 23 12 23C5.37258 23 0 17.8513 0 11.5C0 5.14873 5.37258 0 12 0C18.6274 0 24 5.14873 24 11.5ZM12.43 8.48981C11.2628 8.95505 8.93014 9.91798 5.43189 11.3786C4.86383 11.5951 4.56626 11.8069 4.53917 12.014C4.49339 12.3639 4.95071 12.5017 5.57347 12.6894C5.65818 12.7149 5.74595 12.7414 5.83594 12.7694C6.44864 12.9603 7.27283 13.1836 7.70129 13.1924C8.08994 13.2005 8.52373 13.0469 9.00264 12.7318C12.2712 10.6174 13.9584 9.54865 14.0643 9.52561C14.139 9.50936 14.2426 9.48892 14.3128 9.54869C14.3829 9.60845 14.376 9.72164 14.3686 9.752C14.3233 9.93709 12.5281 11.5365 11.5991 12.3642C11.3095 12.6222 11.1041 12.8053 11.0621 12.8471C10.968 12.9407 10.8721 13.0293 10.78 13.1144C10.2108 13.6403 9.78391 14.0346 10.8036 14.6786C11.2936 14.9881 11.6858 15.244 12.077 15.4993C12.5042 15.7781 12.9303 16.0562 13.4816 16.4025C13.6221 16.4908 13.7562 16.5824 13.8869 16.6717C14.3841 17.0114 14.8307 17.3165 15.3826 17.2679C15.7032 17.2396 16.0345 16.9506 16.2027 16.0888C16.6002 14.0522 17.3816 9.63935 17.5622 7.82093C17.578 7.66162 17.5581 7.45772 17.5422 7.36822C17.5262 7.27871 17.4928 7.15119 17.3714 7.05678C17.2276 6.94498 17.0056 6.9214 16.9064 6.92308C16.455 6.9307 15.7626 7.16145 12.43 8.48981Z" fill="currentColor" />
                            </g>
                            <defs>
                              <clipPath id="clip0_1200_953">
                                <rect width="24" height="23" fill="currentColor" />
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="footer_logo-wrapper">
                  <div className="footer_logo w-embed">
                    <a href="/" className="footer_brand"><img src="/b-logo%20white.svg" alt="" /><span>{"BUDDY"}</span></a>
                  </div>
                </div>
                <div className="footer_policy-wrapper">
                  <div id="w-node-_83b66b22-4b3e-6103-c8fc-6bc59024e72b-9024e6ff" className="footer_policy-text">
                    {"ALL RIGHTS RESERVED, ©BUDDY"}
                  </div>
                  <div id="w-node-_83b66b22-4b3e-6103-c8fc-6bc59024e72d-9024e6ff" className="footer_social-icons hide-mobile-landscape">
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e72e" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e72e" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://www.instagram.com/neocondaofficial/" target="_blank" className="social-icon_link w-inline-block">
                      <div className="social-icon w-embed">
                        <svg width="100%" height="100%" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1200_965)">
                            <path d="M12 2.0709C15.2063 2.0709 15.5859 2.08437 16.8469 2.13828C18.0188 2.1877 18.6516 2.37637 19.0734 2.53359C19.6313 2.74023 20.0344 2.9918 20.4516 3.3916C20.8734 3.7959 21.1313 4.17773 21.3469 4.7123C21.5109 5.1166 21.7078 5.72754 21.7594 6.84609C21.8156 8.05898 21.8297 8.42285 21.8297 11.491C21.8297 14.5637 21.8156 14.9275 21.7594 16.1359C21.7078 17.259 21.5109 17.8654 21.3469 18.2697C21.1313 18.8043 20.8687 19.1906 20.4516 19.5904C20.0297 19.9947 19.6313 20.2418 19.0734 20.4484C18.6516 20.6057 18.0141 20.7943 16.8469 20.8438C15.5813 20.8977 15.2016 20.9111 12 20.9111C8.79375 20.9111 8.41406 20.8977 7.15313 20.8438C5.98125 20.7943 5.34844 20.6057 4.92656 20.4484C4.36875 20.2418 3.96563 19.9902 3.54844 19.5904C3.12656 19.1861 2.86875 18.8043 2.65313 18.2697C2.48906 17.8654 2.29219 17.2545 2.24063 16.1359C2.18438 14.923 2.17031 14.5592 2.17031 11.491C2.17031 8.41836 2.18438 8.05449 2.24063 6.84609C2.29219 5.72305 2.48906 5.1166 2.65313 4.7123C2.86875 4.17773 3.13125 3.79141 3.54844 3.3916C3.97031 2.9873 4.36875 2.74023 4.92656 2.53359C5.34844 2.37637 5.98594 2.1877 7.15313 2.13828C8.41406 2.08437 8.79375 2.0709 12 2.0709ZM12 0C8.74219 0 8.33438 0.0134766 7.05469 0.0673828C5.77969 0.121289 4.90313 0.318945 4.14375 0.601953C3.35156 0.898437 2.68125 1.28926 2.01563 1.93164C1.34531 2.56953 0.9375 3.21191 0.628125 3.9666C0.332812 4.69883 0.126563 5.53437 0.0703125 6.75625C0.0140625 7.98711 0 8.37793 0 11.5C0 14.6221 0.0140625 15.0129 0.0703125 16.2393C0.126563 17.4611 0.332812 18.3012 0.628125 19.0289C0.9375 19.7881 1.34531 20.4305 2.01563 21.0684C2.68125 21.7062 3.35156 22.1016 4.13906 22.3936C4.90313 22.6766 5.775 22.8742 7.05 22.9281C8.32969 22.982 8.7375 22.9955 11.9953 22.9955C15.2531 22.9955 15.6609 22.982 16.9406 22.9281C18.2156 22.8742 19.0922 22.6766 19.8516 22.3936C20.6391 22.1016 21.3094 21.7062 21.975 21.0684C22.6406 20.4305 23.0531 19.7881 23.3578 19.0334C23.6531 18.3012 23.8594 17.4656 23.9156 16.2437C23.9719 15.0174 23.9859 14.6266 23.9859 11.5045C23.9859 8.38242 23.9719 7.9916 23.9156 6.76523C23.8594 5.54336 23.6531 4.70332 23.3578 3.97559C23.0625 3.21191 22.6547 2.56953 21.9844 1.93164C21.3188 1.29375 20.6484 0.898438 19.8609 0.606445C19.0969 0.323437 18.225 0.125781 16.95 0.071875C15.6656 0.0134766 15.2578 0 12 0Z" fill="currentColor" />
                            <path d="M12 5.59277C8.59688 5.59277 5.83594 8.23867 5.83594 11.5C5.83594 14.7613 8.59688 17.4072 12 17.4072C15.4031 17.4072 18.1641 14.7613 18.1641 11.5C18.1641 8.23867 15.4031 5.59277 12 5.59277ZM12 15.3318C9.79219 15.3318 8.00156 13.6158 8.00156 11.5C8.00156 9.38418 9.79219 7.66816 12 7.66816C14.2078 7.66816 15.9984 9.38418 15.9984 11.5C15.9984 13.6158 14.2078 15.3318 12 15.3318Z" fill="currentColor" />
                            <path d="M19.8469 5.35957C19.8469 6.12325 19.2 6.73868 18.4078 6.73868C17.6109 6.73868 16.9688 6.11875 16.9688 5.35957C16.9688 4.5959 17.6156 3.98047 18.4078 3.98047C19.2 3.98047 19.8469 4.60039 19.8469 5.35957Z" fill="currentColor" />
                          </g>
                          <defs>
                            <clipPath id="clip0_1200_965">
                              <rect width="24" height="23" fill="currentColor" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </a>
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e730" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e730" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://discord.com/" target="_blank" className="social-icon_link w-inline-block">
                      <div className="social-icon w-embed">
                        <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1200_963)">
                            <path d="M19.4705 3.98253C18.0045 3.30989 16.4325 2.81432 14.7889 2.53049C14.759 2.52501 14.7291 2.5387 14.7137 2.56608C14.5115 2.92566 14.2875 3.39476 14.1307 3.76348C12.3629 3.49881 10.6041 3.49881 8.87256 3.76348C8.7157 3.38657 8.48363 2.92566 8.28055 2.56608C8.26513 2.53961 8.23523 2.52592 8.2053 2.53049C6.56258 2.81341 4.99058 3.30898 3.52373 3.98253C3.51103 3.988 3.50015 3.99714 3.49292 4.00899C0.511167 8.46367 -0.305661 12.8089 0.0950476 17.1002C0.0968607 17.1212 0.108646 17.1412 0.124965 17.154C2.09224 18.5987 3.99789 19.4758 5.86814 20.0572C5.89808 20.0663 5.92979 20.0553 5.94884 20.0307C6.39125 19.4265 6.78562 18.7895 7.12375 18.1196C7.1437 18.0804 7.12466 18.0338 7.08387 18.0183C6.45834 17.781 5.8627 17.4917 5.28974 17.1631C5.24442 17.1367 5.24079 17.0719 5.28249 17.0408C5.40306 16.9505 5.52366 16.8565 5.63879 16.7616C5.65962 16.7442 5.68865 16.7406 5.71314 16.7515C9.47723 18.4701 13.5523 18.4701 17.272 16.7515C17.2965 16.7397 17.3255 16.7433 17.3472 16.7606C17.4624 16.8556 17.583 16.9505 17.7045 17.0408C17.7462 17.0719 17.7434 17.1367 17.6981 17.1631C17.1252 17.4981 16.5295 17.781 15.9031 18.0174C15.8623 18.0329 15.8442 18.0804 15.8641 18.1196C16.2095 18.7886 16.6039 19.4256 17.0381 20.0298C17.0562 20.0553 17.0889 20.0663 17.1188 20.0572C18.9981 19.4758 20.9038 18.5987 22.871 17.154C22.8883 17.1412 22.8992 17.1221 22.901 17.1011C23.3805 12.1398 22.0977 7.8303 19.5004 4.0099C19.494 3.99714 19.4832 3.988 19.4705 3.98253ZM7.68586 14.4872C6.5526 14.4872 5.61884 13.4468 5.61884 12.1691C5.61884 10.8913 6.53449 9.85093 7.68586 9.85093C8.84625 9.85093 9.77098 10.9005 9.75284 12.1691C9.75284 13.4468 8.83718 14.4872 7.68586 14.4872ZM15.3283 14.4872C14.1951 14.4872 13.2613 13.4468 13.2613 12.1691C13.2613 10.8913 14.1769 9.85093 15.3283 9.85093C16.4887 9.85093 17.4134 10.9005 17.3953 12.1691C17.3953 13.4468 16.4887 14.4872 15.3283 14.4872Z" fill="currentColor" />
                          </g>
                          <defs>
                            <clipPath id="clip0_1200_963">
                              <rect width="23" height="23" fill="currentColor" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </a>
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e732" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e732" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://www.reddit.com/r/neoconda/" target="_blank" className="social-icon_link w-inline-block">
                      <div className="social-icon w-embed">
                        <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14.3923 4.07833C14.6388 5.12342 15.5773 5.90197 16.6979 5.90197C18.0062 5.90197 19.0669 4.84133 19.0669 3.53302C19.0669 2.2247 18.0062 1.16406 16.6979 1.16406C15.554 1.16406 14.5999 1.97482 14.3778 3.05323C12.462 3.25869 10.966 4.88353 10.966 6.85266C10.966 6.8571 10.966 6.86043 10.966 6.86487C8.88247 6.95261 6.97998 7.54568 5.46953 8.48194C4.90867 8.04769 4.20454 7.78891 3.44043 7.78891C1.6068 7.78891 0.120789 9.27492 0.120789 11.1086C0.120789 12.4391 0.902665 13.5852 2.03217 14.115C2.14212 17.9689 6.34137 21.0686 11.5069 21.0686C16.6724 21.0686 20.8772 17.9655 20.9816 14.1083C22.1022 13.5752 22.8774 12.4324 22.8774 11.1097C22.8774 9.27603 21.3914 7.79002 19.5578 7.79002C18.797 7.79002 18.0962 8.04658 17.5364 8.4775C16.0126 7.53458 14.0891 6.94151 11.9844 6.86265C11.9844 6.85932 11.9844 6.8571 11.9844 6.85377C11.9844 5.44328 13.0329 4.27269 14.3923 4.08055V4.07833ZM5.33626 13.2154C5.39179 12.0115 6.19144 11.0875 7.12103 11.0875C8.05061 11.0875 8.76141 12.0637 8.70588 13.2676C8.65035 14.4715 7.95621 14.9091 7.02551 14.9091C6.09481 14.9091 5.28073 14.4193 5.33626 13.2154ZM15.8938 11.0875C16.8245 11.0875 17.6242 12.0115 17.6786 13.2154C17.7341 14.4193 16.9189 14.9091 15.9893 14.9091C15.0597 14.9091 14.3645 14.4726 14.309 13.2676C14.2534 12.0637 14.9631 11.0875 15.8938 11.0875ZM14.7876 16.0008C14.962 16.0186 15.0731 16.1996 15.0053 16.3618C14.4333 17.729 13.0828 18.6896 11.5069 18.6896C9.93089 18.6896 8.58149 17.729 8.00841 16.3618C7.94066 16.1996 8.05173 16.0186 8.22609 16.0008C9.24786 15.8975 10.3529 15.8409 11.5069 15.8409C12.6608 15.8409 13.7648 15.8975 14.7876 16.0008Z" fill="currentColor" />
                        </svg>
                      </div>
                    </a>
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e734" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e734" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://x.com/neocondaoffic" target="_blank" className="social-icon_link w-inline-block">
                      <div className="social-icon w-embed">
                        <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.5627 1.82422H20.7956L13.7326 9.89673L22.0416 20.8816H15.5357L10.4401 14.2193L4.60951 20.8816H1.37464L8.92919 12.2471L0.958313 1.82422H7.62938L12.2354 7.91379L17.5627 1.82422ZM16.428 18.9465H18.2194L6.65598 3.65764H4.73363L16.428 18.9465Z" fill="currentColor" />
                        </svg>
                      </div>
                    </a>
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e736" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e736" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://www.tiktok.com/@neocondaofficial" target="_blank" className="social-icon_link w-inline-block">
                      <div className="social-icon w-embed">
                        <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16.3612 0H12.485V15.6666C12.485 17.5333 10.9942 19.0667 9.13894 19.0667C7.28368 19.0667 5.79285 17.5333 5.79285 15.6666C5.79285 13.8334 7.25055 12.3333 9.03957 12.2667V8.33335C5.09713 8.39998 1.91669 11.6333 1.91669 15.6666C1.91669 19.7334 5.16338 23 9.17208 23C13.1807 23 16.4274 19.7 16.4274 15.6666V7.63332C17.8851 8.70001 19.6741 9.33334 21.5625 9.36669V5.43333C18.6471 5.33334 16.3612 2.93333 16.3612 0Z" fill="currentColor" />
                        </svg>
                      </div>
                    </a>
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e738" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e738" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://www.youtube.com/@neocondaofficial" target="_blank" className="social-icon_link w-inline-block">
                      <div className="social-icon w-embed">
                        <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1200_955)">
                            <path d="M22.7709 6.89961C22.7709 6.89961 22.5463 5.31387 21.8545 4.61758C20.9785 3.70117 19.9992 3.69668 19.55 3.64277C16.3336 3.40918 11.5045 3.40918 11.5045 3.40918H11.4955C11.4955 3.40918 6.66641 3.40918 3.45 3.64277C3.00078 3.69668 2.02148 3.70117 1.14551 4.61758C0.453711 5.31387 0.233594 6.89961 0.233594 6.89961C0.233594 6.89961 0 8.76387 0 10.6236V12.3666C0 14.2264 0.229102 16.0906 0.229102 16.0906C0.229102 16.0906 0.453711 17.6764 1.14102 18.3727C2.01699 19.2891 3.16699 19.2576 3.6791 19.3564C5.5209 19.5316 11.5 19.5855 11.5 19.5855C11.5 19.5855 16.3336 19.5766 19.55 19.3475C19.9992 19.2936 20.9785 19.2891 21.8545 18.3727C22.5463 17.6764 22.7709 16.0906 22.7709 16.0906C22.7709 16.0906 23 14.2309 23 12.3666V10.6236C23 8.76387 22.7709 6.89961 22.7709 6.89961ZM9.12363 14.4824V8.01816L15.3363 11.2615L9.12363 14.4824Z" fill="currentColor" />
                          </g>
                          <defs>
                            <clipPath id="clip0_1200_955">
                              <rect width="23" height="23" fill="currentColor" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </a>
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e73a" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e73a" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="https://t.me/neoconda" target="_blank" className="social-icon_link w-inline-block">
                      <div className="social-icon w-embed">
                        <svg width="100%" height="100%" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1200_953)">
                            <path fillRule="evenodd" clipRule="evenodd" d="M24 11.5C24 17.8513 18.6274 23 12 23C5.37258 23 0 17.8513 0 11.5C0 5.14873 5.37258 0 12 0C18.6274 0 24 5.14873 24 11.5ZM12.43 8.48981C11.2628 8.95505 8.93014 9.91798 5.43189 11.3786C4.86383 11.5951 4.56626 11.8069 4.53917 12.014C4.49339 12.3639 4.95071 12.5017 5.57347 12.6894C5.65818 12.7149 5.74595 12.7414 5.83594 12.7694C6.44864 12.9603 7.27283 13.1836 7.70129 13.1924C8.08994 13.2005 8.52373 13.0469 9.00264 12.7318C12.2712 10.6174 13.9584 9.54865 14.0643 9.52561C14.139 9.50936 14.2426 9.48892 14.3128 9.54869C14.3829 9.60845 14.376 9.72164 14.3686 9.752C14.3233 9.93709 12.5281 11.5365 11.5991 12.3642C11.3095 12.6222 11.1041 12.8053 11.0621 12.8471C10.968 12.9407 10.8721 13.0293 10.78 13.1144C10.2108 13.6403 9.78391 14.0346 10.8036 14.6786C11.2936 14.9881 11.6858 15.244 12.077 15.4993C12.5042 15.7781 12.9303 16.0562 13.4816 16.4025C13.6221 16.4908 13.7562 16.5824 13.8869 16.6717C14.3841 17.0114 14.8307 17.3165 15.3826 17.2679C15.7032 17.2396 16.0345 16.9506 16.2027 16.0888C16.6002 14.0522 17.3816 9.63935 17.5622 7.82093C17.578 7.66162 17.5581 7.45772 17.5422 7.36822C17.5262 7.27871 17.4928 7.15119 17.3714 7.05678C17.2276 6.94498 17.0056 6.9214 16.9064 6.92308C16.455 6.9307 15.7626 7.16145 12.43 8.48981Z" fill="currentColor" />
                          </g>
                          <defs>
                            <clipPath id="clip0_1200_953">
                              <rect width="24" height="23" fill="currentColor" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </a>
                  </div>
                  <div id="w-node-_83b66b22-4b3e-6103-c8fc-6bc59024e73c-9024e6ff" className="footer-privacy_links">
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e73d" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e73d" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="/privacy-policy" aria-current="page" className="footer_policy-text hide-mobile-landscape w--current">
                      {"PRIVACY POLICY"}
                    </a>
                    <a data-wf-native-id-path="ce5eeb70-7f4b-b844-4b73-e6935d7ebf95:83b66b22-4b3e-6103-c8fc-6bc59024e73f" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e73f" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%22ce5eeb70-7f4b-b844-4b73-e6935d7ebf95%22%7D%5D" href="/terms-of-service" className="footer_policy-text hide-mobile-landscape">
                      {"TERMS OF SERVICE"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <a data-wf-native-id-path="50262846-68c0-162e-a71b-d612068bf9eb" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="50262846-68c0-162e-a71b-d612068bf9eb" href="#page" className="scroll-to-top w-inline-block">
        <div className="arrow-top w-embed">
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.93994e-05 12.0684L23.7542 12.0684" stroke="white" />
            <path d="M15.0082 21.1964L24.1362 12.0684L15.0082 2.94034" stroke="white" />
          </svg>
        </div>
      </a>
    </div>

    <div className="code-embed w-embed">
      <style dangerouslySetInnerHTML={{ __html: "\n/* Targets screens that are larger than 1920px */\n@media screen and (min-width: 1921px) {\n  html {\n    /* Adjust this percentage to whatever size you need */\n    font-size: 110%; \n  }\n}\n" }} />
    </div>
    </>
  );
}
