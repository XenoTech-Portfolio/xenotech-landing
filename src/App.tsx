import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import * as THREE from "three";
import Lenis from "lenis";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, Mail, MapPin, PlayCircle, Rocket } from "lucide-react";

const EMAIL = "mansellasimone24@gmail.com";
const GITHUB_URL = "https://github.com/XenoTech-Portfolio";
const INK = "#221f1b";
const GOLD = "#b8862b"; // unico accento, colori originali del logo

// TODO: aggiornare con gli URL reali dopo il deploy su Vercel
const REVU_URL = "https://revu.vercel.app";
const LAVAGNA_TATTICA_URL = "https://lavagna-tattica.vercel.app";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

/* ---------- Logo 2D (header/footer) ---------- */

function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 42 L20 16 L27 27 L34 14 L44 42 Z" />
      <path d="M30 8 l1.6 3.2 3.4.4-2.5 2.4.6 3.4-3.1-1.7-3.1 1.7.6-3.4L25 11.6l3.4-.4Z" />
    </svg>
  );
}

/* ---------- Scroll fluido con inerzia (Lenis) ---------- */

function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (a) {
        const href = a.getAttribute("href")!;
        if (href.startsWith("#/")) return; // cambio pagina (hash route), non scroll
        e.preventDefault();
        lenis.scrollTo(href, { offset: -72 });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}

/* ---------- Routing interno via hash: "#/automazioni" è una seconda pagina ---------- */

function useHashRoute() {
  const getRoute = () =>
    window.location.hash.startsWith("#/") ? window.location.hash.slice(1) : "/";
  const [route, setRoute] = useState(getRoute);
  useEffect(() => {
    const onHash = () => {
      setRoute(getRoute());
      // Nuova pagina, si riparte dall'alto (senza animazione di scroll)
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

/* ---------- Sfondo 3D persistente: la montagna del logo, dietro a tutta
   la pagina. Un'unica scena al posto dei tre livelli separati di prima
   (fluido, poligoni sparsi, riquadro hero) — non cattura mai i click
   (pointer-events: none via CSS), ma resta viva: la camera segue lo
   scroll e il mouse, e un click ovunque sulla pagina increspa il terreno. ---------- */

function MountainBackground({
  starPulseRef,
}: {
  starPulseRef: RefObject<number>;
}) {
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
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);

    // Luci: chiave calda + riempimento freddo, per far leggere le facce
    scene.add(new THREE.AmbientLight(0xfff6e6, 0.75));
    const key = new THREE.DirectionalLight(0xffe9c8, 1.25);
    key.position.set(12, 18, 8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe8f0, 0.35);
    fill.position.set(-10, 8, -6);
    scene.add(fill);

    // --- La montagna del logo: silhouette esatta, corpo low-poly ---
    const profilePts: [number, number][] = [
      [-10, 0],
      [-2, 8.7],
      [1.5, 5.0],
      [5, 9.4],
      [10, 0],
    ];
    const profile = (x: number) => {
      if (x <= profilePts[0][0] || x >= profilePts[profilePts.length - 1][0]) return 0;
      for (let i = 1; i < profilePts.length; i++) {
        const [x0, y0] = profilePts[i - 1];
        const [x1, y1] = profilePts[i];
        if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
      }
      return 0;
    };
    const frac = (v: number) => v - Math.floor(v);
    const noise = (x: number, z: number) =>
      frac(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) - 0.5;
    const mountainH = (x: number, z: number) => {
      const f = Math.max(0, 1 - Math.pow(Math.abs(z) / 8.5, 1.7));
      let y = profile(x) * f;
      if (y > 0.05) y += noise(x, z) * Math.min(1.1, y * 0.16);
      return Math.max(0, y);
    };

    const W = 36;
    const D = 24;
    const geo = new THREE.PlaneGeometry(W, D, 84, 56);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      if (Math.abs(x) < W / 2 - 0.5 && Math.abs(z) < D / 2 - 0.5) {
        pos.setX(i, x + noise(z, x) * 0.28);
        pos.setZ(i, z + noise(x + 7, z - 3) * 0.28);
      }
    }
    const baseHeights = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const y = mountainH(pos.getX(i), pos.getZ(i));
      baseHeights[i] = y;
      pos.setY(i, y);
    }
    geo.computeVertexNormals();
    const terrain = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ede7d9"),
        flatShading: true,
        roughness: 0.95,
        metalness: 0,
      })
    );
    scene.add(terrain);
    const sketch = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({
        color: new THREE.Color(INK),
        transparent: true,
        opacity: 0.07,
      })
    );
    scene.add(sketch);

    // --- Il sentiero che serpeggia fino alla vetta destra ---
    const pathXZ: [number, number][] = [
      [-8.2, 7.5],
      [-4.5, 5.2],
      [-1.0, 6.0],
      [1.8, 3.6],
      [0.6, 1.2],
      [2.6, -0.6],
      [4.6, 0.8],
      [5.0, -0.6],
    ];
    const roughCurve = new THREE.CatmullRomCurve3(
      pathXZ.map(([x, z]) => new THREE.Vector3(x, mountainH(x, z) + 0.15, z))
    );
    const sampled: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const pt = roughCurve.getPoint(i / 120);
      sampled.push(new THREE.Vector3(pt.x, mountainH(pt.x, pt.z) + 0.14, pt.z));
    }
    const walkCurve = new THREE.CatmullRomCurve3(sampled);
    const path = new THREE.Mesh(
      new THREE.TubeGeometry(walkCurve, 160, 0.09, 6, false),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(INK), roughness: 0.8 })
    );
    scene.add(path);

    // --- Lo scalatore: gambe e braccia articolate per un passo vero ---
    const hiker = new THREE.Group();
    const inkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(INK),
      roughness: 0.7,
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), inkMat);
    head.position.y = 1.02;
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.44, 4, 8), inkMat);
    torso.position.y = 0.63;
    const makeLimb = (radius: number, length: number, pivotY: number) => {
      const pivot = new THREE.Group();
      pivot.position.y = pivotY;
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 3, 6), inkMat);
      mesh.position.y = -length / 2 - radius;
      pivot.add(mesh);
      return pivot;
    };
    const hipY = 0.42;
    const shoulderY = 0.84;
    const legL = makeLimb(0.055, 0.34, hipY);
    legL.position.x = 0.09;
    const legR = makeLimb(0.055, 0.34, hipY);
    legR.position.x = -0.09;
    const armL = makeLimb(0.048, 0.32, shoulderY);
    armL.position.x = 0.19;
    const armR = makeLimb(0.048, 0.32, shoulderY);
    armR.position.x = -0.19;
    hiker.add(head, torso, legL, legR, armL, armR);
    hiker.scale.setScalar(1.15);
    // Ordine "YXZ": lo yaw ruota per primo attorno alla vera verticale,
    // il pitch inclina poi rispetto alla nuova direzione — con l'ordine
    // di default "XYZ" il pitch veniva applicato prima e lo yaw lo
    // trascinava fuori asse, facendo "attorcigliare" l'omino nelle curve.
    hiker.rotation.order = "YXZ";
    scene.add(hiker);

    // --- La stella del logo, sopra la vetta destra: unico accento oro ---
    const starGroup = new THREE.Group();
    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? 1 : 0.45;
      const px = Math.cos(a) * rad;
      const py = Math.sin(a) * rad;
      i === 0 ? starShape.moveTo(px, py) : starShape.lineTo(px, py);
    }
    starShape.closePath();
    const sGeo = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 2,
    });
    sGeo.translate(0, 0, -0.15);
    const sMesh = new THREE.Mesh(
      sGeo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(GOLD),
        roughness: 0.35,
        metalness: 0.25,
      })
    );
    starGroup.add(sMesh);
    const raysGeo = new THREE.BufferGeometry();
    const rayVerts: number[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      rayVerts.push(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0);
      rayVerts.push(Math.cos(a) * 2.0, Math.sin(a) * 2.0, 0);
    }
    raysGeo.setAttribute("position", new THREE.Float32BufferAttribute(rayVerts, 3));
    const rays = new THREE.LineSegments(
      raysGeo,
      new THREE.LineBasicMaterial({
        color: new THREE.Color(GOLD),
        transparent: true,
        opacity: 0.85,
      })
    );
    starGroup.add(rays);
    const STAR_Y = 12.2;
    starGroup.scale.setScalar(1.6);
    starGroup.position.set(5, STAR_Y, 0);
    scene.add(starGroup);

    // --- La nuvola del logo, alla deriva accanto alla vetta sinistra ---
    const cloud = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#faf6ec"),
      roughness: 1,
    });
    const puffs: [number, number, number, number][] = [
      [0, 0, 0, 0.9],
      [1.0, 0.15, 0, 0.7],
      [-0.9, 0.1, 0, 0.65],
      [0.3, 0.55, 0, 0.6],
    ];
    for (const [px, py, pz, r] of puffs) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), cloudMat);
      puff.position.set(px, py, pz);
      cloud.add(puff);
    }
    const CLOUD_X = -6;
    cloud.position.set(CLOUD_X, 10.6, -2);
    scene.add(cloud);

    // --- Gocce d'inchiostro ---
    const DROPS = 40;
    const dropGeo = new THREE.SphereGeometry(0.09, 6, 6);
    const dropMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(INK) });
    const drops = new THREE.InstancedMesh(dropGeo, dropMat, DROPS);
    const dropPos: THREE.Vector3[] = [];
    const dropVel: number[] = [];
    for (let i = 0; i < DROPS; i++) {
      dropPos.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * W * 0.85,
          Math.random() * 15 + 2,
          (Math.random() - 0.5) * D * 0.85
        )
      );
      dropVel.push(0.04 + Math.random() * 0.08);
    }
    scene.add(drops);

    // --- Camera guidata da scroll + mouse (niente drag manuale: lo sfondo
    // non deve mai intercettare i click destinati ai contenuti sopra) ---
    const CENTER = new THREE.Vector3(0, 4, 0);
    const RADIUS = 21.37;
    const AZ0 = Math.atan2(4, 21); // framing di partenza identico alla versione precedente
    camera.position.set(4, 8, 21);
    camera.lookAt(CENTER);

    let nx = 0;
    let ny = 0;
    const onPointerMoveParallax = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMoveParallax);

    // Click ovunque sulla pagina → onda sul terreno + impulso della stella.
    // Ascolto passivo su window: non interferisce mai con i click reali
    // sui bottoni/link (lo sfondo ha pointer-events:none via CSS).
    type Ripple = { x: number; z: number; t0: number };
    const ripples: Ripple[] = [];
    const raycaster = new THREE.Raycaster();
    const clock = new THREE.Clock();
    const onGlobalPointerDown = (e: PointerEvent) => {
      const px = (e.clientX / window.innerWidth) * 2 - 1;
      const py = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(px, py), camera);
      const hit = raycaster.intersectObject(terrain)[0];
      if (hit) {
        ripples.push({ x: hit.point.x, z: hit.point.z, t0: clock.getElapsedTime() });
        if (ripples.length > 5) ripples.shift();
      }
      starPulseRef.current = 1.35;
    };
    window.addEventListener("pointerdown", onGlobalPointerDown);

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

    const dummy = new THREE.Object3D();
    const tangent = new THREE.Vector3();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Stella: rotazione, fluttuazione e impulso al clic (o all'hover
      // della card del progetto in evidenza, via starPulseRef condiviso)
      starGroup.rotation.y = t * 0.6;
      starGroup.position.y = STAR_Y + Math.sin(t * 1.4) * 0.3;
      starPulseRef.current += (1 - starPulseRef.current) * 0.08;
      starGroup.scale.setScalar(1.6 * starPulseRef.current);

      if (!reduced) {
        cloud.position.x = CLOUD_X + Math.sin(t * 0.15) * 1.4;
        cloud.position.y = 10.6 + Math.sin(t * 0.4) * 0.15;
      }

      // Lo scalatore percorre il sentiero con un vero ciclo del passo
      const u = reduced ? 0.6 : (t * 0.014) % 1;
      const hp = walkCurve.getPointAt(u);
      walkCurve.getTangentAt(u, tangent);
      const yaw = Math.atan2(tangent.x, tangent.z);
      const slopePitch = Math.atan2(tangent.y, Math.hypot(tangent.x, tangent.z) || 1e-4);
      if (reduced) {
        hiker.position.set(hp.x, hp.y - 0.05, hp.z);
        hiker.rotation.set(0, yaw, 0);
      } else {
        const stride = 6.2;
        const phase = t * stride;
        const swing = 0.6;
        legL.rotation.x = Math.sin(phase) * swing;
        legR.rotation.x = Math.sin(phase + Math.PI) * swing;
        armL.rotation.x = Math.sin(phase + Math.PI) * swing * 0.75;
        armR.rotation.x = Math.sin(phase) * swing * 0.75;
        const bob = Math.abs(Math.sin(phase)) * 0.045;
        torso.rotation.z = Math.sin(phase) * 0.05;
        torso.rotation.x = 0.18;
        hiker.position.set(hp.x, hp.y - 0.05 + bob, hp.z);
        hiker.rotation.set(-slopePitch * 0.7 + 0.1, yaw, 0);
      }

      // Onde sul terreno dai clic
      if (ripples.length > 0) {
        const active = ripples.filter((rp) => t - rp.t0 < 4);
        for (let i = 0; i < pos.count; i++) {
          let y = baseHeights[i];
          const vx = pos.getX(i);
          const vz = pos.getZ(i);
          for (const rp of active) {
            const dt = t - rp.t0;
            const d = Math.sqrt((vx - rp.x) ** 2 + (vz - rp.z) ** 2);
            y += 0.8 * Math.sin(d * 1.9 - dt * 7) * Math.exp(-d * 0.32) * Math.exp(-dt * 1.4);
          }
          pos.setY(i, y);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        if (active.length === 0) ripples.length = 0;
      }

      if (!reduced) {
        for (let i = 0; i < DROPS; i++) {
          const p = dropPos[i];
          p.y -= dropVel[i];
          if (p.y < mountainH(p.x, p.z) + 0.1) {
            p.set(
              (Math.random() - 0.5) * W * 0.85,
              15 + Math.random() * 4,
              (Math.random() - 0.5) * D * 0.85
            );
          }
          dummy.position.copy(p);
          dummy.updateMatrix();
          drops.setMatrixAt(i, dummy.matrix);
        }
        drops.instanceMatrix.needsUpdate = true;
      }

      // Camera: orbita lentamente seguendo lo scroll (la pagina "continua
      // la salita" mentre scendi) più una piccola parallasse del mouse.
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollProgress = reduced ? 0 : Math.min(1, window.scrollY / maxScroll);
      const idle = reduced ? 0 : Math.sin(t * 0.05) * 0.035;
      const az = AZ0 + scrollProgress * 0.55 + idle + (reduced ? 0 : nx * 0.05);
      const elevOffset = 4 - scrollProgress * 1.6 + (reduced ? 0 : -ny * 0.5);
      const targetX = CENTER.x + RADIUS * Math.sin(az);
      const targetZ = CENTER.z + RADIUS * Math.cos(az);
      const targetY = CENTER.y + elevOffset;
      camera.position.x += (targetX - camera.position.x) * 0.045;
      camera.position.y += (targetY - camera.position.y) * 0.045;
      camera.position.z += (targetZ - camera.position.z) * 0.045;
      camera.lookAt(CENTER);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMoveParallax);
      window.removeEventListener("pointerdown", onGlobalPointerDown);
      ro.disconnect();
      renderer.dispose();
      geo.dispose();
      dropGeo.dispose();
      sGeo.dispose();
      raysGeo.dispose();
      mount.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="mountain-bg"
      aria-hidden="true"
      title="Clicca ovunque sulla pagina: la montagna increspa"
    />
  );
}

/* ---------- Pannello 3D: le card della pagina hanno spessore reale ---------- */

function Panel3D({
  children,
  delay = 0,
  className,
  variant = "paper",
  onPointerEnter,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "paper" | "ink" | "ghost";
  onPointerEnter?: () => void;
}) {
  const frontRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = frontRef.current;
    if (!el || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateY(${px * 16}deg) rotateX(${-py * 16}deg) translateZ(14px)`;
    el.style.boxShadow = `${-px * 26}px ${18 - py * 10}px 32px -10px rgba(34,31,27,0.4)`;
  };
  const onLeave = () => {
    const el = frontRef.current;
    if (!el) return;
    el.style.transform = "";
    el.style.boxShadow = "";
  };

  const skin =
    variant === "ghost" ? "ghost-card" : variant === "ink" ? "panel-ink" : "panel-paper";

  return (
    <div
      className={`reveal panel3d-wrap${className ? ` ${className}` : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {variant !== "ghost" && <div className="panel3d-under" aria-hidden />}
      <div
        ref={frontRef}
        className={`panel3d-front ${skin} flex h-full flex-col p-6`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onMouseEnter={onPointerEnter}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- Nav: sezione attiva mentre scorri (scroll-spy) ---------- */

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const idsKey = ids.join(",");

  useEffect(() => {
    const els = idsKey
      .split(",")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActive(topmost.target.id);
      },
      // -90px in alto: la sezione conta come "attiva" appena esce da sotto
      // l'header sticky (~72px + margine); -55% in basso: evita che due
      // sezioni risultino attive insieme quando sono entrambe alte.
      { rootMargin: "-90px 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [idsKey]);

  return active;
}

/* ---------- Reveal on scroll ---------- */

function useReveal(routeDep?: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // routeDep: al cambio pagina i nodi .reveal sono nuovi, l'observer va ricreato
  }, [routeDep]);
}

/* ---------- Dati ---------- */

type Progetto = {
  nome: string;
  descrizione: string;
  tag: string[];
  stato: string;
  peso: "featured" | "normale" | "ghost";
  link?: string;
};

const progetti: Progetto[] = [
  {
    nome: "Revu",
    descrizione:
      "Piattaforma self-serve per raccogliere recensioni Google: onboarding negoziante, abbonamento Stripe, pagina pubblica di valutazione con redirect intelligente tra recensione pubblica e feedback privato.",
    tag: ["Next.js", "Prisma", "Stripe"],
    stato: "Live",
    peso: "featured" as const,
    link: "#/revu",
  },
  {
    nome: "Lavagna Tattica",
    descrizione:
      "Lavagna tattica interattiva per il calcio: schemi, movimenti e animazioni dei giocatori direttamente nel browser.",
    tag: ["React", "Three.js", "Vite"],
    stato: "In sviluppo",
    peso: "normale" as const,
    link: "#/lavagna-tattica",
  },
  {
    nome: "StarkEno",
    descrizione:
      "Il mio secondo cervello digitale: un sistema di note interconnesse per obiettivi, studio e gestione degli asset personali.",
    tag: ["Obsidian", "Knowledge Management"],
    stato: "Attivo",
    peso: "normale" as const,
  },
  {
    nome: "Prossima vetta",
    descrizione:
      "C'è sempre una nuova salita in programma. Il prossimo progetto è in fase di esplorazione: torna a trovarmi presto.",
    tag: ["Coming soon"],
    stato: "In arrivo",
    peso: "ghost" as const,
  },
];

const competenze = [
  {
    titolo: "Sviluppo Web",
    voce: "React, TypeScript, Vite e interfacce moderne, dal prototipo al prodotto.",
    cta: false as const,
  },
  {
    titolo: "Sperimentazione AI",
    voce: "Integrazione di modelli e agenti AI nei flussi di lavoro e nei progetti personali.",
    cta: false as const,
  },
  {
    titolo: "Organizzazione della conoscenza",
    voce: "Metodo e strumenti per trasformare idee sparse in sistemi ordinati e consultabili.",
    cta: false as const,
  },
];

/* ---------- Pagina Automazioni: catalogo, funzionamento e prezzi ---------- */

type FlowNode = { label: string; sub?: string; ai?: boolean };

// Le automazioni reali di Simone (scenari Make già in funzione sul suo
// account). Prezzi fittizi di lancio, proporzionati al valore che portano.
const automazioni: {
  id: string;
  nome: string;
  pitch: string;
  descrizione: string;
  flow: FlowNode[][];
  valore: string;
  prezzo: number;
  prezzoPieno: number;
}[] = [
  {
    id: "email-ai",
    nome: "Assistente Email AI",
    pitch: "La casella si gestisce da sola.",
    descrizione:
      "Un agente AI legge ogni email in arrivo, la classifica, registra tutto su Google Sheets, ti avvisa su Telegram quando c'è qualcosa di urgente e prepara la bozza di risposta direttamente in Gmail. Tu apri, controlli e premi invia.",
    flow: [
      [{ label: "Gmail", sub: "email in arrivo" }],
      [{ label: "Agente AI", sub: "legge e decide", ai: true }],
      [
        { label: "Google Sheets", sub: "registro" },
        { label: "Telegram", sub: "avviso urgenze" },
        { label: "Bozza Gmail", sub: "risposta pronta" },
      ],
    ],
    valore: "Ore di smistamento email restituite ogni settimana",
    prezzo: 149,
    prezzoPieno: 249,
  },
  {
    id: "ordini",
    nome: "Notifiche Ordini",
    pitch: "Ogni ordine tracciato nell'istante in cui arriva.",
    descrizione:
      "Le email degli ordini vengono intercettate, l'agente AI estrae i dati che contano — cliente, importo, prodotto — li archivia su Google Sheets e smista la notifica giusta sul canale Telegram giusto.",
    flow: [
      [{ label: "Gmail", sub: "email ordine" }],
      [{ label: "Agente AI", sub: "estrae i dati", ai: true }],
      [{ label: "Router", sub: "smistamento" }],
      [
        { label: "Telegram", sub: "notifica" },
        { label: "Google Sheets", sub: "archivio" },
      ],
    ],
    valore: "Zero ordini persi, archivio sempre aggiornato",
    prezzo: 99,
    prezzoPieno: 179,
  },
  {
    id: "contenuti",
    nome: "Pipeline Contenuti",
    pitch: "Da una riga su Sheets a un video pronto.",
    descrizione:
      "Scrivi l'idea in una riga di Google Sheets: l'agente AI genera lo script, ElevenLabs lo trasforma in voce naturale e Creatomate monta il video finale. Una catena di montaggio per i tuoi contenuti.",
    flow: [
      [{ label: "Google Sheets", sub: "idea" }],
      [{ label: "Agente AI", sub: "script", ai: true }],
      [{ label: "ElevenLabs", sub: "voce" }],
      [{ label: "Creatomate", sub: "video" }],
    ],
    valore: "Un video prodotto al costo di una riga di testo",
    prezzo: 199,
    prezzoPieno: 349,
  },
];

function FlowDiagram({ flow }: { flow: FlowNode[][] }) {
  return (
    <div
      className="flow-scroll mt-6 flex items-center gap-2"
      role="img"
      aria-label="Schema di funzionamento dell'automazione"
    >
      {flow.map((group, gi) => (
        <Fragment key={gi}>
          {gi > 0 && (
            <svg
              className="flow-arrow shrink-0"
              width="30"
              height="12"
              viewBox="0 0 30 12"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="6"
                x2="21"
                y2="6"
                stroke="currentColor"
                strokeWidth="1.5"
                className="flow-dash"
              />
              <path d="M21 1.5 L29 6 L21 10.5 Z" fill="currentColor" />
            </svg>
          )}
          <div className="flex shrink-0 flex-col gap-2">
            {group.map((n) => (
              <div key={n.label} className={`flow-node${n.ai ? " flow-node-ai" : ""}`}>
                <span className="block text-xs font-bold">{n.label}</span>
                {n.sub && <span className="block text-[10px] opacity-70">{n.sub}</span>}
              </div>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function AutomazioniPage() {
  return (
    <main className="mx-auto max-w-6xl px-5">
      <section className="py-14 md:py-20">
        <p className="font-mono-label mb-6 text-xs">
          <a className="ink-link" href="#/">← Torna alla home</a>
        </p>
        <p className="font-mono-label mb-3 text-xs" style={{ color: GOLD }}>
          Automazioni · Make + Agenti AI
        </p>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Automazioni che lavorano
          <br />al posto tuo
          <span style={{ color: GOLD }}>.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg font-semibold leading-relaxed text-muted-foreground">
          Queste non sono demo: sono le automazioni che uso davvero, già in
          funzione sui miei account. Il prezzo segue il valore che portano —
          più ore ti restituiscono, più valgono.
        </p>
        <span className="panel-gold-text mt-5 inline-block border border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          Prezzi di lancio — indicativi
        </span>
      </section>

      <div className="flex flex-col gap-10 pb-20">
        {automazioni.map((a, i) => (
          <Panel3D key={a.id} delay={i * 90}>
            <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono-label text-[10px] opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="panel-chip px-2 py-0.5 text-xs font-bold">
                    Funzionante
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                  {a.nome}
                </h2>
                <p
                  className="font-display mt-1 text-lg font-bold italic"
                  style={{ color: GOLD }}
                >
                  {a.pitch}
                </p>
                <p className="mt-3 leading-relaxed opacity-80">{a.descrizione}</p>
                <FlowDiagram flow={a.flow} />
              </div>
              <div
                className="flex flex-col justify-between gap-6 border-t pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0"
                style={{ borderColor: "rgba(34, 31, 27, 0.2)" }}
              >
                <div>
                  <p className="font-mono-label text-[10px] opacity-60">Cosa ti porta</p>
                  <p className="mt-1 font-semibold leading-relaxed">{a.valore}</p>
                </div>
                <div>
                  <p className="font-mono-label text-[10px] opacity-60">
                    Prezzo di lancio
                  </p>
                  <p className="mt-1 flex items-baseline gap-3">
                    <span className="price-old text-lg font-semibold">
                      €{a.prezzoPieno}
                    </span>
                    <span
                      className="font-display text-4xl font-black"
                      style={{ color: GOLD }}
                    >
                      €{a.prezzo}
                    </span>
                  </p>
                  <p className="mt-1 text-xs opacity-60">
                    una tantum · installata e configurata sui tuoi account
                  </p>
                  <a
                    href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                      `Voglio l'automazione: ${a.nome}`
                    )}`}
                    className="btn-gold mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
                  >
                    <Rocket className="h-4 w-4" /> Richiedi questa automazione
                  </a>
                </div>
              </div>
            </div>
          </Panel3D>
        ))}

        <Panel3D variant="ink" delay={automazioni.length * 90}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="md:max-w-md">
              <h2 className="font-display text-2xl font-bold">
                Ti serve qualcosa su misura?
              </h2>
              <p className="p-muted mt-2 leading-relaxed">
                Ogni flusso di lavoro è diverso. Raccontami il tuo processo più
                ripetitivo e ti dico se si può automatizzare — e quanto tempo ti
                restituirebbe.
              </p>
            </div>
            <a
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                "Automazione su misura"
              )}`}
              className="btn-gold inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 text-sm"
            >
              <Mail className="h-4 w-4" /> Parliamone
            </a>
          </div>
        </Panel3D>
      </div>
    </main>
  );
}

/* ---------- Pagina Revu: sottopagina dedicata con demo live ---------- */

function RevuPage() {
  return (
    <main className="mx-auto max-w-6xl px-5">
      <section className="py-14 md:py-20">
        <p className="font-mono-label mb-6 text-xs">
          <a className="ink-link" href="#/">← Torna alla home</a>
        </p>
        <p className="font-mono-label mb-3 text-xs" style={{ color: GOLD }}>
          Revu · SaaS per recensioni Google
        </p>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Le recensioni,
          <br />senza pensieri
          <span style={{ color: GOLD }}>.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg font-semibold leading-relaxed text-muted-foreground">
          Revu è una piattaforma self-serve per negozi e attività locali: si
          registrano, collegano il canale giusto e iniziano a raccogliere
          recensioni Google vere, senza nessuna configurazione tecnica.
        </p>
        <a
          href={REVU_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-gold mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
        >
          Apri la demo live <ArrowUpRight className="h-4 w-4" />
        </a>
      </section>

      <div className="flex flex-col gap-10 pb-20">
        <Panel3D>
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Come funziona
          </h2>
          <p className="mt-3 leading-relaxed opacity-80">
            Onboarding in 3 passaggi — dati dell'attività, canale di invio,
            abbonamento Stripe — e la pagina pubblica di valutazione è pronta.
            Chi lascia 4-5 stelle viene indirizzato direttamente su Google; chi
            lascia 1-3 stelle atterra su un feedback privato, mai pubblicato:
            il negoziante lo legge, il punteggio su Google resta protetto.
          </p>
        </Panel3D>
        <Panel3D delay={90}>
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Sotto il cofano
          </h2>
          <p className="mt-3 leading-relaxed opacity-80">
            Next.js (App Router), Prisma su Postgres, abbonamenti reali via
            Stripe Checkout con webhook verificato end-to-end. Design system
            dedicato — turchese e panna, tipografia Plus Jakarta Sans —
            pensato per essere immediato anche per chi non ha mai usato un
            gestionale.
          </p>
        </Panel3D>

        <Panel3D variant="ink" delay={180}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="md:max-w-md">
              <h2 className="font-display text-2xl font-bold">
                Ti serve una piattaforma così?
              </h2>
              <p className="p-muted mt-2 leading-relaxed">
                Revu è un esempio reale di quello che so costruire: onboarding
                self-serve, pagamenti, database, pagina pubblica pronta
                all'uso. Raccontami la tua idea e vediamo se ha senso
                costruirne una su misura per te.
              </p>
            </div>
            <a
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                "Voglio una piattaforma come Revu"
              )}`}
              className="btn-gold inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 text-sm"
            >
              <Rocket className="h-4 w-4" /> Parliamone
            </a>
          </div>
        </Panel3D>
      </div>
    </main>
  );
}

/* ---------- Pagina Lavagna Tattica: sottopagina dedicata, demo live in iframe ---------- */

function LavagnaTatticaPage() {
  return (
    <main className="mx-auto max-w-6xl px-5">
      <section className="py-14 md:py-20">
        <p className="font-mono-label mb-6 text-xs">
          <a className="ink-link" href="#/">← Torna alla home</a>
        </p>
        <p className="font-mono-label mb-3 text-xs" style={{ color: GOLD }}>
          Lavagna Tattica · 3D per allenatori
        </p>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Ogni schema,
          <br />prima del fischio d'inizio
          <span style={{ color: GOLD }}>.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg font-semibold leading-relaxed text-muted-foreground">
          Uno stadio notturno completo, ricostruito in 3D nel browser: moduli,
          transizioni di fase, marcatura uomo/zona e registrazione delle
          azioni, per preparare la partita come farebbe un vero staff tecnico.
        </p>
      </section>

      <div className="flex flex-col gap-10 pb-20">
        <Panel3D>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight">
              Demo live — interagisci direttamente
            </h2>
            <a
              href={LAVAGNA_TATTICA_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-ink-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              Apri a schermo intero <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <iframe
            src={LAVAGNA_TATTICA_URL}
            title="Lavagna Tattica Pro — demo live"
            className="h-[65vh] w-full rounded-md border-0"
            loading="lazy"
            allow="fullscreen"
          />
        </Panel3D>

        <div className="grid gap-8 md:grid-cols-3">
          <Panel3D delay={80}>
            <h3 className="font-display text-xl font-bold">Stadio e grafica</h3>
            <p className="mt-2 flex-1 leading-relaxed opacity-80">
              Catino a gradoni con ~7.000 spettatori, tone mapping ACES, bloom
              sulle superfici emissive: atmosfera cinematografica da notturna
              vera.
            </p>
          </Panel3D>
          <Panel3D delay={160}>
            <h3 className="font-display text-xl font-bold">Moduli per fase</h3>
            <p className="mt-2 flex-1 leading-relaxed opacity-80">
              9 strutture di possesso e 22 moduli di non possesso, con
              transizioni animate e marcatura uomo/zona che si adatta alla
              fase in corso.
            </p>
          </Panel3D>
          <Panel3D delay={240}>
            <h3 className="font-display text-xl font-bold">Azioni e lavagna</h3>
            <p className="mt-2 flex-1 leading-relaxed opacity-80">
              Registra e riproduci sviluppi d'azione fotogramma per
              fotogramma, disegna a mano libera frecce e linee di passaggio,
              esporta lo schema in PNG.
            </p>
          </Panel3D>
        </div>

        <Panel3D variant="ink" delay={320}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="md:max-w-md">
              <h2 className="font-display text-2xl font-bold">
                In sviluppo, e cresce ancora
              </h2>
              <p className="p-muted mt-2 leading-relaxed">
                Lavagna Tattica è un progetto vivo — nuove viste, nuovi moduli
                e un backend tattico opzionale che ricalcola le posizioni in
                tempo reale sono già nel piano. Se alleni una squadra e vuoi
                provarla sul campo vero, scrivimi.
              </p>
            </div>
            <a
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                "Lavagna Tattica — feedback"
              )}`}
              className="btn-gold inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 text-sm"
            >
              <Mail className="h-4 w-4" /> Parliamone
            </a>
          </div>
        </Panel3D>
      </div>
    </main>
  );
}

/* ---------- Pagina ---------- */

export default function App() {
  const route = useHashRoute();
  const onAutomazioni = route === "/automazioni";
  const onRevu = route === "/revu";
  const onLavagnaTattica = route === "/lavagna-tattica";
  const onSubpage = onAutomazioni || onRevu || onLavagnaTattica;
  useSmoothScroll();
  useReveal(route);
  const activeSection = useActiveSection(
    onSubpage ? [] : ["chi-sono", "progetti", "competenze", "contatti"]
  );
  // Impulso della stella condiviso: il click globale sulla montagna e
  // l'hover del progetto in evidenza scrivono sullo stesso ref, letto
  // ogni frame dentro MountainBackground.
  const starPulseRef = useRef(1);

  return (
    <div className="min-h-screen">
      <MountainBackground starPulseRef={starPulseRef} />
      <div className="mountain-veil" aria-hidden />

      <div className="page-content">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <a href={onSubpage ? "#/" : "#top"} className="flex items-center gap-2">
              <LogoMark />
              <span className="font-display text-xl font-semibold tracking-tight">
                XenoTech
              </span>
            </a>
            <nav className="hidden items-center gap-7 text-sm md:flex">
              {onSubpage ? (
                <a className="ink-link" href="#/">← Torna alla home</a>
              ) : (
                <>
                  {(
                    [
                      ["chi-sono", "Chi sono"],
                      ["progetti", "Progetti"],
                      ["competenze", "Competenze"],
                      ["contatti", "Contatti"],
                    ] as const
                  ).map(([id, label]) => (
                    <a
                      key={id}
                      className={`ink-link${activeSection === id ? " ink-link-active" : ""}`}
                      href={`#${id}`}
                    >
                      {label}
                    </a>
                  ))}
                </>
              )}
            </nav>
            <div className="flex items-center gap-2">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="ink-link hidden sm:inline-flex"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <Button asChild size="sm" className="font-bold">
                <a href={`mailto:${EMAIL}`}>
                  <Mail className="mr-1.5 h-4 w-4" /> Scrivimi
                </a>
              </Button>
            </div>
          </div>
        </header>

        {onAutomazioni ? (
          <AutomazioniPage />
        ) : onRevu ? (
          <RevuPage />
        ) : onLavagnaTattica ? (
          <LavagnaTatticaPage />
        ) : (
        <main id="top" className="mx-auto max-w-6xl px-5">
          {/* Hero: niente più riquadro 3D separato — la montagna è già lo
              sfondo di tutta la pagina, qui c'è solo il testo. */}
          <section className="py-20 md:py-28">
            <div className="max-w-2xl">
              <p className="font-mono-label mb-5 text-xs text-muted-foreground">
                Personal brand · Simone Mansella
              </p>
              <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
                Ogni progetto
                <br />è una vetta
                <span style={{ color: GOLD }}>.</span>
              </h1>
              <p
                className="font-display mt-4 text-xl font-bold italic tracking-tight"
                style={{ color: GOLD }}
              >
                Dal codice alla vetta.
              </p>
              <p className="mt-5 max-w-md text-lg font-semibold leading-relaxed text-muted-foreground">
                XenoTech è il mio laboratorio personale: qui costruisco progetti
                web, esploro l'intelligenza artificiale e documento la salita,
                un passo alla volta.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="font-bold">
                  <a href="#progetti">
                    Guarda i progetti <ArrowUpRight className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#chi-sono">La mia storia</a>
                </Button>
              </div>
              <p className="font-mono-label mt-8 text-[10px] text-muted-foreground">
                Clicca ovunque sulla pagina: la montagna increspa
              </p>
            </div>
          </section>

          <Separator />

          {/* Chi sono */}
          <section id="chi-sono" className="grid gap-10 py-20 md:grid-cols-[0.8fr_1.2fr]">
            <div className="reveal">
              <p className="font-mono-label mb-3 text-xs" style={{ color: GOLD }}>
                01 — Chi sono
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Il sentiero prima della cima
              </h2>
            </div>
            <div className="reveal space-y-5 text-lg font-semibold leading-relaxed text-muted-foreground">
              <p>
                Sono Simone, appassionato di tecnologia e di tutto ciò che si può
                costruire con essa. XenoTech nasce dall'idea che ogni competenza
                sia una montagna: non si arriva in cima con un salto, ma con un
                sentiero fatto di piccoli passi costanti.
              </p>
              <p>
                Qui raccolgo i progetti su cui lavoro — dal web al 3D, fino agli
                agenti AI — e li condivido mentre prendono forma. Non solo il
                risultato finale, ma anche la salita.
              </p>
              <p className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" style={{ color: GOLD }} /> Italia
              </p>
            </div>
          </section>

          <Separator />

          {/* Progetti */}
          <section id="progetti" className="py-20">
            <div className="reveal mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono-label mb-3 text-xs" style={{ color: GOLD }}>
                  02 — Progetti
                </p>
                <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                  Le salite in corso
                </h2>
              </div>
              <p className="max-w-xs text-sm font-semibold text-muted-foreground">
                Una selezione di ciò che sto costruendo, tra esperimenti e
                progetti di lungo periodo.
              </p>
            </div>

            <div className="grid auto-rows-fr gap-8 md:grid-cols-3">
              {progetti.map((p, i) => {
                const isFeatured = p.peso === "featured";
                const isGhost = p.peso === "ghost";
                const card = (
                  <Panel3D
                    delay={i * 90}
                    variant={isGhost ? "ghost" : "paper"}
                    className={isFeatured ? "md:col-span-2" : undefined}
                    onPointerEnter={
                      isFeatured ? () => { starPulseRef.current = 1.35; } : undefined
                    }
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="font-mono-label text-[10px] opacity-60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="panel-chip px-2 py-0.5 text-xs font-bold">
                        {p.stato}
                      </span>
                    </div>
                    <h3
                      className={`font-display font-bold tracking-tight ${
                        isFeatured ? "text-3xl" : "text-2xl"
                      }`}
                    >
                      {p.nome}
                    </h3>
                    <p
                      className={`mt-3 flex-1 leading-relaxed opacity-80 ${
                        isFeatured ? "max-w-md text-base" : ""
                      }`}
                    >
                      {p.descrizione}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {p.tag.map((t) => (
                        <span key={t} className="panel-chip px-2 py-0.5 text-xs font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                    {p.link && (
                      <span
                        className="mt-5 inline-flex items-center gap-1 text-xs font-bold"
                        style={{ color: GOLD }}
                      >
                        Vedi il progetto live <ArrowUpRight className="h-3 w-3" />
                      </span>
                    )}
                  </Panel3D>
                );
                return p.link ? (
                  <a key={p.nome} href={p.link} className="contents">
                    {card}
                  </a>
                ) : (
                  <Fragment key={p.nome}>{card}</Fragment>
                );
              })}
            </div>

            <div className="mt-8">
              <Panel3D variant="ink" delay={progetti.length * 90}>
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="md:max-w-md">
                    <span className="panel-gold-text mb-3 inline-block border border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      Caso concreto
                    </span>
                    <h3 className="font-display text-2xl font-bold">
                      Ti serve una piattaforma così per la tua attività?
                    </h3>
                    <p className="p-muted mt-2 leading-relaxed">
                      Revu è un esempio reale di quello che so costruire:
                      onboarding self-serve, pagamenti, database, pagina
                      pubblica pronta all'uso. Raccontami la tua idea e vediamo
                      se ha senso costruirne una su misura per te.
                    </p>
                  </div>
                  <a
                    href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                      "Voglio una piattaforma come Revu"
                    )}`}
                    className="btn-gold inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 text-sm"
                  >
                    <Rocket className="h-4 w-4" /> Parliamone
                  </a>
                </div>
              </Panel3D>
            </div>
          </section>

          <Separator />

          {/* Competenze */}
          <section id="competenze" className="py-20">
            <div className="reveal mb-12">
              <p className="font-mono-label mb-3 text-xs" style={{ color: GOLD }}>
                03 — Competenze
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Gli attrezzi nello zaino
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {competenze.map((c, i) => (
                <Panel3D key={c.titolo} delay={i * 80}>
                  <h3 className="font-display text-xl font-bold">{c.titolo}</h3>
                  <p className="mt-2 flex-1 leading-relaxed opacity-80">{c.voce}</p>
                </Panel3D>
              ))}
            </div>

            {/* Automazioni: l'unica card orientata alla vendita, distinta
                dalle altre — inchiostro pieno, filo dorato, due CTA. */}
            <div className="mt-8">
              <Panel3D variant="ink" delay={competenze.length * 80}>
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="md:max-w-md">
                    <span className="panel-gold-text mb-3 inline-block border border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      Prezzo di lancio
                    </span>
                    <h3 className="font-display text-2xl font-bold">
                      Automazioni e Workflow
                    </h3>
                    <p className="p-muted mt-2 leading-relaxed">
                      Scenari Make con agenti AI: triage e risposta automatica
                      alle email, notifiche ordini su Telegram, log su Google
                      Sheets e pipeline di contenuti audio/video.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                    <a
                      href="#/automazioni"
                      className="btn-ink-outline inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
                    >
                      <PlayCircle className="h-4 w-4" /> Guarda le automazioni
                    </a>
                    <a
                      href="#/automazioni"
                      className="btn-gold inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
                    >
                      <Rocket className="h-4 w-4" /> Acquista a prezzo di lancio
                    </a>
                  </div>
                </div>
              </Panel3D>
            </div>
          </section>

          <Separator />

          {/* Contatti */}
          <section id="contatti" className="py-24">
            <div className="reveal mx-auto max-w-2xl text-center">
              <div className="flex justify-center">
                <LogoMark size={44} />
              </div>
              <h2 className="font-display mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
                Scaliamo qualcosa insieme?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-lg font-semibold leading-relaxed text-muted-foreground">
                Se hai un'idea, un progetto o anche solo una domanda, la mia
                casella è sempre aperta.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="font-bold">
                  <a href={`mailto:${EMAIL}`}>
                    <Mail className="mr-2 h-4 w-4" /> {EMAIL}
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                    <GithubIcon className="mr-2 h-4 w-4" /> GitHub
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </main>
        )}

        <footer className="border-t">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <LogoMark size={18} /> XenoTech — {new Date().getFullYear()}
            </span>
            <span className="font-mono-label text-[10px]">
              Un passo alla volta, fino alla vetta
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
