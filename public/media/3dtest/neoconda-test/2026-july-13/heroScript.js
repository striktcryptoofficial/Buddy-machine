import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import gsap from "gsap";
import { ScrollTrigger } from "../../../../vendor/unpkg/gsap@3.12.5/ScrollTrigger.js";
import GUI from "../../../../vendor/jsdelivr/npm/lil-gui@0.19.1/dist/lil-gui.esm.js";

// IMMEDIATELY hide preloader on resize reload - before any rendering
(function hidePreloaderImmediately() {
  try {
    if (sessionStorage.getItem('__neoconda_resize_reload') === 'true') {
      // Inject CSS to hide preloader before it renders
      const style = document.createElement('style');
      style.textContent = `
        #preloader-first, #pre-one, #pre-two, #pre-three, #preloader, .preloader-wrapper {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `;
      // Append to head or create head if not exists
      (document.head || document.documentElement).appendChild(style);
      console.log('[heroScript-stagging] Preloader hidden immediately on resize reload');
    }
  } catch (e) {}
})();

gsap.registerPlugin(ScrollTrigger);
// Enhanced mobile configuration for cross-browser compatibility
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
});
const START_CONTAINER_ID = "#hero";
const HERO_SCROLL_SCRUB = 1.5;

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
        // Safe property access - compatible with all browser versions
        const value = this.tasks[key];
        return value !== undefined && value !== null ? value : 0;
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

const loadRegistry = getNeocondaLoadRegistry();
loadRegistry.markScriptReady("heroScript-stagging");

// Check if this is a resize reload - if so, skip preloader
const RESIZE_FLAG_KEY = '__neoconda_resize_reload';
let skipPreloaderOnResize = false;
try {
  skipPreloaderOnResize = sessionStorage.getItem(RESIZE_FLAG_KEY) === 'true';
  if (skipPreloaderOnResize) {
    // Clear the flag immediately so manual refresh shows preloader
    sessionStorage.removeItem(RESIZE_FLAG_KEY);
    console.log('[heroScript-stagging] Resize reload detected - skipping preloader');
  }
} catch (e) {}

let heroSceneInitialized = false;

function startHeroScene() {
  if (heroSceneInitialized) return;
  const canvas = document.querySelector("#app");
  
  // Always mark DOM ready - critical for preloader progress
  loadRegistry.markDomReady("heroScript-stagging");
  
  if (!canvas) {
    console.warn('[heroScript-stagging] #app canvas not found, scene not initialized');
    return;
  }
  heroSceneInitialized = true;
  initScene(canvas);
}

startHeroScene();
window.addEventListener("DOMContentLoaded", startHeroScene, { once: true });

// Reload page on any window resize to ensure proper layout
(function initResizeHandler() {
  let resizeTimeout = null;
  let isReloading = false;
  const RESIZE_DELAY = 0; // ms to wait after resize ends
  const RESIZE_FLAG_KEY = '__neoconda_resize_reload';
  const shouldSkipResizeReload = () => {
    try {
      return window.innerWidth <= 767;
    } catch (e) {
      return false;
    }
  };
  
  window.addEventListener('resize', () => {
    if (shouldSkipResizeReload()) return;

    // Prevent multiple reloads
    if (isReloading) return;
    
    // Clear existing timeout to debounce
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    
    // Wait for resize to settle, then reload
    resizeTimeout = setTimeout(() => {
      isReloading = true;
      // Set flag so preloader is skipped on reload
      try {
        sessionStorage.setItem(RESIZE_FLAG_KEY, 'true');
      } catch (e) {}
      window.location.reload();
    }, RESIZE_DELAY);
  });
  
  // Also handle orientation change on mobile devices
  window.addEventListener('orientationchange', () => {
    if (shouldSkipResizeReload()) return;

    if (isReloading) return;
    setTimeout(() => {
      isReloading = true;
      // Set flag so preloader is skipped on reload
      try {
        sessionStorage.setItem(RESIZE_FLAG_KEY, 'true');
      } catch (e) {}
      window.location.reload();
    }, RESIZE_DELAY);
  });
})();

function applyPlanarUVs(mesh) {
  const geometry = mesh.geometry;
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const size = new THREE.Vector3();
  box.getSize(size);
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) - box.min.x) / (size.x || 1);
    uvs[i * 2 + 1] = 1 - (pos.getY(i) - box.min.y) / (size.y || 1);
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.attributes.uv.needsUpdate = true;
}

function initScene(canvasOrContainer) {
  // Check if this is a resize reload - skip preloader entirely
  if (skipPreloaderOnResize) {
    console.log('[heroScript-stagging] Skipping preloader on resize reload');
    
    // Remove all preloader elements immediately
    const preloaderElements = [
      document.querySelector("#preloader-first"),
      document.querySelector("#pre-one"),
      document.querySelector("#pre-two"),
      document.querySelector("#pre-three"),
      document.querySelector("#preloader"),
      document.querySelector(".preloader-wrapper")
    ];
    
    preloaderElements.forEach(el => {
      if (el && el.parentNode) {
        el.remove();
      }
    });
  } else {
    // Initialize preloader at 0%
    const preloaderNumber = document.getElementById("preloader-number");
    if (preloaderNumber) {
      preloaderNumber.textContent = "0%";
      // Add CSS transition for smooth number changes
      preloaderNumber.style.transition = "all 0.3s ease-out";
    }

    // Hide hero content initially until preloader slides away
    // Set inline styles immediately to prevent flash of content
    const heroContentEl = document.querySelector("#hero-content");
    if (heroContentEl) {
      heroContentEl.style.opacity = "0";
    }

    const svgOneEl = document.querySelector(".svg-one");
    const svgTwoEl = document.querySelector(".svg-two");
    [svgOneEl, svgTwoEl].forEach((svgEl) => {
      if (!svgEl) return;
      svgEl.style.visibility = "visible";
      svgEl.style.opacity = "1";
      svgEl.querySelectorAll("animate").forEach((animateEl) => {
        if (typeof animateEl.beginElement === "function") {
          try {
            animateEl.beginElement();
          } catch (error) {}
        }
      });
    });

    // Content elements will be visible behind preloader, no initial opacity:0 needed
  }

  let canvas = canvasOrContainer;
  if (!(canvasOrContainer instanceof HTMLCanvasElement)) {
    canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvasOrContainer.appendChild(canvas);
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    13,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.domElement.style.pointerEvents = "none";

  const pivotGroup = new THREE.Group();
  scene.add(pivotGroup);
  const flipScaleGroup = new THREE.Group();
  pivotGroup.add(flipScaleGroup);
  const lightsRig = new THREE.Group();
  flipScaleGroup.add(lightsRig);
  const finalOffsetGroup = new THREE.Group();
  flipScaleGroup.add(finalOffsetGroup);

  const heroVideoSrc =
    "media/3dtest/neoconda-test/videos/Logo.mp4";
  const terminalVideoSrc =
    "media/3dtest/neoconda-test/videos/neoconda-terminal-2.mp4";

  const heroVideo = document.createElement("video");
  heroVideo.src = heroVideoSrc;
  heroVideo.crossOrigin = "anonymous";
  heroVideo.loop = true;
  heroVideo.autoplay = true;
  heroVideo.preload = "auto";
  heroVideo.muted = true;
  heroVideo.playsInline = true;
  heroVideo.setAttribute("muted", "");
  heroVideo.setAttribute("playsinline", "");
  heroVideo.setAttribute("webkit-playsinline", "");
  heroVideo.load();
  heroVideo.play().catch((e) => {});

  const terminalVideo = document.createElement("video");
  terminalVideo.src = terminalVideoSrc;
  terminalVideo.crossOrigin = "anonymous";
  terminalVideo.loop = true;
  terminalVideo.autoplay = true;
  terminalVideo.preload = "auto";
  terminalVideo.muted = true;
  terminalVideo.playsInline = true;
  terminalVideo.setAttribute("muted", "");
  terminalVideo.setAttribute("playsinline", "");
  terminalVideo.setAttribute("webkit-playsinline", "");
  terminalVideo.load();
  terminalVideo.play().catch((e) => {});

  const heroVideoTexture = new THREE.VideoTexture(heroVideo);
  heroVideoTexture.flipY = false;
  heroVideoTexture.colorSpace = THREE.SRGBColorSpace;
  heroVideoTexture.minFilter = THREE.LinearFilter;
  heroVideoTexture.magFilter = THREE.LinearFilter;
  heroVideoTexture.wrapS = THREE.ClampToEdgeWrapping;
  heroVideoTexture.wrapT = THREE.ClampToEdgeWrapping;
  const terminalVideoTexture = new THREE.VideoTexture(terminalVideo);
  terminalVideoTexture.flipY = false;
  terminalVideoTexture.colorSpace = THREE.SRGBColorSpace;
  terminalVideoTexture.minFilter = THREE.LinearFilter;
  terminalVideoTexture.magFilter = THREE.LinearFilter;
  terminalVideoTexture.wrapS = THREE.ClampToEdgeWrapping;
  terminalVideoTexture.wrapT = THREE.ClampToEdgeWrapping;
  if (window.innerWidth <= 767) {
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const mobileAnisotropy = Math.min(maxAnisotropy || 1, 4);
    heroVideoTexture.anisotropy = mobileAnisotropy;
    terminalVideoTexture.anisotropy = mobileAnisotropy;
  }

  const settings = {
    material: {
      metalness: 0.053,
      roughness: 0.275,
      envMapIntensity: 0.42,
    },
    environment: {
      enabled: true,
      url: "media/3dtest/sunthings-test/hdri/studio_small_08_1k.exr",
      intensity: 0.408,
      rotation: 0,
    },
    ambient: {
      enabled: true,
      intensity: 0.534,
      targetIntensity: 1.132,
      color: "#ffffff",
    },
    keyLight: {
      enabled: true,
      intensity: 1.45,
      targetIntensity: 1.311,
      color: "#d1d1d1",
      startX: 2.12,
      startY: -0.32,
      startZ: 5,
      targetX: 0.22,
      targetY: 0.418,
      targetZ: 4.041,
      endX: 0.22,
      endY: 0.418,
      endZ: 4.041,
    },
    fillLight: {
      enabled: true,
      intensity: 1.72,
      targetIntensity: 1.45,
      color: "#ffffff",
      startX: 0.58,
      startY: 0.32,
      startZ: 0.84,
      targetX: -1.4,
      targetY: -1.94,
      targetZ: 0,
      endX: -1.4,
      endY: -1.94,
      endZ: 0,
    },
    rim: {
      enabled: true,
      intensity: 1.205,
      color: "#ffffff",
      x: -13,
      y: 3.76,
      z: -6.68,
      angle: 0.5,
      penumbra: 0.581,
    },
    targetFront: {
      enabled: true,
      intensity: 0.4,
      color: "#424242",
      x: 0.18,
      y: -0.04,
      z: 0.06,
    },
    mobileRotationLight: {
      enabled: true,
      intensity: 0.25,
      color: "#ffffff",
      offsetX: 0,
      offsetY: 0.08,
      offsetZ: 0.473,
      angle: 0.75,
      penumbra: 0.65,
      distance: 3,
      fadeInEnd: 0.04,
    },
    cameraStart: { x: 0, y: 0, z: 0.25 },
    cameraEnd: { x: 0, y: 0, z: 0.25 },
    initial: { x: 0.0025, y: 0, z: 0, rotX: 77, rotY: -11, rotZ: 16 },
    mobileInitial: { x: 0, y: 0.007, z: 0, rotX: 77, rotY: -11, rotZ: 16 },
    final: { x: 0, y: 0, z: 0, rotX: 85, rotY: 1, rotZ: -13.6 },
    mobileFinal: { x: 0, y: 0, z: 0, rotX: 90, rotY: 0, rotZ: 0 },
    finalOffset: {
      desktop: {
        position: { x: 0, y: 0, z: 0 },
        rotationRad: { x: 0.13, y: -0.198, z: -0.005 },
        scale: 2.47,
      },
      mobile: {
        position: { x: 0, y: 0.001, z: 0 },
        rotationRad: { x: 0, y: 0, z: 0 },
        scale: 1,
      },
    },
    autoFit: true,
    scaleMultiplier: 0.06,
    scaleMid: 0.08,
    mobileScaleMultiplier: 0.365,
    mobileScaleMid: 0.05,
    debug: {
      useManualScroll: false,
      manualProgress: 0,
    },
    video: {
      targetNode: "Body-30_-_Part_2",
      playing: false,
      emissiveIntensity: 1.0,
      heroOpacity: 1.0,
      terminalOpacity: 0.0,
    },
    floatSpeed: 0.8,
    floatAmp: 0.0015,
    flipScale: {
      enabled: true,
      amount: 0.05,
    },
  };

  let model;
  let videoMeshes = [];
  let heroVideoMaterial = null;
  let terminalVideoMaterial = null;
  let activeVideoKey = "hero";
  let nodeMap = {};
  let baseScale = 1.0;
  let heroSceneVisible = true;

  let modelOriginalSize = new THREE.Vector3();

  const isMobile = () => {
    const w = window.innerWidth;
    // Mobile only (phones) - excludes iPad
    return w <= 767;
  };

  const isIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  // Safe viewport dimension helper - works across all browser versions
  // Feature-detects visualViewport API with full fallback chain
  const getViewportDimensions = () => {
    try {
      // Try modern visualViewport API first (Chrome 61+, Safari 13+)
      if (
        window.visualViewport &&
        typeof window.visualViewport.width === "number"
      ) {
        return {
          width: window.visualViewport.width,
          height: window.visualViewport.height,
        };
      }
    } catch (e) {
      // Silently fall through to next option
    }

    try {
      // Fallback to window.innerWidth/Height (universally supported)
      if (
        typeof window.innerWidth === "number" &&
        typeof window.innerHeight === "number"
      ) {
        return {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      }
    } catch (e) {
      // Silently fall through to next option
    }

    try {
      // Final fallback to documentElement client dimensions
      const docEl = document.documentElement;
      if (docEl && typeof docEl.clientWidth === "number") {
        return {
          width: docEl.clientWidth,
          height: docEl.clientHeight,
        };
      }
    } catch (e) {
      // Absolute fallback
    }

    // Ultimate fallback - assume desktop dimensions
    return { width: 1024, height: 768 };
  };

  const isIPadPortrait = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // iPad portrait mode (768px-1024px in portrait mode where height > width)
    return w > 767 && w <= 1024 && h > w;
  };

  const getScaleMultiplier = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isIPadPortraitMode = w > 767 && w <= 1024 && h > w;

    if (isIPadPortraitMode) {
      return 0.12;
    }

    // Calculate proportional scale based on screen dimensions
    // Use the diagonal as a measure of overall screen size
    const diagonal = Math.sqrt(w * w + h * h);

    // Reference values: at 1920x1080 (diagonal ~2203), scale is 0.06
    // Scale inversely with diagonal: larger screens = smaller multiplier
    const referenceDiagonal = 2203; // diagonal of 1920x1080
    const referenceScale = 0.06;

    // Calculate proportional scale (inverse relationship)
    let scale = referenceScale * (referenceDiagonal / diagonal);

    // Clamp to reasonable bounds to prevent extreme values
    scale = Math.max(0.04, Math.min(scale, 0.08));

    return scale;
  };
  const tiltState = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };
  const tiltStrength = 0.1;
  const floatState = {
    active: false,
    startTime: 0,
  };
  const heroMotionDebugState = {
    lastScroll: 0,
    lastCombinedYDeg: 0,
    lastStalled: false,
  };

  const createHeroMotionDebug = () => {
    const panel = document.createElement("div");
    panel.id = "hero-motion-debug";
    Object.assign(panel.style, {
      position: "fixed",
      top: "20px",
      left: "20px",
      zIndex: "9998",
      minWidth: "220px",
      padding: "12px 14px",
      background: "rgba(0, 0, 0, 0.82)",
      border: "1px solid rgba(78, 255, 150, 0.35)",
      borderRadius: "8px",
      color: "#9dffba",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "11px",
      lineHeight: "1.5",
      pointerEvents: "none",
      whiteSpace: "pre-wrap",
    });
    document.body.appendChild(panel);
    return panel;
  };

  const heroMotionDebug = createHeroMotionDebug();
  heroMotionDebug.style.display = "none";

  const updateHeroMotionDebug = ({
    t,
    arrivalProgress,
    rotationProgress,
    yRotationProgress,
    modelYRad,
    offsetYRad,
  }) => {
    const modelYDeg = THREE.MathUtils.radToDeg(modelYRad);
    const offsetYDeg = THREE.MathUtils.radToDeg(offsetYRad);
    const combinedYDeg = modelYDeg + offsetYDeg;
    const scrollDelta = Math.abs(t - heroMotionDebugState.lastScroll);
    const yDelta = Math.abs(
      combinedYDeg - heroMotionDebugState.lastCombinedYDeg,
    );
    const stalled = scrollDelta > 0.002 && yDelta < 0.04;

    heroMotionDebug.innerHTML = [
      "HERO Y DEBUG",
      `scroll(t): ${t.toFixed(3)}`,
      `arrival: ${arrivalProgress.toFixed(3)}`,
      `rot prog: ${rotationProgress.toFixed(3)}`,
      `y prog: ${yRotationProgress.toFixed(3)}`,
      `model y: ${modelYDeg.toFixed(2)}deg`,
      `offset y: ${offsetYDeg.toFixed(2)}deg`,
      `combined y: ${combinedYDeg.toFixed(2)}deg`,
      `y/frame: ${yDelta.toFixed(3)}deg`,
      `stalled: ${stalled ? "YES" : "NO"}`,
    ].join("\n");

    window.__heroMotionDebug = {
      t,
      arrivalProgress,
      rotationProgress,
      yRotationProgress,
      modelYDeg,
      offsetYDeg,
      combinedYDeg,
      yDelta,
      stalled,
    };

    heroMotionDebugState.lastScroll = t;
    heroMotionDebugState.lastCombinedYDeg = combinedYDeg;
    heroMotionDebugState.lastStalled = stalled;
  };

  window.addEventListener("mousemove", (e) => {
    // Disable mouse movement animation below 991px
    if (window.innerWidth < 991) {
      tiltState.targetX = 0;
      tiltState.targetY = 0;
      return;
    }
    tiltState.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    tiltState.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const exrLoader = new EXRLoader();
  let envTexture = null;

  exrLoader.load(settings.environment.url, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    envTexture = texture;
    if (settings.environment.enabled) {
      scene.environment = texture;
      scene.environmentIntensity = settings.environment.intensity;
      if (scene.environmentRotation) {
        scene.environmentRotation.y = settings.environment.rotation;
      }
    }
  });

  const ambientLight = new THREE.AmbientLight(
    settings.ambient.color,
    settings.ambient.intensity,
  );
  ambientLight.visible = settings.ambient.enabled;
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(
    settings.keyLight.color,
    settings.keyLight.intensity,
  );
  dirLight.position.set(
    settings.keyLight.startX,
    settings.keyLight.startY,
    settings.keyLight.startZ,
  );
  dirLight.visible = settings.keyLight.enabled;
  // Add to scene directly so lights don't move with model
  scene.add(dirLight);
  scene.add(dirLight.target);

  const fillLight = new THREE.DirectionalLight(
    settings.fillLight.color,
    settings.fillLight.intensity,
  );
  fillLight.position.set(
    settings.fillLight.startX,
    settings.fillLight.startY,
    settings.fillLight.startZ,
  );
  fillLight.visible = settings.fillLight.enabled;
  // Add to scene directly so lights don't move with model
  scene.add(fillLight);
  scene.add(fillLight.target);

  const rimLight = new THREE.SpotLight(
    settings.rim.color,
    settings.rim.intensity,
  );
  rimLight.position.set(settings.rim.x, settings.rim.y, settings.rim.z);
  rimLight.angle = settings.rim.angle;
  rimLight.penumbra = settings.rim.penumbra;
  rimLight.visible = settings.rim.enabled;
  lightsRig.add(rimLight);
  lightsRig.add(rimLight.target);

  const targetFrontLight = new THREE.DirectionalLight(
    settings.targetFront.color,
    settings.targetFront.intensity,
  );
  targetFrontLight.position.set(
    settings.targetFront.x,
    settings.targetFront.y,
    settings.targetFront.z,
  );
  targetFrontLight.visible = settings.targetFront.enabled;
  lightsRig.add(targetFrontLight);
  lightsRig.add(targetFrontLight.target);

  const mobileRotationLight = new THREE.SpotLight(
    settings.mobileRotationLight.color,
    0,
    settings.mobileRotationLight.distance,
    settings.mobileRotationLight.angle,
    settings.mobileRotationLight.penumbra,
    1,
  );
  mobileRotationLight.visible = false;
  scene.add(mobileRotationLight);
  scene.add(mobileRotationLight.target);

  const updateMaterials = () => {
    if (!model) return;
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        const isVideoMesh =
          child.material.map === heroVideoTexture ||
          child.material.map === terminalVideoTexture;
        if (!isVideoMesh) {
          child.material.metalness = settings.material.metalness;
          child.material.roughness = settings.material.roughness;
          child.material.envMapIntensity = settings.material.envMapIntensity;
        }
      }
    });
    if (envTexture) scene.environmentIntensity = settings.environment.intensity;
  };

  const stabilizeVideoMaterialForMobile = (material) => {
    if (!isMobile() || !material) return;
    // Reduce border shimmer/z-fighting artifacts on mobile video surfaces.
    material.toneMapped = false;
    material.transparent = false;
    material.opacity = 1;
    material.side = THREE.FrontSide;
    material.depthWrite = true;
    material.depthTest = true;
    material.forceSinglePass = true;
    material.polygonOffset = true;
    material.polygonOffsetFactor = -2;
    material.polygonOffsetUnits = -2;
  };

  const stabilizeVideoMeshForMobile = (mesh) => {
    if (!isMobile() || !mesh) return;
    // Draw video screen consistently above nearby coplanar faces on mobile.
    mesh.renderOrder = 30;
    if (!mesh.userData.__mobileVideoInsetScaleApplied) {
      // Tiny shrink to keep video safely inside the physical screen bezel.
      mesh.scale.x *= 0.996;
      mesh.scale.y *= 0.996;
      mesh.userData.__mobileVideoInsetScaleApplied = true;
    }
  };

  const insetVideoUVsForMobile = (
    mesh,
    insetX = 0.004,
    insetTop = 0.004,
    insetBottom = 0.01,
  ) => {
    if (!isMobile() || !mesh?.geometry?.attributes?.uv) return;
    const uv = mesh.geometry.attributes.uv;
    const minU = insetX;
    const maxU = 1 - insetX;
    const minV = insetTop;
    const maxV = 1 - insetBottom;
    for (let i = 0; i < uv.count; i++) {
      const u = THREE.MathUtils.clamp(uv.getX(i), 0, 1);
      const v = THREE.MathUtils.clamp(uv.getY(i), 0, 1);
      uv.setXY(
        i,
        THREE.MathUtils.lerp(minU, maxU, u),
        THREE.MathUtils.lerp(minV, maxV, v),
      );
    }
    uv.needsUpdate = true;
  };

  const createVideoMaterial = (texture, opacity) => {
    if (isMobile()) {
      return new THREE.MeshBasicMaterial({
        map: texture,
        toneMapped: false,
        transparent: false,
        opacity: 1,
        side: THREE.FrontSide,
      });
    }

    return new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: settings.video.emissiveIntensity,
      toneMapped: false,
      transparent: true,
      opacity,
      roughness: 0.0,
      metalness: 0.0,
      envMapIntensity: 0.0,
      side: THREE.DoubleSide,
    });
  };

  const selectVideoTargetMeshes = (targetNode) => {
    if (!targetNode) return [];

    const allMeshes = [];
    targetNode.traverse((child) => {
      if (child.isMesh && child.geometry?.attributes?.position) {
        allMeshes.push(child);
      }
    });

    if (!allMeshes.length) return [];

    const planarCandidates = [];
    allMeshes.forEach((mesh) => {
      const geometry = mesh.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);

      const axes = [Math.abs(size.x), Math.abs(size.y), Math.abs(size.z)].sort(
        (a, b) => b - a,
      );
      const largest = axes[0];
      const second = axes[1];
      const smallest = axes[2];
      if (largest <= 0 || second <= 0) return;

      const planarity = smallest / largest;
      if (planarity > 0.03) return;

      const matName = (mesh.material?.name || "").toLowerCase();
      const area = largest * second;
      let score = area;

      if (
        matName.includes("screen") ||
        matName.includes("display") ||
        matName.includes("appearance-13") ||
        matName.includes("part 2")
      ) {
        score *= 1.2;
      }

      planarCandidates.push({ mesh, score });
    });

    if (!planarCandidates.length) {
      return allMeshes;
    }

    planarCandidates.sort((a, b) => b.score - a.score);
    return [planarCandidates[0].mesh];
  };

  const applyVideoToSelection = (displayName) => {
    const targetNode = nodeMap[displayName];
    videoMeshes = [];
    if (!targetNode) return;

    heroVideoMaterial = createVideoMaterial(
      heroVideoTexture,
      settings.video.heroOpacity,
    );
    stabilizeVideoMaterialForMobile(heroVideoMaterial);

    terminalVideoMaterial = createVideoMaterial(
      terminalVideoTexture,
      settings.video.terminalOpacity,
    );
    stabilizeVideoMaterialForMobile(terminalVideoMaterial);

    const targetMeshes = selectVideoTargetMeshes(targetNode);
    targetMeshes.forEach((child) => {
      const geometry = child.geometry;
      const hasUVs =
        geometry &&
        geometry.attributes &&
        geometry.attributes.uv &&
        geometry.attributes.position &&
        geometry.attributes.uv.count === geometry.attributes.position.count;

      if (!hasUVs) {
        applyPlanarUVs(child);
      }
      insetVideoUVsForMobile(child);
      stabilizeVideoMeshForMobile(child);
      videoMeshes.push(child);
      child.material = heroVideoMaterial;
    });

    if (settings.video.playing) {
      heroVideo.play().catch((e) => {});
      terminalVideo.play().catch((e) => {});
    }
    updateVideoOpacity();
    updateMaterials();
  };

  const updateVideoOpacity = () => {
    videoMeshes.forEach((mesh) => {
      mesh.material = heroVideoMaterial.clone();
      mesh.material.opacity = settings.video.heroOpacity;
      mesh.material.transparent = true;
      stabilizeVideoMaterialForMobile(mesh.material);

      if (settings.video.terminalOpacity > 0) {
        mesh.material.map = terminalVideoTexture;
        if ("emissiveMap" in mesh.material) {
          mesh.material.emissiveMap = terminalVideoTexture;
        }
        mesh.material.opacity = settings.video.terminalOpacity;
      } else {
        mesh.material.map = heroVideoTexture;
        if ("emissiveMap" in mesh.material) {
          mesh.material.emissiveMap = heroVideoTexture;
        }
        mesh.material.opacity = settings.video.heroOpacity;
      }
      if (isMobile()) {
        mesh.material.transparent = false;
        mesh.material.opacity = 1;
      }
      mesh.material.needsUpdate = true;
    });
  };

  const setHeroVideoSource = (nextSrc) => {
    if (heroVideo.src === nextSrc) {
      heroVideo.currentTime = 0;
      heroVideo.play().catch((e) => {});
      heroVideoTexture.needsUpdate = true;
      return;
    }

    const restartHeroVideo = () => {
      heroVideo.currentTime = 0;
      heroVideo.play().catch((e) => {});
      heroVideoTexture.needsUpdate = true;
    };

    heroVideo.pause();
    heroVideo.src = nextSrc;
    heroVideo.load();

    if (heroVideo.readyState >= 1) {
      restartHeroVideo();
      return;
    }

    heroVideo.addEventListener("loadeddata", restartHeroVideo, { once: true });
  };

  const playInitialHeroVideo = () => {
    activeVideoKey = "hero";
    setHeroVideoSource(heroVideoSrc);
  };

  const setHeroSceneVisibility = (visible) => {
    heroSceneVisible = visible;
    if (settings.video.playing) {
      heroVideo.play().catch((e) => {});
      terminalVideo.play().catch((e) => {});
    }
  };

  const applyScale = () => {
    if (!model) return;
    const multiplier = isMobile()
      ? settings.mobileScaleMultiplier
      : getScaleMultiplier();
    const finalScale = baseScale * multiplier;
    model.scale.set(finalScale, finalScale, finalScale);
  };

  const trackedLightTarget = new THREE.Vector3();
  const trackedLightOffset = new THREE.Vector3();
  const trackedLightQuaternion = new THREE.Quaternion();

  const setMobileTrackedDirectionalLight = (light, x, y, z) => {
    if (!model || !light) return;
    model.updateWorldMatrix(true, false);
    model.getWorldPosition(trackedLightTarget);
    model.getWorldQuaternion(trackedLightQuaternion);
    trackedLightOffset.set(x, y, z).applyQuaternion(trackedLightQuaternion);
    light.position.copy(trackedLightTarget).add(trackedLightOffset);
    light.target.position.copy(trackedLightTarget);
    light.target.updateMatrixWorld();
  };

  const updateMobileRotationLight = (rotationProgress) => {
    const lightSettings = settings.mobileRotationLight;
    if (!isMobile() || !model || !lightSettings.enabled) {
      mobileRotationLight.visible = false;
      mobileRotationLight.intensity = 0;
      return;
    }

    const rotationStarted = rotationProgress > 0.001;
    const fadeIn = rotationStarted
      ? Math.max(
          0.55,
          THREE.MathUtils.smoothstep(
            rotationProgress,
            0.001,
            lightSettings.fadeInEnd,
          ),
        )
      : 0;
    const intensity = lightSettings.intensity * fadeIn;

    mobileRotationLight.visible = intensity > 0.001;
    mobileRotationLight.intensity = intensity;
    mobileRotationLight.color.set(lightSettings.color);
    mobileRotationLight.angle = lightSettings.angle;
    mobileRotationLight.penumbra = lightSettings.penumbra;
    mobileRotationLight.distance = lightSettings.distance;

    model.updateWorldMatrix(true, false);
    model.getWorldPosition(trackedLightTarget);
    mobileRotationLight.position.set(
      trackedLightTarget.x + lightSettings.offsetX,
      trackedLightTarget.y + lightSettings.offsetY,
      trackedLightTarget.z + lightSettings.offsetZ,
    );
    mobileRotationLight.target.position.copy(trackedLightTarget);
    mobileRotationLight.target.updateMatrixWorld();
  };

  const updateEnvironment = () => {
    if (settings.environment.enabled && envTexture) {
      scene.environment = envTexture;
      scene.environmentIntensity = settings.environment.intensity;
      if (scene.environmentRotation) {
        scene.environmentRotation.y = settings.environment.rotation;
      }
      return;
    }

    scene.environment = null;
  };

  const updateStaticRigLights = () => {
    rimLight.position.set(settings.rim.x, settings.rim.y, settings.rim.z);
    rimLight.angle = settings.rim.angle;
    rimLight.penumbra = settings.rim.penumbra;
    targetFrontLight.position.set(
      settings.targetFront.x,
      settings.targetFront.y,
      settings.targetFront.z,
    );
  };

  const setVideoPlaying = (playing) => {
    settings.video.playing = playing;
    if (playing) {
      heroVideo.play().catch((e) => {});
      terminalVideo.play().catch((e) => {});
      return;
    }

    heroVideo.pause();
    terminalVideo.pause();
  };

  const setupGUI = () => {
    const gui = new GUI({ title: "Hero Scene Controls" });
    gui.hide();
    // Keep GUI above all hero elements.
    gui.domElement.style.zIndex = "10000";
    gui.domElement.style.position = "fixed";
    gui.domElement.style.top = "10px";
    gui.domElement.style.right = "10px";

    const addVectorControls = (
      folder,
      target,
      names = ["x", "y", "z"],
      range = 8,
      onChange = null,
    ) => {
      const attach = (controller) =>
        onChange ? controller.onChange(onChange) : controller;
      attach(folder.add(target, names[0], -range, range, 0.001).name("X"));
      attach(folder.add(target, names[1], -range, range, 0.001).name("Y"));
      attach(folder.add(target, names[2], -range, range, 0.001).name("Z"));
    };

    const mobileOnlyLightFolder = gui.addFolder("Mobile Rotation Light");
    mobileOnlyLightFolder
      .add(settings.mobileRotationLight, "enabled")
      .name("Enabled");
    mobileOnlyLightFolder
      .add(settings.mobileRotationLight, "intensity", 0, 5, 0.001)
      .name("Intensity");
    mobileOnlyLightFolder
      .addColor(settings.mobileRotationLight, "color")
      .name("Color");
    addVectorControls(
      mobileOnlyLightFolder.addFolder("Position Offset"),
      settings.mobileRotationLight,
      ["offsetX", "offsetY", "offsetZ"],
      2,
    );
    mobileOnlyLightFolder
      .add(settings.mobileRotationLight, "angle", 0, Math.PI / 2, 0.001)
      .name("Angle");
    mobileOnlyLightFolder
      .add(settings.mobileRotationLight, "penumbra", 0, 1, 0.001)
      .name("Penumbra");
    mobileOnlyLightFolder
      .add(settings.mobileRotationLight, "distance", 0, 10, 0.001)
      .name("Distance");
    mobileOnlyLightFolder
      .add(settings.mobileRotationLight, "fadeInEnd", 0.01, 1, 0.001)
      .name("Fade In End");
    mobileOnlyLightFolder.open();
    return;

    const rendererFolder = gui.addFolder("Renderer");
    rendererFolder
      .add(renderer, "toneMappingExposure", 0, 5, 0.01)
      .name("Exposure");

    const environmentFolder = gui.addFolder("Environment");
    environmentFolder
      .add(settings.environment, "enabled")
      .name("Enabled")
      .onChange(updateEnvironment);
    environmentFolder
      .add(settings.environment, "intensity", 0, 5, 0.001)
      .name("Intensity")
      .onChange(updateEnvironment);
    environmentFolder
      .add(settings.environment, "rotation", -Math.PI, Math.PI, 0.001)
      .name("Rotation")
      .onChange(updateEnvironment);

    const materialFolder = gui.addFolder("Material");
    materialFolder
      .add(settings.material, "roughness", 0, 1, 0.001)
      .name("Roughness")
      .onChange(updateMaterials);
    materialFolder
      .add(settings.material, "metalness", 0, 1, 0.001)
      .name("Metalness")
      .onChange(updateMaterials);
    materialFolder
      .add(settings.material, "envMapIntensity", 0, 5, 0.001)
      .name("Env Map")
      .onChange(updateMaterials);

    const lightsFolder = gui.addFolder("Lighting");
    lightsFolder
      .add(settings.ambient, "enabled")
      .name("Ambient On")
      .onChange((value) => (ambientLight.visible = value));
    lightsFolder
      .add(settings.ambient, "intensity", 0, 5, 0.001)
      .name("Ambient Start");
    lightsFolder
      .add(settings.ambient, "targetIntensity", 0, 5, 0.001)
      .name("Ambient End");
    lightsFolder
      .addColor(settings.ambient, "color")
      .name("Ambient Color")
      .onChange((value) => ambientLight.color.set(value));

    const keyFolder = lightsFolder.addFolder("Key Light");
    keyFolder
      .add(settings.keyLight, "enabled")
      .name("Enabled")
      .onChange((value) => (dirLight.visible = value));
    keyFolder
      .add(settings.keyLight, "intensity", 0, 10, 0.001)
      .name("Start Intensity");
    keyFolder
      .add(settings.keyLight, "targetIntensity", 0, 10, 0.001)
      .name("End Intensity");
    keyFolder
      .addColor(settings.keyLight, "color")
      .name("Color")
      .onChange((value) => dirLight.color.set(value));
    addVectorControls(
      keyFolder.addFolder("Start Position"),
      settings.keyLight,
      ["startX", "startY", "startZ"],
    );
    addVectorControls(
      keyFolder.addFolder("End Position"),
      settings.keyLight,
      ["targetX", "targetY", "targetZ"],
    );

    const fillFolder = lightsFolder.addFolder("Fill Light");
    fillFolder
      .add(settings.fillLight, "enabled")
      .name("Enabled")
      .onChange((value) => (fillLight.visible = value));
    fillFolder
      .add(settings.fillLight, "intensity", 0, 10, 0.001)
      .name("Start Intensity");
    fillFolder
      .add(settings.fillLight, "targetIntensity", 0, 10, 0.001)
      .name("End Intensity");
    fillFolder
      .addColor(settings.fillLight, "color")
      .name("Color")
      .onChange((value) => fillLight.color.set(value));
    addVectorControls(
      fillFolder.addFolder("Start Position"),
      settings.fillLight,
      ["startX", "startY", "startZ"],
    );
    addVectorControls(
      fillFolder.addFolder("End Position"),
      settings.fillLight,
      ["targetX", "targetY", "targetZ"],
    );

    const rimFolder = lightsFolder.addFolder("Rim Light");
    rimFolder
      .add(settings.rim, "enabled")
      .name("Enabled")
      .onChange((value) => (rimLight.visible = value));
    rimFolder
      .add(settings.rim, "intensity", 0, 10, 0.001)
      .name("Intensity");
    rimFolder
      .addColor(settings.rim, "color")
      .name("Color")
      .onChange((value) => rimLight.color.set(value));
    addVectorControls(
      rimFolder.addFolder("Position"),
      settings.rim,
      ["x", "y", "z"],
      20,
      updateStaticRigLights,
    );
    rimFolder
      .add(settings.rim, "angle", 0, Math.PI / 2, 0.001)
      .name("Angle")
      .onChange(updateStaticRigLights);
    rimFolder
      .add(settings.rim, "penumbra", 0, 1, 0.001)
      .name("Penumbra")
      .onChange(updateStaticRigLights);

    const targetFrontFolder = lightsFolder.addFolder("Target Front Light");
    targetFrontFolder
      .add(settings.targetFront, "enabled")
      .name("Enabled")
      .onChange((value) => (targetFrontLight.visible = value));
    targetFrontFolder
      .add(settings.targetFront, "intensity", 0, 10, 0.001)
      .name("Intensity");
    targetFrontFolder
      .addColor(settings.targetFront, "color")
      .name("Color")
      .onChange((value) => targetFrontLight.color.set(value));
    addVectorControls(
      targetFrontFolder.addFolder("Position"),
      settings.targetFront,
      ["x", "y", "z"],
      5,
      updateStaticRigLights,
    );

    const mobileRotationLightFolder = lightsFolder.addFolder(
      "Mobile Rotation Light",
    );
    mobileRotationLightFolder
      .add(settings.mobileRotationLight, "enabled")
      .name("Enabled");
    mobileRotationLightFolder
      .add(settings.mobileRotationLight, "intensity", 0, 5, 0.001)
      .name("Intensity");
    mobileRotationLightFolder
      .addColor(settings.mobileRotationLight, "color")
      .name("Color");
    addVectorControls(
      mobileRotationLightFolder.addFolder("Position Offset"),
      settings.mobileRotationLight,
      ["offsetX", "offsetY", "offsetZ"],
      2,
    );
    mobileRotationLightFolder
      .add(settings.mobileRotationLight, "angle", 0, Math.PI / 2, 0.001)
      .name("Angle");
    mobileRotationLightFolder
      .add(settings.mobileRotationLight, "penumbra", 0, 1, 0.001)
      .name("Penumbra");
    mobileRotationLightFolder
      .add(settings.mobileRotationLight, "distance", 0, 10, 0.001)
      .name("Distance");
    mobileRotationLightFolder
      .add(settings.mobileRotationLight, "fadeInEnd", 0.01, 1, 0.001)
      .name("Fade In End");
    mobileRotationLightFolder
      .add(settings.mobileRotationLight, "fadeOutStart", 0.01, 1, 0.001)
      .name("Fade Out Start");

    const scaleFolder = gui.addFolder("Scale & Motion");
    scaleFolder
      .add(settings, "scaleMultiplier", 0, 0.5, 0.001)
      .name("Desktop Scale")
      .onChange(applyScale);
    scaleFolder
      .add(settings, "scaleMid", 0, 0.5, 0.001)
      .name("Desktop Mid Scale");
    scaleFolder
      .add(settings, "mobileScaleMultiplier", 0, 1.0, 0.001)
      .name("Mobile Scale")
      .onChange(applyScale);
    scaleFolder
      .add(settings, "mobileScaleMid", 0, 1.0, 0.001)
      .name("Mobile Mid Scale");
    scaleFolder.add(settings, "floatSpeed", 0, 5, 0.001).name("Float Speed");
    scaleFolder.add(settings, "floatAmp", 0, 0.05, 0.0005).name("Float Y");

    const initialOffsetFolder = gui.addFolder("Initial Offset");
    const initialDesktopFolder = initialOffsetFolder.addFolder("Desktop");
    addVectorControls(
      initialDesktopFolder.addFolder("Position"),
      settings.initial,
      ["x", "y", "z"],
      0.5,
    );
    addVectorControls(
      initialDesktopFolder.addFolder("Rotation"),
      settings.initial,
      ["rotX", "rotY", "rotZ"],
      180,
    );
    const initialMobileFolder = initialOffsetFolder.addFolder("Mobile");
    addVectorControls(
      initialMobileFolder.addFolder("Position"),
      settings.mobileInitial,
      ["x", "y", "z"],
      0.5,
    );
    addVectorControls(
      initialMobileFolder.addFolder("Rotation"),
      settings.mobileInitial,
      ["rotX", "rotY", "rotZ"],
      180,
    );

    const finalOffsetFolder = gui.addFolder("Final Offset");
    const finalDesktopFolder = finalOffsetFolder.addFolder("Desktop");
    addVectorControls(
      finalDesktopFolder.addFolder("Position"),
      settings.finalOffset.desktop.position,
      ["x", "y", "z"],
      0.5,
    );
    addVectorControls(
      finalDesktopFolder.addFolder("Rotation"),
      settings.finalOffset.desktop.rotationRad,
      ["x", "y", "z"],
      1,
    );
    finalDesktopFolder
      .add(settings.finalOffset.desktop, "scale", 0.5, 4, 0.001)
      .name("Scale");
    const finalMobileFolder = finalOffsetFolder.addFolder("Mobile");
    addVectorControls(
      finalMobileFolder.addFolder("Position"),
      settings.finalOffset.mobile.position,
      ["x", "y", "z"],
      0.5,
    );
    addVectorControls(
      finalMobileFolder.addFolder("Rotation"),
      settings.finalOffset.mobile.rotationRad,
      ["x", "y", "z"],
      1,
    );
    finalMobileFolder
      .add(settings.finalOffset.mobile, "scale", 0.5, 4, 0.001)
      .name("Scale");

    const cameraFolder = gui.addFolder("Camera");
    addVectorControls(
      cameraFolder.addFolder("Start"),
      settings.cameraStart,
      ["x", "y", "z"],
      2,
    );
    addVectorControls(
      cameraFolder.addFolder("End"),
      settings.cameraEnd,
      ["x", "y", "z"],
      2,
    );

    const videoFolder = gui.addFolder("Video");
    videoFolder
      .add(settings.video, "playing")
      .name("Playing")
      .onChange(setVideoPlaying);
    videoFolder
      .add(settings.video, "emissiveIntensity", 0, 5, 0.001)
      .name("Emissive")
      .onChange(() => {
        if (heroVideoMaterial) {
          heroVideoMaterial.emissiveIntensity = settings.video.emissiveIntensity;
        }
        if (terminalVideoMaterial) {
          terminalVideoMaterial.emissiveIntensity =
            settings.video.emissiveIntensity;
        }
        updateVideoOpacity();
      });
    videoFolder
      .add(settings.video, "heroOpacity", 0, 1, 0.001)
      .name("Hero Opacity")
      .onChange(updateVideoOpacity);
    videoFolder
      .add(settings.video, "terminalOpacity", 0, 1, 0.001)
      .name("Terminal Opacity")
      .onChange(updateVideoOpacity);

    const debugFolder = gui.addFolder("Debug");
    debugFolder
      .add(settings.debug, "useManualScroll")
      .name("Manual Scroll");
    debugFolder
      .add(settings.debug, "manualProgress", 0, 1, 0.001)
      .name("Progress");

    rendererFolder.open();
    environmentFolder.open();
    materialFolder.open();
    lightsFolder.open();
    scaleFolder.open();
    initialOffsetFolder.open();
    finalOffsetFolder.open();
  };

  setupGUI();

  const scrollState = { progress: 0 };
  const moveState = { progress: 0 };
  const rotationState = { progress: 0 };
  // Mobile scroll state for simplified mobile scroll behavior
  const mobileScrollState = { progress: 0 };
  const startPos = new THREE.Vector3();
  const targetPos = new THREE.Vector3();
  const initialPos = new THREE.Vector3();
  const finalPos = new THREE.Vector3();
  let mobileYLockDirection = 0;
  let mobileLockedTargetX = null;

  let cachedTargetEl = null;
  let lastTargetHighlightState = null;

  const getRenderBounds = () => {
    try {
      const bounds = (
        canvas.parentElement instanceof HTMLElement
          ? canvas.parentElement
          : canvas
      ).getBoundingClientRect();

      // On mobile, ensure we have valid dimensions even if element is transitioning
      if (isMobile() && (bounds.width === 0 || bounds.height === 0)) {
        // Use safe viewport dimensions helper - works across all browser versions
        const viewport = getViewportDimensions();
        const vw = viewport.width;
        const vh = viewport.height;
        return {
          left: 0,
          top: 0,
          right: vw,
          bottom: vh,
          width: vw,
          height: vh,
        };
      }

      return bounds;
    } catch (e) {
      // Fallback to safe viewport dimensions if getBoundingClientRect fails
      const viewport = getViewportDimensions();
      return {
        left: 0,
        top: 0,
        right: viewport.width,
        bottom: viewport.height,
        width: viewport.width,
        height: viewport.height,
      };
    }
  };

  const updateMobileTargetHighlight = (targetEl, aligned) => {
    if (!targetEl) return;
    if (!isMobile()) {
      if (lastTargetHighlightState !== null) {
        targetEl.style.outline = "";
        targetEl.style.outlineOffset = "";
        targetEl.style.backgroundColor = "";
        targetEl.style.transition = "";
        lastTargetHighlightState = null;
      }
      return;
    }

    if (lastTargetHighlightState === aligned) return;

    targetEl.style.outline = aligned
      ? "2px solid rgba(56, 245, 155, 0.95)"
      : "2px solid rgba(255, 120, 72, 0.95)";
    targetEl.style.outlineOffset = "-2px";
    targetEl.style.backgroundColor = aligned
      ? "rgba(56, 245, 155, 0.14)"
      : "rgba(255, 120, 72, 0.14)";
    targetEl.style.transition =
      "outline-color 0.2s ease, background-color 0.2s ease";
    lastTargetHighlightState = aligned;
  };

  const getTargetPos = (out = new THREE.Vector3()) => {
    try {
      if (!cachedTargetEl) {
        cachedTargetEl =
          document.querySelector(".target-marker") ||
          document.querySelector("#target");
      }
      const targetEl = cachedTargetEl;
      if (!targetEl) return out.copy(startPos);

      const rect = targetEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const cameraZ = Math.abs(settings.cameraStart.z);
      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFOV / 2) * cameraZ;
      const visibleWidth = visibleHeight * camera.aspect;

      // Use safe viewport dimensions helper - works across all browser versions
      const viewport = getViewportDimensions();
      const viewportWidth = viewport.width;
      const viewportHeight = viewport.height;

      // Calculate position as percentage from viewport center
      // This works consistently across Chrome, Safari, and all mobile browsers
      const pctX = cx / viewportWidth - 0.5;
      const pctY = 0.5 - cy / viewportHeight;
      const targetX = pctX * visibleWidth;
      const targetY = pctY * visibleHeight;

      return out.set(targetX, targetY, 0);
    } catch (e) {
      // Fallback to start position if anything fails
      return out.copy(startPos);
    }
  };

  const getWorldXFromPixels = (pixels) => {
    try {
      const viewport = getViewportDimensions();
      if (!viewport.width) return 0;
      const cameraZ = Math.abs(settings.cameraStart.z);
      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFOV / 2) * cameraZ;
      const visibleWidth = visibleHeight * camera.aspect;
      return (pixels / viewport.width) * visibleWidth;
    } catch (e) {
      return 0;
    }
  };

  const alignMobileModelToTarget = (position, arrivalProgress) => {
    try {
      const targetEl =
        cachedTargetEl ||
        document.querySelector(".target-marker") ||
        document.querySelector("#target");

      if (!isMobile() || !targetEl) {
        updateMobileTargetHighlight(targetEl, false);
        return false;
      }

      const renderBounds = getRenderBounds();
      if (renderBounds.width <= 0 || renderBounds.height <= 0) {
        updateMobileTargetHighlight(targetEl, false);
        return false;
      }

      const cameraZ = Math.abs(settings.cameraStart.z);
      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFOV / 2) * cameraZ;
      const visibleWidth = visibleHeight * camera.aspect;

      const targetRect = targetEl.getBoundingClientRect();
      const targetCx = targetRect.left + targetRect.width / 2;
      const targetCy = targetRect.top + targetRect.height / 2;

      // Use safe viewport dimensions helper - works across all browser versions
      const viewport = getViewportDimensions();
      const viewportWidth = viewport.width;
      const viewportHeight = viewport.height;

      const modelCx = (position.x / visibleWidth + 0.5) * viewportWidth;
      const modelCy = (0.5 - position.y / visibleHeight) * viewportHeight;

      const deltaX = targetCx - modelCx;
      const deltaY = targetCy - modelCy;
      const snapStrength = THREE.MathUtils.smoothstep(arrivalProgress, 0.82, 1);

      if (snapStrength > 0) {
        position.x += (deltaX / viewportWidth) * visibleWidth * snapStrength;
        position.y -= (deltaY / viewportHeight) * visibleHeight * snapStrength;
      }

      const aligned = Math.hypot(deltaX, deltaY) <= 18;
      updateMobileTargetHighlight(targetEl, aligned);

      return aligned;
    } catch (e) {
      // Silently fail and return false to prevent breaking the animation
      return false;
    }
  };

  const calculateFitScale = () => {
    try {
      const container =
        document.querySelector(START_CONTAINER_ID) || document.body;
      const rect = container.getBoundingClientRect();
      const size = modelOriginalSize;

      if (size.length() === 0) return 1;
      const cameraZ = Math.abs(settings.cameraStart.z);
      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const heightAtDist = 2 * Math.tan(vFOV / 2) * cameraZ;
      const widthAtDist = heightAtDist * camera.aspect;

      // Use safe viewport dimensions helper - works across all browser versions
      const viewport = getViewportDimensions();
      const viewportWidth = viewport.width;
      const viewportHeight = viewport.height;

      const scaleX = (widthAtDist * (rect.width / viewportWidth)) / size.x;
      const scaleY = (heightAtDist * (rect.height / viewportHeight)) / size.y;
      // Apply multiplier for mobile screens only (<= 767px)
      const w = window.innerWidth;
      if (w <= 767) {
        return Math.min(scaleX, scaleY) * 1.5;
      } else {
        return Math.min(scaleX, scaleY);
      }
    } catch (e) {
      // Return default scale if calculation fails
      return 1;
    }
  };

  // Track preloader completion state
  let preloaderComplete = false;
  let modelLoaded = false;
  let allAnimationsStarted = false;
  let scrollAnimationsStarted = false;
  let heroEntranceAnimationsStarted = false;
  let modelEntranceTween = null;
  let modelEntranceComplete = false;
  const hasScriptReference = (fileName) =>
    Array.from(document.scripts).some((script) =>
      (script.src || "").includes(fileName),
    );
  const HERO_LOGO_REVEAL_DURATION_SECONDS = 1.2;
  const HERO_LOGO_REVEAL_OPACITY_DURATION_SECONDS = 1;
  const HERO_LOGO_REVEAL_STAGGER_SECONDS = 0.06;
  const HERO_LOGO_REVEAL_RELEASE_PROGRESS = 0.2;
  const HERO_LOGO_REVEAL_EASE = "expo.out";
  const HERO_LOGO_REVEAL_OPACITY_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  const NAV_REVEAL_DURATION_SECONDS = 0.9;
  const NAV_REVEAL_DELAY_AFTER_PRELOADER_SECONDS = 0.2;
  const NAV_REVEAL_EASE = "power3.out";
  const HERO_START_AFTER_PRELOADER_MS = 1000;
  const PRELOADER_COMPLETE_HOLD_MS = 500;
  const PRELOADER_COUNT_SECONDS_PER_PERCENT = 0.025;
  let preloaderDisplayReached100 = false;
  let preloaderCompletionDelayId = null;
  const REQUIRED_PROGRESS_TASKS = [
    { key: "script:heroScript-stagging", weight: 1 },
    { key: "dom:heroScript-stagging", weight: 1 },
    { key: "model:heroScript-stagging", weight: 8 },
  ];

  // Note: We only add external script dependencies if they actually integrate with loadRegistry
  // Scripts must call loadRegistry.markScriptReady() and loadRegistry.markModelReady() 
  // If they don't, the preloader will get stuck waiting
  const hasExplodeModelIntegration = false; // Set to true if explodeModel-stagging.js uses loadRegistry
  if (hasExplodeModelIntegration && (
    hasScriptReference("explodeModel-stagging.js") ||
    document.getElementById("canvas-explode")
  )) {
    REQUIRED_PROGRESS_TASKS.push(
      { key: "script:explodeModel-stagging", weight: 1 },
      { key: "model:explodeModel-stagging", weight: 8 },
    );
  }

  const hasNeocondaCopyIntegration = false; // Set to true if neoconda-script.copy-stagging.js uses loadRegistry
  if (hasNeocondaCopyIntegration && hasScriptReference("neoconda-script.copy-stagging.js")) {
    REQUIRED_PROGRESS_TASKS.push({
      key: "script:neoconda-script.copy-stagging",
      weight: 1,
    });
  }

  const areRequiredAssetsReady = () =>
    REQUIRED_PROGRESS_TASKS.every(
      ({ key }) => loadRegistry.getTaskProgress(key) >= 1,
    );

  const primeLogoPreloaderAnimation = () => {
    const logoPreloader = document.querySelector(".logo-preloader");
    if (!logoPreloader) return;

    if (!logoPreloader.querySelector("svg")) {
      logoPreloader.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 101 63" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoPreloaderAnimatedDiagonalGradient" x1="-100" y1="-100" x2="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#0E0E0E" />
              <stop offset="0.5" stop-color="#56FF8E" />
              <stop offset="1" stop-color="#0E0E0E" />
              <animate attributeName="x1" from="-100" to="100" dur="0.75s" repeatCount="indefinite" />
              <animate attributeName="y1" from="-100" to="100" dur="0.75s" repeatCount="indefinite" />
              <animate attributeName="x2" from="0" to="200" dur="0.75s" repeatCount="indefinite" />
              <animate attributeName="y2" from="0" to="200" dur="0.75s" repeatCount="indefinite" />
            </linearGradient>
          </defs>
          <path d="M63.23 0.0201751L66.6665 9.3034C67.0163 10.2294 66.9968 11.2583 66.606 12.1844L59.8742 28.1361C58.4952 31.3882 53.8435 31.2859 52.6085 27.9721L47.71 14.7789C46.475 11.4033 41.7006 11.3621 40.4039 14.717L21.4474 62.9623H0C0.0411655 62.6948 0.102906 62.4067 0.205786 62.1392L24.5759 0.0201751H63.23Z" fill="url(#logoPreloaderAnimatedDiagonalGradient)"/>
          <path d="M100.752 0L76.0519 62.9623H38.7765L38.798 62.9422L34.6809 51.8271C34.3312 50.901 34.3518 49.8721 34.7428 48.9461L41.4732 32.9943C42.8522 29.7424 47.5036 29.8451 48.7389 33.1584L53.6374 46.3529C54.8725 49.7281 59.6479 49.7693 60.9448 46.4148L79.1804 0H100.752Z" fill="url(#logoPreloaderAnimatedDiagonalGradient)"/>
        </svg>
      `;
    }

    logoPreloader.style.visibility = "visible";
    logoPreloader.style.opacity = "1";
    logoPreloader.style.pointerEvents = "none";
    if (getComputedStyle(logoPreloader).display === "none") {
      logoPreloader.style.display = "block";
    }

    logoPreloader.querySelectorAll("svg").forEach((svgEl) => {
      svgEl.style.visibility = "visible";
      svgEl.style.opacity = "1";
    });

    logoPreloader.querySelectorAll("animate").forEach((animateEl) => {
      if (typeof animateEl.beginElement === "function") {
        try {
          animateEl.beginElement();
        } catch (error) {}
      }
    });
  };

  // Safety timeout: force preloader completion after 30 seconds (generous time for model loading)
  // This should rarely trigger - only if there's a real error
  const PRELOADER_TIMEOUT_MS = 30000;
  let preloaderTimeoutId = null;
  let lastLoggedProgress = 0;
  let revealSvgPathsPromise = null;
  let navRevealStarted = false;
  let navRevealScheduled = false;

  const getNavComponent = () => document.querySelector(".nav_component");

  const primeNavRevealInitialState = () => {
    const navComponent = getNavComponent();
    if (!navComponent) return;

    gsap.killTweensOf(navComponent);
    gsap.set(navComponent, {
      yPercent: -100,
      autoAlpha: 1,
      force3D: true,
    });
    navComponent.style.visibility = "visible";
    navComponent.style.willChange = "transform";
  };

  const revealNavComponent = () => {
    if (navRevealStarted) return;

    const navComponent = getNavComponent();
    if (!navComponent) return;

    navRevealStarted = true;
    gsap.killTweensOf(navComponent);
    navComponent.style.visibility = "visible";
    navComponent.style.willChange = "transform";

    gsap.fromTo(
      navComponent,
      { yPercent: -100, autoAlpha: 1 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: NAV_REVEAL_DURATION_SECONDS,
        ease: NAV_REVEAL_EASE,
        force3D: true,
        clearProps: "transform",
        onComplete: () => {
          navComponent.style.willChange = "auto";
        },
      },
    );
  };

  const revealNavAfterPreloader = () => {
    if (navRevealStarted || navRevealScheduled) return;

    const navComponent = getNavComponent();
    if (!navComponent) return;

    navRevealScheduled = true;
    primeNavRevealInitialState();

    gsap.delayedCall(NAV_REVEAL_DELAY_AFTER_PRELOADER_SECONDS, () => {
      navRevealScheduled = false;
      revealNavComponent();
    });
  };

  const getHeroLogoRevealElement = () => {
    const revealSvg = document.querySelector(".reveal-svg");
    const heroLogo = document.querySelector("#hero-logo-large-to-move");

    try {
      if (window.innerWidth <= 991 && revealSvg) {
        return revealSvg;
      }
    } catch (e) {}

    return heroLogo || revealSvg;
  };

  const getHeroLogoRevealPaths = () => {
    try {
      if (window.innerWidth > 991) {
        const revealSvgPaths = Array.from(document.querySelectorAll(".reveal-svg path"));
        if (revealSvgPaths.length) return revealSvgPaths;
      }
    } catch (e) {}

    const heroLogo = getHeroLogoRevealElement();
    const scopedPaths = heroLogo ? Array.from(heroLogo.querySelectorAll("path")) : [];
    if (scopedPaths.length) return scopedPaths;

    return Array.from(document.querySelectorAll(".reveal-svg path"));
  };

  const primeHeroLogoRevealInitialState = () => {
    const heroLogo = getHeroLogoRevealElement();
    const revealSvgs = Array.from(document.querySelectorAll(".reveal-svg"));
    const revealTargets = Array.from(
      new Set([heroLogo, ...revealSvgs].filter(Boolean)),
    );

    revealTargets.forEach((target) => {
      target.style.opacity = "0";
      target.style.visibility = "visible";
      target.style.transition = "none";
    });

    getHeroLogoRevealPaths().forEach((path) => {
      path.style.opacity = "1";
      path.style.filter = "none";
      path.style.transform = "translateY(300px)";
      path.style.animation = "none";
    });
  };

  const showHeroLogoRevealElement = () => {
    const heroLogo = getHeroLogoRevealElement();
    const revealSvgs = Array.from(document.querySelectorAll(".reveal-svg"));
    const revealTargets = Array.from(
      new Set([heroLogo, ...revealSvgs].filter(Boolean)),
    );

    revealTargets.forEach((target) => {
      target.style.transition = `opacity ${HERO_LOGO_REVEAL_OPACITY_DURATION_SECONDS}s ${HERO_LOGO_REVEAL_OPACITY_EASE}`;
      target.style.opacity = "1";
      target.style.visibility = "visible";
    });
  };

  const runHeroLogoRevealBeforeModelStart = () => {
    if (revealSvgPathsPromise) return revealSvgPathsPromise;

    revealSvgPathsPromise = new Promise((resolve) => {
      const paths = getHeroLogoRevealPaths();
      showHeroLogoRevealElement();

      if (!paths.length) {
        resolve();
        return;
      }

      const revealDurationSeconds = HERO_LOGO_REVEAL_DURATION_SECONDS;
      const staggerSeconds = HERO_LOGO_REVEAL_STAGGER_SECONDS;
      const maxRevealTimeMs =
        (revealDurationSeconds + staggerSeconds * (paths.length - 1)) * 1000;
      let fallbackTimeoutId = null;
      let releaseTimeoutId = null;
      let hasReleasedModelStart = false;

      const releaseModelStart = () => {
        if (hasReleasedModelStart) return;
        hasReleasedModelStart = true;
        resolve();
      };

      const finish = () => {
        if (fallbackTimeoutId) {
          clearTimeout(fallbackTimeoutId);
          fallbackTimeoutId = null;
        }
        if (releaseTimeoutId) {
          clearTimeout(releaseTimeoutId);
          releaseTimeoutId = null;
        }
        paths.forEach((path) => {
          path.style.willChange = "auto";
        });
        releaseModelStart();
      };

      paths.forEach((path) => {
        gsap.killTweensOf(path);
        path.style.opacity = "1";
        path.style.filter = "none";
        path.style.willChange = "transform";
        path.style.animation = "none";
      });

      const tl = gsap.timeline({
        onComplete: finish,
      });

      tl.fromTo(
        paths,
        { y: 300 },
        {
          y: 0,
          duration: revealDurationSeconds,
          stagger: {
            each: staggerSeconds,
          },
          ease: HERO_LOGO_REVEAL_EASE,
          clearProps: "transform",
        },
      );

      releaseTimeoutId = setTimeout(
        releaseModelStart,
        maxRevealTimeMs * HERO_LOGO_REVEAL_RELEASE_PROGRESS,
      );
      fallbackTimeoutId = setTimeout(finish, maxRevealTimeMs + 80);
    });

    return revealSvgPathsPromise;
  };

  const startAfterHeroLogoReveal = (callback) => {
    runHeroLogoRevealBeforeModelStart().then(callback);
  };

  const startHeroAnimationsAfterPreloader = () => {
    setTimeout(() => {
      primeHeroLogoRevealInitialState();
      startAfterHeroLogoReveal(startAllAnimations);
    }, HERO_START_AFTER_PRELOADER_MS);
  };

  primeHeroLogoRevealInitialState();
  primeNavRevealInitialState();
  
  const startPreloaderSafetyTimeout = () => {
    if (preloaderTimeoutId) return;
    preloaderTimeoutId = setTimeout(() => {
      if (!preloaderComplete) {
        console.error('[heroScript-stagging] CRITICAL: Preloader timeout after 30s');
        console.error('Loading task status:', REQUIRED_PROGRESS_TASKS.map(({ key, weight }) => ({
          key,
          weight,
          progress: loadRegistry.getTaskProgress(key)
        })));
        preloaderComplete = true;
        hidePreloaderAndStartAnimations();
      }
    }, PRELOADER_TIMEOUT_MS);
  };
  
  // Progress logging - shows loading status every 10%
  const logLoadingProgress = () => {
    const currentProgress = Math.round(loadRegistry.getCombinedProgress(REQUIRED_PROGRESS_TASKS) * 100);
    if (currentProgress >= lastLoggedProgress + 10 || currentProgress === 100) {
      console.log(`[heroScript-stagging] Loading: ${currentProgress}%`);
      if (currentProgress < 100) {
        const incompleteTasks = REQUIRED_PROGRESS_TASKS
          .filter(({ key }) => loadRegistry.getTaskProgress(key) < 1)
          .map(({ key }) => key);
        if (incompleteTasks.length > 0) {
          console.log(`[heroScript-stagging] Waiting for: ${incompleteTasks.join(', ')}`);
        }
      }
      lastLoggedProgress = currentProgress;
    }
  };

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  loader.load(
    "media/3dtest/neoconda-test/models/neoconda-hero-header.glb",
    (gltf) => {
      model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      box.getSize(modelOriginalSize);

      finalOffsetGroup.add(model);

      model.traverse((node) => {
        if (node) {
          const name = node.name || `Unnamed`;
          const displayName = node.isMesh ? `Ã°Å¸â€œÂ¦ ${name}` : `Ã°Å¸â€œÂ ${name}`;
          nodeMap[displayName] = node;
        }
      });

      const targetName = settings.video.targetNode;
      const foundKey = Object.keys(nodeMap).find((k) => k.includes(targetName));
      if (foundKey) applyVideoToSelection(foundKey);

      baseScale = calculateFitScale();
      model.scale.set(0.001, 0.001, 0.001);
      model.visible = false;

      modelLoaded = true;
      loadRegistry.markModelReady("heroScript-stagging");
      maybeFinishPreloader();
    },
    // onProgress callback
    (event) => {
      const progress = event.total > 0 ? event.loaded / event.total : 0;
      loadRegistry.setModelProgress(
        "heroScript-stagging",
        event.loaded,
        event.total,
      );
      // Log model loading progress every 25%
      if (progress > 0 && Math.round(progress * 100) % 25 === 0) {
        console.log(`[heroScript-stagging] Model loading: ${Math.round(progress * 100)}%`);
      }
    },
    // onError callback
    (error) => {
      // console.error('Error loading model:', error);
    },
  );

  function maybeFinishPreloader() {
    if (!preloaderComplete && modelLoaded && areRequiredAssetsReady()) {
      // If resize reload, skip preloader animation and start immediately
      if (skipPreloaderOnResize) {
        preloaderComplete = true;
        if (preloaderTimeoutId) {
          clearTimeout(preloaderTimeoutId);
          preloaderTimeoutId = null;
        }
        console.log('[heroScript-stagging] Resize reload - starting animations immediately');
        revealNavAfterPreloader();
        startAfterHeroLogoReveal(startAllAnimations);
        return;
      }
      
      const currentProgress = Math.round(loadRegistry.getCombinedProgress(REQUIRED_PROGRESS_TASKS) * 100);
      
      // Complete only after the visible number reaches 100%, then hold briefly
      // so the final state is readable before the existing exit animation runs.
      if (currentProgress >= 100 && preloaderDisplayReached100 && !preloaderCompletionDelayId) {
        preloaderCompletionDelayId = setTimeout(() => {
          preloaderCompletionDelayId = null;
          if (preloaderComplete) return;
          preloaderComplete = true;
          if (preloaderTimeoutId) {
            clearTimeout(preloaderTimeoutId);
            preloaderTimeoutId = null;
          }
          console.log('[heroScript-stagging] All assets loaded - hiding preloader');
          hidePreloaderAndStartAnimations();
        }, PRELOADER_COMPLETE_HOLD_MS);
      }
    }
  }

  // Drive the preloader number from actual script/model/DOM readiness.
  function startPreloaderCountAnimation() {
    const preloaderNumber = document.getElementById("preloader-number");
    if (!preloaderNumber) {
      primeLogoPreloaderAnimation();
      preloaderDisplayReached100 = true;
      maybeFinishPreloader();
      loadRegistry.subscribe(() => {
        maybeFinishPreloader();
      });
      return;
    }

    let currentTween = null;
    let displayedProgress = 0;

    const updatePreloaderNumber = () => {
      const actualProgress = loadRegistry.getCombinedProgress(
        REQUIRED_PROGRESS_TASKS,
      );
      const targetProgress = Math.round(actualProgress * 100);
      
      // Log progress for debugging
      logLoadingProgress();

      // Always update if progress changed - ensure we reach 100%
      if (targetProgress !== displayedProgress) {
        const progressObj = { value: displayedProgress };
        const progressDiff = targetProgress - displayedProgress;
        
        // Keep big jumps readable, especially cached loads that jump straight to 100%.
        const duration = Math.max(0.35, Math.abs(progressDiff) * PRELOADER_COUNT_SECONDS_PER_PERCENT);

        // Kill any existing tween
        if (currentTween) {
          currentTween.kill();
        }

        // Create new tween for smooth number animation
        currentTween = gsap.to(progressObj, {
          value: targetProgress,
          duration: duration,
          ease: "power2.out",
          onUpdate: () => {
            const currentValue = Math.round(progressObj.value);
            displayedProgress = currentValue;
            preloaderNumber.textContent = `${currentValue}%`;
          },
          onComplete: () => {
            displayedProgress = targetProgress;
            if (targetProgress >= 100) {
              preloaderNumber.textContent = "100%";
              preloaderDisplayReached100 = true;
              maybeFinishPreloader();
            }
          },
        });
      }
    };

    primeLogoPreloaderAnimation();
    preloaderNumber.textContent = "0%";
    updatePreloaderNumber();
    loadRegistry.subscribe(updatePreloaderNumber);
  }

  startPreloaderCountAnimation();
  
  // Start safety timeout to prevent infinite loading
  startPreloaderSafetyTimeout();

  // Function to slide up preloader and start animations
  function hidePreloaderAndStartAnimations() {
    const preloaderWrapper = document.querySelector(".preloader-wrapper");
    const preloaderFirst = document.querySelector("#preloader-first");
    const preOne = document.querySelector("#pre-one");
    const preTwo = document.querySelector("#pre-two");
    const preThree = document.querySelector("#pre-three");
    const preloader = document.querySelector("#preloader");

    // Check if we have the new staggered preloader elements (preloader-first + pre-one, pre-two, pre-three)
    if (preloaderFirst && preOne && preTwo && preThree) {
      // Make content visible immediately behind the preloader before animation starts
      // const navComponent = document.querySelector(".nav_component");
      const svgOne = document.querySelector(".svg-one");
      const svgTwo = document.querySelector(".svg-two");

      // Set initial visibility for nav component
      // if (navComponent) {
      //   navComponent.style.visibility = 'visible';
      // }

      // Set SVGs to opacity 0 initially (will fade in during animation)
      if (svgOne) svgOne.style.opacity = "0";
      if (svgTwo) svgTwo.style.opacity = "0";
      if (svgOne) svgOne.style.visibility = "visible";
      if (svgTwo) svgTwo.style.visibility = "visible";

      startHeroAnimationsAfterPreloader();

      // Apply hardware acceleration to all preloader elements to prevent jerk
      [preloaderFirst, preOne, preTwo, preThree, preloader].forEach((el) => {
        if (el) {
          el.style.willChange = "transform";
          el.style.transform = "translate3d(0, 0, 0)";
          el.style.backfaceVisibility = "hidden";
        }
      });

      // Use absolute positioning timeline for precise control
      const tl = gsap.timeline({
        onComplete: () => {
          // Remove all preloader elements from DOM after animation
          [preloaderFirst, preOne, preTwo, preThree, preloader].forEach(
            (el) => {
              if (el && el.parentNode) {
                el.style.willChange = "auto";
                el.remove();
              }
            },
          );
          revealNavAfterPreloader();
        },
      });

      // Ensure all elements start at yPercent: 0
      [preloaderFirst, preOne, preTwo, preThree, preloader].forEach((el) => {
        if (el) {
          gsap.set(el, { yPercent: 0 });
        }
      });

      // preloaderFirst: moves FIRST with 0.5s duration
      tl.to(preloaderFirst, {
        yPercent: -100,
        duration: 0.6,
        ease: "power2.inOut",
        force3D: true,
      });

      // Other layers start at absolute time 0.35s for smooth stagger
      // Using consistent easing and force3D for smooth performance
      tl.to(
        preOne,
        {
          yPercent: -100,
          duration: 0.8,
          ease: "power2.inOut",
          force3D: true,
        },
        0.35,
      );

      tl.to(
        preTwo,
        {
          yPercent: -100,
          duration: 0.8,
          ease: "power2.inOut",
          force3D: true,
        },
        0.5,
      );

      tl.to(
        preThree,
        {
          yPercent: -100,
          duration: 0.8,
          ease: "power2.inOut",
          force3D: true,
        },
        0.65,
      );

      tl.to(
        preloader,
        {
          yPercent: -100,
          duration: 0.8,
          ease: "power2.inOut",
          force3D: true,
        },
        0.8,
      );

      return;
    }

    // Fallback for old preloader structure
    if (preloaderFirst || preOne || preTwo || preThree || preloader) {
      // Use the existing staggered preloader animation
      runStaggeredPreloaderAnimation();
      return;
    }

    if (!preloaderWrapper) {
      // If no preloader, just start animations immediately
      revealNavAfterPreloader();
      primeHeroLogoRevealInitialState();
      startAfterHeroLogoReveal(startAllAnimations);
      return;
    }

    // Prepare preloader for animation
    preloaderWrapper.style.cssText +=
      "will-change: transform; transform: translate3d(0, 0, 0);";

    startHeroAnimationsAfterPreloader();

    // Force reflow before animation
    void preloaderWrapper.offsetHeight;

    // Add transition and animate to negative Y
    preloaderWrapper.style.cssText +=
      "transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1); transform: translate3d(0, -100vh, 0);";

    // After preloader slides away completely, start everything
    preloaderWrapper.addEventListener(
      "transitionend",
      (e) => {
        if (e.target === preloaderWrapper && e.propertyName === "transform") {
          // Remove preloader from DOM
          preloaderWrapper.remove();
          revealNavAfterPreloader();
        }
      },
      { once: true },
    );
  }

  // Fallback staggered preloader animation
  function runStaggeredPreloaderAnimation() {
    const preloaderFirst = document.querySelector("#preloader-first");
    const preOne = document.querySelector("#pre-one");
    const preTwo = document.querySelector("#pre-two");
    const preThree = document.querySelector("#pre-three");
    const preloader = document.querySelector("#preloader");

    // Apply hardware acceleration
    [preloaderFirst, preOne, preTwo, preThree, preloader].forEach((el) => {
      if (el) {
        el.style.willChange = "transform";
        el.style.transform = "translate3d(0, 0, 0)";
        el.style.backfaceVisibility = "hidden";
      }
    });

    // Ensure all elements start at yPercent: 0
    [preloaderFirst, preOne, preTwo, preThree, preloader].forEach((el) => {
      if (el) {
        gsap.set(el, { yPercent: 0 });
      }
    });

    startHeroAnimationsAfterPreloader();

    const tl = gsap.timeline({
      onComplete: () => {
        // Remove all preloader elements after animation
        [preloaderFirst, preOne, preTwo, preThree, preloader].forEach((el) => {
          if (el && el.parentNode) {
            el.style.willChange = "auto";
            el.remove();
          }
        });
        revealNavAfterPreloader();
      },
    });

    // Staggered animation with consistent timing
    const staggerDelay = 0.15;
    const animDuration = 0.6;

    // Animate each element with yPercent for consistency
    if (preloaderFirst) {
      tl.to(preloaderFirst, {
        yPercent: -100,
        duration: animDuration,
        ease: "power2.inOut",
        force3D: true,
      });
    }

    if (preOne) {
      tl.to(
        preOne,
        {
          yPercent: -100,
          duration: animDuration,
          ease: "power2.inOut",
          force3D: true,
        },
        staggerDelay,
      );
    }

    if (preTwo) {
      tl.to(
        preTwo,
        {
          yPercent: -100,
          duration: animDuration,
          ease: "power2.inOut",
          force3D: true,
        },
        staggerDelay * 2,
      );
    }

    if (preThree) {
      tl.to(
        preThree,
        {
          yPercent: -100,
          duration: animDuration,
          ease: "power2.inOut",
          force3D: true,
        },
        staggerDelay * 3,
      );
    }

    if (preloader) {
      tl.to(
        preloader,
        {
          yPercent: -100,
          duration: animDuration,
          ease: "power2.inOut",
          force3D: true,
        },
        staggerDelay * 3,
      );
    }

  }

  // Function to start ALL animations after preloader is gone
  function startAllAnimations() {
    if (allAnimationsStarted) return;
    allAnimationsStarted = true;

    // Restore scroll before starting animations
    document.body.style.overflow = "auto";
    playInitialHeroVideo();

    // Hide hero-content initially - it will animate after model scales up
    const heroContent = document.querySelector("#hero-content");
    if (heroContent) {
      heroContent.style.opacity = "0";
    }

    start3DAnimations();
  }

  function runHeroEntranceAnimationsOnce() {
    if (heroEntranceAnimationsStarted) return;
    heroEntranceAnimationsStarted = true;
    runHeroEntranceAnimations();
  }

  // Hero entrance animations - runs AFTER preloader slides away
  function runHeroEntranceAnimations() {
    //const navComponent = document.querySelector(".nav_component");
    const svgOne = document.querySelector(".svg-one");
    const svgTwo = document.querySelector(".svg-two");

    // Apply will-change for smoother animations
    const elementsToAnimate = [svgOne, svgTwo].filter((el) => el);
    elementsToAnimate.forEach((el) => {
      el.style.willChange = "transform, opacity";
    });

    // Create timeline with smooth, gentle defaults
    let tl = gsap.timeline({
      defaults: {
        ease: "power2.out",
        duration: 1.2,
        force3D: true,
      },
    });

    // All elements start with generous stagger for smooth, flowing reveal
    const startTime = 0;
    const staggerDelay = 0.15;

    // Nav - gentle fade in from above (already visible, subtle animation)
    // if (navComponent) {
    //   tl.fromTo(navComponent,
    //     { y: -20, opacity: 0 },
    //     { y: 0, opacity: 1, duration: 1.0 },
    //     startTime
    //   );
    // }

    // SVGs - smooth slide from sides with gentle scale effect
    if (svgOne) {
      tl.fromTo(
        svgOne,
        { x: -60, scale: 0.9, opacity: 0 },
        { x: 0, scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" },
        startTime + staggerDelay,
      );
    }

    if (svgTwo) {
      tl.fromTo(
        svgTwo,
        { x: 60, scale: 0.9, opacity: 0 },
        { x: 0, scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" },
        startTime + staggerDelay,
      );
    }

    // Clean up will-change after animations complete
    tl.eventCallback("onComplete", () => {
      elementsToAnimate.forEach((el) => {
        el.style.willChange = "auto";
      });
    });
  }

  // 3D model animations
  function start3DAnimations() {
    if (!model) {
      allAnimationsStarted = false;
      return;
    }

    // Check if user is at the top of the page (first 100vh)
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const isAtTop = scrollY < 100; // Allow small tolerance
    const startMult = isMobile()
      ? settings.mobileScaleMultiplier
      : getScaleMultiplier();
    const targetScale = baseScale * startMult;

    if (!isAtTop) {
      // User is NOT at top on page load - instantly set model to full scale
      // Animation already "completed" before user sees it
      modelEntranceComplete = true;
      model.scale.set(targetScale, targetScale, targetScale);
      model.visible = true;
      runHeroEntranceAnimationsOnce();
    } else {
      // User is at top - animate scale up normally
      modelEntranceComplete = false;
      model.scale.set(0.001, 0.001, 0.001);
      model.visible = true;
      animateModelScale(targetScale);
      runHeroEntranceAnimationsOnce();
    }

    // Always set up scroll animations regardless of position
    setupScrollAnimations();
  }

  // Separate function to animate model scale up
  function animateModelScale(targetScale) {
    if (modelEntranceTween) {
      modelEntranceTween.kill();
    }
    modelEntranceTween = gsap.to(model.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 1.35,
      ease: "power3.out",
      overwrite: "auto",
      onComplete: () => {
        modelEntranceComplete = true;
        modelEntranceTween = null;
        runHeroEntranceAnimationsOnce();
        // Animate hero content after model is fully scaled
        // animateHeroContent();
      },
    });
  }

  // Animate hero content after model scale-up
  function animateHeroContent() {
    const heroContent = document.querySelector("#hero-content");
    if (heroContent) {
      heroContent.style.willChange = "transform, opacity";
      gsap.fromTo(
        heroContent,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: "power2.out",
          onComplete: () => {
            heroContent.style.willChange = "auto";
          },
        },
      );
    }
  }

  // Setup all scroll-related animations (separated from scale animation)
  function setupScrollAnimations() {
    if (scrollAnimationsStarted) return;
    scrollAnimationsStarted = true;

    const heroEl = document.querySelector("#hero");
    const targetEl = document.querySelector("#target");
    const wrapperEl = document.querySelector(".section-relative-wrap");
    const featuresPaddingEl = document.querySelector("#features-padding");
    const logoOutline = document.querySelector(".logo-outline");
    const canvasWrap = document.querySelector(".canvas-wrap");
    const canvasFadeTarget =
      document.querySelector("#canvas") ||
      document.querySelector("#app") ||
      canvasWrap;
    // const aboutRight = document.querySelector(".section_about-right");
    const visibilityEndTriggerEl = wrapperEl || targetEl || heroEl;
    const visibilityEndPosition = "bottom top";

    // if (aboutRight) aboutRight.style.opacity = "0";

    if (heroEl) {
      const elementsToFade = [logoOutline, canvasWrap].filter((el) => el);
      if (elementsToFade.length > 0) {
        gsap.fromTo(
          elementsToFade,
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: heroEl,
              start: "top top",
              end: "+=25%",
              scrub: HERO_SCROLL_SCRUB,
            },
          },
        );
      }
    }

    if (heroEl && targetEl) {
      gsap.to(scrollState, {
        progress: 1,
        scrollTrigger: {
          trigger: heroEl,
          start: "top top",
          endTrigger: targetEl,
          end: "top bottom",
          scrub: HERO_SCROLL_SCRUB,
        },
      });

      // if (aboutRight) {
      //   const setAboutRightOpacity = (value) => {
      //     aboutRight.style.opacity = String(value);
      //   };
      //
      //   ScrollTrigger.create({
      //     trigger: heroEl,
      //     start: "top top",
      //     endTrigger: targetEl,
      //     end: "top bottom",
      //     scrub: HERO_SCROLL_SCRUB,
      //     invalidateOnRefresh: true,
      //     onUpdate: (self) => {
      //       setAboutRightOpacity(
      //         THREE.MathUtils.clamp(
      //           (self.progress - 275 / 360) / (1 - 275 / 360),
      //           0,
      //           1,
      //         ).toFixed(3),
      //       );
      //     },
      //     onLeave: () => setAboutRightOpacity(1),
      //     onLeaveBack: () => setAboutRightOpacity(0),
      //     onRefresh: (self) =>
      //       setAboutRightOpacity(
      //         self.progress <= 0
      //           ? 0
      //           : self.progress >= 1
      //           ? 1
      //           : THREE.MathUtils.clamp(
      //               (self.progress - 275 / 360) / (1 - 275 / 360),
      //               0,
      //               1,
      //             ).toFixed(3),
      //       ),
      //   });
      // }
    }

    // Mobile-specific scroll trigger: DISABLED - using desktop behavior
    // Model movement for screen sizes below 767px
    // if (isMobile() && heroEl && targetEl) {
    //   gsap.to(mobileScrollState, {
    //     progress: 1,
    //     scrollTrigger: {
    //       trigger: heroEl,
    //       start: "top top",
    //       endTrigger: targetEl,
    //       end: "center center",
    //       scrub: HERO_SCROLL_SCRUB,
    //       invalidateOnRefresh: true,
    //     },
    //   });
    // }

    if (wrapperEl) {
      gsap.to(moveState, {
        progress: 1,
        scrollTrigger: {
          trigger: wrapperEl,
          start: "top 50%",
          end: "top top",
          scrub: HERO_SCROLL_SCRUB,
        },
      });
    }

    if (featuresPaddingEl && canvasFadeTarget) {
      const setCanvasFade = (opacity) => {
        gsap.to(canvasFadeTarget, {
          opacity,
          duration: 0.2,
          ease: "power1.out",
          overwrite: "auto",
        });
      };

      ScrollTrigger.create({
        trigger: featuresPaddingEl,
        start: "top top-=2%",
        end: "bottom top-=2%",
        invalidateOnRefresh: true,
        onEnter: () => setCanvasFade(0),
        onEnterBack: () => setCanvasFade(0),
        onLeaveBack: () => setCanvasFade(1),
        onRefresh: (self) => setCanvasFade(self.scroll() >= self.start ? 0 : 1),
      });
    }

    if (heroEl && wrapperEl) {
      gsap.to(rotationState, {
        progress: 1,
        scrollTrigger: {
          trigger: heroEl,
          start: "top top",
          endTrigger: wrapperEl,
          end: "top top",
          scrub: HERO_SCROLL_SCRUB,
        },
      });

      // Fade out hero-content within first 5% of scroll as model rotates
      const heroContentScroll = document.querySelector("#hero-content");
      if (heroContentScroll) {
        gsap.fromTo(
          heroContentScroll,
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: heroEl,
              start: "top top",
              end: "+=5%", // Fade completes within first 5% of scroll
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      ScrollTrigger.create({
        trigger: heroEl,
        start: "top bottom",
        endTrigger: visibilityEndTriggerEl,
        end: visibilityEndPosition,
        onEnter: () => setHeroSceneVisibility(true),
        onEnterBack: () => setHeroSceneVisibility(true),
        onLeave: () => setHeroSceneVisibility(false),
        onLeaveBack: () => setHeroSceneVisibility(false),
      });

      // Ensure ScrollTrigger recalculates on scroll direction changes
      // This fixes any positioning issues when scrolling back up
      ScrollTrigger.create({
        trigger: heroEl,
        start: "top top",
        endTrigger: targetEl,
        end: "top bottom",
        onUpdate: (self) => {
          // Clear cached target element on significant scroll changes
          // to ensure fresh position calculations
          if (self.direction !== self.previousDirection) {
            cachedTargetEl = null;
          }
          self.previousDirection = self.direction;
        },
      });

      // Refresh ScrollTrigger after setup to ensure proper calculations
      // Delay slightly on mobile to allow viewport to stabilize
      if (isMobile()) {
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      } else {
        ScrollTrigger.refresh();
      }
    }

    // Mobile-specific scroll trigger for simple position transition
    // Model moves from initial position to target as user scrolls from hero to target
    if (isMobile() && heroEl && targetEl) {
      gsap.to(mobileScrollState, {
        progress: 1,
        scrollTrigger: {
          trigger: heroEl,
          start: "top top",
          endTrigger: targetEl,
          end: "center center",
          scrub: HERO_SCROLL_SCRUB,
          invalidateOnRefresh: true,
        },
      });
    }

    // Refresh ScrollTrigger after setup to ensure proper calculations
    ScrollTrigger.refresh();

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      if (!heroSceneVisible) {
        // renderer.clear();
        return;
      }
      let t = settings.debug.useManualScroll
        ? settings.debug.manualProgress
        : scrollState.progress;

      const elapsedTime = clock.getElapsedTime();
      const interactionStrength = 1 - THREE.MathUtils.smoothstep(t, 0.02, 0.16);
      const floatShouldBeActive = interactionStrength > 0.001;

      if (floatShouldBeActive && !floatState.active) {
        floatState.active = true;
        floatState.startTime = elapsedTime;
      } else if (!floatShouldBeActive) {
        floatState.active = false;
      }

      const floatElapsed = floatState.active
        ? elapsedTime - floatState.startTime
        : 0;
      const floatOffsetY =
        Math.sin(floatElapsed * settings.floatSpeed) *
        settings.floatAmp *
        interactionStrength;
      // Disable floating animation on mobile
      const appliedFloatOffsetY = isMobile() ? 0 : floatOffsetY;

      // Mouse tilt - disabled on mobile
      if (!isMobile()) {
        tiltState.currentX = THREE.MathUtils.lerp(
          tiltState.currentX,
          tiltState.targetX,
          0.05,
        );
        tiltState.currentY = THREE.MathUtils.lerp(
          tiltState.currentY,
          tiltState.targetY,
          0.05,
        );
        pivotGroup.rotation.x =
          -tiltState.currentY * tiltStrength * interactionStrength;
        pivotGroup.rotation.y =
          tiltState.currentX * tiltStrength * interactionStrength;
      } else {
        // Reset tilt on mobile
        pivotGroup.rotation.x = 0;
        pivotGroup.rotation.y = 0;
      }

      // Use mobile or desktop initial/final settings based on device
      const currentInitial = isMobile()
        ? settings.mobileInitial
        : settings.initial;
      const currentFinal = isMobile() ? settings.mobileFinal : settings.final;
      const mobileStartOffsetX = isMobile() ? getWorldXFromPixels(18) : 0;
      initialPos.set(
        startPos.x + currentInitial.x + mobileStartOffsetX,
        startPos.y + currentInitial.y,
        startPos.z + currentInitial.z,
      );

      getTargetPos(targetPos);
      if (isMobile()) {
        // Lock X destination early so the model doesn't keep aligning on scroll.
        if (mobileScrollState.progress <= 0.001 || mobileLockedTargetX === null) {
          mobileLockedTargetX = targetPos.x;
        }
        finalPos.set(
          mobileLockedTargetX + currentFinal.x,
          targetPos.y + currentFinal.y,
          targetPos.z + currentFinal.z,
        );
      } else {
        finalPos.set(
          targetPos.x + currentFinal.x,
          targetPos.y + currentFinal.y,
          targetPos.z + currentFinal.z,
        );
      }

      // Mobile scroll-based positioning - simplified for mobile devices
      let arrivalProgress;
      let rotationProgress;
      let yRotationProgress;

      if (isMobile()) {
        // Mobile: direct scroll progress from 0 to 1 based on hero to target scroll
        const mobileProgress = mobileScrollState.progress;
        const mobileArrivalRaw = THREE.MathUtils.clamp(
          mobileProgress * 1.7,
          0,
          1,
        );
        // Reach center sooner with a smooth eased movement curve.
        arrivalProgress = THREE.MathUtils.smoothstep(mobileArrivalRaw, 0, 1);
        // Start/advance rotation earlier on mobile without changing layout triggers.
        rotationProgress = THREE.MathUtils.clamp(mobileProgress * 1.35, 0, 1);
        yRotationProgress = rotationProgress;
      } else {
        // Desktop: complex arrival calculation with delays
        arrivalProgress =
          moveState.progress * THREE.MathUtils.clamp((t - 0.5) / 0.5, 0, 1);
        rotationProgress = rotationState.progress;
        yRotationProgress = rotationProgress;
      }

      // Using desktop final offset for all screen sizes
      // const finalOffsetTarget = isMobile()
      //   ? settings.finalOffset.mobile
      // Use mobile or desktop final offset based on device
      const finalOffsetTarget = isMobile()
        ? settings.finalOffset.mobile
        : settings.finalOffset.desktop;

      // Model travels from initialPos to finalPos
      flipScaleGroup.position.lerpVectors(
        initialPos,
        finalPos,
        arrivalProgress,
      );

      // Floating animation (desktop behavior for all screen sizes)
      flipScaleGroup.position.y += appliedFloatOffsetY;

      finalOffsetGroup.position.set(
        THREE.MathUtils.lerp(0, finalOffsetTarget.position.x, arrivalProgress),
        THREE.MathUtils.lerp(0, finalOffsetTarget.position.y, arrivalProgress),
        THREE.MathUtils.lerp(0, finalOffsetTarget.position.z, arrivalProgress),
      );

      if (isMobile()) {
        const lockedY = startPos.y + settings.mobileInitial.y;
        const targetDeltaY = finalPos.y - lockedY;

        if (mobileScrollState.progress <= 0.001 || mobileYLockDirection === 0) {
          mobileYLockDirection = Math.sign(targetDeltaY) || 1;
        }

        const shouldStayLocked =
          mobileYLockDirection > 0 ? targetDeltaY > 0 : targetDeltaY < 0;

        if (shouldStayLocked) {
          // Keep Y fixed until the old destination crosses this locked height.
          flipScaleGroup.position.y = lockedY;
          finalOffsetGroup.position.y = settings.finalOffset.mobile.position.y;
        }
      }

      // Mobile rotation offset disabled - using desktop behavior
      // if (isMobile()) {
      //   finalOffsetGroup.rotation.set(0, 0, 0);
      // } else {
      finalOffsetGroup.rotation.set(
        THREE.MathUtils.lerp(
          0,
          finalOffsetTarget.rotationRad.x,
          rotationProgress,
        ),
        THREE.MathUtils.lerp(
          0,
          finalOffsetTarget.rotationRad.y,
          yRotationProgress,
        ),
        THREE.MathUtils.lerp(
          0,
          finalOffsetTarget.rotationRad.z,
          rotationProgress,
        ),
      );
      // }

      const finalOffsetScale = finalOffsetTarget.scale;
      finalOffsetGroup.scale.set(
        finalOffsetScale,
        finalOffsetScale,
        finalOffsetScale,
      );

      // Mobile model rotation disabled - using desktop behavior
      // if (isMobile()) {
      //   model.rotation.set(0, 0, 0);
      // } else {
      // Simplified rotation for mobile - no extra Z rotation
      if (isMobile()) {
        // Minimal rotation on mobile - just interpolate between initial and final
        model.rotation.x = THREE.MathUtils.lerp(
          THREE.MathUtils.degToRad(currentInitial.rotX),
          THREE.MathUtils.degToRad(currentFinal.rotX),
          rotationProgress,
        );
        model.rotation.y = THREE.MathUtils.lerp(
          THREE.MathUtils.degToRad(currentInitial.rotY),
          THREE.MathUtils.degToRad(currentFinal.rotY),
          rotationProgress,
        );
        model.rotation.z = THREE.MathUtils.lerp(
          THREE.MathUtils.degToRad(currentInitial.rotZ),
          THREE.MathUtils.degToRad(currentFinal.rotZ),
          rotationProgress,
        );
      } else {
        // Desktop: full rotation with extra Z spin
        model.rotation.x = THREE.MathUtils.lerp(
          THREE.MathUtils.degToRad(currentInitial.rotX),
          THREE.MathUtils.degToRad(currentFinal.rotX),
          rotationProgress,
        );
        model.rotation.y = THREE.MathUtils.lerp(
          THREE.MathUtils.degToRad(currentInitial.rotY),
          THREE.MathUtils.degToRad(currentFinal.rotY),
          rotationProgress,
        );

        const extraZRotation = Math.PI * 2 * rotationProgress;
        model.rotation.z =
          THREE.MathUtils.lerp(
            THREE.MathUtils.degToRad(currentInitial.rotZ),
            THREE.MathUtils.degToRad(currentFinal.rotZ),
            rotationProgress,
          ) + extraZRotation;
      }
      // }

      // Lights stay in initial position - don't rotate with model
      // lightsRig.rotation.copy(model.rotation);

      // Gradually interpolate lights from initial to target values during rotation
      // Use rotationProgress to determine how far along the rotation we are (0 to 1)
      const shouldTrackMobileLighting = isMobile();
      const lightProgress = shouldTrackMobileLighting ? 0 : rotationProgress;

      if (shouldTrackMobileLighting) {
        lightsRig.rotation.copy(model.rotation);
      } else {
        lightsRig.rotation.set(0, 0, 0);
      }

      if (envTexture) {
        scene.environmentIntensity = settings.environment.intensity;
      }

      rimLight.intensity = settings.rim.intensity;
      targetFrontLight.intensity = settings.targetFront.intensity;

      // Interpolate ambient light intensity
      ambientLight.intensity = THREE.MathUtils.lerp(
        settings.ambient.intensity,
        settings.ambient.targetIntensity,
        lightProgress,
      );

      // Interpolate key light intensity and position
      dirLight.intensity = THREE.MathUtils.lerp(
        settings.keyLight.intensity,
        settings.keyLight.targetIntensity,
        lightProgress,
      );
      dirLight.position.x = THREE.MathUtils.lerp(
        settings.keyLight.startX,
        settings.keyLight.targetX,
        lightProgress,
      );
      dirLight.position.y = THREE.MathUtils.lerp(
        settings.keyLight.startY,
        settings.keyLight.targetY,
        lightProgress,
      );
      dirLight.position.z = THREE.MathUtils.lerp(
        settings.keyLight.startZ,
        settings.keyLight.targetZ,
        lightProgress,
      );

      // Interpolate fill light intensity and position
      fillLight.intensity = THREE.MathUtils.lerp(
        settings.fillLight.intensity,
        settings.fillLight.targetIntensity,
        lightProgress,
      );
      fillLight.position.x = THREE.MathUtils.lerp(
        settings.fillLight.startX,
        settings.fillLight.targetX,
        lightProgress,
      );
      fillLight.position.y = THREE.MathUtils.lerp(
        settings.fillLight.startY,
        settings.fillLight.targetY,
        lightProgress,
      );
      fillLight.position.z = THREE.MathUtils.lerp(
        settings.fillLight.startZ,
        settings.fillLight.targetZ,
        lightProgress,
      );

      if (shouldTrackMobileLighting) {
        setMobileTrackedDirectionalLight(
          dirLight,
          settings.keyLight.startX,
          settings.keyLight.startY,
          settings.keyLight.startZ,
        );
        setMobileTrackedDirectionalLight(
          fillLight,
          settings.fillLight.startX,
          settings.fillLight.startY,
          settings.fillLight.startZ,
        );
      } else {
        dirLight.target.position.set(0, 0, 0);
        dirLight.target.updateMatrixWorld();
        fillLight.target.position.set(0, 0, 0);
        fillLight.target.updateMatrixWorld();
      }

      updateMobileRotationLight(rotationProgress);

      flipScaleGroup.scale.set(1, 1, 1);

      const mobileRotXDeg = THREE.MathUtils.radToDeg(model.rotation.x);
      const mobileRotYDeg = THREE.MathUtils.radToDeg(model.rotation.y);
      const mobileRotZDeg = THREE.MathUtils.radToDeg(model.rotation.z);
      const requestedMobileVideoTriggerRotation = {
        x: 100.26,
        y: 11.76,
        z: 31.98,
      };
      const mobileRotationStart = {
        x: settings.mobileInitial.rotX,
        y: settings.mobileInitial.rotY,
        z: settings.mobileInitial.rotZ,
      };
      const mobileRotationEnd = {
        x: settings.mobileFinal.rotX,
        y: settings.mobileFinal.rotY,
        z: settings.mobileFinal.rotZ,
      };
      const mobileRotationDelta = {
        x: mobileRotationEnd.x - mobileRotationStart.x,
        y: mobileRotationEnd.y - mobileRotationStart.y,
        z: mobileRotationEnd.z - mobileRotationStart.z,
      };
      const mobileRotationDeltaLengthSq =
        mobileRotationDelta.x * mobileRotationDelta.x +
        mobileRotationDelta.y * mobileRotationDelta.y +
        mobileRotationDelta.z * mobileRotationDelta.z;
      const mobileVideoTriggerProgress =
        mobileRotationDeltaLengthSq > 0
          ? THREE.MathUtils.clamp(
              ((requestedMobileVideoTriggerRotation.x - mobileRotationStart.x) *
                mobileRotationDelta.x +
                (requestedMobileVideoTriggerRotation.y -
                  mobileRotationStart.y) *
                  mobileRotationDelta.y +
                (requestedMobileVideoTriggerRotation.z -
                  mobileRotationStart.z) *
                  mobileRotationDelta.z) /
                mobileRotationDeltaLengthSq,
              0,
              1,
            )
          : 1;
      // Mobile video trigger logic disabled - using desktop behavior
      // const mobileVideoTriggered = isMobile()
      //   ? rotationProgress >= mobileVideoTriggerProgress
      //   : false;
      // const videoProgress = isMobile()
      //   ? (mobileVideoTriggered ? 1 : 0)
      //   : rotationProgress;
      // const threshold = isMobile() ? 0.5 : 0.5;
      // const range = isMobile() ? 0 : 0.05;

      if (isMobile()) {
        // Mobile: switch early without fade to avoid border/color shimmer.
        const shouldUseTerminalVideo = mobileScrollState.progress >= 0.03;
        settings.video.heroOpacity = shouldUseTerminalVideo ? 0.0 : 1.0;
        settings.video.terminalOpacity = shouldUseTerminalVideo ? 1.0 : 0.0;
      } else {
        const videoProgress = rotationProgress;
        const threshold = 0.5;
        const range = 0.05;

        if (videoProgress < threshold - range) {
          settings.video.heroOpacity = 1.0;
          settings.video.terminalOpacity = 0.0;
        } else if (videoProgress > threshold + range) {
          settings.video.heroOpacity = 0.0;
          settings.video.terminalOpacity = 1.0;
        } else {
          const p = (videoProgress - (threshold - range)) / (range * 2);
          settings.video.heroOpacity = 1.0 - p;
          settings.video.terminalOpacity = p;
        }
      }

      const nextVideoKey =
        settings.video.terminalOpacity > 0.5 ? "terminal" : "hero";
      const videoChanged = nextVideoKey !== activeVideoKey;

      if (videoChanged) {
        // Mobile video switching disabled - using desktop behavior
        // if (isMobile()) {
        //   setHeroVideoSource(
        //     nextVideoKey === "terminal" ? terminalVideoSrc : heroVideoSrc,
        //   );
        // } else {
        const nextVideoEl =
          nextVideoKey === "terminal" ? terminalVideo : heroVideo;
        nextVideoEl.currentTime = 0;
        nextVideoEl.play().catch((e) => {});
        // }
        activeVideoKey = nextVideoKey;
      }

      videoMeshes.forEach((mesh) => {
        if (videoChanged) {
          // Mobile video texture switching disabled - using desktop behavior
          // mesh.material.map =
          //   isMobile()
          //     ? heroVideoTexture
          //     : nextVideoKey === "terminal"
          //     ? terminalVideoTexture
          //     : heroVideoTexture;
          mesh.material.map =
            nextVideoKey === "terminal"
              ? terminalVideoTexture
              : heroVideoTexture;
          if ("emissiveMap" in mesh.material) {
            mesh.material.emissiveMap = mesh.material.map;
          }
          mesh.material.needsUpdate = true;
        }
        if (isMobile()) {
          mesh.material.opacity = 1;
          mesh.material.transparent = false;
        } else {
          mesh.material.opacity =
            nextVideoKey === "terminal"
              ? settings.video.terminalOpacity
              : settings.video.heroOpacity;
          mesh.material.transparent = true;
        }
      });

      updateHeroMotionDebug({
        t,
        arrivalProgress,
        rotationProgress,
        yRotationProgress,
        modelYRad: model.rotation.y,
        offsetYRad: finalOffsetGroup.rotation.y,
      });

      camera.position.set(0, 0, settings.cameraStart.z);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();
  }

  // Initialize with safe viewport dimensions
  let initialViewport = getViewportDimensions();
  let lastWidth = initialViewport.width;
  let lastHeight = initialViewport.height;

  const handleResize = () => {
    try {
      // Use safe viewport dimensions helper - works across all browser versions
      const viewport = getViewportDimensions();
      let currentWidth = viewport.width;
      let currentHeight = viewport.height;

      // Prevent excessive updates on mobile from address bar hide/show
      // Only skip if BOTH width and height are effectively the same
      const widthChanged = Math.abs(currentWidth - lastWidth) > 1;
      const heightChanged = Math.abs(currentHeight - lastHeight) > 1;

      // Also check window.innerWidth for mobile detection consistency
      let windowWidth;
      try {
        windowWidth = window.innerWidth;
      } catch (e) {
        windowWidth = currentWidth;
      }

      if (windowWidth <= 767 && !widthChanged) {
        return;
      }

      if (windowWidth <= 991 && !widthChanged && !heightChanged) {
        return;
      }

      lastWidth = currentWidth;
      lastHeight = currentHeight;

      camera.aspect = currentWidth / currentHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentWidth, currentHeight);
      if (model) {
        baseScale = calculateFitScale();
        if (modelEntranceComplete) {
          applyScale();
        }
      }

      // Clear cached target element on resize to force fresh calculation
      cachedTargetEl = null;
      mobileLockedTargetX = null;

      // Mobile ScrollTrigger refresh on resize disabled
      // if (windowWidth <= 767) {
      //   ScrollTrigger.refresh();
      // }
    } catch (e) {
      // Silently fail to prevent breaking the application
    }
  };

  window.addEventListener("resize", handleResize);

  // Use visualViewport resize for mobile when available (handles address bar show/hide better)
  // Feature-detect with safe property access for older browsers
  try {
    if (
      window.visualViewport &&
      typeof window.visualViewport.addEventListener === "function"
    ) {
      window.visualViewport.addEventListener("resize", handleResize);
    }
  } catch (e) {
    // visualViewport not supported - window.resize will handle it
  }
}
