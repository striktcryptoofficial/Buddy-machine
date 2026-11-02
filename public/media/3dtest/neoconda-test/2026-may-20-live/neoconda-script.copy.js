function getNeocondaLoadRegistry() {
  if (!window.__neocondaLoadRegistry) {
    const listeners = new Set();
    window.__neocondaLoadRegistry = {
      scripts: Object.create(null),
      models: Object.create(null),
      tasks: Object.create(null),
      notify() {
        listeners.forEach((listener) => listener());
      },
      setTaskProgress(key, progress) {
        const nextProgress = Math.max(0, Math.min(progress, 1));
        if (this.tasks[key] === nextProgress) return;
        this.tasks[key] = nextProgress;
        this.notify();
      },
      getTaskProgress(key) {
        return this.tasks[key] ?? 0;
      },
      markScriptReady(key) {
        this.scripts[key] = true;
        this.setTaskProgress(`script:${key}`, 1);
      },
      markModelReady(key) {
        this.models[key] = true;
        this.setTaskProgress(`model:${key}`, 1);
      },
      setModelProgress(key, loaded, total) {
        if (Number.isFinite(total) && total > 0) {
          this.setTaskProgress(`model:${key}`, loaded / total);
        } else if (loaded > 0) {
          this.setTaskProgress(
            `model:${key}`,
            Math.max(this.getTaskProgress(`model:${key}`), 0.05),
          );
        }
      },
      markDomReady(key) {
        this.setTaskProgress(`dom:${key}`, 1);
      },
      isScriptReady(key) {
        return !!this.scripts[key];
      },
      isModelReady(key) {
        return !!this.models[key];
      },
      getCombinedProgress(taskDefs) {
        if (!taskDefs.length) return 0;


        let completedWeight = 0;
        let totalWeight = 0;


        taskDefs.forEach(({ key, weight = 1 }) => {
          totalWeight += weight;
          completedWeight += this.getTaskProgress(key) * weight;
        });


        return totalWeight > 0 ? completedWeight / totalWeight : 0;
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
  }


  return window.__neocondaLoadRegistry;
}


getNeocondaLoadRegistry().markScriptReady("neoconda-script.copy");


document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav_component");
  const navButton = document.querySelector(".nav_button");




  if (nav) {
    nav.style.transition = "background 0.3s ease";
  }




  // Centralized function to calculate logic and apply styles
  const updateNavBackground = () => {
    if (!nav) return;




    const currentScrollY = window.scrollY;




    // 1 & 2: Calculate threshold based on screen width
    // Above 991px -> 200vh (height * 2) | 991px and below -> 5vh (height * 0.05)
    const scrollThreshold =
      window.innerWidth > 991
        ? window.innerHeight * 2
        : window.innerHeight * 0.05;




    // 3: Check if the menu is currently open
    const isMenuOpen = navButton && navButton.classList.contains("w--open");




    // Use solid black while the menu is open so page content does not show through.
    if (isMenuOpen) {
      nav.style.backgroundImage = "none";
      nav.style.backgroundColor = "#000";
    } else if (currentScrollY > scrollThreshold) {
      nav.style.backgroundImage =
        "linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%)";
      nav.style.backgroundColor = "transparent";
    } else {
      nav.style.backgroundImage = "none";
      nav.style.backgroundColor = "transparent";
    }
  };




  // Run on initial load to catch users reloading halfway down a page
  updateNavBackground();




  // Scroll Event Listener
  let isTicking = false;
  window.addEventListener("scroll", () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateNavBackground();
        isTicking = false;
      });
      isTicking = true;
    }
  });




  // Resize Listener: Recalculates thresholds if user flips their phone or resizes browser
  window.addEventListener("resize", () => {
    window.requestAnimationFrame(() => {
      updateNavBackground();
    });
  });




  // MutationObserver: Watches the nav button for Webflow's class changes
  if (navButton) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateNavBackground(); // Triggers immediately when "w--open" is added/removed
        }
      });
    });




    // Tell observer to only look at attributes (classes) on the button
    observer.observe(navButton, { attributes: true });
  }
});




document.addEventListener("DOMContentLoaded", () => {
  // --- EXISTING LOGIC FOR NAV BACKGROUND ---
  const nav = document.querySelector(".nav_component");
  const navButton = document.querySelector(".nav_button");




  if (nav) {
    nav.style.transition = "background 0.3s ease";
  }




  const updateNavBackground = () => {
    if (!nav) return;




    const currentScrollY = window.scrollY;




    // Threshold calculation
    const scrollThreshold =
      window.innerWidth > 991
        ? window.innerHeight * 2
        : window.innerHeight * 0.05;




    // Menu open state
    const isMenuOpen = navButton && navButton.classList.contains("w--open");




    // Use solid black while the menu is open so page content does not show through.
    if (isMenuOpen) {
      nav.style.backgroundImage = "none";
      nav.style.backgroundColor = "#000";
    } else if (currentScrollY > scrollThreshold) {
      nav.style.backgroundImage =
        "linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%)";
      nav.style.backgroundColor = "transparent";
    } else {
      nav.style.backgroundImage = "none";
      nav.style.backgroundColor = "transparent";
    }
  };




  updateNavBackground(); // Initial check




  let isTicking = false;
  window.addEventListener("scroll", () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateNavBackground();
        isTicking = false;
      });
      isTicking = true;
    }
  });




  if (navButton) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateNavBackground();
        }
      });
    });
    observer.observe(navButton, { attributes: true });
  }




  // --- NEW LOGIC FOR DATA-REVEAL ATTRIBUTE ---
  const sliderCards = document.querySelectorAll(".section_slider-card");




  const updateSliderDataAttributes = () => {
    // Only run if the elements exist on the page
    if (sliderCards.length === 0) return;




    if (window.innerWidth <= 767) {
      // Screen is 767px or below: Add the attribute
      sliderCards.forEach((card) => {
        card.setAttribute("data-reveal", "block");
      });
    } else {
      // Screen is above 767px: Remove the attribute (keeps the DOM clean)
      sliderCards.forEach((card) => {
        card.removeAttribute("data-reveal");
      });
    }
  };




  updateSliderDataAttributes(); // Initial check for attributes




  // --- COMBINED RESIZE LISTENER ---
  window.addEventListener("resize", () => {
    window.requestAnimationFrame(() => {
      updateNavBackground(); // Recalculate nav thresholds
      updateSliderDataAttributes(); // Recalculate slider attributes
    });
  });
});




gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });




let video = null;
let lottiePlayer = null;
let lottieControlInitialized = false;




// --- CONFIGURATION ---
const VIDEO_FPS = 30;
const DEBUG_MARKERS = false;
const DEBUG_LOGS = false; // Set to false to hide console logs
const SCRUB_SMOOTHING = 0.5;




const frameToSec = (frame) => frame / VIDEO_FPS;


function refreshLottieElements() {
  video = document.getElementById("scroll-video");
  lottiePlayer =
    document.querySelector(".lottie-container dotlottie-player") ||
    document.querySelector("dotlottie-player");

  return !!video;
}




function initLottieControl() {
  refreshLottieElements();
  if (!video) return;
  if (lottieControlInitialized) return;
  lottieControlInitialized = true;




  let isIntroComplete = false;
  let lottieAnim = null;
  let lottieTotalFrames = 0;




  let ticking = false;
  let latestFrame = 0;
  let latestLottiePct = 0;




  // --- RENDER & LOGGING LOGIC ---
  function renderFrame() {
    // 1. Update Video
    video.currentTime = frameToSec(latestFrame);




    // 2. Update Lottie
    let currentLottieFrame = 0;
    if (ensureLottieReady()) {
      const pct = latestLottiePct / 100;
      currentLottieFrame = pct * (lottieTotalFrames - 1);
      lottieAnim.goToAndStop(currentLottieFrame, true);
    }




    ticking = false;
  }




  const syncState = (frame, lottiePct = 0) => {
    latestFrame = frame;
    latestLottiePct = lottiePct;
    if (!ticking) {
      requestAnimationFrame(renderFrame);
      ticking = true;
    }
  };




  function cacheLottie() {
    refreshLottieElements();
    lottieAnim = lottiePlayer?.getLottie?.() || null;
    if (lottieAnim) {
      lottieTotalFrames =
        lottieAnim.totalFrames ?? lottieAnim.getDuration?.(true) ?? 0;
      try {
        lottieAnim.pause?.();
      } catch (e) {}
    }

    return !!lottieAnim && lottieTotalFrames > 0;
  }


  function ensureLottieReady() {
    if (lottieAnim && lottieTotalFrames > 0) return true;
    return cacheLottie();
  }




  cacheLottie();
  ["load", "ready", "complete"].forEach((eventName) => {
    lottiePlayer?.addEventListener?.(eventName, () => {
      if (cacheLottie()) syncState(latestFrame, latestLottiePct);
    });
  });
  if (lottiePlayer) gsap.set(lottiePlayer, { opacity: 0 });


  const hasTrigger = (target) => {
    if (!target) return false;
    if (typeof target === "string") return !!document.querySelector(target);
    return !!target;
  };




  // =========================================================
  // PHASE 1: Auto-play
  // =========================================================
  const introState = { frame: 0 };
  if (hasTrigger(".sticky-block-grid")) {
    ScrollTrigger.create({
      id: "PHASE-1",
      trigger: ".sticky-block-grid",
      start: "top 50%",
      once: true,
      markers: false, // Markers enabled
      onEnter: () => {
        gsap.to(introState, {
          frame: 50,
          duration: 2,
          ease: "power1.inOut",
          onUpdate: () => {
            // console.log("Phase 1 Frame:", Math.round(introState.frame));
            syncState(Math.round(introState.frame));
          },
          onComplete: () => {
            isIntroComplete = true;
          },
        });
      },
    });
  }




  // =========================================================
  // PHASES 2, 3, 5: Scrubbing Logic
  // =========================================================
  const createScrubPhase = (
    id,
    trigger,
    start,
    end,
    startFrame,
    endFrame,
    endTrigger = null,
    showMarkers = false,
  ) => {
    if (!hasTrigger(trigger)) return;


    let obj = { frame: startFrame };
    gsap.to(obj, {
      frame: endFrame,
      ease: "none",
      scrollTrigger: {
        id: id,
        trigger: trigger,
        endTrigger: endTrigger,
        start: start,
        end: end,
        scrub: true,
        fastScrollEnd: true,
        overwrite: "auto",
        markers: showMarkers,
        onUpdate: () => {
          if (isIntroComplete) {
            let currentFrame = Math.round(obj.frame);
            // console.log(`Scrub ${id} Frame:`, currentFrame, `| Range: ${startFrame}-${endFrame}`);
            syncState(currentFrame);
          }
        },
      },
    });
  };




  createScrubPhase(
    "PHASE-2",
    ".sticky-block-grid",
    "top 20%",
    "bottom top",
    50,
    160,
  );




  createScrubPhase(
    "PHASE-3",
    "#lottiee-section",
    "top bottom",
    "top top",
    160,
    199,
  );




  // =========================================================
  // PHASE 4: Unified Split Sync (Timeline)
  // =========================================================
  const phase4Proxy = { frame: 199, lottiePct: 0 };
  if (hasTrigger("#trigger-2")) {
    const tlPhase4 = gsap.timeline({
      scrollTrigger: {
        id: "PHASE-4",
        trigger: "#trigger-2",
        start: "top bottom",
        end: () => "+=" + window.innerHeight * 2,
        scrub: true,
        fastScrollEnd: true,
        markers: false,
        onEnter: () => {
          cacheLottie();
          if (lottiePlayer) gsap.to(lottiePlayer, { opacity: 1, duration: 0.3 });
        },
        onLeaveBack: () => {
          refreshLottieElements();
          if (lottiePlayer) gsap.to(lottiePlayer, { opacity: 0, duration: 0.3 });
        },
        onUpdate: () => {
          if (isIntroComplete) {
            let currentFrame = Math.round(phase4Proxy.frame);
            // console.log(
            //   "Phase 4 Frame:",
            //   currentFrame,
            //   "| Lottie Pct:",
            //   Math.round(phase4Proxy.lottiePct),
            // );
            syncState(currentFrame, phase4Proxy.lottiePct);
          }
        },
      },
    });


    // Part A: Frame 199 to 397, Lottie 0% to 14%
    tlPhase4.to(phase4Proxy, { frame: 397, lottiePct: 14, duration: 0.6, ease: "none" });


    // Part B: Frame 397 to 415, Lottie 14% to 29%
    tlPhase4.to(phase4Proxy, { frame: 500, lottiePct: 29, duration: 0.4, ease: "none" });
  }




  // =========================================================
  // PHASE 5: Final Cleanup
  // =========================================================
  createScrubPhase(
    "PHASE-5",
    "#router-details",
    "top center",
    "70% top",
    500,
    680,
    null,
    false,
  );


  // =========================================================
  // HOME DEFENCE CONTENT: Animate the heading and text block inside
  // the wrapper one after another when #router-details top crosses
  // 80% of the viewport from the top, then reverse on scroll up.
  // =========================================================
  const homeDefenceContentWrap = document.querySelector(".home_defence-content-wrap");
  const lottieContainer = document.querySelector(".lottie-container");


  ScrollTrigger.matchMedia({
    "(min-width: 768px)": () => {
      if (homeDefenceContentWrap) {
        const homeDefenceHeading = homeDefenceContentWrap.querySelector(
          "h1, h2, h3, h4, h5, h6",
        );
        const homeDefenceTextBlock = homeDefenceContentWrap.querySelector(
          "div",
        );
        const homeDefenceTargets = [
          homeDefenceHeading,
          homeDefenceTextBlock,
        ].filter(
          (element, index, elements) =>
            element && elements.indexOf(element) === index,
        );


        if (homeDefenceTargets.length === 0) {
          homeDefenceTargets.push(
            ...Array.from(homeDefenceContentWrap.children).filter(
              (element) => element instanceof HTMLElement,
            ).slice(0, 2),
          );
        }


        if (homeDefenceTargets.length > 0) {
          gsap.timeline({
            defaults: {
              yPercent: -20,
              opacity: 0,
              duration: 0.45,
              ease: "power2.out",
              overwrite: "auto",
            },
            scrollTrigger: {
              id: "ROUTER-DETAILS-OPACITY",
              trigger: "#router-details",
              start: "top 80%",
              toggleActions: "play none none reverse",
              markers: false,
            },
          }).to(homeDefenceTargets, {
            stagger: 0.2,
          });
        }
      }


      if (lottieContainer) {
        gsap.to(lottieContainer, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
          scrollTrigger: {
            id: "ROUTER-DETAILS-LOTTIE-FADE",
            trigger: "#router-details",
            start: "top 60%",
            toggleActions: "play none none reverse",
            markers: false,
          },
        });
      }
    },
  });


  // =========================================================
  // LOTTIE SCRUB: 29% to 100% when #router-details top crosses bottom to top
  // =========================================================
  const lottieScrubProxy = { lottiePct: 29 };
  gsap.to(lottieScrubProxy, {
    lottiePct: 100,
    ease: "none",
    scrollTrigger: {
      id: "LOTTIE-SCRUB",
      trigger: "#router-details",
      start: "top 80%",
      end: "top top",
      scrub: true,
      markers: false,
      onUpdate: () => {
        if (isIntroComplete && ensureLottieReady()) {
          const pct = lottieScrubProxy.lottiePct / 100;
          const currentLottieFrame = pct * (lottieTotalFrames - 1);
          lottieAnim.goToAndStop(currentLottieFrame, true);
        }
      },
    },
  });


  let lastScrollTriggerWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    const currentWidth = window.innerWidth;


    // Ignore mobile browser chrome height changes that fire resize while scrolling.
    if (currentWidth <= 767 && currentWidth === lastScrollTriggerWidth) {
      return;
    }


    lastScrollTriggerWidth = currentWidth;
    ScrollTrigger.refresh();
  });
}




async function init() {
  refreshLottieElements();
  if (!video) return;
  video.preload = "auto";




  if (video.readyState >= 1) {
    initLottieControl();
  } else {
    video.addEventListener("loadedmetadata", initLottieControl, { once: true });
  }
}




function queueLottieInit() {
  init();

  // Webflow and custom elements can mount just after DOMContentLoaded.
  // Retry briefly so this controller does not miss the video or dotLottie node.
  window.setTimeout(init, 100);
  window.setTimeout(init, 500);
}


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", queueLottieInit, { once: true });
} else {
  queueLottieInit();
}
window.addEventListener("load", queueLottieInit, { once: true });




document.addEventListener("DOMContentLoaded", () => {
  // 1. Select Elements
  const trigger1 = document.querySelector("#trigger-1");
  const leftSlider = document.querySelector(".section_left-slider-wrap");
  const bottomSlider = document.querySelector(".section_bottom-slider");
  const mobRes = document.querySelector("#mob-res");
  const responsiveWrapper = document.querySelector(
    ".section_responsive-wrapper",
  );




  if (!trigger1 || !leftSlider || !bottomSlider) return;




  // Track viewport state
  let isDesktop = window.innerWidth > 767;
  let stableMobileViewportHeight = window.innerHeight;
  let ticking = false;




  // ==========================================
  // MOBILE HEIGHT CALCULATION
  // ==========================================
  function setMobileTriggerHeight() {
    if (!isDesktop && responsiveWrapper) {
      const wrapperHeightX2 = responsiveWrapper.offsetHeight * 2;
      const svh40 = stableMobileViewportHeight * 0.4;
      const targetMinHeight = wrapperHeightX2 + svh40;




      trigger1.style.minHeight = `${targetMinHeight}px`;
      trigger1.style.height = `${targetMinHeight}px`;
    } else if (isDesktop) {
      trigger1.style.height = "";
      trigger1.style.minHeight = "";
    }
  }




  // ==========================================
  // RESET FUNCTION FOR BREAKPOINT SWITCHING
  // ==========================================
  function resetAxisStyles() {
    leftSlider.style.transform = "";
    bottomSlider.style.transform = "";
    if (mobRes) mobRes.style.transform = "";
    trigger1.style.height = "";
    trigger1.style.minHeight = "";
  }




  // ==========================================
  // ANIMATION LOGIC (DESKTOP & MOBILE)
  // ==========================================
  function updateAnimations() {
    const windowHeight = isDesktop
      ? window.innerHeight
      : stableMobileViewportHeight;
    const rect1 = trigger1.getBoundingClientRect();




    const distanceTraveled = windowHeight - rect1.top;




    if (isDesktop) {
      let progress = Math.max(0, Math.min(1, distanceTraveled / windowHeight));
      const currentStartPercent = 50;
      const currentEndPercent = -50;




      const translateVal =
        currentStartPercent +
        progress * (currentEndPercent - currentStartPercent);




      leftSlider.style.transform = `translateY(${translateVal}%)`;
      bottomSlider.style.transform = `translateY(${translateVal}%)`;




      if (mobRes) mobRes.style.transform = "";
    } else {
      const triggerHeight = trigger1.offsetHeight;
      const totalScrollDistance = triggerHeight;
      let progress = Math.max(
        0,
        Math.min(1, distanceTraveled / totalScrollDistance),
      );




      const legacyTranslateVal = -(progress * 50);
      leftSlider.style.transform = `translateY(${legacyTranslateVal}%)`;
      bottomSlider.style.transform = `translateY(${legacyTranslateVal}%)`;




      if (mobRes && responsiveWrapper) {
        const mobResHeight = mobRes.offsetHeight;
        const wrapperHeight = responsiveWrapper.offsetHeight;




        if (mobResHeight > wrapperHeight) {
          const maxTravelDistancePixels = mobResHeight - wrapperHeight;
          const maxTravelPercentage =
            (maxTravelDistancePixels / mobResHeight) * 100;
          const mobResTranslateVal = -(progress * maxTravelPercentage);




          mobRes.style.transform = `translateY(${mobResTranslateVal}%)`;
        } else {
          mobRes.style.transform = `translateY(0%)`;
        }
      }
    }




    ticking = false;
  }




  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateAnimations);
      ticking = true;
    }
  });




  let lastAnimationLayoutWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    const currentWidth = window.innerWidth;


    if (currentWidth <= 767 && currentWidth === lastAnimationLayoutWidth) {
      return;
    }


    lastAnimationLayoutWidth = currentWidth;
    stableMobileViewportHeight = window.innerHeight;


    const wasDesktop = isDesktop;
    isDesktop = currentWidth > 767;




    if (isDesktop !== wasDesktop) {
      resetAxisStyles();
    }




    setMobileTriggerHeight();
    updateAnimations();
  });




  // ==========================================
  // INITIAL LOAD
  // ==========================================
  setMobileTriggerHeight();
  updateAnimations();
});




// Set up GSAP matchMedia
let mm = gsap.matchMedia();




// Target devices below 767px
mm.add("(max-width: 766px)", () => {
  const mobileLottiePlayer = document.querySelector(
    ".lottie-container dotlottie-player",
  );




  if (!mobileLottiePlayer) return;


  let mobileLottieInitialized = false;


  const initMobileLottie = () => {
    if (mobileLottieInitialized) return true;

    const lottieInstance = mobileLottiePlayer.getLottie
      ? mobileLottiePlayer.getLottie()
      : null;




    if (lottieInstance) {
      const totalFrames = lottieInstance.getDuration(true);
      if (!totalFrames || totalFrames <= 0) return false;

      mobileLottieInitialized = true;
      lottieInstance.pause();
      let lottieState = { frame: 0 };




      gsap.to(lottieState, {
        frame: totalFrames,
        ease: "none",
        scrollTrigger: {
          id: "MOBILE-LOTTIE",
          trigger: ".lottie-container",
          start: "top 90%",
          end: "bottom 10%",
          scrub: 0.5,
          onUpdate: () => {
            lottieInstance.goToAndStop(lottieState.frame, true);
          },
        },
      });

      ScrollTrigger.refresh();
      return true;
    }

    return false;
  };




  const retryMobileLottie = (attempt = 0) => {
    if (initMobileLottie()) return;
    if (attempt >= 8) return;
    window.setTimeout(() => retryMobileLottie(attempt + 1), 150);
  };


  ["load", "ready", "complete"].forEach((eventName) => {
    mobileLottiePlayer.addEventListener(eventName, () => retryMobileLottie());
  });
  retryMobileLottie();
});




let flipCtx;




const createTimeline = () => {
  flipCtx && flipCtx.revert();




  flipCtx = gsap.context(() => {
    const box = document.querySelector(".box");
    const target = document.querySelector("#explode-target");




    if (!box || !target) {
      return;
    }




    const targetState = Flip.getState(target);




    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#canvas-explode",
        start: "top center",
        endTrigger: "#explode-target",
        end: "top center",
        scrub: 1,
      },
    });




    tl.add(
      Flip.fit(box, targetState, {
        duration: 1,
        ease: "none",
      }),
    );
  });
};




window.addEventListener("DOMContentLoaded", createTimeline);




let lastFlipTimelineWidth = window.innerWidth;
window.addEventListener("resize", () => {
  const currentWidth = window.innerWidth;


  if (currentWidth <= 767 && currentWidth === lastFlipTimelineWidth) {
    return;
  }


  lastFlipTimelineWidth = currentWidth;
  createTimeline();
});




// --- MOUSE MOVE OVERLAY ---
const overlay = document.querySelector(".overlay-center");
if (overlay) {
  window.addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;
    const xPct = (clientX / window.innerWidth) * 100;
    const yPct = (clientY / window.innerHeight) * 100;




    gsap.to(overlay, {
      "--x": `${xPct}%`,
      "--y": `${yPct}%`,
      duration: 0.6,
      ease: "power2.out",
    });
  });
}




// --- PART 1: GRID ANIMATION ---
const mediaQuery = window.matchMedia("(min-width: 992px)");
const canvas = document.getElementById("gridCanvas");
let gridAnimationFrameId = null;
let isGridRunning = false;




if (canvas && canvas.getContext) {
  const ctx = canvas.getContext("2d");
  const config = {
    gridSize: 30,
    baseLineColor: "#0e0e0e",
    highlightColor: "#FAFAFA",
    highlightOpacity: 0.46,
    blurAmount: 100,
    spotlightRadius: 200,
    wobbleSpeed: 0.003,
    mouseLag: 0.1,
  };




  let width, height;
  let time = 0;




  const maskCanvas = document.createElement("canvas");
  const maskCtx = maskCanvas.getContext("2d");




  const mouse = { x: -1000, y: -1000 };
  const currentMouse = { x: -1000, y: -1000 };

// 1. Safe extraction (prevents SSR crashes if running in Next.js/Nuxt)
const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";
const platform = typeof window !== "undefined" ? navigator.platform : "";
const maxTouchPoints = typeof window !== "undefined" ? navigator.maxTouchPoints : 0;

// 2. Browser Detection
const isSafari =
  /Safari/i.test(userAgent) &&
  !/(Chrome|Chromium|CriOS|FxiOS|Edg|EdgiOS|OPR|OPiOS|DuckDuckGo)/i.test(userAgent);

const isIOSDevice =
  /iP(ad|hone|od)/.test(userAgent) ||
  (platform === "MacIntel" && maxTouchPoints > 1); // Catches iPads masquerading as Macs

const isIOSBrowser = isIOSDevice;

// 3. The Unified Flag
// Triggers fallback for Desktop Safari AND all iOS browsers (Chrome on iOS is still WebKit)
const needsCanvasFallback = isSafari || isIOSBrowser;

if (isSafari) {
  console.log("[Neoconda grid] Safari/iOS environment detected", {
    isSafari,
    isIOSBrowser,
    needsCanvasFallback,
    userAgent,
  });
}



  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    maskCanvas.width = width;
    maskCanvas.height = height;
  }




  window.addEventListener("resize", resize);
  resize();




  window.addEventListener("mousemove", (e) => {
    if (mediaQuery.matches) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
  });




  function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }




  function drawGrid(context, color) {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += config.gridSize) {
      context.moveTo(x + 0.5, 0);
      context.lineTo(x + 0.5, height);
    }
    for (let y = 0; y <= height; y += config.gridSize) {
      context.moveTo(0, y + 0.5);
      context.lineTo(width, y + 0.5);
    }
    context.stroke();
  }




  function drawOrganicShape(context, x, y, radius, time) {
    context.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
      const noise =
        Math.sin(angle * 3 + time) * 20 +
        Math.cos(angle * 5 - time) * 15 +
        Math.sin(time * 2) * 5;
      const r = radius + noise;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (angle === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.closePath();
    context.fill();
  }




  function animate() {
    if (!isGridRunning) return;
    ctx.clearRect(0, 0, width, height);
    maskCtx.clearRect(0, 0, width, height);
    time += config.wobbleSpeed;
    currentMouse.x = lerp(currentMouse.x, mouse.x, config.mouseLag);
    currentMouse.y = lerp(currentMouse.y, mouse.y, config.mouseLag);
    drawGrid(ctx, config.baseLineColor);


if (needsCanvasFallback) {
  maskCtx.save();
  
  // Note: if 'time' is in milliseconds, divide by 1000 here to slow down the wobble
  // const t = time / 1000; 
  // const wobbleX = Math.sin(t * 3) * 12 + Math.cos(t * 5) * 8;
  
  const wobbleX = Math.sin(time * 3) * 12 + Math.cos(time * 5) * 8;
  const wobbleY = Math.cos(time * 3) * 12 + Math.sin(time * 5) * 8;
  const cx = currentMouse.x + wobbleX;
  const cy = currentMouse.y + wobbleY;

  const gradient = maskCtx.createRadialGradient(
    cx, cy, 0,
    cx, cy, config.spotlightRadius + config.blurAmount
  );
  
  gradient.addColorStop(0, `rgba(255,255,255,${config.highlightOpacity})`);
  gradient.addColorStop(0.45, `rgba(255,255,255,${config.highlightOpacity * 0.6})`);
  gradient.addColorStop(1, `rgba(255,255,255,0)`);
  
  maskCtx.fillStyle = gradient;
  maskCtx.fillRect(0, 0, width, height); // Ensure 'width' and 'height' are defined in this scope!
  maskCtx.restore();
  
} else {
  maskCtx.save();
  maskCtx.filter = `blur(${config.blurAmount}px)`;
  maskCtx.fillStyle = `rgba(255, 255, 255, ${config.highlightOpacity})`;
  drawOrganicShape(
    maskCtx,
    currentMouse.x,
    currentMouse.y,
    config.spotlightRadius,
    time * 1000 
  );
  maskCtx.restore();
}
    ctx.save();
    maskCtx.globalCompositeOperation = "source-in";
    drawGrid(maskCtx, config.highlightColor);
    maskCtx.globalCompositeOperation = "source-over";
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.restore();
    gridAnimationFrameId = requestAnimationFrame(animate);
  }




  window.startGridAnimation = function () {
    if (!isGridRunning) {
      isGridRunning = true;
      animate();
    }
  };




  window.stopGridAnimation = function () {
    isGridRunning = false;
    if (gridAnimationFrameId) cancelAnimationFrame(gridAnimationFrameId);
  };
}




// --- PART 2: NOISE ANIMATION ---
const turbulence = document.getElementById("noise-turbulence");
let noiseIntervalId = null;




function startNoise() {
  if (turbulence && !noiseIntervalId) {
    noiseIntervalId = setInterval(() => {
      turbulence.setAttribute("seed", Math.random() * 100);
    }, 50);
  }
}




function stopNoise() {
  if (noiseIntervalId) {
    clearInterval(noiseIntervalId);
    noiseIntervalId = null;
  }
}




// --- PART 3: MEDIA QUERY HANDLER ---
function handleBreakpointChange(e) {
  if (e.matches) {
    if (window.startGridAnimation) window.startGridAnimation();
    startNoise();
  } else {
    if (window.stopGridAnimation) window.stopGridAnimation();
    stopNoise();
  }
}




mediaQuery.addEventListener("change", handleBreakpointChange);
handleBreakpointChange(mediaQuery);




function startUSCountdown(targetDateString) {
  const targetDate = new Date(targetDateString).getTime();




  const monthEls = document.getElementsByClassName("timer-month");
  const daysEls = document.getElementsByClassName("timer-days");
  const hoursEls = document.getElementsByClassName("timer-hours");




  const monthElLaunch = document.getElementById("launch-month");
  const daysElLaunch = document.getElementById("launch-days");
  const hoursElLaunch = document.getElementById("launch-hours");




  if (
    monthEls.length === 0 &&
    daysEls.length === 0 &&
    hoursEls.length === 0 &&
    !monthElLaunch &&
    !daysElLaunch &&
    !hoursElLaunch
  ) {
    return;
  }




  function setTimerElementText(el, value) {
    if (!el || el.dataset.timerValue === value) return;
    el.dataset.timerValue = value;
    if (el.dataset.timerRevealSplit === "true") {
      const chars = el.querySelectorAll(".char");
      if (chars.length === value.length) {
        chars.forEach((char, index) => {
          char.textContent = value[index];
        });
        return;
      }
    }
    el.innerText = value;
  }




  function setTimerText(elements, value) {
    for (let el of elements) {
      setTimerElementText(el, value);
    }
  }




  function updateTimer() {
    const now = new Date();
    const usTimeStr = now.toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const usNow = new Date(usTimeStr).getTime();
    const distance = targetDate - usNow;




    if (distance < 0) {
      setTimerText(monthEls, "00");
      setTimerText(daysEls, "00");
      setTimerText(hoursEls, "00");
      setTimerElementText(monthElLaunch, "00");
      setTimerElementText(daysElLaunch, "00");
      setTimerElementText(hoursElLaunch, "00");
      return false;
    }




    const totalSeconds = Math.floor(distance / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);




    const months = Math.floor(totalDays / 30.44);
    const relativeDays = Math.floor(totalDays % 30.44);
    const relativeHours = totalHours % 24;




    const monthValue = String(months).padStart(2, "0");
    const daysValue = String(relativeDays).padStart(2, "0");
    const hoursValue = String(relativeHours).padStart(2, "0");




    setTimerText(monthEls, monthValue);
    setTimerText(daysEls, daysValue);
    setTimerText(hoursEls, hoursValue);




    setTimerElementText(monthElLaunch, monthValue);
    setTimerElementText(daysElLaunch, daysValue);
    setTimerElementText(hoursElLaunch, hoursValue);
    return true;
  }




  if (!updateTimer()) return;




  const timerInterval = setInterval(() => {
    if (!updateTimer()) clearInterval(timerInterval);
  }, 1000);
}




function setupTimerRevealAnimation() {
  if (window.__neocondaTimerRevealInitialized) return;




  const timerNumbers = Array.from(document.querySelectorAll(".home_timer"));
  const timerLabels = Array.from(document.querySelectorAll(".home_time-text"));
  const colons = Array.from(document.querySelectorAll(".colon"));
  const footerTrigger = document.querySelector(".home_footer-component");




  if (
    !timerNumbers.length ||
    !footerTrigger ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined"
  ) {
    return;
  }




  window.__neocondaTimerRevealInitialized = true;




  function splitTimerNumberChars() {
    if (window.SplitType) {
      const splitTimerNumbers = new SplitType(".home_timer", { types: "chars" });
      return splitTimerNumbers.chars;
    }

    return timerNumbers.flatMap((timerNumber) => {ˇ
      timerNumber.textContent = "";
      return Array.from(value).map((char) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        span.style.display = "inline-block";
        timerNumber.appendChild(span);
        return span;
      });
    });
  }




  const timerNumberTargets = splitTimerNumberChars();
  const timerNumberCharGroups = timerNumbers.map((timerNumber) =>
    Array.from(timerNumber.querySelectorAll(".char")),
  );
  timerNumbers.forEach((timerNumber) => {
    timerNumber.dataset.timerRevealSplit = "true";
  });




  gsap.set(timerNumbers, { opacity: 1 });
  gsap.set(timerNumberTargets, {
    display: "inline-block",
    y: 12,
    opacity: 0,
  });
  gsap.set(colons, {
    opacity: 0,
  });
  gsap.set(timerLabels, { y: 10, opacity: 0 });




  const timerRevealTl = gsap.timeline({
    scrollTrigger: {
      trigger: footerTrigger,
      start: "top 50%",
      toggleActions: "play none none none",
    },
  });

  const REVEAL_DURATION = 0.62;
  const REVEAL_STEP = 0.24;
  const NUMBER_STAGGER = 0.015;
  const LABEL_STAGGER = 0.025;
  let revealTime = 0;
  timerNumberCharGroups.forEach((chars, index) => {
    if (!chars.length) return;

    timerRevealTl.to(
      chars,
      {
        y: 0,
        opacity: 1,
        duration: REVEAL_DURATION,
        stagger: NUMBER_STAGGER,
        ease: "power4.out",
      },
      revealTime,
    );
    revealTime += REVEAL_STEP;

    if (colons[index]) {
      timerRevealTl.to(
        colons[index],
        {
          opacity: 1,
          duration: REVEAL_DURATION,
          ease: "sine.out",
        },
        revealTime,
      );
      revealTime += REVEAL_STEP;
    }
  });

  timerRevealTl.to(
    timerLabels,
    {
      y: 0,
      opacity: 1,
      duration: REVEAL_DURATION,
      stagger: LABEL_STAGGER,
      ease: "power3.out",
    },
    revealTime + 0.06,
  );




  ScrollTrigger.refresh();
}




function primeTimerRevealInitialState() {
  const timerElements = document.querySelectorAll(
    ".home_timer, .home_time-text, .colon",
  );
  if (!timerElements.length) return;

  if (typeof gsap !== "undefined") {
    gsap.set(timerElements, { opacity: 0 });
    return;
  }

  timerElements.forEach((element) => {
    element.style.opacity = "0";
  });
}




function runAfterPreloader(callback) {
  const isPreloaderGone = () => {
    const activePreloaderLayer = document.querySelector(
      "#preloader-first, #pre-one, #pre-two, #pre-three, #preloader",
    );
    if (activePreloaderLayer) return false;

    const preloaderWrapper = document.querySelector(".preloader-wrapper");
    if (!preloaderWrapper) return true;

    const hasVisibleWrapper =
      getComputedStyle(preloaderWrapper).display !== "none" &&
      getComputedStyle(preloaderWrapper).visibility !== "hidden" &&
      preloaderWrapper.getBoundingClientRect().height > 0;

    return !hasVisibleWrapper || preloaderWrapper.children.length === 0;
  };




  if (isPreloaderGone()) {
    callback();
    return;
  }




  const observer = new MutationObserver(() => {
    if (!isPreloaderGone()) return;
    observer.disconnect();
    callback();
  });




  observer.observe(document.body, { childList: true, subtree: true });
}




document.addEventListener("DOMContentLoaded", () => {
  startUSCountdown("July 20, 2026 12:00:00");
});




// document.addEventListener("DOMContentLoaded", () => {
//   const navLinks = Array.from(document.querySelectorAll(".nav_menu_link"));
//
//   if (!navLinks.length || document.querySelector("#nav-link-gui")) return;
//
//   const style = document.createElement("style");
//   style.id = "nav-link-gui-style";
//   style.textContent = `
//     #nav-link-gui {
//       position: fixed;
//       bottom:16px;
//       right: 16px;
//       z-index: 9999;
//       width: 280px;
//       max-height: calc(100vh - 32px);
//       overflow: auto;
//       padding: 12px;
//       border-radius: 12px;
//       background: rgba(10, 48, 74, 0.96);
//       border: 1px solid rgba(173, 216, 255, 0.32);
//       box-shadow: 0 12px 40px rgba(0, 18, 36, 0.42);
//       backdrop-filter: blur(10px);
//       color: #fff;
//       font: 12px/1.4 Arial, sans-serif;
//     }
//
//     #nav-link-gui[hidden] {
//       display: none;
//     }
//
//     #nav-link-gui-toggle {
//       position: fixed;
//       top: 16px;
//       right: 16px;
//       z-index: 10000;
//       padding: 8px 12px;
//       border: 0;
//       border-radius: 999px;
//       background: #0d5c8f;
//       box-shadow: 0 10px 24px rgba(0, 18, 36, 0.3);
//       color: #fff;
//       font: 12px/1 Arial, sans-serif;
//       cursor: pointer;
//     }
//
//     #nav-link-gui h3 {
//       margin: 0 0 10px;
//       font-size: 12px;
//       letter-spacing: 0.08em;
//       text-transform: uppercase;
//     }
//
//     .nav-link-gui__row {
//       margin-bottom: 12px;
//     }
//
//     .nav-link-gui__header {
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//       gap: 8px;
//       margin-bottom: 6px;
//     }
//
//     .nav-link-gui__label {
//       overflow: hidden;
//       text-overflow: ellipsis;
//       white-space: nowrap;
//     }
//
//     .nav-link-gui__value {
//       color: rgba(255, 255, 255, 0.72);
//       font-variant-numeric: tabular-nums;
//     }
//
//     .nav-link-gui__slider {
//       width: 100%;
//     }
//
//     .nav-link-gui__actions {
//       display: flex;
//       gap: 8px;
//       margin-top: 10px;
//     }
//
//     .nav-link-gui__actions button {
//       flex: 1;
//       padding: 8px 10px;
//       border: 0;
//       border-radius: 8px;
//       background: #0b4164;
//       color: #fff;
//       cursor: pointer;
//       font: inherit;
//     }
//   `;
//   document.head.appendChild(style);
//
//   const storageKey = "neoconda-nav-link-gui-x";
//   const savedOffsets = (() => {
//     try {
//       return JSON.parse(localStorage.getItem(storageKey) || "{}");
//     } catch (error) {
//       return {};
//     }
//   })();
//
//   const getLabel = (link, index) =>
//     link.id ||
//     link.getAttribute("aria-label") ||
//     link.textContent.trim() ||
//     `Link ${index + 1}`;
//
//   const applyOffset = (link, value) => {
//     link.dataset.guiBaseX = String(value);
//     gsap.set(link, { x: value });
//   };
//
//   navLinks.forEach((link, index) => {
//     const initialValue = Number(savedOffsets[link.id || `index-${index}`] || 0);
//     applyOffset(link, initialValue);
//   });
//
//   const toggle = document.createElement("button");
//   toggle.id = "nav-link-gui-toggle";
//   toggle.type = "button";
//   toggle.textContent = "Nav GUI";
//
//   const panel = document.createElement("div");
//   panel.id = "nav-link-gui";
//   panel.hidden = true;
//
//   const title = document.createElement("h3");
//   title.textContent = "Nav Link X";
//   panel.appendChild(title);
//
//   navLinks.forEach((link, index) => {
//     const key = link.id || `index-${index}`;
//     const label = getLabel(link, index);
//     const row = document.createElement("div");
//     row.className = "nav-link-gui__row";
//
//     const header = document.createElement("div");
//     header.className = "nav-link-gui__header";
//
//     const labelEl = document.createElement("div");
//     labelEl.className = "nav-link-gui__label";
//     labelEl.textContent = label;
//
//     const valueEl = document.createElement("div");
//     valueEl.className = "nav-link-gui__value";
//     valueEl.textContent = `${Number(link.dataset.guiBaseX || 0)}px`;
//
//     const slider = document.createElement("input");
//     slider.className = "nav-link-gui__slider";
//     slider.type = "range";
//     slider.min = "-100";
//     slider.max = "100";
//     slider.step = "1";
//     slider.value = String(Number(link.dataset.guiBaseX || 0));
//
//     slider.addEventListener("input", () => {
//       const value = Number(slider.value);
//       applyOffset(link, value);
//       valueEl.textContent = `${value}px`;
//       savedOffsets[key] = value;
//       try {
//         localStorage.setItem(storageKey, JSON.stringify(savedOffsets));
//       } catch (error) {
//         // Ignore storage issues so the GUI still works live.
//       }
//     });
//
//     header.appendChild(labelEl);
//     header.appendChild(valueEl);
//     row.appendChild(header);
//     row.appendChild(slider);
//     panel.appendChild(row);
//   });
//
//   const actions = document.createElement("div");
//   actions.className = "nav-link-gui__actions";
//
//   const resetButton = document.createElement("button");
//   resetButton.type = "button";
//   resetButton.textContent = "Reset";
//   resetButton.addEventListener("click", () => {
//     panel.querySelectorAll(".nav-link-gui__slider").forEach((slider, index) => {
//       const link = navLinks[index];
//       const key = link.id || `index-${index}`;
//       slider.value = "0";
//       applyOffset(link, 0);
//       const valueEl = slider.parentElement?.querySelector(".nav-link-gui__value");
//       if (valueEl) valueEl.textContent = "0px";
//       savedOffsets[key] = 0;
//     });
//     try {
//       localStorage.setItem(storageKey, JSON.stringify(savedOffsets));
//     } catch (error) {
//       // Ignore storage issues so the GUI still works live.
//     }
//   });
//
//   const closeButton = document.createElement("button");
//   closeButton.type = "button";
//   closeButton.textContent = "Close";
//   closeButton.addEventListener("click", () => {
//     panel.hidden = true;
//     toggle.hidden = false;
//   });
//
//   actions.appendChild(resetButton);
//   actions.appendChild(closeButton);
//   panel.appendChild(actions);
//
//   toggle.addEventListener("click", () => {
//     panel.hidden = false;
//     toggle.hidden = true;
//   });
//
//   document.body.appendChild(toggle);
//   document.body.appendChild(panel);
// });




gsap.registerPlugin(ScrollTrigger);




ScrollTrigger.matchMedia({
  "(min-width: 992px)": function () {
    const logo = document.querySelector("#hero-logo-large-to-move");
    const navLinks = Array.from(document.querySelectorAll(".nav_menu_link"));
    const homeLink =
      navLinks.find((link) => {
        const href = link.getAttribute("href") || "";
        const label = link.textContent.trim().toLowerCase();
        return href === "#hero" || href === "/" || label === "home";
      }) || navLinks[0] || null;
    const aboutLink =
      navLinks.find((link) => {
        const href = link.getAttribute("href") || "";
        const label = link.textContent.trim().toLowerCase();
        return href === "#about" || label === "about";
      }) || navLinks[1] || null;
    const navLogo = document.querySelector("#nav-logo");
    const spec = document.querySelector("#spec");
    const device = document.querySelector("#hero-device");
    const source = document.querySelector("#hero-logo-source");
    const destination = document.querySelector("#nav-logo-destination");
    const dummy = document.querySelector("#dummy");
    const mailingList = document.querySelector("#mailing-list");
    const navScrollTargets = [
      { element: homeLink, x: 0 },
      { element: aboutLink, x: -40 },
      { element: navLogo, x: -80 },
      { element: spec, x: 21 },
      { element: mailingList, x: 0 },
      { element: destination, x: -50 },
    ];




    if (logo && source && destination && dummy) {
      const flipStart = "top top";
      const flipEnd = "center top+=30%";
      const sourceRect = source.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const destRect = destination.getBoundingClientRect();




      gsap.set(source, { width: sourceRect.width, height: sourceRect.height });




      const destFullWidth = destRect.width;
      const targetScale = Math.min(
        destFullWidth / logoRect.width,
        destRect.height / logoRect.height,
        1,
      );




      document.body.appendChild(logo);




      gsap.set(logo, {
        position: "fixed",
        top: 0,
        left: 0,
        width: logoRect.width,
        height: logoRect.height,
        x: sourceRect.left,
        y: sourceRect.top,
        zIndex: 1,
        transformOrigin: "center center",
        margin: 0,
        opacity: 1,
      });




      gsap.set(dummy, { opacity: 0 });




      if (device) {
        gsap.set(device, { position: "absolute" });
      }




      gsap.set(destination, { width: 0 });


      navScrollTargets.forEach(({ element, x }) => {
        if (!element) return;


        gsap.to(element, {
          x,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: flipStart,
            end: flipEnd,
            scrub: true,
          },
        });
      });




      ScrollTrigger.create({
        trigger: "#hero",
        start: flipStart,
        end: flipEnd,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;




          // --- CRITICAL PERFORMANCE FIX ---
          // READ measurements FIRST (Before modifying DOM)
          const currentSourceRect = source.getBoundingClientRect();
          const currentDestRect = destination.getBoundingClientRect();




          // WRITE measurements SECOND
          // A. Animate Destination Container Width
          destination.style.width = destFullWidth * progress + "px";




          // B. Calculate Dynamic Positions
          const startX = currentSourceRect.left + currentSourceRect.width / 2;
          const startY = currentSourceRect.top + currentSourceRect.height / 2;




          const endX = currentDestRect.left + currentDestRect.width / 2;
          const endY = currentDestRect.top + currentDestRect.height / 2;




          const currentX = startX + (endX - startX) * progress;
          const currentY = startY + (endY - startY) * progress;




          // Apply to Logo
          gsap.set(logo, {
            x: currentX - logoRect.width / 2,
            y: currentY - logoRect.height / 2,
            scale: 1 + (targetScale - 1) * progress,
          });


          // if (mailingList) {
          //   const mailingListBaseX = Number(mailingList.dataset.guiBaseX || 0);
          //   gsap.set(mailingList, { x: mailingListBaseX + -20 * progress });
          // }




          // --- C. CRITICAL LOGIC: Opacity Swap ---
          if (progress >= 0.999) {
            logo.style.opacity = 0;
            dummy.style.opacity = 1;
          } else {
            logo.style.opacity = 1;
            dummy.style.opacity = 0;
          }
        },
        onLeaveBack: () => {
          gsap.set(destination, { width: 0 });
          gsap.set(logo, { opacity: 1 });
          gsap.set(dummy, { opacity: 0 });
          // if (mailingList) {
          //   gsap.set(mailingList, { x: Number(mailingList.dataset.guiBaseX || 0) });
          // }
        },
      });




      return () => {
        if (destination) gsap.set(destination, { clearProps: "width" });
        if (source) {
          source.appendChild(logo);
          gsap.set(source, { clearProps: "width,height" });
        }
        gsap.set(logo, { clearProps: "all" });
        gsap.set(dummy, { clearProps: "opacity" });
        if (mailingList) gsap.set(mailingList, { clearProps: "transform" });
      };
    }
  },
});




document.addEventListener("DOMContentLoaded", () => {
  const featuresPadding = document.querySelector("#features-padding");
  const aboutSection = document.querySelector("#about");
  const appSection = document.querySelector("#app");


  if (!featuresPadding || (!aboutSection && !appSection)) return;


  ScrollTrigger.matchMedia({
    "(min-width: 768px)": function () {
      const fadeTargets = [aboutSection, appSection].filter(Boolean);


      if (fadeTargets.length === 0) return;


      gsap.fromTo(
        fadeTargets,
        { opacity: 1 },
        {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: featuresPadding,
            start: "top 30%",
            end: "top top",
            scrub: true,
            markers: false,
          },
        },
      );
    },
  });
});


document.addEventListener("DOMContentLoaded", function() {
    // 1. Register the ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);


    // 2. Select your navigation links
    const aboutLink = document.querySelector('a[href="#about"]');
    const featuresLink = document.querySelector('a[href="#features"]');


    // Make sure the elements exist on the page before running GSAP
    if (!aboutLink || !featuresLink || !document.querySelector('.section_home-features')) return;


    // 3. Create the ScrollTrigger
    ScrollTrigger.create({
        trigger: ".section_home-features",
        // This means: "Trigger when the TOP of the features section hits 80% down the screen"
        start: "top 80%", 
        
        // When you scroll down and the section enters the trigger area
        onEnter: () => {
            aboutLink.classList.remove('w--current');
            featuresLink.classList.add('w--current');
        },
        
        // When you scroll back up and the section leaves the trigger area
        onLeaveBack: () => {
            featuresLink.classList.remove('w--current');
            aboutLink.classList.add('w--current');
        }
    });
});
