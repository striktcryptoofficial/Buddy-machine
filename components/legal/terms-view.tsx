export function TermsView() {
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
                      {"Terms of Service"}
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
                        {"These Terms of Service (\"Terms,\" \"Agreement\") are a legally binding agreement between "}
                        <strong>
                          {"NEOCONDA LLC"}
                        </strong>
                        {", a limited liability company (\"Company,\" \"we,\" \"us,\" or \"our\"), and you, the individual or entity accessing or using the website located at neoconda.com and any associated subdomains (collectively, the \"Site\"). These Terms govern your access to and use of the Site and all content, features, and materials made available through it."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Please read these Terms carefully. By accessing, browsing, or otherwise using the Site, you confirm that you have read, understood, and agree to be bound by these Terms, including any additional policies referenced herein, such as our Privacy Policy. If you do not agree to these Terms in their entirety, you must discontinue your use of the Site immediately."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"1. Eligibility"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"By accessing or using the Site, you represent and warrant that:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"You are at least 13 years of age"}
                        </li>
                        <li>
                          {"You have the legal capacity to enter into a binding agreement"}
                        </li>
                        <li>
                          {"Your use of the Site complies with all applicable laws and regulations in your jurisdiction"}
                        </li>
                        <li>
                          {"You are not barred from accessing the Site under the laws of the United States or any other applicable jurisdiction"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"If you are accessing the Site on behalf of a company, organization, or other legal entity, you represent and warrant that you have the authority to bind that entity to these Terms, and \"you\" refers to both you individually and the entity you represent."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"2. Description of the Site"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Neoconda.com is an informational and marketing website operated by NEOCONDA LLC. The Site serves as a showcase for the Neoconda cybersecurity device, providing visitors with information about the product, its features, and the Company. The Site also includes:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"A launch countdown indicating the anticipated availability of the Neoconda device"}
                        </li>
                        <li>
                          {"Links to NEOCONDA LLC's official social media profiles"}
                        </li>
                        <li>
                          {"Contact forms that allow visitors to reach out to us directly"}
                        </li>
                        <li>
                          {"Email capture forms for users who wish to be notified upon product launch"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"The Site does not currently sell any products, subscriptions, or services. No financial transactions are conducted through neoconda.com at this time. All product specifications, features, timelines, and other details displayed on the Site are subject to change without notice."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"3. Intellectual Property Rights"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"3.1 Ownership"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"All content on the Site is the exclusive property of NEOCONDA LLC or its licensors and is protected by United States and international intellectual property laws, including copyright, trademark, trade dress, and patent laws. This includes, without limitation:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"The Neoconda name, wordmark, logo, and all associated brand assets"}
                        </li>
                        <li>
                          {"All written content, product descriptions, and marketing copy"}
                        </li>
                        <li>
                          {"Product renders, illustrations, photographs, and graphic design elements"}
                        </li>
                        <li>
                          {"The Site's overall design, layout, user interface, and visual appearance (trade dress)"}
                        </li>
                        <li>
                          {"Any videos, animations, or multimedia content displayed on the Site"}
                        </li>
                        <li>
                          {"All code, software, scripts, and technical elements underlying the Site"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"3.2 Limited License to Use the Site"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"NEOCONDA LLC grants you a limited, non-exclusive, non-transferable, revocable license to access and view the Site and its contents for personal, non-commercial informational purposes only. This license does not include the right to:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Copy, reproduce, or duplicate any content from the Site"}
                        </li>
                        <li>
                          {"Modify, translate, adapt, or create derivative works based on any content"}
                        </li>
                        <li>
                          {"Redistribute, resell, sublicense, or otherwise transfer any content to third parties"}
                        </li>
                        <li>
                          {"Remove or alter any copyright, trademark, or other proprietary notices"}
                        </li>
                        <li>
                          {"Use any content for commercial purposes without our prior written consent"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"3.3 Trademarks"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"The Neoconda name, logo, and all related branding are trademarks or service marks of NEOCONDA LLC. You may not use any of our trademarks, trade names, or logos without prior written permission. All other trademarks, service marks, and logos referenced on the Site are the property of their respective owners."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"3.4 User-Submitted Content"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"If you submit any content to us through contact forms, email, or other means (such as feedback, suggestions, or ideas), you grant NEOCONDA LLC a non-exclusive, royalty-free, perpetual, worldwide license to use, reproduce, and incorporate that content into our business operations, without any obligation to compensate you or keep the submission confidential, except as required by applicable law or our Privacy Policy."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"4. Acceptable Use"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"4.1 Permitted Uses"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"You may access and use the Site for lawful, personal, and non-commercial purposes, including viewing product information, submitting contact inquiries, and browsing publicly available content."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"4.2 Prohibited Uses"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"You agree that you will not, under any circumstances:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Use the Site for any purpose that is unlawful, harmful, fraudulent, deceptive, or prohibited by these Terms"}
                        </li>
                        <li>
                          {"Impersonate any person or entity, or falsely represent your affiliation with any person or entity, including NEOCONDA LLC"}
                        </li>
                        <li>
                          {"Use the Site to transmit, distribute, or upload spam, unsolicited commercial messages, or any other form of unwanted communication"}
                        </li>
                        <li>
                          {"Use automated tools, scripts, bots, crawlers, or scrapers to access, index, or harvest data from the Site without our prior written consent"}
                        </li>
                        <li>
                          {"Attempt to gain unauthorized access to any part of the Site, its underlying systems, databases, or servers"}
                        </li>
                        <li>
                          {"Probe, scan, or test the vulnerability of the Site or any related infrastructure without authorization"}
                        </li>
                        <li>
                          {"Interfere with, disrupt, or degrade the performance of the Site, its servers, or any networks connected to it"}
                        </li>
                        <li>
                          {"Introduce or attempt to introduce any viruses, worms, Trojan horses, ransomware, spyware, or other malicious code to the Site"}
                        </li>
                        <li>
                          {"Use the Site to engage in any form of unauthorized data collection, including harvesting email addresses or personal information from the Site"}
                        </li>
                        <li>
                          {"Circumvent or attempt to circumvent any security features, content restrictions, or access controls on the Site"}
                        </li>
                        <li>
                          {"Misrepresent the origin of any communication submitted through the Site"}
                        </li>
                        <li>
                          {"Use the Site in any manner that could damage the reputation of NEOCONDA LLC or any of its products, services, or personnel"}
                        </li>
                        <li>
                          {"Engage in any activity that violates the rights of third parties, including intellectual property rights, privacy rights, or rights of publicity"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"4.3 Consequences of Violations"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Violation of the acceptable use provisions may result in, at our sole discretion:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Blocking your IP address or otherwise restricting your access to the Site"}
                        </li>
                        <li>
                          {"Referral to law enforcement or regulatory authorities"}
                        </li>
                        <li>
                          {"Civil or criminal legal action, where applicable"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5. Contact Forms and Communications"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5.1 Accuracy of Information"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"When you submit a contact form or any other form on the Site, you agree to provide accurate, truthful, and complete information. You agree not to impersonate any person or provide false contact information."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5.2 No Confidentiality Obligation"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Unless we have a separate written agreement with you, any communications you submit through the Site are not treated as confidential. Please do not share proprietary, sensitive, or confidential information through the Site's contact forms unless you are comfortable with it being received and reviewed by NEOCONDA LLC personnel."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5.3 Right to Decline or Ignore"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"NEOCONDA LLC reserves the right, at its sole discretion, to decline to respond to, disregard, or delete any communications that are abusive, harassing, threatening, spam, irrelevant, or otherwise inappropriate."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"5.4 No Solicitations"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"You may not use our contact forms to solicit NEOCONDA LLC for the purchase of goods, services, or advertising. Unsolicited sales pitches, vendor outreach, or promotional messages submitted through contact forms will be disregarded."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"6. Product Information and Availability"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"6.1 Informational Nature of Content"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"All product descriptions, specifications, features, imagery, pricing indications, and availability timelines displayed on the Site are provided for informational and marketing purposes only. Nothing on the Site constitutes a binding offer, warranty, or guarantee of product availability or performance."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"6.2 Subject to Change"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"All product details are subject to change without notice. NEOCONDA LLC reserves the right to modify, delay, or cancel any planned product, feature, or launch at any time without liability to any visitor or prospective customer."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"6.3 No Purchase or Pre-Order"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"At this time, the Site does not facilitate the purchase, pre-order, or reservation of any product. Any future sales or pre-order functionality will be governed by separate terms and conditions that will be presented at the time of any such transaction."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"7. Third-Party Links and External Content"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"The Site may contain links to external websites, social media platforms, or other third-party resources. These links are provided as a convenience and for informational purposes only. NEOCONDA LLC does not endorse, control, or assume any responsibility for the content, privacy practices, accuracy, or availability of any third-party site or resource. Your access to and use of any third-party site is entirely at your own risk and is subject to that third party's own terms and conditions."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"We encourage you to review the terms of service and privacy policies of any third-party platforms you visit, including any social media platforms linked from the Site."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"8. Analytics and Tracking"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"The Site uses third-party analytics services, including Google Analytics 4 and Microsoft Clarity, to collect information about how visitors interact with the Site. By using the Site, you consent to the collection of such data as described in our Privacy Policy. These analytics services are operated by Google LLC and Microsoft Corporation, respectively, and are subject to their own terms of service and privacy policies."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"9. Disclaimer of Warranties"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE SITE AND ALL CONTENT, MATERIALS, INFORMATION, AND FEATURES PROVIDED THROUGH THE SITE ARE PROVIDED ON AN \"AS IS\" AND \"AS AVAILABLE\" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"NEOCONDA LLC EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT"}
                        </li>
                        <li>
                          {"WARRANTIES THAT THE SITE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR FREE FROM ERRORS, BUGS, OR VIRUSES"}
                        </li>
                        <li>
                          {"WARRANTIES AS TO THE ACCURACY, RELIABILITY, COMPLETENESS, OR CURRENCY OF ANY CONTENT ON THE SITE"}
                        </li>
                        <li>
                          {"WARRANTIES THAT ANY DEFECTS IN THE SITE WILL BE CORRECTED"}
                        </li>
                        <li>
                          {"WARRANTIES RELATED TO THE AVAILABILITY, PERFORMANCE, OR SECURITY OF ANY LINKED THIRD-PARTY SITES"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"YOUR USE OF THE SITE IS ENTIRELY AT YOUR OWN RISK. NO INFORMATION OBTAINED FROM THE SITE SHALL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THESE TERMS."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"10. Limitation of Liability"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL NEOCONDA LLC, ITS MEMBERS, MANAGERS, OFFICERS, EMPLOYEES, AGENTS, CONTRACTORS, SUCCESSORS, OR ASSIGNS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES"}
                        </li>
                        <li>
                          {"LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES"}
                        </li>
                        <li>
                          {"COST OF SUBSTITUTE GOODS OR SERVICES"}
                        </li>
                        <li>
                          {"DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SITE"}
                        </li>
                        <li>
                          {"DAMAGES ARISING FROM ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS OR ANY PERSONAL INFORMATION STORED THEREIN"}
                        </li>
                        <li>
                          {"DAMAGES ARISING FROM ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SITE"}
                        </li>
                        <li>
                          {"DAMAGES ARISING FROM BUGS, VIRUSES, OR OTHER HARMFUL COMPONENTS THAT MAY BE TRANSMITTED THROUGH THE SITE"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"THIS LIMITATION APPLIES REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE) AND EVEN IF NEOCONDA LLC HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"IN JURISDICTIONS WHERE LIMITATIONS ON LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES ARE NOT PERMITTED, OUR LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"IN NO EVENT SHALL NEOCONDA LLC'S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE SITE EXCEED ONE HUNDRED UNITED STATES DOLLARS ($100.00)."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"11. Indemnification"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"You agree to defend, indemnify, and hold harmless NEOCONDA LLC and its members, managers, officers, employees, agents, contractors, licensors, successors, and assigns from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or in connection with:"}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <ul role="list">
                        <li>
                          {"Your access to or use of the Site"}
                        </li>
                        <li>
                          {"Your violation of any provision of these Terms"}
                        </li>
                        <li>
                          {"Your violation of any applicable law, regulation, or third-party right, including any intellectual property right or privacy right"}
                        </li>
                        <li>
                          {"Any content or information you submit through the Site"}
                        </li>
                        <li>
                          {"Your misrepresentation of any information provided to NEOCONDA LLC"}
                        </li>
                      </ul>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"NEOCONDA LLC reserves the right to assume exclusive control of the defense of any matter subject to indemnification by you, in which case you agree to cooperate with our defense at your own expense."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"12. Governing Law"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"These Terms and any dispute arising out of or relating to these Terms or your use of the Site shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law principles."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"13. Dispute Resolution"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"13.1 Informal Resolution"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Before filing any formal legal claim, you agree to first contact NEOCONDA LLC at hello@neoconda.com and provide a written description of the dispute, your proposed resolution, and your contact information. We will attempt to resolve the dispute informally within 30 days of receipt of your notice."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"13.2 Binding Arbitration"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"If the dispute is not resolved informally, you and NEOCONDA LLC agree that any dispute, claim, or controversy arising out of or relating to these Terms or the Site shall be resolved through binding individual arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules, rather than in a court of law. The arbitration shall take place in Santa Clara County, California, unless otherwise agreed."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"13.3 Class Action Waiver"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"YOU AND NEOCONDA LLC AGREE THAT EACH PARTY MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE ACTION. You expressly waive your right to bring or participate in any class action, class-wide arbitration, or representative proceeding."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"13.4 Exceptions"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Not with standing the arbitration agreement above, either party may bring an individual action in small claims court. NEOCONDA LLC also reserves the right to seek injunctive or other equitable relief in a court of competent jurisdiction to prevent or restrain any infringement of intellectual property rights or other imminent harm."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"13.5 Jurisdiction for Non-Arbitrated Claims"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"For any claims not subject to arbitration under these Terms, you agree to submit to the personal and exclusive jurisdiction of the state and federal courts located in Santa Clara County, California."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"14. Severability"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"If any provision of these Terms is found to be invalid, illegal, or unenforceable under applicable law, such provision shall be modified to the minimum extent necessary to make it enforceable, or if modification is not possible, it shall be severed from these Terms. The remaining provisions shall continue in full force and effect and shall be interpreted to carry out the original intent of the parties as closely as possible."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"15. Waiver"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"The failure of NEOCONDA LLC to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision. No waiver of any term shall be deemed a further or continuing waiver of such term or any other term. Any waiver must be in writing and signed by an authorized representative of NEOCONDA LLC to be effective."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"16. Entire Agreement"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"These Terms, together with our Privacy Policy and any other legal notices or policies published by NEOCONDA LLC on the Site, constitute the entire agreement between you and NEOCONDA LLC with respect to your use of the Site and supersede all prior agreements, understandings, negotiations, and discussions, whether oral or written, between you and NEOCONDA LLC relating to the subject matter herein."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"17. Assignment"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"You may not assign or transfer these Terms or any rights or obligations hereunder without the prior written consent of NEOCONDA LLC. NEOCONDA LLC may freely assign or transfer these Terms in connection with a merger, acquisition, sale of assets, or by operation of law, without restriction or notice to you."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"18. Force Majeure"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"NEOCONDA LLC shall not be liable for any failure or delay in performance of its obligations under these Terms arising from causes beyond its reasonable control, including but not limited to acts of God, natural disasters, pandemics, government actions, internet infrastructure failures, cyberattacks, power outages, labor disputes, or other events that reasonably could not have been anticipated or prevented."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"19. No Agency or Partnership"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Nothing in these Terms shall be construed to create a partnership, joint venture, employment, franchise, or agency relationship between you and NEOCONDA LLC. You do not have authority to bind NEOCONDA LLC to any obligation."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"20. Notices"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"Any notices or communications required or permitted under these Terms shall be provided in writing. Notices to NEOCONDA LLC should be sent to hello@neoconda.com. We may provide notices to you through the Site or via any email address you have provided to us. Notices are effective upon transmission."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"21. Export Compliance"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"The Site and any related technical information may be subject to U.S. export control laws and regulations. By using the Site, you represent that you are not located in a country subject to a U.S. government embargo and that you are not on any U.S. government list of prohibited or restricted parties."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"22. Changes to These Terms"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"NEOCONDA LLC reserves the right to revise, update, or modify these Terms at any time at our sole discretion. When we make changes, we will update the \"Last Updated\" date at the top of this page. If we make material changes to these Terms, we will make reasonable efforts to provide notice on the Site. Your continued use of the Site following the posting of revised Terms constitutes your acceptance of the updated Terms. If you do not agree to the revised Terms, you must stop using the Site."}
                      </p>
                      <p>
                        {"‍"}
                      </p>
                      <h2>
                        <strong>
                          {"23. Contact Us"}
                        </strong>
                      </h2>
                      <p>
                        {"‍"}
                      </p>
                      <p>
                        {"If you have any questions, concerns, or requests related to these Terms of Service, please contact us:"}
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
                        {"We will make every effort to respond to your inquiry in a timely manner."}
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
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e71c" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e71c" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="/privacy-policy" className="footer_policy-text">
                      {"PRIVACY POLICY"}
                    </a>
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e71e" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e71e" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="/terms-of-service" aria-current="page" className="footer_policy-text w--current">
                      {"TERMS OF SERVICE"}
                    </a>
                    <div className="footer_social-icons">
                      <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:126bb547-eda1-067b-477c-c92d9ebf1539" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf1539" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://www.instagram.com/neocondaofficial/" target="_blank" className="social-icon_link w-inline-block">
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
                      <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:126bb547-eda1-067b-477c-c92d9ebf153b" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf153b" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://discord.com/" target="_blank" className="social-icon_link w-inline-block">
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
                      <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:126bb547-eda1-067b-477c-c92d9ebf153d" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf153d" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://www.reddit.com/r/neoconda/" target="_blank" className="social-icon_link w-inline-block">
                        <div className="social-icon w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.3923 4.07833C14.6388 5.12342 15.5773 5.90197 16.6979 5.90197C18.0062 5.90197 19.0669 4.84133 19.0669 3.53302C19.0669 2.2247 18.0062 1.16406 16.6979 1.16406C15.554 1.16406 14.5999 1.97482 14.3778 3.05323C12.462 3.25869 10.966 4.88353 10.966 6.85266C10.966 6.8571 10.966 6.86043 10.966 6.86487C8.88247 6.95261 6.97998 7.54568 5.46953 8.48194C4.90867 8.04769 4.20454 7.78891 3.44043 7.78891C1.6068 7.78891 0.120789 9.27492 0.120789 11.1086C0.120789 12.4391 0.902665 13.5852 2.03217 14.115C2.14212 17.9689 6.34137 21.0686 11.5069 21.0686C16.6724 21.0686 20.8772 17.9655 20.9816 14.1083C22.1022 13.5752 22.8774 12.4324 22.8774 11.1097C22.8774 9.27603 21.3914 7.79002 19.5578 7.79002C18.797 7.79002 18.0962 8.04658 17.5364 8.4775C16.0126 7.53458 14.0891 6.94151 11.9844 6.86265C11.9844 6.85932 11.9844 6.8571 11.9844 6.85377C11.9844 5.44328 13.0329 4.27269 14.3923 4.08055V4.07833ZM5.33626 13.2154C5.39179 12.0115 6.19144 11.0875 7.12103 11.0875C8.05061 11.0875 8.76141 12.0637 8.70588 13.2676C8.65035 14.4715 7.95621 14.9091 7.02551 14.9091C6.09481 14.9091 5.28073 14.4193 5.33626 13.2154ZM15.8938 11.0875C16.8245 11.0875 17.6242 12.0115 17.6786 13.2154C17.7341 14.4193 16.9189 14.9091 15.9893 14.9091C15.0597 14.9091 14.3645 14.4726 14.309 13.2676C14.2534 12.0637 14.9631 11.0875 15.8938 11.0875ZM14.7876 16.0008C14.962 16.0186 15.0731 16.1996 15.0053 16.3618C14.4333 17.729 13.0828 18.6896 11.5069 18.6896C9.93089 18.6896 8.58149 17.729 8.00841 16.3618C7.94066 16.1996 8.05173 16.0186 8.22609 16.0008C9.24786 15.8975 10.3529 15.8409 11.5069 15.8409C12.6608 15.8409 13.7648 15.8975 14.7876 16.0008Z" fill="currentColor" />
                          </svg>
                        </div>
                      </a>
                      <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:126bb547-eda1-067b-477c-c92d9ebf153f" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf153f" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://x.com/neocondaoffic" target="_blank" className="social-icon_link w-inline-block">
                        <div className="social-icon w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5627 1.82422H20.7956L13.7326 9.89673L22.0416 20.8816H15.5357L10.4401 14.2193L4.60951 20.8816H1.37464L8.92919 12.2471L0.958313 1.82422H7.62938L12.2354 7.91379L17.5627 1.82422ZM16.428 18.9465H18.2194L6.65598 3.65764H4.73363L16.428 18.9465Z" fill="currentColor" />
                          </svg>
                        </div>
                      </a>
                      <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:126bb547-eda1-067b-477c-c92d9ebf1541" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf1541" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://www.tiktok.com/@neocondaofficial" target="_blank" className="social-icon_link w-inline-block">
                        <div className="social-icon w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.3612 0H12.485V15.6666C12.485 17.5333 10.9942 19.0667 9.13894 19.0667C7.28368 19.0667 5.79285 17.5333 5.79285 15.6666C5.79285 13.8334 7.25055 12.3333 9.03957 12.2667V8.33335C5.09713 8.39998 1.91669 11.6333 1.91669 15.6666C1.91669 19.7334 5.16338 23 9.17208 23C13.1807 23 16.4274 19.7 16.4274 15.6666V7.63332C17.8851 8.70001 19.6741 9.33334 21.5625 9.36669V5.43333C18.6471 5.33334 16.3612 2.93333 16.3612 0Z" fill="currentColor" />
                          </svg>
                        </div>
                      </a>
                      <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:126bb547-eda1-067b-477c-c92d9ebf1543" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf1543" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://www.youtube.com/@neocondaofficial" target="_blank" className="social-icon_link w-inline-block">
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
                      <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:126bb547-eda1-067b-477c-c92d9ebf1545" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="126bb547-eda1-067b-477c-c92d9ebf1545" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://t.me/neoconda" target="_blank" className="social-icon_link w-inline-block">
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
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e72e" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e72e" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://www.instagram.com/neocondaofficial/" target="_blank" className="social-icon_link w-inline-block">
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
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e730" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e730" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://discord.com/" target="_blank" className="social-icon_link w-inline-block">
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
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e732" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e732" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://www.reddit.com/r/neoconda/" target="_blank" className="social-icon_link w-inline-block">
                      <div className="social-icon w-embed">
                        <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14.3923 4.07833C14.6388 5.12342 15.5773 5.90197 16.6979 5.90197C18.0062 5.90197 19.0669 4.84133 19.0669 3.53302C19.0669 2.2247 18.0062 1.16406 16.6979 1.16406C15.554 1.16406 14.5999 1.97482 14.3778 3.05323C12.462 3.25869 10.966 4.88353 10.966 6.85266C10.966 6.8571 10.966 6.86043 10.966 6.86487C8.88247 6.95261 6.97998 7.54568 5.46953 8.48194C4.90867 8.04769 4.20454 7.78891 3.44043 7.78891C1.6068 7.78891 0.120789 9.27492 0.120789 11.1086C0.120789 12.4391 0.902665 13.5852 2.03217 14.115C2.14212 17.9689 6.34137 21.0686 11.5069 21.0686C16.6724 21.0686 20.8772 17.9655 20.9816 14.1083C22.1022 13.5752 22.8774 12.4324 22.8774 11.1097C22.8774 9.27603 21.3914 7.79002 19.5578 7.79002C18.797 7.79002 18.0962 8.04658 17.5364 8.4775C16.0126 7.53458 14.0891 6.94151 11.9844 6.86265C11.9844 6.85932 11.9844 6.8571 11.9844 6.85377C11.9844 5.44328 13.0329 4.27269 14.3923 4.08055V4.07833ZM5.33626 13.2154C5.39179 12.0115 6.19144 11.0875 7.12103 11.0875C8.05061 11.0875 8.76141 12.0637 8.70588 13.2676C8.65035 14.4715 7.95621 14.9091 7.02551 14.9091C6.09481 14.9091 5.28073 14.4193 5.33626 13.2154ZM15.8938 11.0875C16.8245 11.0875 17.6242 12.0115 17.6786 13.2154C17.7341 14.4193 16.9189 14.9091 15.9893 14.9091C15.0597 14.9091 14.3645 14.4726 14.309 13.2676C14.2534 12.0637 14.9631 11.0875 15.8938 11.0875ZM14.7876 16.0008C14.962 16.0186 15.0731 16.1996 15.0053 16.3618C14.4333 17.729 13.0828 18.6896 11.5069 18.6896C9.93089 18.6896 8.58149 17.729 8.00841 16.3618C7.94066 16.1996 8.05173 16.0186 8.22609 16.0008C9.24786 15.8975 10.3529 15.8409 11.5069 15.8409C12.6608 15.8409 13.7648 15.8975 14.7876 16.0008Z" fill="currentColor" />
                        </svg>
                      </div>
                    </a>
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e734" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e734" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://x.com/neocondaoffic" target="_blank" className="social-icon_link w-inline-block">
                      <div className="social-icon w-embed">
                        <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.5627 1.82422H20.7956L13.7326 9.89673L22.0416 20.8816H15.5357L10.4401 14.2193L4.60951 20.8816H1.37464L8.92919 12.2471L0.958313 1.82422H7.62938L12.2354 7.91379L17.5627 1.82422ZM16.428 18.9465H18.2194L6.65598 3.65764H4.73363L16.428 18.9465Z" fill="currentColor" />
                        </svg>
                      </div>
                    </a>
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e736" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e736" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://www.tiktok.com/@neocondaofficial" target="_blank" className="social-icon_link w-inline-block">
                      <div className="social-icon w-embed">
                        <svg width="100%" height="100%" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16.3612 0H12.485V15.6666C12.485 17.5333 10.9942 19.0667 9.13894 19.0667C7.28368 19.0667 5.79285 17.5333 5.79285 15.6666C5.79285 13.8334 7.25055 12.3333 9.03957 12.2667V8.33335C5.09713 8.39998 1.91669 11.6333 1.91669 15.6666C1.91669 19.7334 5.16338 23 9.17208 23C13.1807 23 16.4274 19.7 16.4274 15.6666V7.63332C17.8851 8.70001 19.6741 9.33334 21.5625 9.36669V5.43333C18.6471 5.33334 16.3612 2.93333 16.3612 0Z" fill="currentColor" />
                        </svg>
                      </div>
                    </a>
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e738" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e738" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://www.youtube.com/@neocondaofficial" target="_blank" className="social-icon_link w-inline-block">
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
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e73a" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e73a" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="https://t.me/neoconda" target="_blank" className="social-icon_link w-inline-block">
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
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e73d" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e73d" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="/privacy-policy" className="footer_policy-text hide-mobile-landscape">
                      {"PRIVACY POLICY"}
                    </a>
                    <a data-wf-native-id-path="48912259-6157-a5f8-c3c1-e66952f86ec4:83b66b22-4b3e-6103-c8fc-6bc59024e73f" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="83b66b22-4b3e-6103-c8fc-6bc59024e73f" data-wf-component-context="%5B%7B%22componentId%22%3A%2283b66b22-4b3e-6103-c8fc-6bc59024e6ff%22%2C%22instanceId%22%3A%2248912259-6157-a5f8-c3c1-e66952f86ec4%22%7D%5D" href="/terms-of-service" aria-current="page" className="footer_policy-text hide-mobile-landscape w--current">
                      {"TERMS OF SERVICE"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <a data-wf-native-id-path="6f37635b-d3dc-de97-e184-6682a489a3e0" data-wf-ao-click-engagement-tracking="true" data-wf-element-id="6f37635b-d3dc-de97-e184-6682a489a3e0" href="#page" className="scroll-to-top w-inline-block">
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
