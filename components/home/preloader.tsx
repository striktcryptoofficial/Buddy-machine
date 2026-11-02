export function Preloader() {
  return (
    <div id="preloader" className="preloader-wrapper">
      <div id="preloader-first" className="preloader-number-wrap">
        <div className="logo_preloader w-embed">
          <img src="/b-logo%20white.svg" alt="" />
        </div>
        <div className="preloader-load-wrap">
          <div className="preloader-num-text">
            {"LOADING"}
          </div>
          <div id="preloader-number" className="preloader-num">
            {"0%"}
          </div>
        </div>
      </div>
      <div id="pre-one" className="preloader-bg one" />
      <div id="pre-two" className="preloader-bg two" />
      <div id="pre-three" className="preloader-bg three" />
    </div>
  );
}
