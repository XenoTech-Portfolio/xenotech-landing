import { useEffect, useRef, useState, type MouseEvent } from "react";
import { HeroParticles } from "./HeroParticles";
import { AmbientField } from "./AmbientField";

/* Prototipo della NUOVA landing completa (rotta nascosta #/lab).
   Tema scuro immersivo, tutti gli stili scoped in .lab-*. */

const EMAIL = "xenomistech@gmail.com";
const GITHUB_URL = "https://github.com/XenoTech-Portfolio";
const REVU_URL = "https://webapp-recensioni.vercel.app";
const LAVAGNA_TATTICA_URL = "https://lavagna-tattica.vercel.app";

const prefersRM = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Motion interattive: tilt 3D delle card + bottoni magnetici ---------- */

function onTiltMove(e: MouseEvent<HTMLElement>) {
  if (prefersRM()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-5px)`;
}
function onTiltLeave(e: MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = "";
}
const tilt = { onMouseMove: onTiltMove, onMouseLeave: onTiltLeave };

function onMagMove(e: MouseEvent<HTMLElement>) {
  if (prefersRM()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const mx = e.clientX - (r.left + r.width / 2);
  const my = e.clientY - (r.top + r.height / 2);
  el.style.transform = `translate(${mx * 0.22}px, ${my * 0.3}px)`;
}
function onMagLeave(e: MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = "";
}
const mag = { onMouseMove: onMagMove, onMouseLeave: onMagLeave };

/* ---------- Dati ---------- */

const NAV: [string, string][] = [
  ["chi-sono", "Chi sono"],
  ["percorso", "Percorso"],
  ["progetti", "Progetti"],
  ["contatti", "Contatti"],
];

const STATS: [string, string][] = [
  ["17", "Anni"],
  ["3", "Prodotti online"],
  ["100%", "Autodidatta"],
];

type Tappa = { label: string; testo: string };
const PERCORSO: Tappa[] = [
  { label: "Le prime righe", testo: "La curiosità di capire come funzionano le cose, trasformata in codice." },
  { label: "StarkEno", testo: "Il mio secondo cervello: un sistema di note per organizzare obiettivi, studio e asset." },
  { label: "Lavagna Tattica", testo: "Il primo grande progetto 3D nel browser: stadio, moduli e azioni animate con Three.js." },
  { label: "Revu", testo: "Dal codice al prodotto: un SaaS vero, con onboarding e pagamenti Stripe. Online." },
  { label: "XenoTech", testo: "Il brand: questo portfolio e i contenuti per documentare la salita." },
  { label: "La prossima vetta", testo: "Quello che verrà. La salita continua." },
];

type Progetto = {
  nome: string;
  desc: string;
  tag: string[];
  stato: string;
  preview: "auto" | "click" | "placeholder" | "ghost";
  live?: string;
  featured?: boolean;
};
const PROGETTI: Progetto[] = [
  {
    nome: "Revu",
    desc: "SaaS self-serve per raccogliere recensioni Google: onboarding, pagamenti Stripe, pagina pubblica con redirect intelligente.",
    tag: ["Next.js", "Prisma", "Stripe"],
    stato: "Live",
    preview: "auto",
    live: REVU_URL,
    featured: true,
  },
  {
    nome: "Lavagna Tattica",
    desc: "Tactics board 3D per il calcio: stadio notturno, moduli per fase, marcatura, registrazione delle azioni.",
    tag: ["Three.js", "Vite"],
    stato: "Live",
    preview: "click",
    live: LAVAGNA_TATTICA_URL,
  },
  {
    nome: "StarkEno",
    desc: "Il mio secondo cervello: un sistema di note interconnesse per obiettivi, studio e gestione degli asset.",
    tag: ["Obsidian", "Knowledge"],
    stato: "Attivo",
    preview: "placeholder",
  },
  {
    nome: "La prossima vetta",
    desc: "C'è sempre una nuova salita in programma. Il prossimo progetto è in esplorazione.",
    tag: ["Coming soon"],
    stato: "In arrivo",
    preview: "ghost",
  },
];

const COMPETENZE: [string, string][] = [
  ["Sviluppo Web", "React, TypeScript, Vite e interfacce moderne, dal prototipo al prodotto."],
  ["Sperimentazione AI", "Integrazione di modelli e agenti AI nei flussi di lavoro e nei progetti."],
  ["3D & Creative", "Esperienze interattive in tempo reale con Three.js e WebGL."],
];

/* ---------- Reveal on scroll (con fallback) ---------- */

function useLabReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".lab-reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    const t = window.setTimeout(() => els.forEach((el) => el.classList.add("is-in")), 2200);
    return () => {
      obs.disconnect();
      window.clearTimeout(t);
    };
  }, []);
}

/* ---------- Preview live: iframe reale scalato (auto = carica in vista) ---------- */

function LivePreview({ url, mode }: { url: string; mode: "auto" | "click" }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const [loaded, setLoaded] = useState(false);
  const BASE_W = 1280;
  const BASE_H = 800;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const update = () => setScale(box.clientWidth / BASE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  // auto: carica l'iframe solo quando la card è vicina al viewport
  useEffect(() => {
    if (mode !== "auto" || loaded) return;
    const box = boxRef.current;
    if (!box) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0]?.isIntersecting) {
          setLoaded(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(box);
    return () => io.disconnect();
  }, [mode, loaded]);

  return (
    <div className="lab-preview" ref={boxRef}>
      {loaded ? (
        <iframe
          src={url}
          title="Anteprima live"
          loading="lazy"
          tabIndex={-1}
          style={{
            width: BASE_W,
            height: BASE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      ) : mode === "click" ? (
        <button
          type="button"
          className="lab-preview-poster"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLoaded(true);
          }}
        >
          <span className="lab-preview-play">▶</span>
          <span>Carica anteprima live</span>
        </button>
      ) : (
        <div className="lab-preview-poster lab-preview-loading">
          <span>Anteprima live in arrivo…</span>
        </div>
      )}
      <span className="lab-preview-badge">● Live</span>
    </div>
  );
}

/* ---------- SVG ---------- */

function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor"
      strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 42 L20 16 L27 27 L34 14 L44 42 Z" />
      <path d="M30 8 l1.6 3.2 3.4.4-2.5 2.4.6 3.4-3.1-1.7-3.1 1.7.6-3.4L25 11.6l3.4-.4Z" />
    </svg>
  );
}
function ArrowUR({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/* ---------- Pagina ---------- */

export function LabSite() {
  useLabReveal();
  const [menuOpen, setMenuOpen] = useState(false);
  const year = new Date().getFullYear();

  const go = (id: string) => {
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <div className="lab-root">
      <style>{labStyles}</style>
      <AmbientField />

      {/* NAV */}
      <header className="lab-nav">
        <button className="lab-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Logo />
          <span>XenoTech</span>
        </button>
        <nav className="lab-nav-links">
          {NAV.map(([id, label]) => (
            <button key={id} onClick={() => go(id)}>{label}</button>
          ))}
        </nav>
        <a className="lab-btn lab-btn-primary lab-nav-cta" href={`mailto:${EMAIL}`} {...mag}>Scrivimi</a>
        <button
          className="lab-nav-toggle"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </header>
      {menuOpen && (
        <div className="lab-nav-mobile">
          {NAV.map(([id, label]) => (
            <button key={id} onClick={() => go(id)}>{label}</button>
          ))}
          <a className="lab-btn lab-btn-primary" href={`mailto:${EMAIL}`}>Scrivimi</a>
        </div>
      )}

      {/* HERO */}
      <section className="lab-hero">
        <HeroParticles />
        <div className="lab-veil" aria-hidden />
        <div className="lab-hero-content">
          <p className="lab-eyebrow lab-anim">XenoTech · Simone Mansella</p>
          <h1 className="lab-display lab-title lab-anim">
            Idee ambiziose,
            <br /><span className="lab-gold">prodotti reali</span>.
          </h1>
          <p className="lab-sub lab-anim">
            17 anni, autodidatta, e un'idea chiara in testa: costruire software che
            le persone usano davvero. Web, esperienze 3D, automazioni AI — progetti
            già online, non promesse. Hai un'idea da far decollare? Scrivimi.
          </p>
          <div className="lab-cta-row lab-anim">
            <a className="lab-btn lab-btn-primary" href={`mailto:${EMAIL}`} {...mag}>
              Lavoriamo insieme <ArrowUR />
            </a>
            <button className="lab-btn lab-btn-ghost" onClick={() => scrollToId("progetti")}>
              Guarda i progetti
            </button>
          </div>
        </div>
        <button className="lab-scrollhint" onClick={() => scrollToId("chi-sono")} aria-label="Scorri">
          <span>scorri</span>
          <span className="lab-scrollhint-line" />
        </button>
      </section>

      <main className="lab-main">
        {/* CHI SONO */}
        <section id="chi-sono" className="lab-section">
          <p className="lab-num lab-reveal">01 — Chi sono</p>
          <div className="lab-about-grid">
            <h2 className="lab-display lab-h2 lab-reveal">
              Meno teoria.<br />Più cose <span className="lab-gold">finite</span>.
            </h2>
            <div className="lab-about-text">
              <p className="lab-reveal">
                Ho 17 anni e una strada poco ortodossa: invece di collezionare
                certificati, costruisco prodotti veri — e li porto online.
              </p>
              <p className="lab-reveal">
                Parto da un problema, lo studio e lo trasformo in software: dal web
                al 3D fino agli agenti AI. Ogni progetto mi insegna qualcosa di nuovo,
                e lo porto fino in fondo.
              </p>
              <p className="lab-reveal lab-about-cta-line">
                Cerchi qualcuno che le idee non le lascia nel cassetto? Sei nel posto giusto.
              </p>
            </div>
          </div>
          <div className="lab-stats lab-reveal">
            {STATS.map(([n, l]) => (
              <div key={l} className="lab-stat">
                <span className="lab-display lab-stat-n">{n}</span>
                <span className="lab-stat-l">{l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PERCORSO / TIMELINE */}
        <section id="percorso" className="lab-section">
          <p className="lab-num lab-reveal">02 — Il percorso</p>
          <h2 className="lab-display lab-h2 lab-reveal">La salita, una tappa alla volta.</h2>
          <ol className="lab-timeline">
            {PERCORSO.map((t, i) => (
              <li key={t.label} className="lab-tl-item lab-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="lab-tl-dot" style={{ background: `hsl(${(i / PERCORSO.length) * 300}, 70%, 60%)` }} />
                <div className="lab-tl-body">
                  <span className="lab-tl-step">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="lab-tl-title">{t.label}</h3>
                  <p className="lab-tl-text">{t.testo}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* PROGETTI */}
        <section id="progetti" className="lab-section">
          <p className="lab-num lab-reveal">03 — Progetti</p>
          <h2 className="lab-display lab-h2 lab-reveal">Quello che ho costruito.</h2>
          <div className="lab-projects">
            {PROGETTI.map((p) => (
              <article
                key={p.nome}
                className={`lab-card lab-reveal${p.featured ? " lab-card-featured" : ""}${p.preview === "ghost" ? " lab-card-ghost" : ""}`}
                {...(p.preview === "ghost" ? {} : tilt)}
              >
                {(p.preview === "auto" || p.preview === "click") && p.live && (
                  <LivePreview url={p.live} mode={p.preview} />
                )}
                {p.preview === "placeholder" && (
                  <div className="lab-preview lab-preview-ph"><Logo size={40} /></div>
                )}
                <div className="lab-card-body">
                  <div className="lab-card-head">
                    <h3 className="lab-card-title">{p.nome}</h3>
                    <span className="lab-chip">{p.stato}</span>
                  </div>
                  <p className="lab-card-desc">{p.desc}</p>
                  <div className="lab-tags">
                    {p.tag.map((t) => <span key={t} className="lab-tag">{t}</span>)}
                  </div>
                  {p.live && (
                    <div className="lab-card-actions">
                      <a className="lab-link-gold" href={p.live} target="_blank" rel="noreferrer">
                        Apri la demo live <ArrowUR s={14} />
                      </a>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="lab-panel lab-reveal">
            <div>
              <span className="lab-panel-eyebrow">Caso concreto</span>
              <h3 className="lab-display lab-panel-title">Ti serve una piattaforma così?</h3>
              <p className="lab-panel-text">
                Revu è un esempio reale di quello che so costruire: onboarding self-serve,
                pagamenti, database, pagina pubblica pronta all'uso. Raccontami la tua idea.
              </p>
            </div>
            <a className="lab-btn lab-btn-primary" href={`mailto:${EMAIL}?subject=${encodeURIComponent("Voglio una piattaforma come Revu")}`} {...mag}>
              Parliamone <ArrowUR />
            </a>
          </div>
        </section>

        {/* AUTOMAZIONI (04) */}
        <section className="lab-section">
          <p className="lab-num lab-reveal">04 — Automazioni</p>
          <h2 className="lab-display lab-h2 lab-reveal">Automazioni che lavorano per te.</h2>
          <div className="lab-panel lab-panel-auto lab-reveal">
            <div>
              <span className="lab-panel-eyebrow">Prezzo di lancio</span>
              <h3 className="lab-display lab-panel-title">Scenari Make + agenti AI</h3>
              <p className="lab-panel-text">
                Triage e risposta automatica alle email, notifiche ordini su Telegram,
                log su Google Sheets e pipeline di contenuti audio/video. Già in funzione.
              </p>
            </div>
            <a className="lab-btn lab-btn-ghost" href="#/automazioni">Guarda le automazioni</a>
          </div>
        </section>

        {/* COMPETENZE (05) */}
        <section className="lab-section">
          <p className="lab-num lab-reveal">05 — Competenze</p>
          <h2 className="lab-display lab-h2 lab-reveal">Gli attrezzi nello zaino.</h2>
          <div className="lab-skills">
            {COMPETENZE.map(([t, d], i) => (
              <div key={t} className="lab-skill lab-reveal" style={{ transitionDelay: `${i * 80}ms` }} {...tilt}>
                <h3 className="lab-skill-title">{t}</h3>
                <p className="lab-skill-text">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CONTATTI */}
        <section id="contatti" className="lab-section lab-contact">
          <p className="lab-num lab-reveal">06 — Contatti</p>
          <h2 className="lab-display lab-contact-h lab-reveal">
            Costruiamo qualcosa <span className="lab-gold">insieme</span>?
          </h2>
          <p className="lab-contact-sub lab-reveal">
            Se hai un'idea, un progetto o anche solo una domanda, la mia casella è sempre aperta.
          </p>
          <div className="lab-cta-row lab-reveal">
            <a className="lab-btn lab-btn-primary" href={`mailto:${EMAIL}`} {...mag}>{EMAIL} <ArrowUR /></a>
            <a className="lab-btn lab-btn-ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </section>
      </main>

      <footer className="lab-footer">
        <span className="lab-foot-brand"><Logo size={18} /> XenoTech — {year}</span>
        <span className="lab-foot-tag">Un passo alla volta, fino alla vetta</span>
      </footer>
    </div>
  );
}

const labStyles = `
.lab-root {
  position: relative;
  background: #07070c;
  color: #e8e9f0;
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
.lab-display { font-family: "Clash Display", "Inter", sans-serif; }
.lab-gold {
  background: linear-gradient(180deg, #e7c274 0%, #b8862b 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

/* Campo 3D ambientale fisso dietro a tutto */
.lab-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.lab-ambient canvas { width: 100% !important; height: 100% !important; }

/* NAV */
.lab-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px clamp(18px, 5vw, 56px);
  background: rgba(7,7,12,0.6); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.lab-nav-brand { display: flex; align-items: center; gap: 9px; background: none; border: 0; color: #e8e9f0; font-weight: 600; font-size: 18px; cursor: pointer; }
.lab-nav-brand svg { color: #cdb98a; }
.lab-nav-links { display: flex; gap: 26px; }
.lab-nav-links button { background: none; border: 0; color: #c3c7d8; font-size: 14px; cursor: pointer; transition: color 0.2s; font-family: inherit; }
.lab-nav-links button:hover { color: #fff; }
.lab-nav-cta { padding: 9px 18px; font-size: 14px; }
.lab-nav-toggle { display: none; flex-direction: column; gap: 5px; background: none; border: 0; cursor: pointer; padding: 6px; }
.lab-nav-toggle span { width: 22px; height: 2px; background: #e8e9f0; border-radius: 2px; }
.lab-nav-mobile {
  position: fixed; top: 58px; left: 0; right: 0; z-index: 49;
  display: flex; flex-direction: column; gap: 6px; padding: 12px clamp(18px,5vw,56px) 18px;
  background: rgba(10,10,17,0.96); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.lab-nav-mobile button { background: none; border: 0; text-align: left; color: #e8e9f0; font-size: 16px; padding: 10px 0; cursor: pointer; font-family: inherit; }
.lab-nav-mobile .lab-btn { margin-top: 6px; justify-content: center; }
@media (max-width: 720px) {
  .lab-nav-links, .lab-nav-cta { display: none; }
  .lab-nav-toggle { display: flex; }
}

/* Bottoni */
.lab-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 22px; border-radius: 999px; font-weight: 600; font-size: 15px; text-decoration: none; cursor: pointer; font-family: inherit; border: 0; transition: transform 0.18s cubic-bezier(0.23,1,0.32,1), background 0.2s, border-color 0.2s, box-shadow 0.2s; }
.lab-btn-primary { background: linear-gradient(180deg, #e7c274 0%, #b8862b 100%); color: #1a140a; box-shadow: 0 8px 30px -8px rgba(184,134,43,0.55); }
.lab-btn-ghost { background: transparent; color: #e8e9f0; border: 1px solid rgba(232,233,240,0.28); }
@media (hover: hover) {
  .lab-btn-primary:hover { box-shadow: 0 12px 36px -8px rgba(184,134,43,0.7); }
  .lab-btn-ghost:hover { border-color: rgba(232,233,240,0.7); }
}
.lab-btn:active { transform: scale(0.97); }

/* HERO */
.lab-hero { position: relative; z-index: 1; min-height: 100vh; min-height: 100svh; overflow: hidden; display: flex; align-items: center; }
.lab-canvas { position: absolute; inset: 0; z-index: 0; }
.lab-canvas canvas { width: 100% !important; height: 100% !important; }
.lab-veil {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, rgba(7,7,12,0.5) 100%),
    linear-gradient(180deg, rgba(7,7,12,0.35) 0%, transparent 25%, transparent 55%, #07070c 100%);
}
.lab-hero-content { position: relative; z-index: 2; max-width: 1160px; width: 100%; margin: 0 auto; padding: 0 clamp(20px, 5vw, 56px); }
.lab-eyebrow { text-transform: uppercase; letter-spacing: 0.22em; font-size: 12px; font-weight: 600; color: #9aa0b8; margin-bottom: 22px; }
.lab-title { font-size: clamp(3rem, 9vw, 6.5rem); line-height: 0.98; font-weight: 600; letter-spacing: -0.02em; margin: 0; color: #f4f5fb; }
.lab-sub { margin: 28px 0 0; max-width: 30rem; font-size: clamp(1rem, 1.5vw, 1.18rem); line-height: 1.6; color: #c3c7d8; }
.lab-cta-row { margin-top: 38px; display: flex; flex-wrap: wrap; gap: 14px; }

/* Motion d'entrata hero */
@keyframes labRise { from { opacity: 0; transform: translateY(24px); filter: blur(6px); } to { opacity: 1; transform: none; filter: blur(0); } }
.lab-anim { opacity: 0; animation: labRise 0.95s cubic-bezier(0.22,1,0.32,1) forwards; }
.lab-eyebrow.lab-anim { animation-delay: 0.15s; }
.lab-title.lab-anim { animation-delay: 0.32s; }
.lab-sub.lab-anim { animation-delay: 0.62s; }
.lab-cta-row.lab-anim { animation-delay: 0.82s; }

.lab-scrollhint { position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%); z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px; background: none; border: 0; color: #9aa0b8; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; }
.lab-scrollhint-line { width: 1px; height: 34px; background: linear-gradient(#9aa0b8, transparent); animation: labPulse 1.8s ease-in-out infinite; }
@keyframes labPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }

/* MAIN / sezioni */
.lab-main { position: relative; z-index: 1; }
.lab-section { position: relative; max-width: 1160px; margin: 0 auto; padding: clamp(70px, 11vw, 140px) clamp(20px, 5vw, 56px); }
.lab-num { text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px; font-weight: 600; color: #d8a84a; margin-bottom: 18px; }
.lab-h2 { font-size: clamp(2rem, 5vw, 3.4rem); line-height: 1.05; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 10px; color: #f4f5fb; }

/* Reveal */
.lab-reveal { opacity: 0; transform: translateY(26px); transition: opacity 0.8s cubic-bezier(0.22,1,0.32,1), transform 0.8s cubic-bezier(0.22,1,0.32,1); }
.lab-reveal.is-in { opacity: 1; transform: none; }

/* CHI SONO */
.lab-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 5vw, 64px); margin-top: 12px; }
.lab-about-text p { font-size: clamp(1rem, 1.4vw, 1.15rem); line-height: 1.7; color: #c3c7d8; margin: 0 0 18px; }
.lab-about-cta-line { color: #e8e9f0 !important; font-weight: 500; }
.lab-stats { display: flex; flex-wrap: wrap; gap: clamp(28px, 6vw, 72px); margin-top: 54px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.08); }
.lab-stat { display: flex; flex-direction: column; }
.lab-stat-n { font-size: clamp(2.2rem, 5vw, 3.4rem); font-weight: 600; color: #f4f5fb; line-height: 1; }
.lab-stat-l { margin-top: 8px; font-size: 13px; color: #9aa0b8; }
@media (max-width: 760px) { .lab-about-grid { grid-template-columns: 1fr; } }

/* TIMELINE */
.lab-timeline { list-style: none; margin: 40px 0 0; padding: 0; position: relative; }
.lab-timeline::before { content: ""; position: absolute; left: 7px; top: 6px; bottom: 6px; width: 1px; background: linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.04)); }
.lab-tl-item { position: relative; padding: 0 0 34px 40px; }
.lab-tl-dot { position: absolute; left: 0; top: 4px; width: 15px; height: 15px; border-radius: 50%; box-shadow: 0 0 16px 2px currentColor; }
.lab-tl-step { font-size: 11px; letter-spacing: 0.14em; color: #9aa0b8; }
.lab-tl-title { font-size: 1.25rem; font-weight: 600; margin: 4px 0 6px; color: #f4f5fb; }
.lab-tl-text { font-size: 1rem; line-height: 1.6; color: #b9bed2; margin: 0; max-width: 44rem; }

/* PROGETTI */
.lab-projects { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; margin-top: 40px; }
.lab-card { display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; background: rgba(20,20,32,0.55); backdrop-filter: blur(4px); transition: transform 0.18s ease, border-color 0.25s; transform-style: preserve-3d; }
@media (hover: hover) { .lab-card:hover { border-color: rgba(216,168,74,0.5); } }
.lab-card-featured { grid-column: span 2; }
.lab-card-ghost { border-style: dashed; opacity: 0.7; }
@media (max-width: 760px) { .lab-projects { grid-template-columns: 1fr; } .lab-card-featured { grid-column: span 1; } }

.lab-preview { position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; background: #0d0d16; border-bottom: 1px solid rgba(255,255,255,0.06); }
.lab-preview iframe { position: absolute; top: 0; left: 0; border: 0; pointer-events: none; }
.lab-preview-badge { position: absolute; top: 10px; right: 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: #7fe0a8; background: rgba(7,7,12,0.7); padding: 3px 8px; border-radius: 999px; }
.lab-preview-poster { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: radial-gradient(circle at 50% 40%, #16162a, #0d0d16); border: 0; color: #c3c7d8; cursor: pointer; font-family: inherit; font-size: 13px; }
.lab-preview-loading { cursor: default; color: #9aa0b8; }
.lab-preview-play { display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(180deg, #e7c274, #b8862b); color: #1a140a; font-size: 16px; }
.lab-preview-ph { display: flex; align-items: center; justify-content: center; color: #cdb98a; background: radial-gradient(circle at 50% 40%, #16162a, #0d0d16); }

.lab-card-body { display: flex; flex-direction: column; flex: 1; padding: 22px; }
.lab-card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.lab-card-title { font-size: 1.4rem; font-weight: 600; margin: 0; color: #f4f5fb; }
.lab-chip { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.18); color: #c3c7d8; white-space: nowrap; }
.lab-card-desc { margin: 12px 0 0; font-size: 0.98rem; line-height: 1.6; color: #b9bed2; flex: 1; }
.lab-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 16px; }
.lab-tag { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 999px; background: rgba(255,255,255,0.05); color: #9aa0b8; }
.lab-card-actions { display: flex; align-items: center; gap: 18px; margin-top: 18px; }
.lab-link-gold { display: inline-flex; align-items: center; gap: 5px; color: #e7c274; font-weight: 600; font-size: 14px; text-decoration: none; }

/* PANNELLI (CTA) */
.lab-panel { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 28px; flex-wrap: wrap; margin-top: 34px; padding: clamp(26px, 4vw, 42px); border-radius: 18px; border: 1px solid rgba(255,255,255,0.1); background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)); }
.lab-panel-auto { border-color: rgba(216,168,74,0.35); background: linear-gradient(135deg, rgba(184,134,43,0.14), rgba(255,255,255,0.01)); }
.lab-panel > div { max-width: 34rem; }
.lab-panel-eyebrow { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #d8a84a; border: 1px solid currentColor; padding: 2px 8px; border-radius: 4px; margin-bottom: 14px; }
.lab-panel-title { font-size: clamp(1.4rem, 3vw, 2rem); margin: 0 0 10px; color: #f4f5fb; }
.lab-panel-text { margin: 0; line-height: 1.6; color: #b9bed2; }

/* COMPETENZE */
.lab-skills { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 40px; }
.lab-skill { padding: 26px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); background: rgba(20,20,32,0.5); backdrop-filter: blur(4px); transition: transform 0.18s ease, border-color 0.25s; transform-style: preserve-3d; }
@media (hover: hover) { .lab-skill:hover { border-color: rgba(216,168,74,0.4); } }
.lab-skill-title { font-size: 1.2rem; font-weight: 600; margin: 0 0 10px; color: #f4f5fb; }
.lab-skill-text { margin: 0; line-height: 1.6; color: #b9bed2; font-size: 0.98rem; }
@media (max-width: 760px) { .lab-skills { grid-template-columns: 1fr; } }

/* CONTATTI */
.lab-contact { text-align: center; }
.lab-contact-h { font-size: clamp(2.4rem, 6vw, 4.2rem); line-height: 1.02; font-weight: 600; letter-spacing: -0.02em; margin: 0 auto; color: #f4f5fb; }
.lab-contact-sub { max-width: 34rem; margin: 22px auto 0; font-size: 1.1rem; line-height: 1.6; color: #c3c7d8; }
.lab-contact .lab-cta-row { justify-content: center; margin-top: 36px; }

/* FOOTER */
.lab-footer { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; max-width: 1160px; margin: 0 auto; padding: 28px clamp(20px, 5vw, 56px); border-top: 1px solid rgba(255,255,255,0.08); color: #9aa0b8; font-size: 14px; }
.lab-foot-brand { display: flex; align-items: center; gap: 9px; }
.lab-foot-brand svg { color: #cdb98a; }
.lab-foot-tag { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }

@media (prefers-reduced-motion: reduce) {
  .lab-anim, .lab-reveal { opacity: 1 !important; transform: none !important; animation: none !important; }
  .lab-scrollhint-line { animation: none; }
  .lab-btn, .lab-card, .lab-skill { transition: none; }
}
`;
