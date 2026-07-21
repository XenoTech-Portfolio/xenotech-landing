import { Fragment } from "react";
import { AmbientField } from "./AmbientField";

const EMAIL = "mansellasimone24@gmail.com";

type FlowNode = { label: string; sub?: string; ai?: boolean };
type Scenario = {
  id: string;
  nome: string;
  pitch: string;
  descrizione: string;
  flow: FlowNode[][];
  valore: string;
  prezzo: number;
  prezzoPieno: number;
};

const AUTOMAZIONI: Scenario[] = [
  {
    id: "email-ai",
    nome: "Assistente Email AI",
    pitch: "La casella si gestisce da sola.",
    descrizione:
      "Un agente AI legge ogni email in arrivo, la classifica, registra tutto su Google Sheets, ti avvisa su Telegram quando c'è qualcosa di urgente e prepara la bozza di risposta in Gmail. Tu apri, controlli e premi invia.",
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
    <div className="az-flow" role="img" aria-label="Schema di funzionamento dell'automazione">
      {flow.map((group, gi) => (
        <Fragment key={gi}>
          {gi > 0 && (
            <svg className="az-arrow" width="30" height="12" viewBox="0 0 30 12" aria-hidden>
              <line x1="0" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
              <path d="M21 1.5 L29 6 L21 10.5 Z" fill="currentColor" />
            </svg>
          )}
          <div className="az-flow-col">
            {group.map((n) => (
              <div key={n.label} className={`az-node${n.ai ? " az-node-ai" : ""}`}>
                <span className="az-node-label">{n.label}</span>
                {n.sub && <span className="az-node-sub">{n.sub}</span>}
              </div>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export function AutomazioniLab() {
  return (
    <div className="lab-root az-root">
      <style>{azStyles}</style>
      <AmbientField />

      <header className="az-topbar">
        <a className="az-back" href="#/">← Torna alla home</a>
        <a className="az-brand" href="#/">XenoTech</a>
      </header>

      <main className="az-main">
        <section className="az-head">
          <p className="az-eyebrow">Automazioni · Make + Agenti AI</p>
          <h1 className="lab-display az-h1">
            Automazioni che lavorano<br />al posto tuo<span className="lab-gold">.</span>
          </h1>
          <p className="az-intro">
            Non sono demo: sono le automazioni che uso davvero, già in funzione sui
            miei account. Il prezzo segue il valore che portano — più ore ti
            restituiscono, più valgono.
          </p>
          <span className="az-badge">Prezzi di lancio — indicativi</span>
        </section>

        <div className="az-list">
          {AUTOMAZIONI.map((a, i) => (
            <article className="az-card" key={a.id}>
              <div className="az-card-main">
                <div className="az-card-top">
                  <span className="az-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="az-chip">Funzionante</span>
                </div>
                <h2 className="lab-display az-card-title">{a.nome}</h2>
                <p className="az-pitch lab-gold">{a.pitch}</p>
                <p className="az-desc">{a.descrizione}</p>
                <FlowDiagram flow={a.flow} />
              </div>
              <div className="az-side">
                <div>
                  <p className="az-side-label">Cosa ti porta</p>
                  <p className="az-side-value">{a.valore}</p>
                </div>
                <div>
                  <p className="az-side-label">Prezzo di lancio</p>
                  <p className="az-price">
                    <span className="az-price-old">€{a.prezzoPieno}</span>
                    <span className="lab-display az-price-new">€{a.prezzo}</span>
                  </p>
                  <p className="az-price-note">una tantum · installata e configurata sui tuoi account</p>
                  <a
                    className="lab-btn lab-btn-primary az-cta"
                    href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Voglio l'automazione: ${a.nome}`)}`}
                  >
                    Richiedi questa automazione
                  </a>
                </div>
              </div>
            </article>
          ))}

          <div className="az-panel">
            <div>
              <h2 className="lab-display az-panel-title">Ti serve qualcosa su misura?</h2>
              <p className="az-panel-text">
                Ogni flusso di lavoro è diverso. Raccontami il tuo processo più
                ripetitivo e ti dico se si può automatizzare — e quanto tempo ti
                restituirebbe.
              </p>
            </div>
            <a className="lab-btn lab-btn-primary" href={`mailto:${EMAIL}?subject=${encodeURIComponent("Automazione su misura")}`}>
              Parliamone
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

const azStyles = `
.az-root { position: relative; background: #07070c; color: #e8e9f0; font-family: "Inter", ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; min-height: 100vh; overflow-x: hidden; }
.lab-display { font-family: "Clash Display", "Inter", sans-serif; }
.lab-gold { background: linear-gradient(180deg, #e7c274 0%, #b8862b 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.lab-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.lab-ambient canvas { width: 100% !important; height: 100% !important; }

.lab-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; border-radius: 999px; font-weight: 600; font-size: 14px; text-decoration: none; cursor: pointer; font-family: inherit; border: 0; transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), box-shadow 0.2s; }
.lab-btn-primary { background: linear-gradient(180deg, #e7c274 0%, #b8862b 100%); color: #1a140a; box-shadow: 0 8px 30px -8px rgba(184,134,43,0.55); }
@media (hover: hover) { .lab-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 36px -8px rgba(184,134,43,0.7); } }

.az-topbar { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; max-width: 1100px; margin: 0 auto; padding: 22px clamp(20px,5vw,48px); }
.az-back { color: #c3c7d8; font-size: 13px; text-decoration: none; }
.az-back:hover { color: #fff; }
.az-brand { color: #e8e9f0; font-weight: 600; text-decoration: none; }

.az-main { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 0 clamp(20px,5vw,48px) 100px; }
.az-head { padding: 40px 0 20px; }
.az-eyebrow { text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px; font-weight: 600; color: #d8a84a; margin-bottom: 18px; }
.az-h1 { font-size: clamp(2.4rem, 7vw, 4.6rem); line-height: 1.02; font-weight: 600; letter-spacing: -0.02em; margin: 0; color: #f4f5fb; }
.az-intro { max-width: 34rem; margin: 22px 0 0; font-size: 1.1rem; line-height: 1.6; color: #c3c7d8; }
.az-badge { display: inline-block; margin-top: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #d8a84a; border: 1px solid currentColor; padding: 3px 9px; border-radius: 4px; }

.az-list { display: flex; flex-direction: column; gap: 26px; margin-top: 40px; }
.az-card { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 34px; padding: clamp(24px,4vw,38px); border-radius: 18px; border: 1px solid rgba(255,255,255,0.09); background: rgba(20,20,32,0.55); backdrop-filter: blur(5px); }
.az-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.az-index { font-size: 12px; letter-spacing: 0.1em; color: #9aa0b8; }
.az-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(127,224,168,0.4); color: #7fe0a8; }
.az-card-title { font-size: clamp(1.5rem,3vw,2rem); font-weight: 600; margin: 0; color: #f4f5fb; }
.az-pitch { font-family: "Clash Display","Inter",sans-serif; font-size: 1.15rem; font-weight: 600; font-style: italic; margin: 6px 0 0; }
.az-desc { margin: 14px 0 0; line-height: 1.6; color: #b9bed2; }
.az-side { display: flex; flex-direction: column; justify-content: space-between; gap: 24px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; }
.az-side-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9aa0b8; margin: 0; }
.az-side-value { margin: 6px 0 0; font-weight: 500; line-height: 1.5; color: #e8e9f0; }
.az-price { display: flex; align-items: baseline; gap: 12px; margin: 6px 0 0; }
.az-price-old { font-size: 1.1rem; color: #6f758e; text-decoration: line-through; }
.az-price-new { font-size: 2.6rem; font-weight: 700; color: #e7c274; }
.az-price-note { font-size: 12px; color: #9aa0b8; margin: 6px 0 0; }
.az-cta { margin-top: 16px; width: 100%; }
@media (min-width: 641px) { .az-side { border-top: 0; border-left: 1px solid rgba(255,255,255,0.1); padding-top: 0; padding-left: 32px; } }
@media (max-width: 640px) { .az-card { grid-template-columns: 1fr; gap: 20px; } }

/* Flow diagram */
.az-flow { display: flex; align-items: center; gap: 8px; margin-top: 22px; overflow-x: auto; padding-bottom: 4px; }
.az-flow-col { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
.az-node { min-width: 108px; text-align: center; padding: 9px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.03); }
.az-node-ai { border-color: rgba(216,168,74,0.6); background: rgba(184,134,43,0.14); }
.az-node-label { display: block; font-size: 12px; font-weight: 700; color: #f4f5fb; }
.az-node-sub { display: block; font-size: 10px; color: #9aa0b8; margin-top: 2px; }
.az-arrow { color: #6f758e; flex-shrink: 0; }

.az-panel { display: flex; align-items: center; justify-content: space-between; gap: 26px; flex-wrap: wrap; padding: clamp(26px,4vw,40px); border-radius: 18px; border: 1px solid rgba(216,168,74,0.3); background: linear-gradient(135deg, rgba(184,134,43,0.14), rgba(255,255,255,0.01)); }
.az-panel > div { max-width: 34rem; }
.az-panel-title { font-size: clamp(1.4rem,3vw,2rem); margin: 0 0 10px; color: #f4f5fb; }
.az-panel-text { margin: 0; line-height: 1.6; color: #c3c7d8; }

@media (prefers-reduced-motion: reduce) { .lab-btn { transition: none; } }
`;
