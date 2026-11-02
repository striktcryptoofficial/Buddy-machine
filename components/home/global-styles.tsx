export function GlobalStyles() {
  return (
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
      <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style={{"position":"absolute"}}>
        <filter id="features-plate" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix type="matrix" values="0 0 0 0 0.49412  0 0 0 0 0.49412  0 0 0 0 1  0 0 0 1 0" />
        </filter>
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
  );
}
