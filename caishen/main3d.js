/**
 * 云阶财神殿 · 实时三维竖切
 * Three.js r170（MIT，见 vendor/LICENSE-three.txt）。场景、财神、角色均为本页原创程序几何，
 * 没有使用任何寺庙实拍、商用模型或 Sansa 素材。
 * 财运规则仍走 economy.js。
 */
import * as THREE from 'three';

const eco = window.CSEconomy;
const KEY = 'caishen.v1';
const canvas = document.getElementById('view');
const actBtn = document.getElementById('act');
const sheet = document.getElementById('sheet');
const scoreEl = document.getElementById('score');
const live = document.getElementById('live');
const joyEl = document.getElementById('joy');
const knob = document.getElementById('knob');

const PAL = [
  { robe: 0xe7e1d4, trim: 0x245e62, bottom: 0x243236, shoe: 0x1b1916, accent: 0xc4554a },
  { robe: 0x9a3034, trim: 0xf0d59a, bottom: 0x2c221c, shoe: 0x140e0c, accent: 0xf4e2b0 },
  { robe: 0x1d4e46, trim: 0xf0e2c8, bottom: 0x24302c, shoe: 0x3a2a1e, accent: 0xf6edd8 },
  { robe: 0xc9a56e, trim: 0x6a3828, bottom: 0x3a3028, shoe: 0x241810, accent: 0xf8edd6 },
  { robe: 0x1a2c4e, trim: 0xe6c98a, bottom: 0x12161c, shoe: 0x0c0e12, accent: 0xf3e6c0 },
  { robe: 0xe0b8c8, trim: 0x5c3048, bottom: 0x3a2a34, shoe: 0x241820, accent: 0xfbeff4 },
  { robe: 0x7a6232, trim: 0xfff0b8, bottom: 0x2a2416, shoe: 0x16120c, accent: 0xfff6d0 }
];
const SKIN = [0xf3c7a4, 0xe2ad86, 0xc48860, 0x8d5a3c, 0xf8d8ba];
const HAIR = [0x1a1412, 0x3a2a22, 0x4a3424, 0x2c2430, 0x5c5148];
const NAMES = {
  hair: ['束髻', '披发', '短发', '双鬟', '单辫', '高髻'],
  robe: ['交领广袖', '短褐', '圆领长袍', '披风', '比甲', '金缘袍'],
  bottom: ['褶裙', '宽裤', '窄裤'],
  shoes: ['布履', '短靴', '草鞋', '云履'],
  hat: ['不戴冠', '抹额', '软巾', '斗笠', '帷帽'],
  accessory: ['无配饰', '绦带', '腰扇', '耳坠', '披巾', '玉佩']
};

function todayStr() {
  const d = new Date();
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && typeof o === 'object') return o;
    }
  } catch (e) {}
  return {};
}
let save = Object.assign({
  outfit: null, lifetime: 0, days: {}, once: {}, gild: [], wishes: [], charms: [],
  notes: [], salt: Math.floor(Math.random() * 1e9), mute: false, helpSeen: false, px: 0, pz: 8
}, load());
save.gild = save.gild || [];
save.days = save.days || {};
save.once = save.once || {};
let today = todayStr();

function ensureDay() {
  if (!save.days[today]) save.days[today] = Object.assign(eco.blankDay(), { visited: false });
  const d = save.days[today];
  d.done = d.done || {};
  d.earned = d.earned || 0;
  d.coins = d.coins || 0;
  return d;
}
function persist() {
  save.px = avatar.position.x;
  save.pz = avatar.position.z;
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {}
}
function rollOutfit(rng) {
  const u = eco.unlocks(save.lifetime || 0);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const hats = u.hat.filter((h) => h !== 0);
  const acc = u.accessory.filter((h) => h !== 0);
  return {
    skin: pick(u.skin), hair: pick(u.hair), hairColor: pick(u.hairColor),
    robe: pick(u.robe), palette: pick(u.palette), bottom: pick(u.bottom),
    shoes: pick(u.shoes),
    hat: rng() < 0.55 || !hats.length ? 0 : pick(hats),
    accessory: rng() < 0.4 || !acc.length ? 0 : pick(acc)
  };
}
if (!save.outfit) save.outfit = rollOutfit(Math.random);

const mobile = Math.min(window.innerWidth, window.innerHeight) < 760;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe7b08a);
scene.fog = new THREE.FogExp2(0xe0b090, 0.014);
(function sky() {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#f6d2b0');
  grd.addColorStop(0.42, '#e7a888');
  grd.addColorStop(1, '#c46b58');
  g.fillStyle = grd;
  g.fillRect(0, 0, 8, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(70, 24, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, depthWrite: false }));
  scene.add(dome);
  const puff = new THREE.MeshLambertMaterial({ color: 0xfff4e8, transparent: true, opacity: 0.55, depthWrite: false });
  [[-9, 8.5, -4, 3.2], [7, 9, 6, 2.6], [-3, 7.2, 14, 4], [11, 8, -8, 2.2]].forEach((p) => {
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), puff);
    cloud.scale.set(p[3], 0.45, 1.1);
    cloud.position.set(p[0], p[1], p[2]);
    scene.add(cloud);
  });
})();

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 5, 14);

const hemi = new THREE.HemisphereLight(0xffe0c0, 0x4a3428, 0.72);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d2, 2.4);
sun.position.set(-10, 18, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
sun.shadow.camera.near = 2;
sun.shadow.camera.far = 48;
sun.shadow.camera.left = -18;
sun.shadow.camera.right = 18;
sun.shadow.camera.top = 18;
sun.shadow.camera.bottom = -18;
sun.shadow.bias = -0.0004;
scene.add(sun);
const fill = new THREE.DirectionalLight(0x9ec4ff, 0.35);
fill.position.set(8, 6, -6);
scene.add(fill);

function M(color, rough, metal, extra) {
  return new THREE.MeshStandardMaterial(Object.assign({
    color, roughness: rough, metalness: metal
  }, extra || {}));
}
const stoneMat = M(0xd2c3ae, 0.86, 0.02, { map: stoneMap() });
const woodMat = M(0x7a4e32, 0.7, 0.04, { map: woodMap() });
const redMat = M(0x8e242e, 0.48, 0.08);
const goldMat = M(0xf0d070, 0.32, 0.72, { emissive: 0x3a2208, emissiveIntensity: 0.18 });
const darkRoof = M(0x2a3342, 0.42, 0.22, { map: roofMap(), side: THREE.DoubleSide });
const jadeMat = M(0x1c7a5a, 0.32, 0.28);
const blackMat = M(0x16120e, 0.45, 0.08);
const skinMat = M(0xf0c4a4, 0.58, 0.0);
const leafMat = M(0xc45a28, 0.7, 0.0);
const waterMat = M(0x2c6e78, 0.08, 0.15, { transparent: true, opacity: 0.88 });

function stoneMap() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#d7c7b2';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 50; i++) {
    g.strokeStyle = i % 2 ? 'rgba(90,70,50,.28)' : 'rgba(255,248,236,.35)';
    g.strokeRect((i * 47) % 240, (i * 29) % 240, 52, 34);
    g.fillStyle = i % 3 ? 'rgba(160,140,110,.18)' : 'rgba(255,250,240,.2)';
    g.fillRect((i * 53) % 220, (i * 17) % 220, 36, 22);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(6, 6);
  return t;
}
function woodMap() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#7a4e32';
  g.fillRect(0, 0, 128, 256);
  g.strokeStyle = 'rgba(40,20,10,.35)';
  for (let y = 8; y < 256; y += 14) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(128, y + 3); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(2, 4);
  return t;
}
function roofMap() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#2a3342';
  g.fillRect(0, 0, 64, 128);
  g.strokeStyle = 'rgba(230,200,120,.35)';
  for (let x = 4; x < 64; x += 8) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(3, 2);
  return t;
}
function smokeTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 4, 32, 32, 30);
  grd.addColorStop(0, 'rgba(255,250,240,.85)');
  grd.addColorStop(1, 'rgba(255,250,240,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const smokeMap = smokeTex();

function sweepRoof(w, d, rise, lift) {
  const gw = 16, gd = 10;
  const geo = new THREE.BufferGeometry();
  const pos = [];
  const uv = [];
  const idx = [];
  const yAt = (i, j) => {
    const u = i / gw * 2 - 1;
    const v = j / gd * 2 - 1;
    const ridge = (1 - Math.abs(v)) * rise * (1 - Math.abs(u) * 0.08);
    const eave = (Math.pow(Math.abs(u), 2) * 0.55 + Math.pow(Math.abs(v), 2) * 0.2) * lift;
    return ridge + eave;
  };
  for (let j = 0; j <= gd; j++) {
    for (let i = 0; i <= gw; i++) {
      pos.push((i / gw - 0.5) * w, yAt(i, j), (j / gd - 0.5) * d);
      uv.push(i / gw, j / gd);
    }
  }
  for (let j = 0; j < gd; j++) {
    for (let i = 0; i < gw; i++) {
      const a = j * (gw + 1) + i;
      idx.push(a, a + 1, a + gw + 1, a + 1, a + gw + 2, a + gw + 1);
    }
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}
function yuanbaoGeo(scale) {
  const s = new THREE.Shape();
  s.moveTo(-0.32, 0);
  s.quadraticCurveTo(-0.4, 0.22, -0.12, 0.16);
  s.quadraticCurveTo(0, 0.42, 0.12, 0.16);
  s.quadraticCurveTo(0.4, 0.22, 0.32, 0);
  s.quadraticCurveTo(0, -0.14, -0.32, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
  g.scale(scale, scale, scale);
  g.center();
  return g;
}
function bowlGeo() {
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const r = 0.22 + Math.sin(t * Math.PI) * 0.28;
    pts.push(new THREE.Vector2(Math.max(0.05, r), t * 0.42));
  }
  return new THREE.LatheGeometry(pts, 24);
}

function addShadow(obj) {
  obj.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });
}

const root = new THREE.Group();
scene.add(root);

function lantern(x, y, z, base) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, y, 8), woodMat);
  pole.position.y = y / 2;
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), M(0xff5a3c, 0.35, 0.1, { emissive: 0xff6a2a, emissiveIntensity: 0.85 }));
  body.scale.set(1, 1.25, 1);
  body.position.y = y + 0.15;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 8), goldMat);
  cap.position.y = y + 0.42;
  g.add(pole, body, cap);
  g.position.set(x, base || 0, z);
  addShadow(g);
  root.add(g);
  if (!mobile || lanternLights < 4) {
    const pl = new THREE.PointLight(0xff9444, 6, 7, 2);
    pl.position.set(x, (base || 0) + y + 0.2, z);
    scene.add(pl);
    lanternLights++;
  }
  return g;
}
let lanternLights = 0;

function tree(x, z, autumn) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.4, 8), M(0x4a3024, 0.8, 0));
  trunk.position.y = 0.7;
  const col = autumn ? 0xd26528 : 0x2d6a45;
  const a = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 12), M(col, 0.75, 0));
  a.position.y = 1.7;
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), M(autumn ? 0xf0a040 : 0x3d8a58, 0.7, 0));
  b.position.set(0.35, 2.05, 0.2);
  g.add(trunk, a, b);
  g.position.set(x, 0, z);
  addShadow(g);
  root.add(g);
}

function buildCourtyard() {
  const ground = new THREE.Mesh(new THREE.CircleGeometry(26, 48), M(0x6d8a62, 0.9, 0));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);
  const court = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), stoneMat);
  court.rotation.x = -Math.PI / 2;
  court.position.set(0, 0.02, 6);
  court.receiveShadow = true;
  root.add(court);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 12), M(0xb7a48e, 0.8, 0.02));
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.03, 5);
  path.receiveShadow = true;
  root.add(path);

  const pond = new THREE.Mesh(new THREE.CircleGeometry(2.1, 32), waterMat);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(7.2, 0.04, 8.5);
  root.add(pond);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.12, 8, 28), stoneMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.copy(pond.position);
  rim.position.y = 0.08;
  root.add(rim);

  [[-9.5, 9], [9.2, 4.5], [-8, 3], [6, 12.5]].forEach((p, i) => tree(p[0], p[1], i % 2 === 0));

  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.15, 14), M(0xefe6d6, 0.7, 0.02));
    wall.position.set(side * 11.2, 0.58, 7);
    wall.castShadow = wall.receiveShadow = true;
    root.add(wall);
    const cap = new THREE.Mesh(sweepRoof(0.9, 14.2, 0.28, 0.18), darkRoof);
    cap.position.set(side * 11.2, 1.25, 7);
    cap.castShadow = true;
    root.add(cap);
  }
  lantern(-4.2, 2.4, 10);
  lantern(4.2, 2.4, 10);
  lantern(-6.5, 2.2, 3.2);
  lantern(6.5, 2.2, 3.2);

  const burner = new THREE.Group();
  const feet = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.18, 3), M(0x8a8074, 0.4, 0.5));
  feet.position.y = 0.1;
  const bowl = new THREE.Mesh(bowlGeo(), M(0xc4b4a0, 0.35, 0.55));
  bowl.position.y = 0.45;
  burner.add(feet, bowl);
  burner.position.set(0, 0, 3.4);
  addShadow(burner);
  root.add(burner);

  const bellG = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.4, 8), woodMat);
  frame.position.y = 1.2;
  const bellMesh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.65), goldMat);
  bellMesh.scale.set(1, 1.2, 1);
  bellMesh.position.y = 1.7;
  bellG.add(frame, bellMesh);
  bellG.position.set(-5.6, 0, 4.2);
  addShadow(bellG);
  root.add(bellG);
  bellG.userData.mesh = bellMesh;
  return { burner, bellG };
}

function buildHall() {
  const plat = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.85, 11.2), stoneMat);
  plat.position.set(0, 0.42, -8);
  plat.castShadow = plat.receiveShadow = true;
  root.add(plat);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.12, 9.6), woodMat);
  floor.position.set(0, 0.9, -8.1);
  floor.receiveShadow = true;
  root.add(floor);
  const carpet = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 6.2), redMat);
  carpet.position.set(0, 0.98, -7.2);
  carpet.receiveShadow = true;
  root.add(carpet);

  for (let i = 0; i < 4; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(6.4 - i * 0.3, 0.22, 0.7), stoneMat);
    step.position.set(0, 0.12 + i * 0.22, -1.55 - i * 0.55);
    step.castShadow = step.receiveShadow = true;
    root.add(step);
  }
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 3.2), redMat);
    rail.position.set(side * 3.3, 0.7, -2.6);
    rail.castShadow = true;
    root.add(rail);
    for (let k = 0; k < 4; k++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.7, 8), goldMat);
      post.position.set(side * 3.3, 0.55, -1.3 - k * 0.85);
      root.add(post);
    }
  }

  const cols = [[-5.4, -4.2], [-2.2, -4.2], [2.2, -4.2], [5.4, -4.2], [-5.4, -11.4], [-2.2, -11.4], [2.2, -11.4], [5.4, -11.4]];
  cols.forEach(([x, z]) => {
    const c = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.3, 16), redMat);
    shaft.position.y = 2.15 + 0.85;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.28, 12), stoneMat);
    base.position.y = 0.95;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 8, 18), goldMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 4.85;
    c.add(shaft, base, ring);
    c.position.set(x, 0, z);
    addShadow(c);
    root.add(c);
  });

  const back = new THREE.Mesh(new THREE.BoxGeometry(13.4, 3.6, 0.35), redMat);
  back.position.set(0, 2.7, -12.5);
  back.castShadow = back.receiveShadow = true;
  root.add(back);
  for (const side of [-1, 1]) {
    const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.2, 7.2), redMat);
    sideWall.position.set(side * 6.7, 2.5, -8.6);
    sideWall.castShadow = true;
    root.add(sideWall);
  }

  const roof1 = new THREE.Mesh(sweepRoof(16.5, 13.2, 1.15, 0.55), darkRoof);
  roof1.position.set(0, 5.15, -8);
  const roof2 = new THREE.Mesh(sweepRoof(12.4, 9.6, 0.9, 0.42), darkRoof);
  roof2.position.set(0, 6.45, -8);
  const roof3 = new THREE.Mesh(sweepRoof(7.2, 5.4, 0.6, 0.28), M(0x4a3428, 0.4, 0.3, { side: THREE.DoubleSide }));
  roof3.position.set(0, 7.35, -8);
  [roof1, roof2, roof3].forEach((r) => { r.castShadow = true; root.add(r); });
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.16, 0.22), goldMat);
  ridge.position.set(0, 8.05, -8);
  root.add(ridge);
  for (const end of [-1, 1]) {
    const beast = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), goldMat);
    beast.position.set(end * 3.2, 8.05, -8);
    root.add(beast);
  }
  for (let i = -3; i <= 3; i++) {
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.28), goldMat);
    br.position.set(i * 1.5, 4.95, -2.15);
    root.add(br);
  }

  const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 0.08), M(0xf6edd4, 0.5, 0.05));
  plaque.position.set(0, 4.35, -2.05);
  root.add(plaque);
  const sign = labelSprite('财神殿', 512, 160, '#6e2430', '#f6edd4');
  sign.position.set(0, 4.85, -2.15);
  sign.scale.set(2.6, 0.78, 1);
  root.add(sign);
  const hallLight = new THREE.PointLight(0xffc48a, 28, 16, 2);
  hallLight.position.set(0, 3.6, -8.2);
  scene.add(hallLight);

  lantern(-3.2, 2.2, -3.4, 0.9);
  lantern(3.2, 2.2, -3.4, 0.9);
  return plat;
}

function paintLabel(c, text, color, bg) {
  const g = c.getContext('2d');
  const w = c.width, h = c.height;
  g.clearRect(0, 0, w, h);
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = color;
  g.lineWidth = Math.max(6, h * 0.05);
  g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = color;
  g.font = '700 ' + Math.floor(h * 0.52) + 'px "WenQuanYi Micro Hei","Noto Sans SC","PingFang SC",sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, w / 2, h * 0.54);
}
function labelSprite(text, w, h, color, bg) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  paintLabel(c, text, color, bg);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true }));
  const redo = () => { paintLabel(c, text, color, bg); t.needsUpdate = true; };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redo);
  return s;
}

const statueParts = { gold: [], red: [] };
function buildCaishen() {
  const g = new THREE.Group();
  const gold = goldMat.clone();
  gold.emissive = new THREE.Color(0x5a3a10);
  gold.emissiveIntensity = 0.22;
  const red = redMat.clone();
  const skin = skinMat.clone();
  statueParts.gold.push(gold);
  statueParts.red.push(red);
  statueParts.skin = skin;

  const throne = new THREE.Mesh(new THREE.BoxGeometry(2.15, 2.5, 0.22), red);
  throne.position.set(0, 1.85, -0.62);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.28, 1.45), red);
  seat.position.y = 0.85;
  const studMat = gold;
  g.add(throne, seat);
  for (let i = -2; i <= 2; i++) {
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), studMat);
    stud.position.set(i * 0.32, 2.7, -0.48);
    g.add(stud);
  }

  const halo = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.78, 32), new THREE.MeshBasicMaterial({
    color: 0xffe08a, side: THREE.DoubleSide, transparent: true, opacity: 0.9
  }));
  halo.position.set(0, 2.55, -0.45);
  g.add(halo);
  const haloLight = new THREE.PointLight(0xffc56a, 8, 6, 2);
  haloLight.position.set(0, 2.5, 0.2);
  g.add(haloLight);

  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 1.05, 1.2, 24), red);
  robe.position.y = 1.28;
  g.add(robe);
  for (const sx of [-0.28, 0.28, 0]) {
    const roundel = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.028, 8, 16), gold);
    roundel.position.set(sx, sx === 0 ? 1.55 : 1.75, 0.72);
    g.add(roundel);
  }
  const belt = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.2), jadeMat);
  belt.position.set(0, 1.25, 0.78);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.08), gold);
  buckle.position.set(0, 1.25, 0.9);
  g.add(belt, buckle);
  for (const side of [-1, 1]) {
    const sleeve = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), red);
    sleeve.scale.set(1.1, 0.75, 0.8);
    sleeve.position.set(side * 0.85, 1.35, 0.25);
    g.add(sleeve);
  }

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 28, 20), skin);
  head.scale.set(1.08, 0.96, 0.98);
  head.position.set(0, 2.42, 0.08);
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), skin);
  earL.scale.set(0.6, 1, 0.7);
  earL.position.set(-0.4, 2.4, 0.05);
  const earR = earL.clone();
  earR.position.x = 0.4;
  g.add(head, earL, earR);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), skin);
  nose.scale.set(0.8, 0.7, 1.1);
  nose.position.set(0, 2.38, 0.44);
  g.add(nose);
  for (const ex of [-0.14, 0.14]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), blackMat);
    eye.position.set(ex, 2.48, 0.4);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), blackMat);
    brow.position.set(ex, 2.58, 0.4);
    brow.rotation.z = ex < 0 ? 0.25 : -0.25;
    g.add(eye, brow);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.016, 6, 12, Math.PI), M(0xc44848, 0.4, 0));
  smile.rotation.z = Math.PI;
  smile.position.set(0, 2.26, 0.4);
  g.add(smile);
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), blackMat);
  beard.scale.set(1.15, 1.35, 0.55);
  beard.position.set(0, 1.95, 0.55);
  const beardL = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.42, 4, 8), blackMat);
  beardL.position.set(-0.18, 1.78, 0.52);
  const beardR = beardL.clone();
  beardR.position.x = 0.18;
  g.add(beard, beardL, beardR);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.28, 16), blackMat);
  cap.position.set(0, 2.82, 0.02);
  const wingGeo = new THREE.BoxGeometry(1.15, 0.06, 0.16);
  const wingL = new THREE.Mesh(wingGeo, blackMat);
  wingL.position.set(-0.85, 2.78, 0);
  wingL.rotation.z = 0.12;
  const wingR = wingL.clone();
  wingR.position.x = 0.85;
  wingR.rotation.z = -0.12;
  const edgeL = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.02, 0.17), gold);
  edgeL.position.copy(wingL.position);
  edgeL.rotation.copy(wingL.rotation);
  const edgeR = edgeL.clone();
  edgeR.position.x = 0.85;
  edgeR.rotation.z = -0.12;
  const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), M(0xc43838, 0.3, 0.4, { emissive: 0x661111, emissiveIntensity: 0.4 }));
  jewel.position.set(0, 2.9, 0.28);
  g.add(cap, wingL, wingR, edgeL, edgeR, jewel);

  const ingot = new THREE.Mesh(yuanbaoGeo(1.15), gold);
  ingot.position.set(0, 1.15, 0.55);
  ingot.rotation.x = -0.4;
  g.add(ingot);
  const ruyiPath = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.55, 1.35, 0.5),
    new THREE.Vector3(-0.15, 1.85, 0.7),
    new THREE.Vector3(0.15, 1.45, 0.65)
  );
  const ruyi = new THREE.Mesh(new THREE.TubeGeometry(ruyiPath, 12, 0.035, 6, false), gold);
  const cloud = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), gold);
  cloud.scale.set(1.4, 0.7, 0.8);
  cloud.position.set(0.15, 1.45, 0.65);
  g.add(ruyi, cloud);

  const basin = new THREE.Group();
  const bowl = new THREE.Mesh(bowlGeo(), gold);
  bowl.scale.setScalar(1.35);
  basin.add(bowl);
  [[-0.12, 0.28, 0.05], [0.1, 0.26, -0.02], [0, 0.4, 0.04]].forEach((p, i) => {
    const yb = new THREE.Mesh(yuanbaoGeo(0.45 - i * 0.05), gold);
    yb.position.set(p[0], p[1], p[2]);
    basin.add(yb);
  });
  const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), M(0xf6f0e4, 0.15, 0.2));
  pearl.position.set(0.16, 0.36, 0.08);
  basin.add(pearl);
  basin.position.set(1.35, 0.15, 0.35);
  g.add(basin);

  const tablet = labelSprite('招财进宝', 320, 80, '#6e2430', '#f6edd4');
  tablet.position.set(0, 0.22, 0.95);
  tablet.scale.set(0.85, 0.22, 1);
  g.add(tablet);

  g.position.set(0, 1.05, -11.15);
  g.scale.setScalar(1.15);
  addShadow(g);
  root.add(g);
  statueParts.group = g;
  return g;
}

function applyGildLook() {
  const n = (save.gild || []).length / 8;
  statueParts.gold.forEach((m) => { m.emissiveIntensity = 0.22 + n * 0.7; });
  statueParts.red.forEach((m) => {
    m.emissive = new THREE.Color(0x552208);
    m.emissiveIntensity = n * 0.35;
  });
  if (statueParts.skin && n > 0.4) {
    statueParts.skin.color.setHex(0xf6deaa);
    statueParts.skin.emissive = new THREE.Color(0x443010);
    statueParts.skin.emissiveIntensity = (n - 0.4) * 0.4;
  }
}

function buildAvatar(outfit) {
  const g = new THREE.Group();
  const pal = PAL[outfit.palette] || PAL[0];
  const robeM = M(pal.robe, 0.55, 0.06);
  const trimM = M(pal.trim, 0.4, 0.25);
  const bottomM = M(pal.bottom, 0.6, 0.02);
  const shoeM = M(pal.shoe, 0.5, 0.05);
  const skinM = M(SKIN[outfit.skin] || SKIN[0], 0.55, 0);
  const hairM = M(HAIR[outfit.hairColor] || HAIR[0], 0.45, 0.05);
  const accentM = M(pal.accent, 0.45, 0.1);

  const hip = new THREE.Group();
  hip.position.y = 0.92;
  const torsoH = outfit.robe === 1 || outfit.robe === 4 ? 0.62 : 0.7;
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, torsoH, 12), robeM);
  torso.position.y = torsoH / 2;
  hip.add(torso);
  if (outfit.robe === 5) {
    const edge = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 16), goldMat);
    edge.rotation.x = Math.PI / 2;
    edge.position.y = torsoH * 0.7;
    hip.add(edge);
  }
  if (outfit.robe === 3) {
    const cloak = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), accentM);
    cloak.scale.set(1, 1.1, 0.45);
    cloak.position.set(0, 0.25, -0.12);
    hip.add(cloak);
  }
  const skirtLen = outfit.bottom === 0 && outfit.robe !== 1 ? 0.48 : 0.05;
  if (skirtLen > 0.2) {
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, skirtLen, 12), robeM);
    skirt.position.y = -skirtLen / 2 + 0.02;
    hip.add(skirt);
  }
  g.add(hip);

  function limb(upper, mat, len) {
    const pivot = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, len, 4, 8), mat);
    mesh.position.y = -len / 2;
    pivot.add(mesh);
    if (upper) pivot.position.y = 0.9;
    return pivot;
  }
  const legLen = 0.74;
  const leftLeg = limb(false, outfit.bottom === 0 && outfit.robe !== 1 ? robeM : bottomM, legLen);
  leftLeg.position.set(-0.1, 0.92, 0);
  const rightLeg = limb(false, outfit.bottom === 0 && outfit.robe !== 1 ? robeM : bottomM, legLen);
  rightLeg.position.set(0.1, 0.92, 0);
  const leftArm = limb(true, outfit.robe === 4 ? skinM : robeM, 0.38);
  leftArm.position.set(-0.28, 1.35, 0);
  const rightArm = limb(true, outfit.robe === 4 ? skinM : robeM, 0.38);
  rightArm.position.set(0.28, 1.35, 0);
  g.add(leftLeg, rightLeg, leftArm, rightArm);

  [leftLeg, rightLeg].forEach((leg) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, outfit.shoes === 1 ? 0.2 : 0.15), shoeM);
    s.position.set(0, -0.78, 0.04);
    leg.add(s);
  });
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 8), skinM);
  neck.position.y = 1.52;
  g.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), skinM);
  head.position.y = 1.68;
  g.add(head);
  const hair = new THREE.Group();
  const bulkyHat = outfit.hat === 2 || outfit.hat === 3;
  if (bulkyHat) {
    const capH = new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hairM);
    capH.position.y = 1.72;
    hair.add(capH);
  } else if (outfit.hair === 0 || outfit.hair === 5) {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), hairM);
    bun.position.y = 1.86;
    hair.add(bun);
    if (outfit.hair === 5) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 6), goldMat);
      stick.rotation.z = 0.8;
      stick.position.set(0.04, 1.88, 0);
      hair.add(stick);
    }
  } else if (outfit.hair === 1) {
    [-0.1, 0.1].forEach((x) => {
      const lock = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.42, 3, 6), hairM);
      lock.position.set(x, 1.5, -0.04);
      hair.add(lock);
    });
  } else if (outfit.hair === 2) {
    const capH = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), hairM);
    capH.position.y = 1.7;
    hair.add(capH);
  } else if (outfit.hair === 3) {
    [-0.12, 0.12].forEach((x) => {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), hairM);
      bun.position.set(x, 1.8, -0.08);
      hair.add(bun);
    });
  } else if (outfit.hair === 4) {
    const braid = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.46, 3, 6), hairM);
    braid.position.set(0.12, 1.48, -0.02);
    hair.add(braid);
  }
  g.add(hair);

  if (outfit.hat === 1) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.02, 6, 16), accentM);
    band.rotation.x = Math.PI / 2;
    band.position.y = 1.72;
    g.add(band);
  } else if (outfit.hat === 2) {
    const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 0.12, 12), trimM);
    cap2.position.y = 1.86;
    g.add(cap2);
  } else if (outfit.hat === 3) {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.025, 16), M(0xd7b56a, 0.6, 0.1));
    brim.position.y = 1.82;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.12, 12), M(0xf3e2b8, 0.55, 0));
    cone.position.y = 1.9;
    g.add(brim, cone);
  } else if (outfit.hat === 4) {
    const veil = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.02), M(0xf6efe2, 0.4, 0, { transparent: true, opacity: 0.55 }));
    veil.position.set(0, 1.62, 0.15);
    g.add(veil);
  }
  if (outfit.accessory === 1) {
    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 12, Math.PI), accentM);
    sash.position.set(0.05, 1.15, 0.12);
    sash.rotation.y = 0.6;
    g.add(sash);
  } else if (outfit.accessory === 2) {
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.1, 8, 0, Math.PI), accentM);
    fan.position.set(0.32, 1.05, 0.08);
    g.add(fan);
  } else if (outfit.accessory === 3) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), accentM);
    e.position.set(0.15, 1.62, 0.1);
    g.add(e);
  } else if (outfit.accessory === 4) {
    const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.08), accentM);
    scarf.position.set(0.04, 1.48, 0.08);
    g.add(scarf);
  } else if (outfit.accessory === 5) {
    const jade = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), jadeMat);
    jade.position.set(0, 1.2, 0.22);
    g.add(jade);
  }
  addShadow(g);
  g.userData.anim = { leftLeg, rightLeg, leftArm, rightArm, hip };
  return g;
}

const props = buildCourtyard();
buildHall();
const statue = buildCaishen();
applyGildLook();
let avatar = buildAvatar(save.outfit);
const spawnX = Math.abs(save.px) < 12 ? save.px : 0;
const spawnZ = save.pz > -12 && save.pz < 15 ? save.pz : 8;
avatar.position.set(spawnX, 0, spawnZ);
avatar.rotation.y = Math.PI;
root.add(avatar);

const blockers = [
  { x: 0, z: -12.7, hw: 6.6, hd: 0.4 },
  { x: -6.9, z: -8.6, hw: 0.4, hd: 3.4 },
  { x: 6.9, z: -8.6, hw: 0.4, hd: 3.4 },
  { x: -11.2, z: 7, hw: 0.4, hd: 7 },
  { x: 11.2, z: 7, hw: 0.4, hd: 7 },
  { x: 0, z: -11.15, hw: 0.9, hd: 0.7 }
];
[[-5.4, -4.2], [-2.2, -4.2], [2.2, -4.2], [5.4, -4.2], [-5.4, -11.4], [-2.2, -11.4], [2.2, -11.4], [5.4, -11.4]].forEach(([x, z]) => {
  blockers.push({ x, z, r: 0.42 });
});
function blocked(x, z) {
  if (x < -12.4 || x > 12.4 || z > 15.6 || z < -13.6) return true;
  if (z < -2.4 && z > -13.2 && (x < -6.4 || x > 6.4)) return true;
  for (const b of blockers) {
    if (b.r) {
      const dx = x - b.x, dz = z - b.z;
      if (dx * dx + dz * dz < b.r * b.r) return true;
    } else if (Math.abs(x - b.x) < b.hw && Math.abs(z - b.z) < b.hd) return true;
  }
  return false;
}
function groundY(x, z) {
  if (Math.abs(x) < 3.3 && z < -1.5 && z > -3.7) {
    const t = THREE.MathUtils.clamp((-1.5 - z) / 2.1, 0, 1);
    return 0.9 * t;
  }
  if (z < -2.3 && Math.abs(x) < 6.5 && z > -12.4) return 0.9;
  return 0;
}

const spots = [
  { id: 'incense', x: 0, z: 3.4, r: 1.5, label: () => ensureDay().done.incense ? '香还燃着' : '按住上香', hold: 'incense' },
  { id: 'bell', x: -5.6, z: 4.2, r: 1.5, label: () => '敲钟', press: 'bell' },
  { id: 'bow', x: 0, z: -9.6, r: 1.7, label: () => '按住作揖', hold: 'bow' },
  { id: 'rain', x: 0, z: -7.2, r: 1.5, label: () => (ensureDay().coins || 0) >= eco.COIN_MAX ? '今日金雨已满 ' + eco.COIN_MAX + '/' + eco.COIN_MAX : '坐下，等金雨', press: 'rain' },
  { id: 'mirror', x: 4.6, z: 11, r: 1.4, label: () => '照一照衣冠', press: 'wardrobe' },
  { id: 'gild', x: 1.6, z: -10.2, r: 1.5, label: () => (save.lifetime || 0) < eco.GOLD_AT ? '金身未启 ' + (save.lifetime || 0) + '/' + eco.GOLD_AT : '贴一片金箔', press: 'gild' }
];
function nearest() {
  let best = null, bd = 1e9;
  for (const s of spots) {
    const d = Math.hypot(avatar.position.x - s.x, avatar.position.z - s.z);
    if (d < s.r && d < bd) { best = s; bd = d; }
  }
  return best;
}

const keys = {};
const joy = { on: false, x: 0, z: 0 };
let target = null;
let hold = null;
let holdT = 0;
let phase = 0;
let raining = false;
let camLock = null;
let rainT = 0;
let rainSpawned = 0;
const coins = [];
const smokes = [];
let sheetOpen = false;
let ac = null;
const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 20), goldMat);
mirror.position.set(4.6, 1.3, 11);
root.add(mirror);

function say(text) {
  live.textContent = text;
}
function hud() {
  const d = ensureDay();
  scoreEl.querySelector('b').textContent = '财运 ' + (save.lifetime || 0);
  scoreEl.querySelector('small').textContent = '游戏分数 · 今日 ' + (d.earned || 0) + '/' + eco.DAILY_CAP + ' · 金雨 ' + (d.coins || 0) + '/' + eco.COIN_MAX;
}
function reward(res) {
  if (!res) return;
  say((res.amount > 0 ? '+' + res.amount + ' ' : '+0 ') + res.reason);
  hud();
  persist();
}
function blip(freq, dur, type, gain) {
  if (save.mute || !ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type || 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain || 0.05, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(); o.stop(ac.currentTime + dur + 0.02);
}
function audioUnlock() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC || save.mute) return;
  if (!ac) ac = new AC();
  if (ac.state === 'suspended') ac.resume();
}

function openSheet(html) {
  sheetOpen = true;
  target = null;
  sheet.hidden = false;
  sheet.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>';
  sheet.querySelectorAll('[data-close]').forEach((b) => { b.onclick = closeSheet; });
}
function closeSheet() {
  sheetOpen = false;
  sheet.hidden = true;
  sheet.innerHTML = '';
}
sheet.addEventListener('pointerdown', (e) => { if (e.target === sheet) closeSheet(); });
function openHelp() {
  openSheet('<h2>进云阶殿</h2><p>这是一座虚构的三维小殿。电脑用 WASD 或方向键，也可以点地面；手机用左下摇杆。</p><p>走近香炉、钟、财神和殿中空地，才会出现能做的事。金雨要自己走过去接。</p><p class="muted">财运是游戏分数。一天有上限。累计 100 才打开贴金，不扣分。不收款，不预测发财。</p><button type="button" id="goin">我走了</button>');
  sheet.querySelector('#goin').onclick = () => { save.helpSeen = true; closeSheet(); persist(); };
}
function openJournal() {
  const d = ensureDay();
  openSheet('<h2>手帐</h2><p>累计财运 <b>' + (save.lifetime || 0) + '</b> · 今日 <b>' + (d.earned || 0) + '/' + eco.DAILY_CAP + '</b> · 金雨 <b>' + (d.coins || 0) + '/' + eco.COIN_MAX + '</b></p><div class="bar"><i style="width:' + Math.min(100, (save.lifetime || 0) / eco.GOLD_AT * 100) + '%"></i></div><p class="muted">贴金身在累计 ' + eco.GOLD_AT + ' 时永久打开，不扣分。这是游戏分数，不能换成钱，也不预测发财。云阶殿是虚构的。</p><p class="keys">WASD / 方向键走路，E 或空格互动。手机用摇杆或点地面。</p><button type="button" data-close>合上</button>');
}
function openWardrobe() {
  const o = save.outfit;
  const name = (key) => key === 'palette' ? '配色 ' + (o.palette + 1) : key === 'skin' ? '肤色 ' + (o.skin + 1) : key === 'hairColor' ? '发色 ' + (o.hairColor + 1) : NAMES[key][o[key]];
  const line = (key, label) => '<div class="row"><button type="button" data-k="' + key + '" data-d="-1">上一个</button><b>' + esc(label) + ' · ' + esc(name(key)) + '</b><button type="button" data-k="' + key + '" data-d="1">下一个</button></div>';
  openSheet('<h2>衣冠</h2><p class="muted">殿里走着的就是你。换装会立刻穿上，只存在这台浏览器。</p>' +
    line('palette', '配色') + line('robe', '上衣') + line('bottom', '下裳') + line('shoes', '鞋') +
    line('hair', '发型') + line('hairColor', '发色') + line('hat', '头上') + line('accessory', '配饰') + line('skin', '肤色') +
    '<div class="row"><button type="button" id="reroll">换一身</button><button type="button" data-close>照完了</button></div>');
  sheet.querySelectorAll('[data-k]').forEach((b) => {
    b.onclick = () => cycle(b.getAttribute('data-k'), +b.getAttribute('data-d'));
  });
  sheet.querySelector('#reroll').onclick = () => {
    save.outfit = rollOutfit(Math.random);
    rebuildAvatar();
    openWardrobe();
  };
}
function cycle(key, dir) {
  const u = eco.unlocks(save.lifetime || 0)[key];
  let i = u.indexOf(save.outfit[key]);
  if (i < 0) i = 0;
  save.outfit[key] = u[(i + dir + u.length) % u.length];
  rebuildAvatar();
  persist();
  openWardrobe();
}
function rebuildAvatar() {
  const p = avatar.position.clone();
  const r = avatar.rotation.y;
  root.remove(avatar);
  avatar = buildAvatar(save.outfit);
  avatar.position.copy(p);
  avatar.rotation.y = r;
  root.add(avatar);
}
function openGoldLock() {
  const n = save.lifetime || 0;
  openSheet('<h2>金身还锁着</h2><p>累计获得的财运到 <b>' + eco.GOLD_AT + '</b> 就永久打开，不扣除这 ' + eco.GOLD_AT + ' 分。</p><div class="bar"><i style="width:' + Math.min(100, n / eco.GOLD_AT * 100) + '%"></i></div><p>现在 ' + n + ' / ' + eco.GOLD_AT + '。这是游戏分数。</p><button type="button" data-close>再去走走</button>');
}
function pressSpot(s) {
  audioUnlock();
  if (s.press === 'bell') {
    props.bellG.userData.mesh.rotation.z = 0.4;
    blip(392, 0.8, 'sine', 0.05);
    blip(784, 0.6, 'sine', 0.03);
    reward(eco.grant(save, today, 'bell'));
  } else if (s.press === 'rain') startRain();
  else if (s.press === 'wardrobe') openWardrobe();
  else if (s.press === 'gild') {
    if ((save.lifetime || 0) < eco.GOLD_AT) openGoldLock();
    else {
      const id = [0, 1, 2, 3, 4, 5, 6, 7].find((n) => save.gild.indexOf(n) < 0);
      if (id == null) say('金身每一处都亮了。');
      else { reward(eco.grant(save, today, 'gild', { id })); applyGildLook(); }
    }
  }
}
function startRain() {
  const d = ensureDay();
  if ((d.coins || 0) >= eco.COIN_MAX) {
    say('今日金雨已计入 ' + eco.COIN_MAX + '/' + eco.COIN_MAX + '。');
    return;
  }
  if (raining) return;
  raining = true;
  rainT = 0;
  rainSpawned = 0;
  say('金雨从殿顶落下。走到币下用身子接。今日前 ' + eco.COIN_MAX + ' 枚计入。');
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
canvas.addEventListener('pointerdown', (e) => {
  if (e.target !== canvas) return;
  audioUnlock();
  canvas._down = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointerup', (e) => {
  if (!canvas._down || sheetOpen) return;
  const dx = e.clientX - canvas._down.x, dy = e.clientY - canvas._down.y;
  canvas._down = null;
  if (dx * dx + dy * dy > 64) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(root.children, true);
  const hit = hits.find((h) => h.point && h.point.y < 1.4);
  if (hit) target = { x: hit.point.x, z: hit.point.z };
});
window.addEventListener('keydown', (e) => {
  const typing = document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT');
  if (typing) { if (e.key === 'Escape') closeSheet(); return; }
  keys[e.key.toLowerCase()] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault();
  if (e.repeat) return;
  if (e.key === 'e' || e.key === 'E' || e.key === ' ') { audioUnlock(); actDown(); }
  if (e.key === 'Escape') closeSheet();
  if (e.key === 'j' || e.key === 'J') openJournal();
  if (e.key === 'm' || e.key === 'M') toggleMute();
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
  if (e.key === 'e' || e.key === 'E' || e.key === ' ') hold = null;
});
function actDown() {
  const n = nearest();
  if (!n) return;
  if (n.hold) { hold = n.hold; holdT = 0; }
  else pressSpot(n);
}
actBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); actDown(); });
actBtn.addEventListener('pointerup', () => { hold = null; });
actBtn.addEventListener('pointerleave', () => { hold = null; });
document.getElementById('btn-book').onclick = () => { audioUnlock(); openJournal(); };
function toggleMute() {
  save.mute = !save.mute;
  document.getElementById('btn-mute').textContent = save.mute ? '已静音' : '声音';
  persist();
}
document.getElementById('btn-mute').onclick = toggleMute;
joyEl.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  audioUnlock();
  joy.id = e.pointerId;
  joyEl.setPointerCapture(e.pointerId);
  moveJoy(e);
});
joyEl.addEventListener('pointermove', (e) => { if (joy.id === e.pointerId) moveJoy(e); });
function endJoy(e) { if (joy.id === e.pointerId) { joy.on = false; joy.x = joy.z = 0; joy.id = null; knob.style.left = '36px'; knob.style.top = '36px'; } }
joyEl.addEventListener('pointerup', endJoy);
joyEl.addEventListener('pointercancel', endJoy);
function moveJoy(e) {
  const r = joyEl.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  const m = Math.hypot(dx, dy) || 1;
  const k = Math.min(40, m) / m;
  joy.on = true;
  joy.x = dx / 40;
  joy.z = dy / 40;
  knob.style.left = (36 + dx * k) + 'px';
  knob.style.top = (36 + dy * k) + 'px';
  target = null;
}
if (matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) document.body.classList.add('touch');
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.25 : 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
});
window.addEventListener('pagehide', persist);

const clock = new THREE.Clock();
const camPos = new THREE.Vector3();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.033, clock.getDelta());
  let mx = 0, mz = 0, mag = 0;
  if (!sheetOpen) {
    if (joy.on) {
      mx = joy.x; mz = joy.z; mag = Math.hypot(mx, mz);
      if (mag > 1) { mx /= mag; mz /= mag; mag = 1; }
      if (mag < 0.18) mag = 0;
    } else {
      if (keys.a || keys.arrowleft) mx -= 1;
      if (keys.d || keys.arrowright) mx += 1;
      if (keys.w || keys.arrowup) mz -= 1;
      if (keys.s || keys.arrowdown) mz += 1;
      mag = Math.hypot(mx, mz);
      if (mag > 0) { mx /= mag; mz /= mag; mag = 1; }
    }
    if (mag > 0) target = null;
    else if (target) {
      const dx = target.x - avatar.position.x, dz = target.z - avatar.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.25) target = null;
      else { mx = dx / dist; mz = dz / dist; mag = Math.min(1, dist / 1.2); }
    }
  }
  const speed = 4.4 * mag * dt;
  if (speed > 0) {
    const nx = avatar.position.x + mx * speed;
    const nz = avatar.position.z + mz * speed;
    if (!blocked(nx, avatar.position.z)) avatar.position.x = nx;
    if (!blocked(avatar.position.x, nz)) avatar.position.z = nz;
    avatar.rotation.y = Math.atan2(mx, mz);
    phase += dt * 8 * mag;
    const a = avatar.userData.anim;
    const sw = Math.sin(phase);
    a.leftLeg.rotation.x = sw * 0.8;
    a.rightLeg.rotation.x = -sw * 0.8;
    a.leftArm.rotation.x = -sw * 0.55;
    a.rightArm.rotation.x = sw * 0.55;
    a.hip.position.y = 0.92 + Math.abs(sw) * 0.05;
  } else if (avatar.userData.anim) {
    const a = avatar.userData.anim;
    a.leftLeg.rotation.x *= 0.8;
    a.rightLeg.rotation.x *= 0.8;
    a.leftArm.rotation.x *= 0.8;
    a.rightArm.rotation.x *= 0.8;
  }
  avatar.position.y = groundY(avatar.position.x, avatar.position.z);

  if (hold) {
    holdT += dt;
    const need = hold === 'incense' ? 1.15 : 0.9;
    if (holdT >= need) {
      const kind = hold;
      hold = null;
      if (kind === 'incense') { reward(eco.grant(save, today, 'incense')); blip(660, 0.25, 'sine', 0.04); }
      if (kind === 'bow') { reward(eco.grant(save, today, 'bow')); }
    }
  }
  if (ensureDay().done.incense && smokes.length < 24 && Math.random() < dt * 10) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeMap, transparent: true, opacity: 0.45, depthWrite: false }));
    s.position.set(0, 0.9, 3.4);
    s.scale.setScalar(0.35);
    s.userData = { life: 1, vy: 0.6 + Math.random() * 0.4 };
    scene.add(s);
    smokes.push(s);
  }
  for (let i = smokes.length - 1; i >= 0; i--) {
    const s = smokes[i];
    s.position.y += s.userData.vy * dt;
    s.userData.life -= dt * 0.35;
    s.material.opacity = Math.max(0, s.userData.life * 0.4);
    s.scale.setScalar(0.35 + (1 - s.userData.life) * 0.8);
    if (s.userData.life <= 0) { scene.remove(s); smokes.splice(i, 1); }
  }
  if (raining) {
    rainT += dt;
    if (rainSpawned < 16 && rainT > rainSpawned * 0.35) {
      const mesh = new THREE.Mesh(yuanbaoGeo(0.35), goldMat);
      mesh.position.set((Math.random() - 0.5) * 3.2, 7.5, -8 + (Math.random() - 0.5) * 2.4);
      mesh.userData = { vy: 0, got: false, age: 0 };
      scene.add(mesh);
      coins.push(mesh);
      rainSpawned++;
    }
    if (rainT > 9) raining = false;
  }
  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    c.userData.vy -= 9 * dt;
    c.position.y += c.userData.vy * dt;
    c.rotation.y += dt * 3;
    c.rotation.x += dt;
    if (c.position.y < 1.05) { c.position.y = 1.05; c.userData.vy *= -0.25; c.userData.age += dt; }
    const dx = avatar.position.x - c.position.x, dz = avatar.position.z - c.position.z;
    if (!c.userData.got && c.position.y < 1.8 && dx * dx + dz * dz < 0.55) {
      c.userData.got = true;
      blip(1320, 0.07, 'square', 0.04);
      reward(eco.grant(save, today, 'coin'));
    }
    if (c.userData.got || c.userData.age > 1.4) { scene.remove(c); coins.splice(i, 1); }
  }
  if (props.bellG.userData.mesh.rotation.z > 0.01) props.bellG.userData.mesh.rotation.z *= 0.92;

  const dly = ensureDay();
  if (!dly.done.checkin && avatar.position.z < 12) reward(eco.grant(save, today, 'checkin'));

  const n = nearest();
  if (!n || sheetOpen) actBtn.hidden = true;
  else {
    actBtn.hidden = false;
    actBtn.textContent = hold ? n.label() + ' ' + Math.min(100, Math.round(holdT / 1.1 * 100)) + '%' : n.label();
  }

  if (camLock) {
    camera.position.copy(camLock.pos);
    camera.lookAt(camLock.target);
  } else {
    const yaw = avatar.rotation.y;
    camPos.set(
      avatar.position.x - Math.sin(yaw) * 6.4,
      avatar.position.y + 3.5,
      avatar.position.z - Math.cos(yaw) * 6.4
    );
    camera.position.lerp(camPos, 1 - Math.pow(0.02, dt));
    camera.lookAt(avatar.position.x, avatar.position.y + 1.35, avatar.position.z);
  }
  renderer.render(scene, camera);
}
hud();
if (!save.helpSeen) openHelp();
else say('走进殿里。财运只是游戏分数。');
requestAnimationFrame(frame);

window.__cs3d = {
  get avatar() { return avatar; },
  save, eco, statue, camera, scene,
  setPos(x, y, z) { camLock = null; avatar.position.set(x, y, z); camera.position.set(x, y + 3.6, z + 6.2); },
  look(px, py, pz, tx, ty, tz) { camLock = { pos: new THREE.Vector3(px, py, pz), target: new THREE.Vector3(tx, ty, tz) }; },
  wear(o) { save.outfit = o; rebuildAvatar(); },
  ready: true
};
