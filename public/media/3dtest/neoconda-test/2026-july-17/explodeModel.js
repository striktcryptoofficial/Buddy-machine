import * as THREE from "three";
import { createBuddyMachine } from "../../../buddy-demo/machine.js?v=34";
import { mountRouterMachine } from "./routerMachine.js?v=20";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

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

const loadRegistry = getNeocondaLoadRegistry();
loadRegistry.markScriptReady("explodeModel-stagging");


// --- DEBUG & GUI CONFIG ---
const DEBUG = false;
const NON_MOBILE_MODEL_SCALE_FACTOR = 0.95;
const SUB_1440_MODEL_SCALE_BOOST_MAX = 1.12;
const ABOVE_1440_MODEL_SCALE_BOOST_AT_1920 = 1.224;
const MOBILE_SAFE_FIT_MAX_WIDTH = 767;
const MOBILE_SAFE_FIT_X = 0.86;
const MOBILE_SAFE_FIT_X_MIN = 0.8;
const MOBILE_SAFE_FIT_Y_MIN = 0.54;
const MOBILE_SAFE_FIT_Y_MAX = 0.72;
const MOBILE_SAFE_FIT_MIN_HEIGHT = 620;
const MOBILE_SAFE_FIT_MAX_HEIGHT = 900;
const MOBILE_MODEL_SCALE_BOOST_MIN = 1.06;
const MOBILE_MODEL_SCALE_BOOST_MAX = 1.16;
const MOBILE_MODEL_X_SHIFT_RATIO = 0.05;
const MOBILE_MODEL_Y_OFFSET_RATIO_MIN = 0.02;
const MOBILE_MODEL_Y_OFFSET_RATIO_MAX = 0.05;
const MOBILE_TEXT_CLEARANCE_WIDTH_START = 520;
const MOBILE_TEXT_CLEARANCE_WIDTH_END = 767;
const MOBILE_TEXT_CLEARANCE_SCALE_MIN = 0.88;
const MOBILE_TEXT_CLEARANCE_Y_OFFSET_RATIO_MAX = 0.055;
const TABLET_LAYOUT_MIN_WIDTH = 768;
const TABLET_LAYOUT_MAX_WIDTH = 991;
const TABLET_PORTRAIT_ASPECT_MIN = 0.82;
const TABLET_PORTRAIT_SCALE_BOOST_MIN = 1.16;
const TABLET_PORTRAIT_SCALE_BOOST_MAX = 1.28;
const TABLET_SHORT_HEIGHT_SCALE_BOOST = 1.08;
const TABLET_SHORT_HEIGHT_MAX = 750;
const TABLET_SAFE_FIT_X = 0.82;
const TABLET_SAFE_FIT_Y = 0.76;
const TABLET_HIGH_SPEED_M2_LABEL_Y_OFFSET = 0;
const DESKTOP_SAFE_FIT_X_MIN = 0.54;
const DESKTOP_SAFE_FIT_X_MID = 0.62;
const DESKTOP_SAFE_FIT_X_MAX = 0.7;
const DESKTOP_SAFE_FIT_Y_MIN = 0.62;
const DESKTOP_SAFE_FIT_Y_MAX = 0.8;
const DESKTOP_SAFE_FIT_HEIGHT_MIN = 650;
const DESKTOP_SAFE_FIT_HEIGHT_MAX = 900;
const DESKTOP_SHORT_HEIGHT_SCALE_MIN = 0.88;
const MOBILE_HEIGHT_RESIZE_THRESHOLD = 24;
const TABLET_LAYOUT_MODEL_SCALE_BOOST = 1.16;
const DESKTOP_992_TO_1420_SCALE_BOOST = 1.24;
const DESKTOP_992_TO_1420_SCALE_MIN_WIDTH = 992;
const DESKTOP_992_TO_1420_SCALE_MAX_WIDTH = 1420;
const DESKTOP_992_TO_1420_SAFE_FIT_X_START = 0.86;
const DESKTOP_992_TO_1420_SAFE_FIT_X_END = 0.78;
const DESKTOP_992_TO_1420_SAFE_FIT_Y = 0.92;
const EXPLODE_SMALL_SCREEN_Y_LIFT_MIN_WIDTH = 768;
const EXPLODE_SMALL_SCREEN_Y_LIFT_MAX_WIDTH = 1420;
const EXPLODE_SMALL_SCREEN_Y_LIFT_MIN = 0.08;
const EXPLODE_SMALL_SCREEN_Y_LIFT_MAX = 0.24;
const EXPLODE_SMALL_SCREEN_Y_LIFT_HEIGHT_MIN = 650;
const EXPLODE_SMALL_SCREEN_Y_LIFT_HEIGHT_MAX = 900;
const SHORT_VIEWPORT_LABEL_HEIGHT_MIN = 600;
const SHORT_VIEWPORT_LABEL_HEIGHT_MAX = 700;
const SHORT_VIEWPORT_MODEL_SCALE_MIN = 0.92;
const SHORT_VIEWPORT_LABEL_INSET_MAX = 0.035;
const SHORT_VIEWPORT_LINE_SCALE_MIN = 0.72;
function smoothstep01(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function isTabletLayoutWidth(width) {
  return width >= TABLET_LAYOUT_MIN_WIDTH && width <= TABLET_LAYOUT_MAX_WIDTH;
}

function getSub1440ModelScaleBoost(width) {
  if (width <= 767 || width >= 1440) return 1;

  const progressTo1440 = (width - 768) / (1440 - 768);
  const clampedProgress = Math.max(0, Math.min(1, progressTo1440));
  return SUB_1440_MODEL_SCALE_BOOST_MAX -
    (SUB_1440_MODEL_SCALE_BOOST_MAX - 1) * clampedProgress;
}

function getAbove1440ModelScaleBoost(width) {
  if (width <= 1440) return 1;

  if (width <= 1920) {
    const progressTo1920 = Math.max(0, Math.min(1, (width - 1440) / (1920 - 1440)));
    const earlyBoostProgress = 1 - Math.pow(1 - progressTo1920, 3);
    return 1 +
      (ABOVE_1440_MODEL_SCALE_BOOST_AT_1920 - 1) * earlyBoostProgress;
  }

  return 1;
}

function getResponsiveDesktopModelScaleBoost(width) {
  return getSub1440ModelScaleBoost(width) * getAbove1440ModelScaleBoost(width);
}

function getMobileTextClearanceProgress(width) {
  if (width <= MOBILE_TEXT_CLEARANCE_WIDTH_START || width > MOBILE_SAFE_FIT_MAX_WIDTH) {
    return 0;
  }

  return smoothstep01(
    (width - MOBILE_TEXT_CLEARANCE_WIDTH_START) /
      (MOBILE_TEXT_CLEARANCE_WIDTH_END - MOBILE_TEXT_CLEARANCE_WIDTH_START),
  );
}

function getMobileTextClearanceScaleFactor(width) {
  return THREE.MathUtils.lerp(
    1,
    MOBILE_TEXT_CLEARANCE_SCALE_MIN,
    getMobileTextClearanceProgress(width),
  );
}

function getDesktop992To1420ModelScaleBoost(width) {
  if (
    width < DESKTOP_992_TO_1420_SCALE_MIN_WIDTH ||
    width > DESKTOP_992_TO_1420_SCALE_MAX_WIDTH
  ) {
    return 1;
  }

  return DESKTOP_992_TO_1420_SCALE_BOOST;
}

function getTabletLayoutModelScaleBoost(width) {
  return isTabletLayoutWidth(width) ? TABLET_LAYOUT_MODEL_SCALE_BOOST : 1;
}

function getShortViewportPressure(height) {
  const progress =
    (height - SHORT_VIEWPORT_LABEL_HEIGHT_MIN) /
    (SHORT_VIEWPORT_LABEL_HEIGHT_MAX - SHORT_VIEWPORT_LABEL_HEIGHT_MIN);

  return 1 - smoothstep01(progress);
}

function getShortViewportModelScaleFactor(width, height) {
  if (width <= 767 || height >= SHORT_VIEWPORT_LABEL_HEIGHT_MAX) return 1;

  return THREE.MathUtils.lerp(
    1,
    SHORT_VIEWPORT_MODEL_SCALE_MIN,
    getShortViewportPressure(height),
  );
}

function getSmallScreenExplodeYOffset(width, height, expProgress) {
  if (
    width < EXPLODE_SMALL_SCREEN_Y_LIFT_MIN_WIDTH ||
    width > EXPLODE_SMALL_SCREEN_Y_LIFT_MAX_WIDTH
  ) {
    return 0;
  }

  const widthProgress =
    (width - EXPLODE_SMALL_SCREEN_Y_LIFT_MIN_WIDTH) /
    (EXPLODE_SMALL_SCREEN_Y_LIFT_MAX_WIDTH -
      EXPLODE_SMALL_SCREEN_Y_LIFT_MIN_WIDTH);
  const heightProgress =
    (height - EXPLODE_SMALL_SCREEN_Y_LIFT_HEIGHT_MIN) /
    (EXPLODE_SMALL_SCREEN_Y_LIFT_HEIGHT_MAX -
      EXPLODE_SMALL_SCREEN_Y_LIFT_HEIGHT_MIN);
  const widthLift = THREE.MathUtils.lerp(
    EXPLODE_SMALL_SCREEN_Y_LIFT_MAX,
    EXPLODE_SMALL_SCREEN_Y_LIFT_MIN,
    smoothstep01(widthProgress),
  );
  const heightLiftFactor = THREE.MathUtils.lerp(
    1.15,
    0.82,
    smoothstep01(heightProgress),
  );

  return widthLift * heightLiftFactor * expProgress;
}

const guiParams = {
  explodeScale: 0.072,
  mobileOffsetX: 60,
  mobileOffsetY: -20,
  mobileModelShiftX: 0.2,
  explodeShiftX: 0.4,
  modelBaseOffsetX: 0, // Shift model to the right to avoid label overlap
  desktopStartX: 0,
  desktopEndX: 0.25,
  desktopLabelLeftMin: 0.2,
  desktopLabelLeftMid: 0.26,
  desktopLabelLeftMax: 0.26,
  desktopLabelRightMin: 0.22,
  desktopLabelRightMid: 0.27,
  desktopLabelRightMax: 0.27,
  highSpeedM2SlotLabelYOffset: -44,
  smaAntennasLabelYOffset: 40,


  ambientLightIntensity: 0.46,
  ambientLightColor: "#c9c7c4",


  keyLightIntensity: 1.25,
  keyLightColor: "#fff6ee",
  keyLightX: -0.45,
  keyLightY: 0.95,
  keyLightZ: 1.15,


  fillLightIntensity: 0.2,
  fillLightColor: "#d8dbe0",
  fillLightX: 0.85,
  fillLightY: 0.05,
  fillLightZ: 0.55,


  externalExplodeLightIntensity: 0,
  externalExplodeLightColor: "#ffffff",
  externalExplodeLightX: 2.8,
  externalExplodeLightY: -1.86,
  externalExplodeLightZ: 1.78,
  externalExplodeLightDistance: 9,
  externalExplodeLightDecay: 1.35,


  rotationLightIntensity: 0,
  rotationLightColor: "#ffffff",
  rotationLightX: -3.08,
  rotationLightY: -0.91,
  rotationLightZ: 2.74,
  rotationLightDistance: 11.43,
  rotationLightDecay: 1.14,


  bottomLeftFillLightIntensity: 0,
  bottomLeftFillLightColor: "#ffffff",
  bottomLeftFillLightX: -1.64,
  bottomLeftFillLightY: -1.88,
  bottomLeftFillLightZ: 0.45,
  bottomLeftFillLightDistance: 20.39,
  bottomLeftFillLightDecay: 3,


  topLeftFillLightIntensity: 0,
  topLeftFillLightColor: "#ffffff",
  topLeftFillLightX: -4.83,
  topLeftFillLightY: 1.31,
  topLeftFillLightZ: -1.88,
  topLeftFillLightDistance: 25,
  topLeftFillLightDecay: 1.45,


  topRightFillLightIntensity: 0,
  topRightFillLightColor: "#ffffff",
  topRightFillLightX: 3.52,
  topRightFillLightY: 1.07,
  topRightFillLightZ: -1.88,
  topRightFillLightDistance: 25,
  topRightFillLightDecay: 1.45,


  bottomRightFillLightIntensity: 0,
  bottomRightFillLightColor: "#ffffff",
  bottomRightFillLightX: 1.31,
  bottomRightFillLightY: -1.27,
  bottomRightFillLightZ: -0.04,
  bottomRightFillLightDistance: 20.39,
  bottomRightFillLightDecay: 0,
};


console.log("[explodeModel] Script loaded", {
  hasContainer: !!document.getElementById("canvas-explode"),
  hasTriggerElement: !!document.querySelector(".section_home-features"),
  hasTextElement: !!document.querySelector(".home_text-animate"),
  hasScrubSlider: !!document.getElementById("explode-scrub"),
});


function injectStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
        #labels-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; z-index: 100; }
        .hotspot { position: absolute; display: flex; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.67); opacity: 0; transition: opacity 0.5s ease-in-out; visibility: hidden; line-height: 1.4; text-shadow: 0 1px 4px rgba(0,0,0,0.9); }
        .hotspot.visible { opacity: 1; visibility: visible; }
        .hotspot-text { display: flex; flex-direction: column; gap: 2px; padding: 4px 21px; border-radius: 4px; white-space: normal; max-width: 260px; }
        .hotspot-title { text-transform: uppercase; color: rgba(255, 255, 255, 0.82); }
        .hotspot-desc { font-size: 10px; font-weight: 500; letter-spacing: 0.01em; color: rgba(255, 255, 255, 0.6); text-transform: none; }
        .hotspot-line { position: absolute; top: calc(4px + 0.7em); height: 0.5px; background-color: rgba(255, 255, 255, 0.9); box-shadow: 0 0 3px rgba(0,0,0,0.8); pointer-events: none; }
        @media (min-width: 768px) { .hotspot-line { height: 0.5px; background-color: rgba(255, 255, 255, 0.9); box-shadow: 0 0 3px rgba(0,0,0,0.67); } }
        .hotspot.align-left { text-align: right; justify-content: flex-end; }
        .hotspot.align-left .hotspot-line { left: 100%; margin-left: 5px; transform-origin: left center; }
        .hotspot.align-right { text-align: left; justify-content: flex-start; }
        .hotspot.align-right .hotspot-line { right: 100%; margin-right: 5px; transform-origin: right center; }
        .hotspot-number { display: none; width: 28px; height: 28px; border-radius: 50%; background: #2D2D2D; border: 1.457px solid rgba(255, 255, 255, 0.08); color: #1FE477; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.5); flex-shrink: 0; }
        @media (max-width: 767px) { .hotspot-number { display: flex; } .hotspot-text, .hotspot-line { display: none !important; } }
        #debug-hud { position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); color: #1FE477; font-family:  'JetBrains Mono', monospace; font-size: 11px; padding: 12px; border-radius: 4px; z-index: 9999; pointer-events: none; min-width: 180px; border: 1px solid #333; }
        .debug-bar-bg { width: 100%; height: 4px; background: #333; margin: 4px 0 8px 0; }
        .debug-bar-fill { height: 100%; background: #1FE477; width: 0%; }
        .debug-row { display: flex; justify-content: space-between; }
    `;
  document.head.appendChild(style);
}


const container = document.getElementById("canvas-explode");
if (container) container.style.position = "relative";


function createLabelContainer() {
  const old = document.getElementById("labels-container");
  if (old) old.remove();
  const div = document.createElement("div");
  div.id = "labels-container";
  if (container) container.appendChild(div);
  else document.body.appendChild(div);
  return div;
}


function updateDebug(rotP, expP) {
  if (!DEBUG) return;
  let hud = document.getElementById("debug-hud");
  if (!hud) {
    hud = document.createElement("div");
    hud.id = "debug-hud";
    document.body.appendChild(hud);
  }
  hud.innerHTML = `
        <div class="debug-row"><span>ROTATION</span><span>${Math.round(rotP * 100)}%</span></div>
        <div class="debug-bar-bg"><div class="debug-bar-fill" style="width:${rotP * 100}%"></div></div>
        <div class="debug-row"><span>EXPLODE</span><span>${Math.round(expP * 100)}%</span></div>
        <div class="debug-bar-bg"><div class="debug-bar-fill" style="width:${expP * 100}%; background:#ff0055"></div></div>
    `;
}


injectStyles();
const labelContainer = createLabelContainer();
const triggerElement = document.querySelector(".section_home-features");
const textElement = document.querySelector(".home_text-animate");
const scrubSlider = document.getElementById("explode-scrub");
const SCREEN_ROUGHNESS_GROUP_NAME = "Group3001_11";
const SCREEN_ROUGHNESS_VALUE = 1;
const MOBILE_LABEL_VISIBLE_PROGRESS = 0.78;
const DESKTOP_LABEL_VISIBLE_PROGRESS = 0.88;


  let START_ROTATION = { x: 1.55, y: 0, z: 0 };
  let END_ROTATION = { x: 1.55, y: 0, z: Math.PI };


function startExplodeScene() {
  const scene = new THREE.Scene();


  // --- STATE CACHING ---
  let scrollViewportHeight = window.innerHeight;
  let scrollViewportWidth = window.innerWidth;


  // --- FREEZE DIMENSIONS ON LOAD ---
  // Calculate dimensions once and lock them. Ignore scroll track stretching.
  function calculateFrozenDimensions() {
    let cw = container.clientWidth;
    let ch = container.clientHeight;


    if (ch > window.innerHeight * 1.5) ch = window.innerHeight;
    if (cw < 50) cw = window.innerWidth;
    if (ch < 50) ch = window.innerHeight;


    return { width: cw, height: ch };
  }


  let frozenDims = calculateFrozenDimensions();


  const camera = new THREE.PerspectiveCamera(
    50,
    frozenDims.width / frozenDims.height,
    0.1,
    1000,
  );
  camera.position.set(0, 0, 5);


  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(frozenDims.width, frozenDims.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.96;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.position = "relative";
  container.appendChild(renderer.domElement);


  // --- LIGHT SETUP ---
  const ambientLight = new THREE.AmbientLight(
    guiParams.ambientLightColor,
    guiParams.ambientLightIntensity,
  );
  scene.add(ambientLight);
  const keyLight = new THREE.DirectionalLight(
    guiParams.keyLightColor,
    guiParams.keyLightIntensity,
  );
  keyLight.position.set(
    guiParams.keyLightX,
    guiParams.keyLightY,
    guiParams.keyLightZ,
  );
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(
    guiParams.fillLightColor,
    guiParams.fillLightIntensity,
  );
  fillLight.position.set(
    guiParams.fillLightX,
    guiParams.fillLightY,
    guiParams.fillLightZ,
  );
  scene.add(fillLight);
  const externalExplodeLight = new THREE.PointLight(
    guiParams.externalExplodeLightColor,
    0,
    guiParams.externalExplodeLightDistance,
    guiParams.externalExplodeLightDecay,
  );
  externalExplodeLight.position.set(
    guiParams.externalExplodeLightX,
    guiParams.externalExplodeLightY,
    guiParams.externalExplodeLightZ,
  );
  externalExplodeLight.visible = false;
  scene.add(externalExplodeLight);
  let externalExplodeLightProgress = 0;
  let externalExplodeLightRamp = 0;
  let externalExplodeLightIsSet = false;
  const rotationLight = new THREE.PointLight(
    guiParams.rotationLightColor,
    0,
    guiParams.rotationLightDistance,
    guiParams.rotationLightDecay,
  );
  rotationLight.position.set(
    guiParams.rotationLightX,
    guiParams.rotationLightY,
    guiParams.rotationLightZ,
  );
  rotationLight.visible = false;
  scene.add(rotationLight);
  let rotationLightProgress = 0;
  let rotationLightRamp = 0;
  let rotationLightIsSet = false;

  function createCornerFillLight(prefix) {
    const light = new THREE.PointLight(
      guiParams[`${prefix}Color`],
      0,
      guiParams[`${prefix}Distance`],
      guiParams[`${prefix}Decay`],
    );
    light.position.set(
      guiParams[`${prefix}X`],
      guiParams[`${prefix}Y`],
      guiParams[`${prefix}Z`],
    );
    light.visible = false;
    scene.add(light);
    return light;
  }

  const cornerFillLights = [
    {
      title: "Bottom Left Fill Light",
      prefix: "bottomLeftFillLight",
      light: createCornerFillLight("bottomLeftFillLight"),
    },
    {
      title: "Top Left Fill Light",
      prefix: "topLeftFillLight",
      light: createCornerFillLight("topLeftFillLight"),
    },
    {
      title: "Top Right Fill Light",
      prefix: "topRightFillLight",
      light: createCornerFillLight("topRightFillLight"),
    },
    {
      title: "Bottom Right Fill Light",
      prefix: "bottomRightFillLight",
      light: createCornerFillLight("bottomRightFillLight"),
    },
  ];


  // --- GUI SETUP ---
  const gui = new GUI();
   gui.hide();
  gui.title("Explode Model - Animation & Lighting");
  console.log("[explodeModel] lil-gui initialized");


  // Position GUI on the left side to avoid overlapping with heroScript.js GUI
  gui.domElement.style.zIndex = "10000";
  gui.domElement.style.position = "fixed";
  gui.domElement.style.left = "10px";
  gui.domElement.style.top = "10px";
  gui.domElement.style.right = "auto";
  const animFolder = gui.addFolder("Animation");
  animFolder
    .add(guiParams, "explodeScale", 0.01, 0.2)
    .name("Explode Distance")
    .onChange(() => handleScroll());
  animFolder
    .add(guiParams, "mobileOffsetX", -150, 150)
    .name("Mobile Offset X")
    .onChange(() => handleScroll());
  animFolder
    .add(guiParams, "mobileOffsetY", -150, 150)
    .name("Mobile Offset Y")
    .onChange(() => handleScroll());
  animFolder
    .add(guiParams, "mobileModelShiftX", -3.0, 3.0)
    .name("Mobile Model Shift")
    .onChange(() => handleScroll());
  const desktopMotionFolder = gui.addFolder("Desktop Motion");
  desktopMotionFolder
    .add(guiParams, "desktopStartX", -3.0, 3.0, 0.01)
    .name("Start X")
    .onChange(() => handleScroll());
  desktopMotionFolder
    .add(guiParams, "desktopEndX", -3.0, 3.0, 0.01)
    .name("End X")
    .onChange(() => handleScroll());
  const desktopLabelsFolder = gui.addFolder("Desktop Labels");
  desktopLabelsFolder
    .add(guiParams, "desktopLabelLeftMin", 0.05, 0.5, 0.01)
    .name("Left 768")
    .onChange(() => handleScroll());
  desktopLabelsFolder
    .add(guiParams, "desktopLabelLeftMid", 0.05, 0.5, 0.01)
    .name("Left 1366")
    .onChange(() => handleScroll());
  desktopLabelsFolder
    .add(guiParams, "desktopLabelLeftMax", 0.05, 0.5, 0.01)
    .name("Left 1920")
    .onChange(() => handleScroll());
  desktopLabelsFolder
    .add(guiParams, "desktopLabelRightMin", 0.05, 0.5, 0.01)
    .name("Right 768")
    .onChange(() => handleScroll());
  desktopLabelsFolder
    .add(guiParams, "desktopLabelRightMid", 0.05, 0.5, 0.01)
    .name("Right 1366")
    .onChange(() => handleScroll());
  desktopLabelsFolder
    .add(guiParams, "desktopLabelRightMax", 0.05, 0.5, 0.01)
    .name("Right 1920")
    .onChange(() => handleScroll());
  desktopLabelsFolder
    .add(guiParams, "highSpeedM2SlotLabelYOffset", -300, 300, 1)
    .name("M.2 Slot Y")
    .onChange(() => handleScroll());
  desktopLabelsFolder
    .add(guiParams, "smaAntennasLabelYOffset", -300, 300, 1)
    .name("SMA Antennas Y")
    .onChange(() => handleScroll());


  const lightFolder = gui.addFolder("Lighting");
  const ambientFolder = lightFolder.addFolder("Ambient Light");
  ambientFolder
    .add(guiParams, "ambientLightIntensity", 0, 2)
    .name("Intensity")
    .onChange((val) => (ambientLight.intensity = val));
  ambientFolder
    .addColor(guiParams, "ambientLightColor")
    .name("Color")
    .onChange((val) => ambientLight.color.set(val));
  const keyFolder = lightFolder.addFolder("Key Light");
  keyFolder
    .add(guiParams, "keyLightIntensity", 0, 10)
    .name("Intensity")
    .onChange((val) => (keyLight.intensity = val));
  keyFolder
    .addColor(guiParams, "keyLightColor")
    .name("Color")
    .onChange((val) => keyLight.color.set(val));
  keyFolder
    .add(guiParams, "keyLightX", -10, 10)
    .name("Position X")
    .onChange((val) => (keyLight.position.x = val));
  keyFolder
    .add(guiParams, "keyLightY", -10, 10)
    .name("Position Y")
    .onChange((val) => (keyLight.position.y = val));
  keyFolder
    .add(guiParams, "keyLightZ", -10, 10)
    .name("Position Z")
    .onChange((val) => (keyLight.position.z = val));
  const fillFolder = lightFolder.addFolder("Fill Light");
  fillFolder
    .add(guiParams, "fillLightIntensity", 0, 10)
    .name("Intensity")
    .onChange((val) => (fillLight.intensity = val));
  fillFolder
    .addColor(guiParams, "fillLightColor")
    .name("Color")
    .onChange((val) => fillLight.color.set(val));
  fillFolder
    .add(guiParams, "fillLightX", -10, 10)
    .name("Position X")
    .onChange((val) => (fillLight.position.x = val));
  fillFolder
    .add(guiParams, "fillLightY", -10, 10)
    .name("Position Y")
    .onChange((val) => (fillLight.position.y = val));
  fillFolder
    .add(guiParams, "fillLightZ", -10, 10)
    .name("Position Z")
    .onChange((val) => (fillLight.position.z = val));
  const externalExplodeFolder = lightFolder.addFolder("External Explode Light");
  externalExplodeFolder
    .add(guiParams, "externalExplodeLightIntensity", 0, 25, 0.01)
    .name("Intensity")
    .onChange(() => updateExternalExplodeLight(externalExplodeLightProgress));
  externalExplodeFolder
    .addColor(guiParams, "externalExplodeLightColor")
    .name("Color")
    .onChange((val) => externalExplodeLight.color.set(val));
  externalExplodeFolder
    .add(guiParams, "externalExplodeLightX", -5, 5, 0.01)
    .name("Position X")
    .onChange((val) => (externalExplodeLight.position.x = val));
  externalExplodeFolder
    .add(guiParams, "externalExplodeLightY", -5, 5, 0.01)
    .name("Position Y")
    .onChange((val) => (externalExplodeLight.position.y = val));
  externalExplodeFolder
    .add(guiParams, "externalExplodeLightZ", -5, 5, 0.01)
    .name("Position Z")
    .onChange((val) => (externalExplodeLight.position.z = val));
  const addedLightsGui = new GUI();
  addedLightsGui.title("Four Corner Fill Lights");
  addedLightsGui.hide();
  addedLightsGui.domElement.style.zIndex = "10001";
  addedLightsGui.domElement.style.position = "fixed";
  addedLightsGui.domElement.style.left = "auto";
  addedLightsGui.domElement.style.top = "10px";
  addedLightsGui.domElement.style.right = "10px";

  function updateFillLightFromGui(light, prefix, ramp) {
    light.color.set(guiParams[`${prefix}Color`]);
    light.position.set(
      guiParams[`${prefix}X`],
      guiParams[`${prefix}Y`],
      guiParams[`${prefix}Z`],
    );
    light.distance = guiParams[`${prefix}Distance`];
    light.decay = guiParams[`${prefix}Decay`];
    light.intensity = guiParams[`${prefix}Intensity`] * ramp;
    light.visible = ramp > 0;
  }

  function addFillLightGuiFolder(title, light, prefix) {
    const folder = addedLightsGui.addFolder(title);
    const refresh = () =>
      updateFillLightFromGui(light, prefix, getFillLightRamp());

    folder
      .add(guiParams, `${prefix}Intensity`, 0, 25, 0.01)
      .name("Intensity")
      .onChange(refresh);
    folder
      .addColor(guiParams, `${prefix}Color`)
      .name("Color")
      .onChange(refresh);
    folder
      .add(guiParams, `${prefix}X`, -5, 5, 0.01)
      .name("Position X")
      .onChange(refresh);
    folder
      .add(guiParams, `${prefix}Y`, -5, 5, 0.01)
      .name("Position Y")
      .onChange(refresh);
    folder
      .add(guiParams, `${prefix}Z`, -5, 5, 0.01)
      .name("Position Z")
      .onChange(refresh);
    folder
      .add(guiParams, `${prefix}Distance`, 0, 25, 0.01)
      .name("Distance")
      .onChange(refresh);
    folder
      .add(guiParams, `${prefix}Decay`, 0, 3, 0.01)
      .name("Decay")
      .onChange(refresh);
    folder.open();
  }

  cornerFillLights.forEach(({ title, light, prefix }) => {
    addFillLightGuiFolder(title, light, prefix);
  });


  let modelGroup,
    layers = [],
    scrubProgress = null;
  let initialBaseSize = null;
  let lockedModelScale = null;
  let explodeSceneVisible = false;
  let labelAnchorCache = null;


  const layerKeywords = [
    { keywords: ["button"], dir: 1.0 },
    { keywords: ["Upper_Case"], dir: 0.8 },
    { keywords: ["Screen"], dir: 0.3333 },
    { keywords: ["Mother_Board", "Antenna"], dir: 0.0 },
    { keywords: ["Board_2_with_chips"], dir: -0.3333 },
    { keywords: ["Battery_and_screw_holders"], dir: -0.8 },
    { keywords: ["Bottom_Case"], dir: -0.96 },
    { keywords: ["Screw"], dir: -1.0 },
  ];


  /*
  const desktopLabelSettings = [
    {
      keywords: ["Screen"],
      title: "3'' Touch Display",
      side: "left",
      yOffset: -80,
      xOffset: 0,
    },
    {
      keywords: ["button"],
      title: "Tactile Joystick & Button",
      side: "left",
      yOffset: 0,
      xOffset: 0,
    },
    {
      keywords: ["Antenna"],
      title: "Interchangeable SMA Antennas",
      side: "right",
      yOffset: -40,
      xOffset: 0,
    },
    {
      keywords: ["Mother_Board"],
      title: "Expandable GPIO",
      side: "right",
      yOffset: 40,
      xOffset: 0,
    },
    {
      keywords: ["Board_2_with_chips"],
      title: "High-speed M.2 slot",
      side: "right",
      yOffset: 100,
      xOffset: 0,
    },
    {
      keywords: ["Battery_and_screw_holders"],
      title: "High-Capacity Battery",
      side: "left",
      yOffset: 160,
      xOffset: 0,
    },
  ];
  */


  /*
  // Desktop label positioning configuration - uses layer names from 3D model
  const desktopLabelPositions = [
    { keywords: ["Screen"], side: "left", yOffset: -80, xOffset: 0 },
    { keywords: ["button"], side: "left", yOffset: 0, xOffset: 0 },
    { keywords: ["Antenna"], side: "right", yOffset: -40, xOffset: 0 },
    { keywords: ["Mother_Board"], side: "right", yOffset: 40, xOffset: 0 },
    { keywords: ["Board_2_with_chips"], side: "right", yOffset: 100, xOffset: 0 },
    { keywords: ["Battery_and_screw_holders"], side: "left", yOffset: 160, xOffset: 0 },
  ];
  */


  // Layer Settings GUI Controls
  const layerFolder = gui.addFolder("Layer Settings");
  const layerNames = [
    "Joystick",
    "Housing",
    "Screen",
    "Motherboard",
    "IR Receiver",
    "Battery",
    "Bottom Case",
    "Screw",
  ];


  layerNames.forEach((name, index) => {
    const layerSubFolder = layerFolder.addFolder(name);
    layerSubFolder
      .add(layerKeywords[index], "dir", -2, 2, 0.01)
      .name("Explode Dir")
      .onChange(() => handleScroll());
  });


  function getLayerInfo(name) {
    const lowerName = name.toLowerCase();
    for (let i = 0; i < layerKeywords.length; i++) {
      if (
        layerKeywords[i].keywords.some((k) =>
          lowerName.includes(k.toLowerCase()),
        )
      ) {
        return {
          rank: i,
          dir: layerKeywords[i].dir,
        };
      }
    }
    return {
      rank: 99,
      dir: -1.0,
    };
  }


  function buildLayers(model) {
    let targets = model.children;
    if (targets.length === 1 && (targets[0].isGroup || targets[0].isObject3D))
      targets = targets[0].children;
    const layerData = [];


    // List of keywords to hide (case-insensitive) - hide 3, show 6
    const hideKeywords = ["upper_case", "button", "screw"];


    // Map of layer name keywords to display names for the 6 visible layers
    const layerNameMap = {
      antenna: ["Interchangeable", "SMA Antennas"],
      mother_board: ["Tactile Joystick", "& Button"],
      screen: ['3" Touch', "Display"],
      board_2_with_chips: ["Expandable GPIO"],
      battery_and_screw_holders: ["High-Capacity", "Battery"],
      bottom_case: ["High-speed", "M.2 slot"],
    };


    targets.forEach((child) => {
      if (!child.isMesh && !child.isGroup) return;
      const info = getLayerInfo(child.name || "");


      // Check if this layer should be hidden
      const lowerName = child.name.toLowerCase();


      // Check if this layer has a display name in layerNameMap (prioritize showing these)
      let displayName = "";
      let displayNameHtml = "";
      let hasDisplayName = false;
      for (const [keyword, customName] of Object.entries(layerNameMap)) {
        if (lowerName.includes(keyword)) {
          const labelLines = Array.isArray(customName)
            ? customName
            : [customName];
          displayName = labelLines.join(" ");
          displayNameHtml = labelLines.join("<br>");
          hasDisplayName = true;
          break;
        }
      }


      // Only hide if it doesn't have a display name AND matches hideKeywords
      const shouldHide =
        !hasDisplayName &&
        hideKeywords.some((keyword) => lowerName.includes(keyword));


      if (shouldHide) {
        // Still add to layers for animation, but with empty displayName so no label shows
        layerData.push({
          object: child,
          start: child.position.clone(),
          rank: info.rank,
          name: child.name,
          displayName: "", // Empty = no label
          displayNameHtml: "",
          explode: true,
          dir: info.dir,
          labelEl: null,
          lineEl: null,
        });
      } else {
        // If no custom display name found, use the original name
        if (!hasDisplayName) {
          displayName = child.name;
          displayNameHtml = child.name;
        }


        layerData.push({
          object: child,
          start: child.position.clone(),
          rank: info.rank,
          name: child.name,
          displayName: displayName,
          displayNameHtml: displayNameHtml || displayName,
          explode: true,
          dir: info.dir,
          labelEl: null,
          lineEl: null,
        });
      }
    });
    layerData.sort((a, b) => a.rank - b.rank);
    return layerData;
  }


  function setGroupMaterialRoughness(root, groupName, roughness) {
    const targetGroup = root.getObjectByName(groupName);
    if (!targetGroup) return;

    targetGroup.traverse((object) => {
      if (!object.isMesh || !object.material) return;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      const updatedMaterials = materials.map((material) => {
        const nextMaterial = material.clone();

        if ("roughness" in nextMaterial) {
          nextMaterial.roughness = roughness;
          nextMaterial.needsUpdate = true;
        }

        return nextMaterial;
      });

      object.material = Array.isArray(object.material)
        ? updatedMaterials
        : updatedMaterials[0];
    });
  }


  function getFillLightRamp() {
    return (
      externalExplodeLightRamp *
      THREE.MathUtils.smoothstep(rotationLightProgress, 0.9, 1)
    );
  }

  function updateExternalExplodeLight(scrollProgress, rotProgress = 0) {
    externalExplodeLightProgress = THREE.MathUtils.smoothstep(
      scrollProgress,
      0.5,
      0.95,
    );
    const rotationPhaseLightRamp = THREE.MathUtils.smoothstep(
      rotProgress,
      0.4,
      1,
    );
    externalExplodeLightRamp = Math.max(
      rotationPhaseLightRamp,
      externalExplodeLightProgress,
    );
    if (externalExplodeLightRamp > 0.001 && !externalExplodeLightIsSet) {
      externalExplodeLightIsSet = true;
      console.log(
        "[explodeModel] External explode light set",
        {
          explosionPercent: `${Math.round(externalExplodeLightProgress * 100)}%`,
          progress: Number(externalExplodeLightProgress.toFixed(3)),
          rotationPercent: `${Math.round(rotProgress * 100)}%`,
          intensity: guiParams.externalExplodeLightIntensity,
        },
      );
    }
    externalExplodeLight.intensity =
      guiParams.externalExplodeLightIntensity * externalExplodeLightRamp;
    externalExplodeLight.visible = externalExplodeLightRamp > 0;
    if (externalExplodeLightRamp <= 0.001) externalExplodeLightIsSet = false;
    const fillLightRamp = getFillLightRamp();
    cornerFillLights.forEach(({ light, prefix }) => {
      updateFillLightFromGui(light, prefix, fillLightRamp);
    });
  }


  function updateRotationLight(rotProgress) {
    rotationLightProgress = THREE.MathUtils.clamp(rotProgress, 0, 1);
    rotationLightRamp = THREE.MathUtils.smoothstep(
      rotationLightProgress,
      0.4,
      1,
    );
    if (rotationLightRamp > 0 && !rotationLightIsSet) {
      rotationLightIsSet = true;
      console.log(
        "[explodeModel] Rotation light set",
        {
          progress: Number(rotationLightProgress.toFixed(3)),
          intensity: guiParams.rotationLightIntensity,
        },
      );
    }
    rotationLight.intensity =
      guiParams.rotationLightIntensity * rotationLightRamp;
    rotationLight.visible = rotationLightRamp > 0;
    if (rotationLightRamp <= 0.001) rotationLightIsSet = false;
  }


  /*
  function buildDesktopLabels() {
    // Clear any existing labels from the container first
    if (labelContainer) {
      labelContainer.innerHTML = "";
    }
    
    return desktopLabelPositions
      .map((position) => {
        const anchorLayer = layers.find((layer) =>
          position.keywords.some((keyword) =>
            layer.name.toLowerCase().includes(keyword.toLowerCase()),
          ),
        );


        if (!anchorLayer) return null;


        // Get the layer's display name from layerSettings (3D model name)
        const layerSetting = layerSettings.find((s) =>
          s.keywords.some((k) =>
            anchorLayer.name.toLowerCase().includes(k.toLowerCase()),
          ),
        );
        const displayName = layerSetting ? layerSetting.label : anchorLayer.name;
        const labelMarkup = `<span class="hotspot-title">${displayName}</span>`;


        return {
          object: anchorLayer.object,
          name: anchorLayer.name,
          displayName: labelMarkup,
          labelEl: null,
          lineEl: null,
          side: position.side,
          yOffset: position.yOffset || 0,
          xOffset: position.xOffset || 0,
          isDesktopOnly: true,
        };
      })
      .filter(Boolean);
  }
  */


  function createLabels() {
    if (!labelContainer) return;
    labelContainer.innerHTML = "";
    labelAnchorCache = null;
    let numIndex = 1;
    const isMobile = window.innerWidth <= 767;


    // Use layers for all devices
    const labelsToCreate = layers;


    // Filter layers that have names and alternate left/right
    let layersWithNames = labelsToCreate.filter((layer) => layer.displayName);


    layersWithNames.forEach((layer, index) => {
      const showNumber = isMobile; // Only show numbers on mobile
      const layerNum = numIndex < 10 ? `0${numIndex}` : `${numIndex}`;
      const div = document.createElement("div");
      div.className = "hotspot";


      // Define which layers go on left vs right
      const leftKeywords = [
        "screen",
        "mother_board",
        "battery_and_screw_holders",
      ];
      const rightKeywords = ["antenna", "bottom_case", "board_2_with_chips"];


      // Determine side based on layer name
      const lowerName = layer.name.toLowerCase();
      let isLeft = false;


      if (leftKeywords.some((keyword) => lowerName.includes(keyword))) {
        isLeft = true;
      } else if (rightKeywords.some((keyword) => lowerName.includes(keyword))) {
        isLeft = false;
      } else {
        // Fallback to alternating if not matched
        isLeft = index % 2 === 0;
      }


      div.classList.add(isLeft ? "align-left" : "align-right");
      // Store the side for later use
      layer.assignedSide = isLeft ? "left" : "right";
      div.innerHTML = `
                <div class="hotspot-number">${showNumber ? layerNum : ""}</div>
                <div class="hotspot-text"><span class="hotspot-title">${layer.displayNameHtml || layer.displayName}</span></div>
                <div class="hotspot-line"></div>
            `;
      labelContainer.appendChild(div);
      layer.labelEl = div;
      layer.lineEl = div.querySelector(".hotspot-line");
      if (showNumber) numIndex++;
    });
  }


  const tempV = new THREE.Vector3();


  function getDesktopLabelYOffset(layer) {
    if (layer.displayName === "High-speed M.2 slot") {
      if (isTabletLayoutWidth(window.innerWidth)) {
        return TABLET_HIGH_SPEED_M2_LABEL_Y_OFFSET;
      }
      return guiParams.highSpeedM2SlotLabelYOffset;
    }
    if (layer.displayName === "Interchangeable SMA Antennas") {
      return guiParams.smaAntennasLabelYOffset;
    }
    return 0;
  }

  function updateExplodeScale(expProgress) {
    if (!modelGroup || lockedModelScale === null) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isPortrait = screenHeight > screenWidth;
    const baseScale = lockedModelScale;


    if (screenWidth <= 767) {
      // Mobile phones: no scale change during explosion
      modelGroup.scale.setScalar(baseScale);
    } else if (screenWidth <= 1024) {
      // Tablet and small-desktop widths keep a stable scale during explode.
      modelGroup.scale.setScalar(baseScale);
    } else {
      // Desktop (>970px) and landscape: Continuous height-based scaling during explosion
      // Reference height: 1200px (no scaling), minimum at 600px (20% smaller)
      const referenceHeight = 1200;
      const minHeight = 600;
      const minScaleFactor = 0.8; // Minimum 20% smaller


      // Calculate scale factor: 1.0 at 1200px, decreasing to 0.8 at 600px
      let heightScaleFactor;
      if (screenHeight >= referenceHeight) {
        heightScaleFactor = 1.0;
      } else if (screenHeight <= minHeight) {
        heightScaleFactor = minScaleFactor;
      } else {
        // Linear interpolation between minHeight and referenceHeight
        heightScaleFactor =
          minScaleFactor +
          (1.0 - minScaleFactor) *
            ((screenHeight - minHeight) / (referenceHeight - minHeight));
      }


      // Apply continuous height-based scaling during explosion
      const currentScale = THREE.MathUtils.lerp(
        baseScale,
        baseScale * heightScaleFactor,
        expProgress,
      );
      modelGroup.scale.setScalar(currentScale);
    }
  }

  function getLabelAnchorCacheKey(width, height, isMobile) {
    const layerDirs = layerKeywords.map(({ dir }) => dir).join(",");
    const scale = lockedModelScale === null ? "unset" : lockedModelScale;
    const modelPosition = modelGroup.position.toArray().join(",");
    const modelRotation = modelGroup.rotation.toArray().join(",");

    return [
      width,
      height,
      isMobile ? "mobile" : "desktop",
      guiParams.explodeScale,
      scale,
      layerDirs,
      modelPosition,
      modelRotation,
    ].join("|");
  }

  function getFinalLabelAnchors(width, height, isMobile) {
    const cacheKey = getLabelAnchorCacheKey(width, height, isMobile);
    if (labelAnchorCache && labelAnchorCache.key === cacheKey) {
      return labelAnchorCache.anchors;
    }

    const savedScale = modelGroup.scale.clone();
    const savedPositions = layers.map((layer) => ({
      layer,
      position: layer.object.position.clone(),
    }));
    const anchors = new Map();

    applyExplode(1);
    updateExplodeScale(1);
    modelGroup.updateMatrixWorld(true);

    layers.forEach((layer) => {
      if (!layer.labelEl || !layer.displayName) return;

      layer.object.updateWorldMatrix(true, false);
      const box = new THREE.Box3().setFromObject(layer.object);
      box.getCenter(tempV);
      tempV.project(camera);
      anchors.set(layer, {
        sx: (tempV.x * 0.5 + 0.5) * width,
        sy: (tempV.y * -0.5 + 0.5) * height,
      });
    });

    savedPositions.forEach(({ layer, position }) => {
      layer.object.position.copy(position);
    });
    modelGroup.scale.copy(savedScale);
    modelGroup.updateMatrixWorld(true);

    labelAnchorCache = { key: cacheKey, anchors };
    return anchors;
  }

  function updateLabels(showLabels) {
    const activeLayers = layers;


    if (!showLabels) {
      activeLayers.forEach(
        (label) => label.labelEl && label.labelEl.classList.remove("visible"),
      );
      return;
    }


    // Use the frozen dimensions for label positioning
    const width = frozenDims.width;
    const height = frozenDims.height;


    activeLayers.forEach(
      (label) => label.labelEl && label.labelEl.classList.remove("visible"),
    );


    const visibleLayers = activeLayers.filter(
      (l) => l.labelEl && l.displayName,
    );


    const isMobile = window.innerWidth <= 767;
    const finalAnchors = getFinalLabelAnchors(width, height, isMobile);
    const useTabletLabelPlacement = isTabletLayoutWidth(width);


    // Screen width breakpoints for responsive calculations
    const minWidth = 768;
    const maxWidth = 1920;


    // Responsive label positions - exact values requested
    // 768px: Left 37%, Right 70%
    // 1366px: Left 27%, Right 75%
    // 1920px: Left 25%, Right 80%
    const minLeftPos = guiParams.desktopLabelLeftMin;
    const midLeftPos = guiParams.desktopLabelLeftMid;
    const maxLeftPos = guiParams.desktopLabelLeftMax;


    const minRightPos = guiParams.desktopLabelRightMin;
    const midRightPos = guiParams.desktopLabelRightMid;
    const maxRightPos = guiParams.desktopLabelRightMax;


    let leftPosPercent, rightPosPercent;
    if (width >= 1920) {
      leftPosPercent = maxLeftPos;
      rightPosPercent = maxRightPos;
    } else if (width >= 1366) {
      // Interpolate between 1366px and 1920px
      const t = (width - 1366) / (1920 - 1366);
      leftPosPercent = midLeftPos + (maxLeftPos - midLeftPos) * t;
      rightPosPercent = midRightPos + (maxRightPos - midRightPos) * t;
    } else if (width <= 768) {
      leftPosPercent = minLeftPos;
      rightPosPercent = minRightPos;
    } else {
      // Interpolate between 768px and 1366px
      const t = (width - 768) / (1366 - 768);
      leftPosPercent = minLeftPos + (midLeftPos - minLeftPos) * t;
      rightPosPercent = minRightPos + (midRightPos - minRightPos) * t;
    }

    const shortViewportPressure = isMobile
      ? 0
      : getShortViewportPressure(height);
    const shortViewportLabelInset =
      SHORT_VIEWPORT_LABEL_INSET_MAX * shortViewportPressure;
    leftPosPercent += shortViewportLabelInset;
    rightPosPercent += shortViewportLabelInset;

    const leftLabelPosition = width * leftPosPercent;
    const rightLabelPosition = width * (1 - rightPosPercent); // Convert from right-edge percentage


    // Responsive line width
    const minLinePercent = 0.12; 
    const maxLinePercent = 0.14; 


    let linePercent;
    if (width >= maxWidth) {
      linePercent = maxLinePercent;
    } else if (width <= minWidth) {
      linePercent = minLinePercent;
    } else {
      // Linear interpolation
      linePercent =
        minLinePercent +
        (maxLinePercent - minLinePercent) *
          ((width - minWidth) / (maxWidth - minWidth));
    }


    const baseLineWidthReduction = 35;
    const modelLineGap = 30;
    const lineWidth = Math.max(
      0,
      width * linePercent - baseLineWidthReduction - modelLineGap,
    );
    const liveMinLinePercent = 0.07;
    const liveMaxLinePercent = 0.14;
    const liveTabletLinePercent =
      width <= minWidth
        ? liveMinLinePercent
        : liveMinLinePercent +
          (liveMaxLinePercent - liveMinLinePercent) *
            ((width - minWidth) / (maxWidth - minWidth));
    const shortViewportLineScale = THREE.MathUtils.lerp(
      1,
      SHORT_VIEWPORT_LINE_SCALE_MIN,
      shortViewportPressure,
    );
    const currentLineWidth = useTabletLabelPlacement
      ? width * liveTabletLinePercent * shortViewportLineScale
      : lineWidth * shortViewportLineScale;
    const extraLeftLabelOffset = 70.125;
    const extraRightLabelOffset = 80.75;
    const tabletLabelOffset = 24;
    const currentLeftLabelOffset = useTabletLabelPlacement
      ? tabletLabelOffset
      : extraLeftLabelOffset;
    const currentRightLabelOffset = useTabletLabelPlacement
      ? tabletLabelOffset
      : extraRightLabelOffset;


    visibleLayers.forEach((layer) => {
      const anchor = finalAnchors.get(layer);
      if (!anchor) return;

      const baseScreenY = isMobile
        ? anchor.sy
        : anchor.sy + getDesktopLabelYOffset(layer);
      const screenY = isMobile
        ? THREE.MathUtils.clamp(
            baseScreenY,
            Math.max(84, height * 0.13),
            height - 64,
          )
        : baseScreenY;
      const assignedSide = layer.assignedSide || "left";
      const isLeft = assignedSide === "left";


      if (isMobile) {
        // Mobile: Show only numbers at screen edges
        const cornerOffset = 16;
        layer.labelEl.style.top = `${screenY}px`;
        layer.labelEl.style.transform = "translateY(-50%)";
        layer.labelEl.style.fontSize = "";


        if (isLeft) {
          layer.labelEl.style.left = `${cornerOffset}px`;
          layer.labelEl.style.right = "auto";
        } else {
          layer.labelEl.style.left = "auto";
          layer.labelEl.style.right = `${cornerOffset}px`;
        }


        // Show only the number
        const numberEl = layer.labelEl.querySelector(".hotspot-number");
        const textEl = layer.labelEl.querySelector(".hotspot-text");
        const lineEl = layer.labelEl.querySelector(".hotspot-line");
        if (numberEl) numberEl.style.display = "flex";
        if (textEl) textEl.style.display = "none";
        if (lineEl) lineEl.style.display = "none";
      } else {
        // Desktop: Position labels at responsive positions
        layer.labelEl.style.top = `${screenY}px`;
        layer.labelEl.style.transform = "translateY(-50%)";
        layer.labelEl.style.fontSize = `${THREE.MathUtils.lerp(
          14,
          12.5,
          shortViewportPressure,
        )}px`;


        if (isLeft) {
          // Left-side labels: positioned at leftLabelPosition
          layer.labelEl.style.right = `${width - leftLabelPosition + currentLeftLabelOffset}px`;
          layer.labelEl.style.left = "auto";


          // Line extends from label toward left edge
          if (layer.lineEl) {
            layer.lineEl.style.cssText = `
              position: absolute;
              left: 100%;
              top: calc(4px + 0.7em);
              width: ${currentLineWidth}px;
              height: 0.5px;
              background-color: rgba(255, 255, 255, 0.9);
              display: block;
            `;
          }
        } else {
          // Right-side labels: positioned at rightLabelPosition
          layer.labelEl.style.left = `${rightLabelPosition + currentRightLabelOffset}px`;
          layer.labelEl.style.right = "auto";


          // Line extends from label toward right edge
          if (layer.lineEl) {
            layer.lineEl.style.cssText = `
              position: absolute;
              right: 100%;
              top: calc(4px + 0.7em);
              width: ${currentLineWidth}px;
              height: 0.5px;
              background-color: rgba(255, 255, 255, 0.9);
              display: block;
            `;
          }
        }


        // Show text, hide number on desktop
        const numberEl = layer.labelEl.querySelector(".hotspot-number");
        const textEl = layer.labelEl.querySelector(".hotspot-text");
        if (numberEl) numberEl.style.display = "none";
        if (textEl) textEl.style.display = "flex";
      }


      layer.labelEl.classList.add("visible");
    });
  }

  function applyExplode(progress) {
    let explodeMultiplier;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;


    if (width <= 767) {
      // Mobile phones
      explodeMultiplier = 0.8;
    } else if (width <= 1024 && isPortrait) {
      // iPad portrait (768px - 1024px) gets larger explode
      // Scale multiplier from 1.3 at 768px to 1.0 at 1024px
      const ipadFactor = (width - 768) / (1024 - 768); // 0 to 1
      explodeMultiplier = 1.3 - ipadFactor * 0.3; // 1.3 to 1.0
    } else {
      // Desktop landscape or large tablets
      explodeMultiplier = 1.0;
    }


    layers.forEach((layer) => {
      layer.object.position.copy(layer.start);
      if (layer.explode) {
        // Get current dir from layerKeywords
        const settingIndex = layerKeywords.findIndex((s) =>
          s.keywords.some((k) =>
            layer.name.toLowerCase().includes(k.toLowerCase()),
          ),
        );
        const currentDir =
          settingIndex >= 0 ? layerKeywords[settingIndex].dir : layer.dir;
        const totalDistance =
          currentDir *
          (guiParams.explodeScale * explodeMultiplier * 0.7) *
          progress;
        layer.object.position.y += totalDistance;
      }
    });
  }

  function getMobileSafeFitY(height) {
    const progress = THREE.MathUtils.clamp(
      (height - MOBILE_SAFE_FIT_MIN_HEIGHT) /
        (MOBILE_SAFE_FIT_MAX_HEIGHT - MOBILE_SAFE_FIT_MIN_HEIGHT),
      0,
      1,
    );

    return THREE.MathUtils.lerp(
      MOBILE_SAFE_FIT_Y_MIN,
      MOBILE_SAFE_FIT_Y_MAX,
      progress,
    );
  }

  function getMobileSafeFitX(width, height) {
    const widthProgress = THREE.MathUtils.clamp(
      (width - 360) / (MOBILE_SAFE_FIT_MAX_WIDTH - 360),
      0,
      1,
    );
    const heightProgress = THREE.MathUtils.clamp(
      (height - MOBILE_SAFE_FIT_MIN_HEIGHT) /
        (MOBILE_SAFE_FIT_MAX_HEIGHT - MOBILE_SAFE_FIT_MIN_HEIGHT),
      0,
      1,
    );
    const fitX = THREE.MathUtils.lerp(
      MOBILE_SAFE_FIT_X_MIN,
      MOBILE_SAFE_FIT_X,
      Math.min(widthProgress, heightProgress),
    );

    return fitX;
  }

  function getMobileModelScaleBoost(width, height) {
    const widthProgress = THREE.MathUtils.clamp(
      (width - 360) / (MOBILE_SAFE_FIT_MAX_WIDTH - 360),
      0,
      1,
    );
    const heightProgress = THREE.MathUtils.clamp(
      (height - MOBILE_SAFE_FIT_MIN_HEIGHT) /
        (MOBILE_SAFE_FIT_MAX_HEIGHT - MOBILE_SAFE_FIT_MIN_HEIGHT),
      0,
      1,
    );
    const responsiveProgress = Math.min(widthProgress, heightProgress);

    return THREE.MathUtils.lerp(
      MOBILE_MODEL_SCALE_BOOST_MIN,
      MOBILE_MODEL_SCALE_BOOST_MAX,
      smoothstep01(responsiveProgress),
    );
  }

  function getMobileModelXOffset(width, height, rotProgress) {
    if (width > MOBILE_SAFE_FIT_MAX_WIDTH) return 0;

    const visibleSize = getVisibleCameraSize(width, height);
    return visibleSize.width * MOBILE_MODEL_X_SHIFT_RATIO * rotProgress;
  }

  function getMobileModelYOffset(width, height) {
    if (width > MOBILE_SAFE_FIT_MAX_WIDTH) return 0;

    const progress = THREE.MathUtils.clamp(
      (height - MOBILE_SAFE_FIT_MIN_HEIGHT) /
        (MOBILE_SAFE_FIT_MAX_HEIGHT - MOBILE_SAFE_FIT_MIN_HEIGHT),
      0,
      1,
    );
    const visibleSize = getVisibleCameraSize(width, height);
    const offsetRatio = THREE.MathUtils.lerp(
      MOBILE_MODEL_Y_OFFSET_RATIO_MAX,
      MOBILE_MODEL_Y_OFFSET_RATIO_MIN,
      progress,
    ) + MOBILE_TEXT_CLEARANCE_Y_OFFSET_RATIO_MAX *
      getMobileTextClearanceProgress(width);

    return -(visibleSize.height * offsetRatio);
  }

  function getVisibleCameraSize(width, height) {
    const cameraDistance = Math.abs(camera.position.z);
    const visibleHeight =
      2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5) * cameraDistance;

    return {
      width: visibleHeight * (width / height),
      height: visibleHeight,
    };
  }

  function getModelSizeAtRotation(rotation, explodeProgress = 0) {
    const bounds = getModelBoundsAtRotation(rotation, explodeProgress);
    return bounds ? bounds.size : null;
  }

  function getModelBoundsAtRotation(rotation, explodeProgress = 0) {
    if (!modelGroup) return null;

    const savedScale = modelGroup.scale.clone();
    const savedPosition = modelGroup.position.clone();
    const savedRotation = modelGroup.rotation.clone();
    const savedLayerPositions = layers.map((layer) => ({
      layer,
      position: layer.object.position.clone(),
    }));

    modelGroup.scale.setScalar(1);
    modelGroup.position.set(0, 0, 0);
    modelGroup.rotation.set(rotation.x, rotation.y, rotation.z);

    if (explodeProgress > 0 && layers.length) {
      applyExplode(explodeProgress);
    } else {
      savedLayerPositions.forEach(({ layer }) => {
        layer.object.position.copy(layer.start);
      });
    }

    modelGroup.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(modelGroup);
    const size = box.getSize(new THREE.Vector3());
    const min = box.min.clone();
    const max = box.max.clone();

    savedLayerPositions.forEach(({ layer, position }) => {
      layer.object.position.copy(position);
    });
    modelGroup.scale.copy(savedScale);
    modelGroup.position.copy(savedPosition);
    modelGroup.rotation.copy(savedRotation);
    modelGroup.updateMatrixWorld(true);

    return { size, min, max };
  }

  function getMobileSafeScale(width, height, desiredScale) {
    const visibleSize = getVisibleCameraSize(width, height);
    const fitX = getMobileSafeFitX(width, height);
    const fitY = getMobileSafeFitY(height);
    const positionsToFit = [
      {
        rotation: START_ROTATION,
        explodeProgress: 0,
        x: getMobileModelXOffset(width, height, 0),
        y: getMobileModelYOffset(width, height),
      },
      {
        rotation: END_ROTATION,
        explodeProgress: 1,
        x: getMobileModelXOffset(width, height, 1),
        y: getMobileModelYOffset(width, height),
      },
    ];

    const fitScale = positionsToFit.reduce((scale, position) => {
      const bounds = getModelBoundsAtRotation(
        position.rotation,
        position.explodeProgress,
      );

      return Math.min(
        scale,
        getSafeScaleForBoundsAtPosition(
          bounds,
          visibleSize,
          fitX,
          fitY,
          position.x,
          position.y,
        ),
      );
    }, Number.POSITIVE_INFINITY);

    if (!Number.isFinite(fitScale) || fitScale <= 0) {
      return desiredScale;
    }

    return Math.min(desiredScale, fitScale);
  }

  function getTabletSafeScale(width, height, desiredScale) {
    const visibleSize = getVisibleCameraSize(width, height);
    const rotationsToFit = [
      { rotation: START_ROTATION, explodeProgress: 0 },
      { rotation: END_ROTATION, explodeProgress: 1 },
    ];

    const fitScale = rotationsToFit.reduce(
      (scale, { rotation, explodeProgress }) => {
        const bounds = getModelBoundsAtRotation(rotation, explodeProgress);
        return Math.min(
          scale,
          getSafeScaleForBounds(
            bounds,
            visibleSize,
            TABLET_SAFE_FIT_X,
            TABLET_SAFE_FIT_Y,
          ),
        );
      },
      Number.POSITIVE_INFINITY,
    );

    if (!Number.isFinite(fitScale) || fitScale <= 0) {
      return desiredScale;
    }

    return Math.min(desiredScale, fitScale);
  }

  function getDesktopSafeFitX(width) {
    if (width <= 1024) return 0.82;
    if (width <= DESKTOP_992_TO_1420_SCALE_MAX_WIDTH) {
      const progress =
        (width - 1024) / (DESKTOP_992_TO_1420_SCALE_MAX_WIDTH - 1024);

      return THREE.MathUtils.lerp(
        DESKTOP_992_TO_1420_SAFE_FIT_X_START,
        DESKTOP_992_TO_1420_SAFE_FIT_X_END,
        smoothstep01(progress),
      );
    }
    if (width <= 1200) return DESKTOP_SAFE_FIT_X_MIN;
    if (width >= 1920) return DESKTOP_SAFE_FIT_X_MAX;

    const progress = (width - 1200) / (1920 - 1200);
    const midProgress = Math.min(progress * 2, 1);
    const maxProgress = Math.max(progress * 2 - 1, 0);
    const midValue = THREE.MathUtils.lerp(
      DESKTOP_SAFE_FIT_X_MIN,
      DESKTOP_SAFE_FIT_X_MID,
      smoothstep01(midProgress),
    );

    return THREE.MathUtils.lerp(
      midValue,
      DESKTOP_SAFE_FIT_X_MAX,
      smoothstep01(maxProgress),
    );
  }

  function getDesktopSafeFitY(width, height) {
    if (width <= 1024) return 0.92;
    if (width <= DESKTOP_992_TO_1420_SCALE_MAX_WIDTH) {
      return DESKTOP_992_TO_1420_SAFE_FIT_Y;
    }

    const progress =
      (height - DESKTOP_SAFE_FIT_HEIGHT_MIN) /
      (DESKTOP_SAFE_FIT_HEIGHT_MAX - DESKTOP_SAFE_FIT_HEIGHT_MIN);

    return THREE.MathUtils.lerp(
      DESKTOP_SAFE_FIT_Y_MIN,
      DESKTOP_SAFE_FIT_Y_MAX,
      smoothstep01(progress),
    );
  }

  function getSafeScaleForBounds(bounds, visibleSize, fitX, fitY) {
    if (!bounds || !bounds.size || bounds.size.x <= 0 || bounds.size.y <= 0) {
      return Number.POSITIVE_INFINITY;
    }

    const maxAbsX = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
    const maxAbsY = Math.max(Math.abs(bounds.min.y), Math.abs(bounds.max.y));
    const scaleX =
      maxAbsX > 0
        ? (visibleSize.width * fitX * 0.5) / maxAbsX
        : (visibleSize.width * fitX) / bounds.size.x;
    const scaleY =
      maxAbsY > 0
        ? (visibleSize.height * fitY * 0.5) / maxAbsY
        : (visibleSize.height * fitY) / bounds.size.y;

    return Math.min(scaleX, scaleY);
  }

  function getSafeScaleForBoundsAtPosition(
    bounds,
    visibleSize,
    fitX,
    fitY,
    offsetX = 0,
    offsetY = 0,
  ) {
    if (!bounds || !bounds.size || bounds.size.x <= 0 || bounds.size.y <= 0) {
      return Number.POSITIVE_INFINITY;
    }

    const halfWidth = visibleSize.width * fitX * 0.5;
    const halfHeight = visibleSize.height * fitY * 0.5;
    const constraints = [];

    if (bounds.max.x > 0) constraints.push((halfWidth - offsetX) / bounds.max.x);
    if (bounds.min.x < 0) constraints.push((-halfWidth - offsetX) / bounds.min.x);
    if (bounds.max.y > 0) constraints.push((halfHeight - offsetY) / bounds.max.y);
    if (bounds.min.y < 0) constraints.push((-halfHeight - offsetY) / bounds.min.y);

    const validConstraints = constraints.filter(
      (value) => Number.isFinite(value) && value > 0,
    );

    return validConstraints.length
      ? Math.min(...validConstraints)
      : Number.POSITIVE_INFINITY;
  }

  function getDesktopShortHeightScaleFactor(height) {
    const progress =
      (height - DESKTOP_SAFE_FIT_HEIGHT_MIN) /
      (DESKTOP_SAFE_FIT_HEIGHT_MAX - DESKTOP_SAFE_FIT_HEIGHT_MIN);

    return THREE.MathUtils.lerp(
      DESKTOP_SHORT_HEIGHT_SCALE_MIN,
      1,
      smoothstep01(progress),
    );
  }

  function getDesktopSafeScale(width, height, desiredScale) {
    const visibleSize = getVisibleCameraSize(width, height);
    const rotationsToFit = [
      { rotation: START_ROTATION, explodeProgress: 0 },
      { rotation: END_ROTATION, explodeProgress: 1 },
    ];
    const fitX = getDesktopSafeFitX(width);
    const fitY = getDesktopSafeFitY(width, height);

    const fitScale = rotationsToFit.reduce(
      (scale, { rotation, explodeProgress }) => {
        const bounds = getModelBoundsAtRotation(rotation, explodeProgress);
        return Math.min(
          scale,
          getSafeScaleForBounds(bounds, visibleSize, fitX, fitY),
        );
      },
      Number.POSITIVE_INFINITY,
    );

    if (!Number.isFinite(fitScale) || fitScale <= 0) {
      return desiredScale;
    }

    return Math.min(desiredScale, fitScale);
  }

  function calculateModelScale(width, height) {
    if (!initialBaseSize || width === 0 || height === 0) return null;

    const maxDim = Math.max(
      initialBaseSize.x,
      initialBaseSize.y,
      initialBaseSize.z,
    );
    let scale = maxDim > 0 ? 2.5 / maxDim : 1;

    const isPortrait = height > width;
    if (width / height < 1) {
      const aspectScale =
        isTabletLayoutWidth(width) && isPortrait
          ? Math.max(width / height, TABLET_PORTRAIT_ASPECT_MIN)
          : width / height;
      scale *= aspectScale;
    }

    if (width <= MOBILE_SAFE_FIT_MAX_WIDTH) {
      scale *= 1.5 * getMobileModelScaleBoost(width, height);
      return (
        getMobileSafeScale(width, height, scale) *
        getMobileTextClearanceScaleFactor(width)
      );
    }

    if (width <= 1024 && isPortrait) {
      const ipadWidthFactor = (width - 768) / (1024 - 768);
      const ipadBoost = 1.8 + ipadWidthFactor * 0.4;
      scale *= ipadBoost;
    }

    if (isTabletLayoutWidth(width) && isPortrait) {
      const tabletProgress = THREE.MathUtils.clamp(
        (width - TABLET_LAYOUT_MIN_WIDTH) /
          (TABLET_LAYOUT_MAX_WIDTH - TABLET_LAYOUT_MIN_WIDTH),
        0,
        1,
      );
      const portraitBoost = THREE.MathUtils.lerp(
        TABLET_PORTRAIT_SCALE_BOOST_MAX,
        TABLET_PORTRAIT_SCALE_BOOST_MIN,
        tabletProgress,
      );
      scale *= portraitBoost;
    }

    if (isTabletLayoutWidth(width) && height < TABLET_SHORT_HEIGHT_MAX) {
      scale *= TABLET_SHORT_HEIGHT_SCALE_BOOST;
    }

    if (width > 1920) {
      return getDesktopSafeScale(width, height, scale);
    }

    scale *= NON_MOBILE_MODEL_SCALE_FACTOR;
    scale *= getResponsiveDesktopModelScaleBoost(width);
    scale *= getTabletLayoutModelScaleBoost(width);
    scale *= getDesktop992To1420ModelScaleBoost(width);
    scale *= getShortViewportModelScaleFactor(width, height);

    if (isTabletLayoutWidth(width)) {
      scale = isPortrait
        ? getTabletSafeScale(width, height, scale)
        : getDesktopSafeScale(width, height, scale);
    } else {
      if (width > 1024) {
        scale *= getDesktopShortHeightScaleFactor(height);
      }
      scale = getDesktopSafeScale(width, height, scale);
    }

    return scale;
  }


  function updateModelScale() {
    if (!modelGroup) return;


    if (!initialBaseSize) {
      const box = new THREE.Box3().setFromObject(modelGroup.children[0]);
      initialBaseSize = box.getSize(new THREE.Vector3());
    }


    if (lockedModelScale === null) {
      const w = frozenDims.width || scrollViewportWidth;
      const h = frozenDims.height || scrollViewportHeight;
      const scale = calculateModelScale(w, h);
      if (scale === null) return;
      lockedModelScale = scale;
    }


    modelGroup.scale.setScalar(lockedModelScale);
  }


  queueMicrotask(() => {
      const model = createBuddyMachine(THREE, renderer);
      setGroupMaterialRoughness(
        model,
        SCREEN_ROUGHNESS_GROUP_NAME,
        SCREEN_ROUGHNESS_VALUE,
      );

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);


      modelGroup = new THREE.Group();
      modelGroup.add(model);
      scene.add(modelGroup);

      modelGroup.position.set(guiParams.desktopStartX, 0, 0);
      modelGroup.rotation.set(
        START_ROTATION.x,
        START_ROTATION.y,
        START_ROTATION.z,
      );

      // Calculate scale immediately to prevent tiny model on load
      const initialBox = new THREE.Box3().setFromObject(model);
      initialBaseSize = initialBox.getSize(new THREE.Vector3());
      layers = buildLayers(model);
      lockedModelScale =
        calculateModelScale(
          frozenDims.width || scrollViewportWidth,
          frozenDims.height || scrollViewportHeight,
        ) || 1;
      modelGroup.scale.setScalar(lockedModelScale);


      // Clear labels and recreate them fresh
      if (labelContainer) {
        labelContainer.innerHTML = "";
      }


      createLabels();


      console.log("[explodeModel] Model loaded", {
        layerCount: layers.length,
        desktopStartX: guiParams.desktopStartX,
        desktopEndX: guiParams.desktopEndX,
      });

      loadRegistry.markModelReady("explodeModel-stagging");
      handleScroll();
  });

  function updateExplodeSceneVisibility() {
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const visible =
      rect.bottom > -viewportHeight * 0.25 &&
      rect.top < viewportHeight * 1.25;

    explodeSceneVisible = visible;
    renderer.domElement.style.opacity = visible ? "1" : "0";
    renderer.domElement.style.visibility = visible ? "visible" : "hidden";
  }


  const stickerPoint = new THREE.Vector3();
  const stickerNormal = new THREE.Vector3();
  const stickerScale = new THREE.Vector3();
  const stickerClose = new THREE.Vector3();
  const stickerLook = new THREE.Vector3();
  const cameraRest = new THREE.Vector3(0, 0, 5);
  let demoSticker = null;

  function frameDemoSticker(zoom) {
    if (!demoSticker && modelGroup) demoSticker = modelGroup.getObjectByName("demo-sticker");
    if (zoom <= 0.001 || !demoSticker) {
      camera.position.copy(cameraRest);
      camera.lookAt(0, 0, 0);
      return;
    }
    modelGroup.updateMatrixWorld(true);
    demoSticker.getWorldPosition(stickerPoint);
    demoSticker.getWorldDirection(stickerNormal);
    modelGroup.getWorldScale(stickerScale);
    const span = Math.abs(stickerScale.x) || 1;
    const faceH = 268 * span;
    const faceW = 188 * span;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const distH = (faceH * 3.55) / 2 / Math.tan(vFov / 2);
    const distW = (faceW * 3.55) / 2 / (Math.tan(vFov / 2) * camera.aspect);
    stickerClose.copy(stickerPoint).addScaledVector(stickerNormal, Math.max(distH, distW));
    camera.position.lerpVectors(cameraRest, stickerClose, zoom);
    stickerLook.copy(stickerPoint);
    stickerLook.y += faceH * 0.3;
    stickerLook.multiplyScalar(zoom);
    camera.lookAt(stickerLook);
  }

  let scrollTarget = 0;
  let scrollEase = 0;
  let scrollVel = 0;
  let scrollPoseReady = false;
  let lastPoseTime = performance.now();

  function readScrollProgress() {
    const ANIMATION_SCROLL_HEIGHT = scrollViewportHeight * 2;
    const rect = triggerElement.getBoundingClientRect();
    const scrolledPast = Math.max(
      0,
      -(rect.bottom - scrollViewportHeight * 0.1),
    );
    let totalProgress = Math.max(
      0,
      Math.min(1, scrolledPast / ANIMATION_SCROLL_HEIGHT),
    );
    if (scrubProgress !== null) totalProgress = scrubProgress;
    return totalProgress;
  }

  function handleScroll() {
    if (!triggerElement || !modelGroup) return;

    const totalProgress = readScrollProgress();
    scrollTarget = totalProgress;
    if (!scrollPoseReady) {
      scrollEase = totalProgress;
      scrollVel = 0;
      scrollPoseReady = true;
      applyScrollPose(scrollEase);
    }

    const TEXT_EXIT_END_PROGRESS = 0.5;
    if (textElement)
      textElement.style.transform = `translateX(${-Math.min(1, totalProgress / TEXT_EXIT_END_PROGRESS) * 105}%)`;
  }

  function applyScrollPose(totalProgress) {
    const ROTATION_END_PROGRESS = 0.32;
    const EXPLODE_START_PROGRESS = ROTATION_END_PROGRESS;
    const EXPLODE_END_PROGRESS = 0.95;

    let rotProgress = THREE.MathUtils.smoothstep(
      totalProgress,
      0.0,
      ROTATION_END_PROGRESS,
    );
    let expProgress = THREE.MathUtils.smoothstep(
      totalProgress,
      EXPLODE_START_PROGRESS,
      EXPLODE_END_PROGRESS,
    );
    updateExternalExplodeLight(totalProgress, rotProgress);
    updateRotationLight(rotProgress);


    modelGroup.rotation.x = THREE.MathUtils.lerp(
      START_ROTATION.x,
      END_ROTATION.x,
      rotProgress,
    );
    modelGroup.rotation.y = THREE.MathUtils.lerp(
      START_ROTATION.y,
      END_ROTATION.y,
      rotProgress,
    );
    modelGroup.rotation.z = THREE.MathUtils.lerp(
      START_ROTATION.z,
      END_ROTATION.z,
      rotProgress,
    );
    const stickerZoom = THREE.MathUtils.smoothstep(totalProgress, 0.42, 0.9);
    modelGroup.rotation.y += stickerZoom * 0.34;
    modelGroup.rotation.x += stickerZoom * -0.1;


    applyExplode(expProgress);


    // Scale handling - ensure consistent scale throughout
    updateExplodeScale(expProgress);


    if (window.innerWidth <= 767) {
      // Mobile: keep the model centered, then finish 5% toward the right.
      modelGroup.position.x = getMobileModelXOffset(
        frozenDims.width || scrollViewportWidth,
        frozenDims.height || scrollViewportHeight,
        rotProgress,
      );
      modelGroup.position.y = getMobileModelYOffset(
        frozenDims.width || scrollViewportWidth,
        frozenDims.height || scrollViewportHeight,
      );
    } else {
      // Desktop: Start at base offset, move additional shift to the right during rotation
      modelGroup.position.x = THREE.MathUtils.lerp(
        guiParams.desktopStartX,
        guiParams.desktopEndX,
        rotProgress,
      );
      modelGroup.position.y = getSmallScreenExplodeYOffset(
        frozenDims.width || scrollViewportWidth,
        frozenDims.height || scrollViewportHeight,
        expProgress,
      );
    }

    frameDemoSticker(stickerZoom);

    const labelsVisible = window.innerWidth <= 767
      ? expProgress >= MOBILE_LABEL_VISIBLE_PROGRESS
      : expProgress >= DESKTOP_LABEL_VISIBLE_PROGRESS;

    updateLabels(labelsVisible);
    updateDebug(rotProgress, expProgress);
  }


  if (scrubSlider)
    scrubSlider.addEventListener("input", (e) => {
      scrubProgress = parseFloat(e.target.value);
      handleScroll();
    });


  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("scroll", updateExplodeSceneVisibility, {
    passive: true,
  });


  // --- STRICT RESIZE HANDLER ---
  let wasMobile = window.innerWidth <= 767;
  let explodeResizeFrameId = null;


  const handleExplodeResize = () => {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    const mobileHeightDelta = Math.abs(currentHeight - scrollViewportHeight);

    // Ignore small height-only mobile resizes caused by browser UI collapsing/expanding.
    if (
      currentWidth <= 767 &&
      currentWidth === scrollViewportWidth &&
      mobileHeightDelta < MOBILE_HEIGHT_RESIZE_THRESHOLD
    ) {
      return;
    }

    const isMobile = currentWidth <= 767;
    const crossedBreakpoint = isMobile !== wasMobile;


    // Update mobile state tracker
    wasMobile = isMobile;


    const widthChanged = Math.abs(currentWidth - scrollViewportWidth) > 1;
    const heightChanged = Math.abs(currentHeight - scrollViewportHeight) > 1;

    // Mobile still ignores height-only browser chrome changes above.
    // Tablet/desktop must reflow on real viewport changes so labels and scale
    // always match the active breakpoint while resizing.
    if (
      (isMobile ? widthChanged || heightChanged : widthChanged || heightChanged) ||
      crossedBreakpoint
    ) {
      scrollViewportHeight = currentHeight;
      scrollViewportWidth = currentWidth;


      // Re-run the existing breakpoint scale formula for the new viewport.
      // The constants stay untouched; this only prevents stale resize state.
      lockedModelScale = null;


      // Recalculate and update the frozen values
      frozenDims = calculateFrozenDimensions();
      camera.aspect = frozenDims.width / frozenDims.height;
      camera.updateProjectionMatrix();
      renderer.setSize(frozenDims.width, frozenDims.height);


      updateModelScale();


      // Recreate labels when crossing breakpoint (mobile vs desktop labels)
      createLabels();
    }


    if (window.innerWidth > 767 && modelGroup) {
      modelGroup.position.x = 0;
    }

    updateExplodeSceneVisibility();
    handleScroll();
  };


  window.addEventListener("resize", () => {
    if (explodeResizeFrameId) {
      cancelAnimationFrame(explodeResizeFrameId);
    }

    explodeResizeFrameId = requestAnimationFrame(() => {
      explodeResizeFrameId = null;
      handleExplodeResize();
    });
  });


  function stepScrollPose() {
    if (!modelGroup || !scrollPoseReady) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastPoseTime) / 1000);
    lastPoseTime = now;
    const stiffness = 18;
    const damping = 7.2;
    scrollVel += (scrollTarget - scrollEase) * stiffness * dt;
    scrollVel *= Math.exp(-damping * dt);
    scrollEase += scrollVel * dt;
    if (Math.abs(scrollTarget - scrollEase) < 0.0004 && Math.abs(scrollVel) < 0.0004) {
      scrollEase = scrollTarget;
      scrollVel = 0;
    }
    applyScrollPose(scrollEase);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!explodeSceneVisible) {
      lastPoseTime = performance.now();
      return;
    }
    stepScrollPose();
    renderer.render(scene, camera);
  }
  updateExplodeSceneVisibility();
  animate();
}

function whenNear(el, run) {
  if (!el) return;
  let started = false;
  const tick = () => {
    if (started) return;
    if (el.getBoundingClientRect().top > window.innerHeight * 2.6) return;
    started = true;
    window.removeEventListener("scroll", tick);
    window.removeEventListener("wheel", tick);
    run();
  };
  tick();
  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("wheel", tick, { passive: true });
  requestAnimationFrame(tick);
}

whenNear(document.getElementById("scroll-video"), () => mountRouterMachine(THREE));
whenNear(container, startExplodeScene);
