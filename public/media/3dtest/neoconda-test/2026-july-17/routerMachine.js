import { createBuddyMachine } from "../../../buddy-demo/machine.js?v=34";

export function mountRouterMachine(THREE) {
  const video = document.getElementById("scroll-video");
  const slot = video && video.parentElement;
  if (!video || !slot || slot.dataset.buddyMachine) return;
  slot.dataset.buddyMachine = "1";
  slot.style.position = "relative";
  slot.style.overflow = "visible";

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;";
  slot.appendChild(canvas);
  video.style.setProperty("opacity", "0", "important");
  video.style.setProperty("visibility", "hidden", "important");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.96;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 8000);
  scene.add(new THREE.AmbientLight(0xd7dee8, 0.34));
  const key = new THREE.DirectionalLight(0xfff6ee, 1.35);
  key.position.set(-0.35, 1.15, 1.2);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb9c6d8, 0.28);
  fill.position.set(0.9, 0.1, 0.6);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xd5dce8, 0.42);
  rim.position.set(0.2, 0.5, -1);
  scene.add(rim);
  const bounce = new THREE.DirectionalLight(0xe4ebf4, 0.22);
  bounce.position.set(0, -0.8, 0.7);
  scene.add(bounce);

  const model = createBuddyMachine(THREE, renderer);
  model.rotation.x = Math.PI / 2;
  scene.add(model);

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);

  const corners = [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, 1],
    [-1, -1, -1],
  ].map(
    ([x, y, z]) =>
      new THREE.Vector3((size.x / 2) * x, (size.y / 2) * y, (size.z / 2) * z),
  );

  const placeCamera = () => {
    const aspect = camera.aspect || 1;
    const vFov = (camera.fov * Math.PI) / 180;
    const distH = size.y / 2 / Math.tan(vFov / 2);
    const distW = size.x / 2 / (Math.tan(vFov / 2) * aspect);
    let distance = Math.max(distH, distW, 1);
    const inset = 0.9;
    for (let step = 0; step < 6; step += 1) {
      camera.position.set(0, 0, distance);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      let edge = 0;
      for (const corner of corners) {
        const projected = corner.clone().project(camera);
        edge = Math.max(edge, Math.abs(projected.x), Math.abs(projected.y));
      }
      if (edge <= inset) break;
      distance *= edge / inset;
    }
  };

  const resize = () => {
    const width = Math.max(1, Math.round((slot.clientWidth || 1) * 1.16));
    const height = Math.max(1, Math.round((slot.clientHeight || 1) * 1.16));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    placeCamera();
  };
  resize();
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resize).observe(slot);
  } else {
    window.addEventListener("resize", resize);
  }

  renderer.setAnimationLoop(() => {
    const rect = slot.getBoundingClientRect();
    const view = window.innerHeight || 1;
    if (rect.bottom < view * -0.2 || rect.top > view * 1.2) return;
    renderer.render(scene, camera);
  });
}
