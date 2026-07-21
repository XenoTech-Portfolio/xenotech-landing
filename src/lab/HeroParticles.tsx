import { useEffect, useRef } from "react";
import * as THREE from "three";

const GOLD = "#b8862b";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Piramide del prototipo ----------
   Base quadrata centrata sull'origine, apice in alto. Le particelle vivono
   sulle 4 facce triangolari (+ un po' sulla base), così ruotando si legge
   chiaramente come una piramide 3D. Apice = vetta del brand → stella dorata. */
const BASE = 7; // semi-larghezza della base
const H = 12; // altezza totale
const APEX_Y = H / 2; // apice
const BASE_Y = -H / 2; // base

/* Texture morbida e rotonda per i punti: luce, non quadretti netti. */
function makeSoftDot(): THREE.Texture {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.Texture(c);
  tex.needsUpdate = true;
  return tex;
}

export function HeroParticles() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = prefersReducedMotion();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07070c, 0.02);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(0, 0, 25);
    camera.lookAt(0, 0, 0);

    const isSmall = window.innerWidth < 720;
    const COUNT = isSmall ? 6500 : 14000;

    const dot = makeSoftDot();

    const target = new Float32Array(COUNT * 3);
    const current = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const baseHue = new Float32Array(COUNT); // tinta base per il drift di colore
    const phase = new Float32Array(COUNT); // sfasamento per lo shimmer

    const tmpCol = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      // Piramide PIENA: campiona un punto nel volume solido. L'altezza u è
      // distribuita più fitta verso la base (densità realistica del solido);
      // a quota u la sezione è un quadrato che si stringe verso l'apice.
      const u = 1 - Math.cbrt(1 - Math.random());
      const halfW = BASE * (1 - u);
      let x = (Math.random() * 2 - 1) * halfW;
      let z = (Math.random() * 2 - 1) * halfW;
      const y = BASE_Y + (APEX_Y - BASE_Y) * u;
      // Una parte sul guscio esterno (facce) per definire spigoli e silhouette
      if (Math.random() < 0.32 && halfW > 0.01) {
        if (Math.random() < 0.5) x = x < 0 ? -halfW : halfW;
        else z = z < 0 ? -halfW : halfW;
      }

      target[ix] = x;
      target[ix + 1] = y;
      target[ix + 2] = z;

      // Dispersione iniziale: guscio ampio, la piramide "si compone" da qui
      const rr = 30 + Math.random() * 26;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      current[ix] = Math.sin(ph) * Math.cos(th) * rr;
      current[ix + 1] = Math.cos(ph) * rr * 0.7;
      current[ix + 2] = Math.sin(ph) * Math.sin(th) * rr - 6;

      // Colore multicolore: tinta in base all'angolo attorno all'asse + altezza
      const ang = Math.atan2(z, x); // -π..π
      const hgt = (y - BASE_Y) / H; // 0 base → 1 apice
      const hue = ((ang / (Math.PI * 2) + 0.5) * 0.8 + hgt * 0.25 + Math.random() * 0.04) % 1;
      baseHue[i] = hue;
      phase[i] = Math.random() * Math.PI * 2;
      tmpCol.setHSL(hue, 0.62, 0.6);
      colors[ix] = tmpCol.r;
      colors[ix + 1] = tmpCol.g;
      colors[ix + 2] = tmpCol.b;
    }

    if (reduced) current.set(target);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(current, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: isSmall ? 0.17 : 0.14,
      map: dot,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const colAttr = geo.attributes.color as THREE.BufferAttribute;

    // --- Stella dorata sull'apice (figlia della piramide: ruota con lei) ---
    const starTex = makeSoftDot();
    const starMat = new THREE.SpriteMaterial({
      map: starTex,
      color: new THREE.Color(GOLD),
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const star = new THREE.Sprite(starMat);
    star.position.set(0, APEX_Y + 0.5, 0);
    star.scale.setScalar(3);
    points.add(star);
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: starTex,
        color: new THREE.Color("#ffe6a8"),
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    halo.position.copy(star.position);
    halo.scale.setScalar(8);
    points.add(halo);

    // --- Cursore proiettato sul piano z=0, poi portato nello spazio locale ---
    const pointer = new THREE.Vector2(-999, -999);
    const pointerWorld = new THREE.Vector3(999, 999, 0);
    const pointerLocal = new THREE.Vector3(999, 999, 0);
    const rayPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    let hasPointer = false;
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      hasPointer = true;
    };
    const onLeave = () => {
      hasPointer = false;
      pointerWorld.set(999, 999, 0);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onLeave);

    let burst = 0;
    const onDown = () => {
      burst = 1;
    };
    window.addEventListener("pointerdown", onDown);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const REPEL_R = 5;
    const clock = new THREE.Clock();
    let parX = 0;
    let parY = 0;
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (hasPointer) {
        raycaster.setFromCamera(pointer, camera);
        raycaster.ray.intersectPlane(rayPlane, pointerWorld);
      }

      // Rotazione: spin continuo (molto più vivo) + parallasse morbida
      const targetParX = hasPointer ? pointer.x : 0;
      const targetParY = hasPointer ? pointer.y : 0;
      parX += (targetParX - parX) * 0.05;
      parY += (targetParY - parY) * 0.05;
      points.rotation.y = (reduced ? 0.6 : t * 0.32) + parX * 0.5;
      points.rotation.x = (reduced ? 0.1 : Math.sin(t * 0.4) * 0.08) - parY * 0.25;

      burst *= 0.94;

      if (!reduced) {
        points.updateMatrixWorld(true);
        pointerLocal.copy(pointerWorld);
        points.worldToLocal(pointerLocal);

        const arr = posAttr.array as Float32Array;
        const cArr = colAttr.array as Float32Array;
        const k = 0.055;
        const hueDrift = t * 0.03;
        for (let i = 0; i < COUNT; i++) {
          const ix = i * 3;
          // Shimmer: micro-oscillazione continua attorno al target (vita)
          const sh = Math.sin(t * 2.2 + phase[i]) * 0.14;
          let dx = target[ix] - arr[ix];
          let dy = target[ix + 1] + sh - arr[ix + 1];
          let dz = target[ix + 2] - arr[ix + 2];

          if (hasPointer || burst > 0.01) {
            const rx = arr[ix] - pointerLocal.x;
            const ry = arr[ix + 1] - pointerLocal.y;
            const d2 = rx * rx + ry * ry;
            if (d2 < REPEL_R * REPEL_R) {
              const d = Math.sqrt(d2) || 0.0001;
              const f = (REPEL_R - d) / REPEL_R;
              const push = f * (1.4 + burst * 5);
              dx += (rx / d) * push;
              dy += (ry / d) * push;
              dz += (Math.random() - 0.5) * f * (0.5 + burst * 4);
            }
          }

          arr[ix] += dx * k;
          arr[ix + 1] += dy * k;
          arr[ix + 2] += dz * k;

          // Drift di colore lento (multicolore che respira)
          let hue = baseHue[i] + hueDrift;
          hue -= Math.floor(hue);
          tmpCol.setHSL(hue, 0.62, 0.6);
          cArr[ix] = tmpCol.r;
          cArr[ix + 1] = tmpCol.g;
          cArr[ix + 2] = tmpCol.b;
        }
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      }

      const pulse = 1 + Math.sin(t * 1.8) * 0.14;
      star.scale.setScalar(3 * pulse);
      halo.scale.setScalar(8 * (1 + Math.sin(t * 1.8) * 0.1));

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("pointerdown", onDown);
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      dot.dispose();
      starTex.dispose();
      starMat.dispose();
      (halo.material as THREE.SpriteMaterial).dispose();
      renderer.dispose();
      mount.replaceChildren();
    };
  }, []);

  return <div ref={mountRef} className="lab-canvas" aria-hidden="true" />;
}
