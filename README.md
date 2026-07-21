# XenoTech

Portfolio personale di **Simone Mansella** — un laboratorio dove costruisco
progetti web, esploro l'intelligenza artificiale e documento la salita, un
passo alla volta. Metafora del sito: *ogni progetto è una vetta*.

**Live:** [xenotech-landing.vercel.app](https://xenotech-landing.vercel.app)

## Caratteristiche

- Sfondo 3D persistente in **Three.js**: la montagna del logo, con uno
  scalatore animato che percorre il sentiero fino alla vetta e una stella che
  reagisce ai click e all'hover del progetto in evidenza.
- Scroll fluido con inerzia (Lenis) e reveal delle sezioni allo scroll.
- Routing interno via hash: oltre alla home ci sono sottopagine dedicate per
  i progetti live — `#/revu`, `#/lavagna-tattica` — e `#/automazioni`.
- Demo live dei progetti embeddate direttamente dalle sottopagine.

## Stack

- [React](https://react.dev) + TypeScript
- [Three.js](https://threejs.org) per la scena 3D
- [Vite](https://vite.dev) per build e dev server
- Tailwind CSS + componenti shadcn/ui

## Sviluppo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # bundle di produzione in dist/
```
