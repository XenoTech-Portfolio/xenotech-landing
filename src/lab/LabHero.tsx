import { HeroParticles } from "./HeroParticles";

const EMAIL = "mansellasimone24@gmail.com";

/* Prototipo isolato del nuovo hero (rotta nascosta #/lab).
   Tema scuro immersivo, stili tutti scoped in .lab-* così non toccano
   il resto del sito. Font caricati in index.html. */
export function LabHero() {
  return (
    <div className="lab-root">
      <style>{labStyles}</style>

      <HeroParticles />
      <div className="lab-veil" aria-hidden />

      {/* mini brand in alto a sinistra, per dare contesto */}
      <div className="lab-brand">
        <svg width="26" height="26" viewBox="0 0 48 48" fill="none" stroke="currentColor"
          strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 42 L20 16 L27 27 L34 14 L44 42 Z" />
          <path d="M30 8 l1.6 3.2 3.4.4-2.5 2.4.6 3.4-3.1-1.7-3.1 1.7.6-3.4L25 11.6l3.4-.4Z" />
        </svg>
        <span>XenoTech</span>
      </div>

      <div className="lab-content">
        <p className="lab-eyebrow">XenoTech · Simone Mansella</p>
        <h1 className="lab-display lab-title">
          Dal codice
          <br />al <span className="lab-gold">risultato</span>.
        </h1>
        <p className="lab-sub">
          Sono Simone, 17 anni e autodidatta. Costruisco prodotti web, esperienze
          3D e automazioni con l'AI — progetti veri, già online. Se hai un'idea da
          realizzare, partiamo insieme.
        </p>
        <div className="lab-cta-row">
          <a className="lab-btn lab-btn-primary" href={`mailto:${EMAIL}`}>
            Lavoriamo insieme
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
          <a className="lab-btn lab-btn-ghost" href="#/">
            Guarda i progetti
          </a>
        </div>
      </div>

      <p className="lab-hint">Muovi il mouse tra le particelle · clicca per disperderle</p>
    </div>
  );
}

const labStyles = `
.lab-root {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #07070c;
  color: #e8e9f0;
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.lab-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.lab-canvas canvas { width: 100% !important; height: 100% !important; }

/* Vignetta: bordi più scuri + fondo leggibile sotto al testo */
.lab-veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, rgba(7,7,12,0.55) 100%),
    linear-gradient(180deg, rgba(7,7,12,0.35) 0%, transparent 25%, transparent 60%, rgba(7,7,12,0.6) 100%);
}

.lab-brand {
  position: absolute;
  top: 22px;
  left: clamp(20px, 5vw, 56px);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #e8e9f0;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: -0.01em;
}
.lab-brand svg { color: #cdb98a; }

.lab-content {
  position: relative;
  z-index: 2;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 56px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;
}

/* Motion d'entrata: i testi salgono e sfumano in ingresso, in sequenza.
   (Per la versione finale: aggiungere anche l'uscita via transizioni di rotta.) */
@keyframes labRise {
  from { opacity: 0; transform: translateY(24px); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
.lab-eyebrow,
.lab-title,
.lab-sub,
.lab-cta-row {
  opacity: 0;
  animation: labRise 0.95s cubic-bezier(0.22, 1, 0.32, 1) forwards;
}
.lab-eyebrow { animation-delay: 0.15s; }
.lab-title { animation-delay: 0.32s; }
.lab-sub { animation-delay: 0.62s; }
.lab-cta-row { animation-delay: 0.82s; }

.lab-eyebrow {
  font-family: "Inter", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 12px;
  font-weight: 600;
  color: #9aa0b8;
  margin-bottom: 22px;
}

.lab-display { font-family: "Clash Display", "Inter", sans-serif; }

.lab-title {
  font-size: clamp(3rem, 9vw, 6.5rem);
  line-height: 0.98;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
  color: #f4f5fb;
}
.lab-gold {
  color: #d8a84a;
  background: linear-gradient(180deg, #e7c274 0%, #b8862b 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.lab-sub {
  margin: 28px 0 0;
  max-width: 30rem;
  font-size: clamp(1rem, 1.5vw, 1.18rem);
  line-height: 1.6;
  color: #c3c7d8;
  font-weight: 400;
}

.lab-cta-row {
  margin-top: 38px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  pointer-events: auto;
}
.lab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 22px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), background 0.2s ease, border-color 0.2s ease;
}
.lab-btn-primary {
  background: linear-gradient(180deg, #e7c274 0%, #b8862b 100%);
  color: #1a140a;
  box-shadow: 0 8px 30px -8px rgba(184,134,43,0.6);
}
.lab-btn-ghost {
  background: transparent;
  color: #e8e9f0;
  border: 1px solid rgba(232,233,240,0.28);
}
@media (hover: hover) and (pointer: fine) {
  .lab-btn-primary:hover { transform: translateY(-2px) scale(1.03); }
  .lab-btn-ghost:hover { border-color: rgba(232,233,240,0.7); transform: translateY(-2px); }
}
.lab-btn:active { transform: scale(0.97); }

.lab-hint {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: #6f758e;
  pointer-events: none;
  text-align: center;
  width: 90%;
}

@media (prefers-reduced-motion: reduce) {
  .lab-btn { transition: none; }
  .lab-eyebrow,
  .lab-title,
  .lab-sub,
  .lab-cta-row { opacity: 1; animation: none; }
}
`;
