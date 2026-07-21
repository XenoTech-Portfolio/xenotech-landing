// Scarica il DEM reale (AWS Terrain Tiles, formato terrarium) dell'area di
// Palermo / Monte Pellegrino e genera src/palermo-dem.ts con la griglia campionata.
import fs from "node:fs";
import { PNG } from "pngjs";

const Z = 12;
// Bounding box: golfo, Monte Pellegrino, centro di Palermo e Conca d'Oro
const LON_MIN = 13.27;
const LON_MAX = 13.43;
const LAT_MIN = 38.09;
const LAT_MAX = 38.21;
const GW = 224; // campioni in longitudine
const GH = 200; // campioni in latitudine

const lon2x = (lon) => ((lon + 180) / 360) * 2 ** Z;
const lat2y = (lat) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** Z;
};

const tiles = new Map();
async function tile(tx, ty) {
  const key = `${tx}/${ty}`;
  if (!tiles.has(key)) {
    const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${tx}/${ty}.png`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`tile ${key}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    tiles.set(key, PNG.sync.read(buf));
    console.log(`tile ${key} ok`);
  }
  return tiles.get(key);
}

async function elevation(lon, lat) {
  const fx = lon2x(lon);
  const fy = lat2y(lat);
  const tx = Math.floor(fx);
  const ty = Math.floor(fy);
  const png = await tile(tx, ty);
  const px = Math.min(255, Math.floor((fx - tx) * 256));
  const py = Math.min(255, Math.floor((fy - ty) * 256));
  const idx = (py * 256 + px) * 4;
  const [r, g, b] = [png.data[idx], png.data[idx + 1], png.data[idx + 2]];
  return r * 256 + g + b / 256 - 32768;
}

const data = new Int16Array(GW * GH);
let min = Infinity;
let max = -Infinity;
for (let iz = 0; iz < GH; iz++) {
  const lat = LAT_MAX - ((LAT_MAX - LAT_MIN) * iz) / (GH - 1);
  for (let ix = 0; ix < GW; ix++) {
    const lon = LON_MIN + ((LON_MAX - LON_MIN) * ix) / (GW - 1);
    const e = Math.round(await elevation(lon, lat));
    data[iz * GW + ix] = e;
    if (e < min) min = e;
    if (e > max) max = e;
  }
}
console.log(`griglia ${GW}x${GH}, elevazione ${min}..${max} m`);

const out = `// Generato da scripts/fetch-dem.mjs — DEM reale di Palermo (AWS Terrain Tiles)
export const DEM = {
  w: ${GW},
  h: ${GH},
  lonMin: ${LON_MIN},
  lonMax: ${LON_MAX},
  latMin: ${LAT_MIN},
  latMax: ${LAT_MAX},
  maxElev: ${max},
  data: Int16Array.from([${Array.from(data).join(",")}]),
};
`;
fs.writeFileSync("src/palermo-dem.ts", out);
console.log(`scritto src/palermo-dem.ts (${(out.length / 1024).toFixed(0)} KB)`);
