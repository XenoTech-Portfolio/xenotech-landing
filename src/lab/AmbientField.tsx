import { useEffect, useRef } from "react";
import * as THREE from "three";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Campo 3D ambientale: piramidi/tetraedri wireframe che fluttuano dietro a
   TUTTA la pagina (canvas fixed, z dietro ai contenuti). Reagiscono al mouse
   con una parallasse morbida. Leggero: poche geometrie low-poly, linee
   additive. Dà profondità 3D anche fuori dall'hero. */
export function AmbientField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = prefersReducedMotion();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07070c, 0.03);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 20);

    const isSmall = window.innerWidth < 720;
    const N = isSmall ? 10 : 18;

    const group = new THREE.Group();
    const shapes: { mesh: THREE.LineSegments; spin: THREE.Vector3; drift: number; baseY: number }[] = [];
    for (let i = 0; i < N; i++) {
      const geo =
        i % 2 === 0
          ? new THREE.TetrahedronGeometry(1)
          : new THREE.ConeGeometry(0.9, 1.6, 4); // piramide a base quadrata
      const edges = new THREE.EdgesGeometry(geo);
      const hue = (i / N + 0.05) % 1;
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.6, 0.6),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.LineSegments(edges, mat);
      const s = 0.6 + Math.random() * 1.8;
      mesh.scale.setScalar(s);
      const baseY = (Math.random() * 2 - 1) * 14;
      mesh.position.set(
        (Math.random() * 2 - 1) * 20,
        baseY,
        (Math.random() * 2 - 1) * 10 - 4
      );
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      group.add(mesh);
      shapes.push({
        mesh,
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ),
        drift: 0.15 + Math.random() * 0.25,
        baseY,
      });
      geo.dispose();
    }
    scene.add(group);

    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);

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

    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    const onVis = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) return;
      const t = clock.getElapsedTime();

      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;
      group.rotation.y = px * 0.35;
      group.rotation.x = py * 0.2;

      if (!reduced) {
        for (const s of shapes) {
          s.mesh.rotation.x += s.spin.x * 0.01;
          s.mesh.rotation.y += s.spin.y * 0.01;
          s.mesh.rotation.z += s.spin.z * 0.01;
          s.mesh.position.y = s.baseY + Math.sin(t * s.drift + s.baseY) * 1.2;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
      scene.traverse((o) => {
        const ls = o as THREE.LineSegments;
        if (ls.geometry) ls.geometry.dispose();
        const m = ls.material as THREE.Material | undefined;
        if (m && "dispose" in m) m.dispose();
      });
      renderer.dispose();
      mount.replaceChildren();
    };
  }, []);

  return <div ref={mountRef} className="lab-ambient" aria-hidden="true" />;
}
