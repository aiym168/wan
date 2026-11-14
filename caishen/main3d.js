/**
 * 云阶财神殿 · 三维竖切
 * 殿院：3D Assets「Imperial China Palace and Garden」，CC0。
 * 行人：Quaternius King / Witch，CC0，骨骼在、片段不在，走和作揖由本页驱动。
 * 天光：Poly Haven「Kiara 1 Dawn」，CC0，Greg Zaal。
 * 财神：本页原创车削模型。没有拿到可下载的合规雕塑。署名见 CREDITS.md。
 * 财运规则仍走 economy.js。
 */
import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/loaders/GLTFLoader.js';
import { RGBELoader } from './vendor/three/loaders/RGBELoader.js';
import { EffectComposer } from './vendor/three/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/three/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/three/postprocessing/UnrealBloomPass.js';

const eco = window.CSEconomy;
const KEY = 'caishen.v1';
const canvas = document.getElementById('view');
const actBtn = document.getElementById('act');
const sheet = document.getElementById('sheet');
const scoreEl = document.getElementById('score');
const live = document.getElementById('live');
const joyEl = document.getElementById('joy');
const knob = document.getElementById('knob');

const SKIN = [0xf3c7a4, 0xe2ad86, 0xc48860, 0x8d5a3c, 0xf8d8ba];
const HAIR = [0x1a1412, 0x3a2a22, 0x4a3424, 0x2c2430, 0x5c5148];
const CLOTH = [0x8e2430, 0xf4efe4, 0x1c6b4a, 0x2a4f86, 0x1a1a1a, 0xc4552a, 0xd4a017];
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
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
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
  } catch (e) { /* 本地存档坏了就从新档开始 */ }
  return {};
}

let save = Object.assign({
  outfit: null, lifetime: 0, days: {}, once: {}, gild: [], wishes: [], charms: [],
  notes: [], salt: Math.floor(Math.random() * 1e9), mute: false, helpSeen: false, px: 0, pz: 3
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
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* 隐私模式写不进 */ }
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
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.5));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.78;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc9866a);
scene.fog = new THREE.FogExp2(0xcbb59a, 0.016);
const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.08, 80);
camera.position.set(0, 4, 12);

const hemi = new THREE.HemisphereLight(0xffe2c4, 0x3a2a22, 0.35);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d8, 1.65);
sun.position.set(-8, 18, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 48;
sun.shadow.camera.left = sun.shadow.camera.bottom = -18;
sun.shadow.camera.right = sun.shadow.camera.top = 18;
sun.shadow.bias = -0.0004;
scene.add(sun);

const avatar = new THREE.Group();
const spawnX = Math.abs(save.px) < 14 ? save.px : 0;
const spawnZ = save.pz > -14 && save.pz < 14 ? save.pz : 6;
avatar.position.set(spawnX, 0, spawnZ);
avatar.rotation.y = Math.PI;
scene.add(avatar);

let palace = null;
let statue = null;
const statueGold = [];
const loader = new GLTFLoader();
const models = {};
let bones = {};
let rest = {};
let hatAnchor = null;

const useBloom = !mobile && !reduceMotion;
let composer = null;
let bloomPass = null;
if (useBloom) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.16, 0.32, 0.96);
  composer.addPass(bloomPass);
}

function goldMat(emissive, track) {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xffd36a, metalness: 1, roughness: 0.2, envMapIntensity: 1.35,
    emissive: 0x4a2c08, emissiveIntensity: emissive == null ? 0.18 : emissive
  });
  if (track !== false) statueGold.push(m);
  return m;
}
function lacquerMat() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x8c1e28, metalness: 0.12, roughness: 0.36,
    clearcoat: 0.55, clearcoatRoughness: 0.28, sheen: 0.35, sheenRoughness: 0.4,
    sheenColor: new THREE.Color(0xffc2b0)
  });
}
function skinMat() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xf0c4a0, roughness: 0.52, metalness: 0, sheen: 0.2, sheenRoughness: 0.6,
    sheenColor: new THREE.Color(0xffd0b0)
  });
}
function clothMat(color) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.72, metalness: 0, sheen: 0.15, sheenRoughness: 0.7 });
}

function foldLathe(pts, seg, folds, amp) {
  const g = new THREE.LatheGeometry(pts, seg);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const ang = Math.atan2(z, x);
    const r = Math.hypot(x, z);
    const f = 1 + amp * Math.sin(ang * folds + y * 3);
    p.setXYZ(i, Math.cos(ang) * r * f, y, Math.sin(ang) * r * f);
  }
  g.computeVertexNormals();
  return g;
}

function faceGeo() {
  const pts = [
    [0.05, 0.02], [0.16, 0.08], [0.28, 0.2], [0.36, 0.38], [0.4, 0.55],
    [0.38, 0.72], [0.3, 0.88], [0.2, 1.0], [0.08, 1.08]
  ].map((v) => new THREE.Vector2(v[0], v[1]));
  const g = new THREE.LatheGeometry(pts, 36);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const ang = Math.atan2(x, z);
    const front = Math.max(0, Math.cos(ang));
    if (y > 0.42 && y < 0.62) z += front * 0.1;
    if (y > 0.58 && y < 0.72 && Math.abs(ang) > 0.35 && Math.abs(ang) < 1.1) z -= 0.03;
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

function yuanbaoGeo(scale) {
  const s = new THREE.Shape();
  s.moveTo(-0.32, 0);
  s.quadraticCurveTo(-0.42, 0.24, -0.12, 0.16);
  s.quadraticCurveTo(0, 0.46, 0.12, 0.16);
  s.quadraticCurveTo(0.42, 0.24, 0.32, 0);
  s.quadraticCurveTo(0, -0.12, -0.32, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
  g.scale(scale, scale, scale);
  g.center();
  return g;
}

function paintLabel(c, text) {
  const g = c.getContext('2d');
  const w = c.width, h = c.height;
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#f6edd4';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6e2430';
  g.lineWidth = Math.max(8, h * 0.06);
  g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = '#6e2430';
  g.font = '700 ' + Math.floor(h * 0.5) + 'px "WenQuanYi Micro Hei","Noto Sans SC","PingFang SC",sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, w / 2, h * 0.54);
}
function plaque(text, w, h) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  paintLabel(c, text);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide }));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { paintLabel(c, text); t.needsUpdate = true; });
  return mesh;
}

function buildStatue() {
  const g = new THREE.Group();
  const gold = goldMat();
  const red = new THREE.MeshPhysicalMaterial({
    color: 0x8e1a22, metalness: 0.12, roughness: 0.34,
    clearcoat: 0.45, clearcoatRoughness: 0.3, sheen: 0.2, sheenRoughness: 0.45,
    sheenColor: new THREE.Color(0xe8b090)
  });
  const skin = skinMat();
  const black = new THREE.MeshStandardMaterial({ color: 0x140e0c, roughness: 0.55 });
  const jade = new THREE.MeshPhysicalMaterial({ color: 0x1c7a58, roughness: 0.28, metalness: 0.2, clearcoat: 0.35 });

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.55, 0.16), red);
  back.position.set(0, 1.45, -0.42);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.2, 1.05), red);
  seat.position.set(0, 0.72, 0.05);
  const goldFrame = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.08, 0.2), gold);
  goldFrame.position.set(0, 2.18, -0.4);
  g.add(back, seat, goldFrame);
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.14), red);
    post.position.set(side * 0.72, 1.05, 0.15);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), gold);
    finial.position.set(side * 0.72, 1.42, 0.15);
    g.add(post, finial);
  }

  const robePts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    robePts.push(new THREE.Vector2(0.62 - t * 0.3, 0.72 + t * 0.72));
  }
  const robe = new THREE.Mesh(foldLathe(robePts, 36, 10, 0.028), red);
  g.add(robe);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 8, 20), jade);
  belt.rotation.x = Math.PI / 2;
  belt.position.set(0, 1.05, 0.08);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.05), gold);
  buckle.position.set(0, 1.05, 0.4);
  g.add(belt, buckle);
  for (const sx of [-0.16, 0.16]) {
    const roundel = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 8, 14), gold);
    roundel.position.set(sx, 1.28, 0.38);
    g.add(roundel);
  }

  const head = new THREE.Group();
  head.position.set(0, 1.78, 0.06);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.28, 28, 20), skin);
  skull.scale.set(1.05, 0.96, 0.92);
  head.add(skull);
  for (const ex of [-0.09, 0.09]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), new THREE.MeshStandardMaterial({ color: 0xf7f3ee, roughness: 0.35 }));
    white.scale.set(1.2, 0.85, 0.55);
    white.position.set(ex, 0.04, 0.24);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), black);
    pupil.position.set(ex, 0.04, 0.28);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.02), black);
    brow.position.set(ex, 0.12, 0.24);
    brow.rotation.z = ex < 0 ? 0.25 : -0.25;
    head.add(white, pupil, brow);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), skin);
  nose.scale.set(0.7, 0.75, 1.05);
  nose.position.set(0, -0.02, 0.26);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 14, Math.PI), new THREE.MeshStandardMaterial({ color: 0xb85a52, roughness: 0.45 }));
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.12, 0.24);
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), skin);
  earL.scale.set(0.45, 1, 0.6);
  earL.position.set(-0.28, 0.0, 0);
  const earR = earL.clone();
  earR.position.x = 0.28;
  head.add(nose, smile, earL, earR);
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 12), black);
  beard.rotation.x = Math.PI;
  beard.position.set(0, -0.38, 0.12);
  const moust = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.16, 4, 8), black);
  moust.rotation.z = Math.PI / 2;
  moust.position.set(0, -0.16, 0.26);
  head.add(beard, moust);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.16, 16), black);
  cap.position.set(0, 0.32, 0);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 0.08), black);
  wing.position.set(0, 0.3, 0);
  const wingGold = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.012, 0.09), gold);
  wingGold.position.set(0, 0.32, 0);
  const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshStandardMaterial({
    color: 0xc43838, emissive: 0x661818, emissiveIntensity: 0.45, roughness: 0.3
  }));
  jewel.position.set(0, 0.4, 0.16);
  head.add(cap, wing, wingGold, jewel);
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.52, 40), new THREE.MeshBasicMaterial({
    color: 0xffe7a8, side: THREE.DoubleSide, transparent: true, opacity: 0.85
  }));
  halo.position.set(0, 0.15, -0.2);
  head.add(halo);
  g.add(head);
  const glow = new THREE.PointLight(0xffc56a, 4, 4.5, 2);
  glow.position.set(0, 2.1, 0.6);
  g.add(glow);

  const leftIngot = new THREE.Mesh(yuanbaoGeo(0.55), gold);
  leftIngot.position.set(-0.28, 1.15, 0.42);
  const rightIngot = new THREE.Mesh(yuanbaoGeo(0.55), gold);
  rightIngot.position.set(0.28, 1.15, 0.42);
  g.add(leftIngot, rightIngot);

  const bowlPts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    bowlPts.push(new THREE.Vector2(0.16 + Math.sin(t * Math.PI) * 0.2, t * 0.22));
  }
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(bowlPts, 20), gold);
  bowl.position.set(0, 0.72, 0.72);
  g.add(bowl);
  [[-0.08, 0.12], [0.08, 0.1], [0, 0.18]].forEach((p, i) => {
    const yb = new THREE.Mesh(yuanbaoGeo(0.22), gold);
    yb.position.set(p[0], 0.9 + p[1], 0.72);
    g.add(yb);
  });

  const board = plaque('招财进宝', 1.15, 0.36);
  board.position.set(0, 0.42, 0.95);
  g.add(board);

  g.position.set(0, 1.12, -9.4);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(g);
  statue = g;
  return g;
}

function applyGild() {
  const n = (save.gild || []).length / 8;
  statueGold.forEach((m) => { m.emissiveIntensity = 0.18 + n * 0.85; });
}

const smokeMat = new THREE.SpriteMaterial({
  map: (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 4, 32, 32, 30);
    grd.addColorStop(0, 'rgba(255,250,240,.8)');
    grd.addColorStop(1, 'rgba(255,250,240,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })(),
  transparent: true, depthWrite: false
});
const smokes = [];
const coins = [];
const sparkles = [];

function modelName(outfit) {
  return (outfit.robe % 2 === 1) ? '女' : '男';
}

function buildHanfu(outfit) {
  const female = outfit.robe % 2 === 1;
  const g = new THREE.Group();
  const robeHex = female ? 0xf3c9c2 : 0xf6f1e6;
  const trimHex = (female ? [0x2f8f78, 0xc4556a, 0x2f8f78, 0x2456a6, 0x1a1a1a, 0xc4552a, 0xd4a017] : [0x2f8f78, 0x8e2430, 0x1c6b4a, 0x2456a6, 0x1a1a1a, 0xc4552a, 0xd4a017])[outfit.palette % 7];
  const robeM = new THREE.MeshPhysicalMaterial({
    color: robeHex, roughness: 0.58, metalness: 0.02, sheen: 0.35, sheenRoughness: 0.45,
    sheenColor: new THREE.Color(trimHex)
  });
  const trimM = new THREE.MeshPhysicalMaterial({ color: trimHex, roughness: 0.38, metalness: 0.22 });
  const skinM = new THREE.MeshPhysicalMaterial({ color: SKIN[outfit.skin % SKIN.length], roughness: 0.48, sheen: 0.15, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffd0b8) });
  const hairM = new THREE.MeshStandardMaterial({ color: HAIR[outfit.hairColor % HAIR.length], roughness: 0.42 });
  const shoeM = new THREE.MeshStandardMaterial({ color: 0x1a1614, roughness: 0.6 });

  function pivot(name, x, y, z) {
    const o = new THREE.Group();
    o.name = name;
    o.position.set(x, y, z);
    return o;
  }
  const thighL = pivot('thighL', -0.08, 0.9, 0);
  const thighR = pivot('thighR', 0.08, 0.9, 0);
  [thighL, thighR].forEach((th) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.38, 4, 8), female ? robeM : new THREE.MeshStandardMaterial({ color: 0x243038, roughness: 0.7 }));
    leg.position.y = -0.28;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.045, 0.16), shoeM);
    shoe.position.set(0, -0.52, 0.03);
    th.add(leg, shoe);
  });

  const skirtPts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    skirtPts.push(new THREE.Vector2(0.5 - t * 0.32, t * 0.78));
  }
  const skirt = new THREE.Mesh(foldLathe(skirtPts, 32, 9, 0.035), robeM);
  skirt.position.y = 0.06;
  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.012, 6, 24), trimM);
  hem.rotation.x = Math.PI / 2;
  hem.position.y = 0.08;
  const sash = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.028, 8, 18), trimM);
  sash.rotation.x = Math.PI / 2;
  sash.position.y = 0.92;

  const chest = pivot('chest', 0, 1.08, 0);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.19, 0.38, 16), robeM);
  torso.position.y = 0.08;
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 6, 14), trimM);
  collar.rotation.x = Math.PI / 2.4;
  collar.position.set(0, 0.24, 0.04);
  const sleeveL = pivot('sleeveL', -0.2, 0.22, 0);
  const sleeveR = pivot('sleeveR', 0.2, 0.22, 0);
  [sleeveL, sleeveR].forEach((s, i) => {
    const cloth = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.13, 0.52, 12), robeM);
    cloth.position.y = -0.22;
    cloth.rotation.z = i === 0 ? 0.5 : -0.5;
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 6, 12), trimM);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.46;
    s.add(cloth, cuff);
  });

  const head = pivot('head', 0, 0.48, 0);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.125, 24, 18), skinM);
  skull.scale.set(0.92, 1.06, 0.95);
  head.add(skull);
  for (const ex of [-0.042, 0.042]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshStandardMaterial({ color: 0xf7f4ef, roughness: 0.3 }));
    eye.scale.set(1.15, 0.8, 0.5);
    eye.position.set(ex, 0.02, 0.105);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), new THREE.MeshStandardMaterial({ color: 0x1a120e }));
    iris.position.set(ex, 0.02, 0.118);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.006, 0.008), hairM);
    brow.position.set(ex, 0.05, 0.1);
    head.add(eye, iris, brow);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), skinM);
  nose.scale.set(0.65, 0.8, 1.1);
  nose.position.set(0, -0.005, 0.118);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.0035, 4, 10, Math.PI), new THREE.MeshStandardMaterial({ color: 0xc46a62, roughness: 0.45 }));
  mouth.rotation.z = Math.PI;
  mouth.position.set(0, -0.04, 0.11);
  head.add(nose, mouth);
  if (female) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.132, 16, 12), hairM);
    cap.scale.set(1, 0.85, 1);
    cap.position.y = 0.03;
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), hairM);
    bun.position.set(0, 0.15, -0.02);
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.04), trimM);
    ribbon.position.set(0, 0.14, -0.01);
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.32, 4, 6), hairM);
    tail.position.set(0.08, -0.08, -0.05);
    head.add(cap, bun, ribbon, tail);
  } else {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.128, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.65), hairM);
    cap.position.y = 0.02;
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), hairM);
    knot.position.set(0, 0.15, -0.02);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.16, 6), trimM);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(0, 0.15, -0.01);
    head.add(cap, knot, pin);
  }
  chest.add(torso, collar, sleeveL, sleeveR, head);
  g.add(thighL, thighR, skirt, hem, sash, chest);
  g.userData.limbs = { thighL, thighR, sleeveL, sleeveR, chest, head };
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

async function showCharacter(outfit) {
  avatar.children.slice().forEach((ch) => avatar.remove(ch));
  const fig = buildHanfu(outfit);
  avatar.add(fig);
  avatar.userData.limbs = fig.userData.limbs;
}

function pose(moving, bowing, phase, t) {
  const L = avatar.userData.limbs;
  if (!L) return;
  const s = Math.sin(phase);
  const swing = reduceMotion ? s * 0.2 : s * 0.5;
  L.thighL.rotation.x = moving ? swing : 0;
  L.thighR.rotation.x = moving ? -swing : 0;
  L.sleeveL.rotation.x = bowing ? 0.9 : (moving ? -s * 0.4 : Math.sin(t * 1.3) * 0.05);
  L.sleeveR.rotation.x = bowing ? 0.9 : (moving ? s * 0.4 : Math.sin(t * 1.3) * 0.05);
  L.sleeveL.rotation.z = bowing ? 0.4 : 0.15;
  L.sleeveR.rotation.z = bowing ? -0.4 : -0.15;
  L.chest.rotation.x = bowing ? 0.62 : Math.sin(t * 1.5) * 0.02;
  L.head.rotation.x = bowing ? 0.45 : 0;
}

function addCloudSea() {
  const puff = new THREE.MeshLambertMaterial({ color: 0xfff8f2, transparent: true, opacity: 0.9, depthWrite: false });
  for (let i = 0; i < 22; i++) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(1.8 + (i % 5) * 0.45, 12, 8), puff);
    c.scale.y = 0.32;
    const ang = i / 22 * Math.PI * 2;
    const rad = 12 + (i % 4) * 4.5;
    c.position.set(Math.cos(ang) * rad, -2.2 - (i % 3) * 0.8, Math.sin(ang) * rad);
    scene.add(c);
  }
  const rock = new THREE.MeshLambertMaterial({ color: 0x8ea0ae });
  [[-32, -18, -42, 18], [26, -14, -46, 24], [6, -10, -54, 16], [-46, -12, 6, 14]].forEach((m) => {
    const peak = new THREE.Mesh(new THREE.ConeGeometry(m[3] * 0.62, m[3], 6), rock);
    peak.position.set(m[0], m[1] + m[3] / 2, m[2]);
    scene.add(peak);
  });
  const span = new THREE.Mesh(
    new THREE.TorusGeometry(7, 0.22, 6, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xd8d0c4, roughness: 0.78 })
  );
  span.rotation.z = Math.PI;
  span.rotation.y = 0.4;
  span.position.set(-16, 3.2, -30);
  scene.add(span);
}

function dressPalace(root) {
  const lanternPos = [];
  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m || !m.color) return;
        const key = (m.name || '').toLowerCase();
        const look = key.includes('glaze') ? [0x2a8f7a, 0.42, 0.28]
          : key.includes('lacquer') ? [0x8e1c24, 0.08, 0.34]
          : key.includes('stone') ? [0xe6dfd4, 0.02, 0.84]
          : key.includes('plaster') ? [0xf3eee4, 0, 0.9]
          : key.includes('paper') ? [0xf7f1e4, 0, 0.88]
          : key.includes('timber') || key === 'wood' ? [0x6a4030, 0.04, 0.7]
          : key.includes('bronze') ? [0xc6a15a, 0.92, 0.28]
          : null;
        if (look) {
          m.color.setHex(look[0]);
          m.metalness = look[1];
          m.roughness = look[2];
        }
        m.envMapIntensity = 0.85;
      });
    }
    let p = o;
    let lantern = false;
    while (p) {
      if (p.name && /lantern/i.test(p.name)) lantern = true;
      p = p.parent;
    }
    if (lantern && o.isMesh) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      o.material = mats.map((m) => {
        const c = m.clone();
        c.emissive = new THREE.Color(0xff6a2a);
        c.emissiveIntensity = 0.9;
        return c;
      });
      if (o.material.length === 1) o.material = o.material[0];
      const wp = new THREE.Vector3();
      o.getWorldPosition(wp);
      if (wp.y > 0.4 && lanternPos.every((q) => q.distanceTo(wp) > 1.2)) lanternPos.push(wp.clone());
    }
  });
  lanternPos.slice(0, mobile ? 3 : 6).forEach((p) => {
    const pl = new THREE.PointLight(0xffb060, 5, 7, 2);
    pl.position.copy(p);
    scene.add(pl);
  });
}

const raycaster = new THREE.Raycaster();
const _down = new THREE.Vector3(0, -1, 0);
const _origin = new THREE.Vector3();
const _wallDir = new THREE.Vector3();
const _n = new THREE.Vector3();
function groundAt(x, z) {
  if (!palace) return 0;
  _origin.set(x, 4.2, z);
  raycaster.set(_origin, _down);
  raycaster.far = 6;
  const hits = raycaster.intersectObject(palace, true);
  for (let i = 0; i < hits.length; i++) {
    if (hits[i].point.y < 2.3) return hits[i].point.y;
  }
  return 0;
}
function blockedMove(x, z, mx, mz) {
  if (Math.abs(x + mx) > 15.4 || z + mz > 15.6 || z + mz < -15.4) return true;
  if (!palace) return false;
  _origin.set(x, groundAt(x, z) + 1.25, z);
  _wallDir.set(mx, 0, mz);
  if (_wallDir.lengthSq() < 1e-8) return false;
  _wallDir.normalize();
  raycaster.set(_origin, _wallDir);
  raycaster.far = 0.34;
  const targets = statue ? [palace, statue] : [palace];
  const hits = raycaster.intersectObjects(targets, true);
  let blocked = false;
  for (let i = 0; i < hits.length; i++) {
    const h = hits[i];
    if (!h.face) continue;
    _n.copy(h.face.normal).transformDirection(h.object.matrixWorld);
    if (Math.abs(_n.y) > 0.55) continue;
    let p = h.object;
    let name = '';
    while (p) { name += ' ' + (p.name || ''); p = p.parent; }
    if (/lantern|peony|bamboo|plum|lotus|bonsai|banner|pennant|blossom|scroll|cushion|tea|guqin|parasol|dummy|well/i.test(name)) continue;
    lastHit = name.trim();
    blocked = true;
    break;
  }
  return blocked;
}
let lastHit = '';

let audioCtx = null;
function blip(freq, dur, type, gain) {
  if (save.mute) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.value = gain || 0.04;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch (e) { /* 没声音也能玩 */ }
}
function audioUnlock() { try { blip(0, 0.01, 'sine', 0.0001); } catch (e) {} }

function hud() {
  const d = ensureDay();
  scoreEl.innerHTML = '<b>财运 ' + (save.lifetime || 0) + '</b><small>游戏分数 · 今日 ' + (d.earned || 0) + '/' + eco.DAILY_CAP + ' · 金雨 ' + (d.coins || 0) + '/' + eco.COIN_MAX + '</small>';
}
function say(text) { live.textContent = text; }
function reward(r) {
  if (!r) return;
  hud();
  if (r.amount > 0) {
    say('+' + r.amount + ' ' + (r.reason || ''));
    blip(880, 0.08, 'triangle', 0.05);
  } else if (r.reason) say(r.reason);
  persist();
}

let sheetOpen = false;
function openSheet(html) {
  sheetOpen = true;
  sheet.hidden = false;
  sheet.innerHTML = html;
  sheet.querySelectorAll('[data-close]').forEach((b) => { b.onclick = closeSheet; });
}
function closeSheet() {
  sheetOpen = false;
  sheet.hidden = true;
  sheet.innerHTML = '';
}
sheet.addEventListener('pointerdown', (e) => { if (e.target === sheet) closeSheet(); });
function openHelp() {
  openSheet('<h2>进云阶殿</h2><p>这是一座虚构的三维殿院。电脑用 WASD 或方向键，也可以点地面。手机用左下摇杆。</p><p>走近香炉可上香。在财神前按住作揖，他会撒出元宝。接到身上才显示真实的财运加分，一天有上限。</p><p class="muted">财运是游戏分数。累计 100 才打开贴金，不扣分。不收款，不预测发财。出处在「署名」。</p><button type="button" id="goin">我走了</button>');
  sheet.querySelector('#goin').onclick = () => { save.helpSeen = true; closeSheet(); persist(); };
}
function openJournal() {
  const d = ensureDay();
  openSheet('<h2>手帐</h2><p>累计财运 <b>' + (save.lifetime || 0) + '</b> · 今日 <b>' + (d.earned || 0) + '/' + eco.DAILY_CAP + '</b> · 金雨 <b>' + (d.coins || 0) + '/' + eco.COIN_MAX + '</b></p><div class="bar"><i style="width:' + Math.min(100, (save.lifetime || 0) / eco.GOLD_AT * 100) + '%"></i></div><p class="muted">贴金身在累计 ' + eco.GOLD_AT + ' 时永久打开，不扣分。这是游戏分数。云阶殿是虚构的。</p><button type="button" data-close>合上</button>');
}
function openCredits() {
  openSheet('<h2>署名</h2><p>殿院：3D Assets，Imperial China Palace and Garden，CC0。本页改成青绿琉璃、朱红和泥金。</p><p>行人与财神：本页原创。没有下到可改的汉服角色或财神雕塑。</p><p>天光：Greg Zaal，Kiara 1 Dawn，Poly Haven，CC0。</p><p>引擎：Three.js r170，MIT。</p><p class="muted">完整链接在 caishen/CREDITS.md。没有付费素材，也没有 Sansa。</p><button type="button" data-close>合上</button>');
}
function openWardrobe() {
  const o = save.outfit;
  const who = modelName(o) === '女' ? '女式广袖' : '男式交领';
  const line = (key, label) => '<div class="row"><button type="button" data-k="' + key + '" data-d="-1">上一个</button><b>' + esc(label) + '</b><button type="button" data-k="' + key + '" data-d="1">下一个</button></div>';
  openSheet('<h2>衣冠</h2><p class="muted">殿里走着的就是你。换的是这一套可换色的角色，会立刻穿上，只存在这台浏览器。</p>' +
    line('robe', '身形 · ' + who + ' · ' + NAMES.robe[o.robe]) +
    line('palette', '衣色 ' + (o.palette + 1)) +
    line('skin', '肤色 ' + (o.skin + 1)) +
    line('hairColor', '发色 ' + (o.hairColor + 1)) +
    line('hat', NAMES.hat[o.hat] || '不戴冠') +
    '<button type="button" id="reroll">换一套</button><button type="button" data-close>穿好了</button>');
  sheet.querySelector('#reroll').onclick = () => { save.outfit = rollOutfit(Math.random); showCharacter(save.outfit); persist(); openWardrobe(); };
  sheet.querySelectorAll('[data-k]').forEach((b) => {
    b.onclick = () => cycle(b.getAttribute('data-k'), Number(b.getAttribute('data-d')));
  });
}
function cycle(key, dir) {
  const u = eco.unlocks(save.lifetime || 0)[key];
  let i = u.indexOf(save.outfit[key]);
  if (i < 0) i = 0;
  save.outfit[key] = u[(i + dir + u.length) % u.length];
  showCharacter(save.outfit);
  persist();
  openWardrobe();
}
function openGoldLock() {
  const n = save.lifetime || 0;
  openSheet('<h2>金身还锁着</h2><p>累计获得的财运到 <b>' + eco.GOLD_AT + '</b> 就永久打开，不扣除这 ' + eco.GOLD_AT + ' 分。</p><div class="bar"><i style="width:' + Math.min(100, n / eco.GOLD_AT * 100) + '%"></i></div><p>现在 ' + n + ' / ' + eco.GOLD_AT + '。这是游戏分数。</p><button type="button" data-close>再去走走</button>');
}

const spots = [
  { id: 'incense', x: -4.2, z: -1.2, r: 1.7, label: () => ensureDay().done.incense ? '香还燃着' : '按住上香', hold: 'incense' },
  { id: 'bell', x: -10.2, z: -2, r: 1.6, label: () => '敲钟', press: 'bell' },
  { id: 'bow', x: 0, z: -8.6, r: 1.8, label: () => '按住作揖', hold: 'bow' },
  { id: 'rain', x: -5.2, z: 1.7, r: 1.6, label: () => '坐下，等金雨', press: 'rain' },
  { id: 'mirror', x: 3.5, z: 6, r: 1.6, label: () => '衣冠', press: 'mirror' },
  { id: 'gild', x: 0.8, z: -9.4, r: 1.5, label: () => (save.lifetime || 0) >= eco.GOLD_AT ? '贴一片金' : '金身未开', press: 'gild' }
];
function nearest() {
  let best = null, bestD = 1e9;
  for (const s of spots) {
    const dx = avatar.position.x - s.x, dz = avatar.position.z - s.z;
    const d = Math.hypot(dx, dz);
    if (d < s.r && d < bestD) { best = s; bestD = d; }
  }
  return best;
}
let hold = null, holdT = 0, holdStart = 0, raining = false, rainT = 0, rainSpawned = 0;
function pressSpot(s) {
  audioUnlock();
  if (s.press === 'bell') {
    blip(392, 0.7, 'sine', 0.05);
    blip(784, 0.5, 'sine', 0.03);
    reward(eco.grant(save, today, 'bell'));
  } else if (s.press === 'rain') {
    raining = true; rainT = 0; rainSpawned = 0;
    say('金雨来了，走过去接。');
  } else if (s.press === 'mirror') openWardrobe();
  else if (s.press === 'gild') {
    if ((save.lifetime || 0) < eco.GOLD_AT) { openGoldLock(); return; }
    const have = save.gild || [];
    let id = 0;
    while (have.indexOf(id) >= 0 && id < 8) id++;
    if (id >= 8) { say('金身已经贴满。'); return; }
    reward(eco.grant(save, today, 'gild', { id: id }));
    applyGild();
  }
}
const gifts = [];
function scatterIngots() {
  const from = new THREE.Vector3(0, 3.05, -9.2);
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(yuanbaoGeo(0.7), goldMat(0.55, false));
    const start = from.clone().add(new THREE.Vector3((i - 3) * 0.22, (i % 3) * 0.08, 0.4));
    m.position.copy(start);
    m.userData = { t: -i * 0.05, from: start, to: avatar.position.clone() };
    scene.add(m);
    gifts.push(m);
  }
}
function finishHold(kind) {
  if (kind === 'incense') reward(eco.grant(save, today, 'incense'));
  if (kind === 'bow') {
    const r = eco.grant(save, today, 'bow');
    scatterIngots();
    reward(r);
  }
  hold = null; holdT = 0;
}

const keys = {};
window.addEventListener('keydown', (e) => {
  if (sheetOpen && e.key !== 'Escape') return;
  keys[e.key.toLowerCase()] = true;
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
  const s = nearest();
  if (!s || sheetOpen) return;
  if (s.hold) { hold = s.hold; holdT = 0; holdStart = performance.now(); }
  else pressSpot(s);
}
actBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); actDown(); });
actBtn.addEventListener('pointerup', () => { hold = null; });
actBtn.addEventListener('pointerleave', () => { hold = null; });

const joy = { on: false, x: 0, z: 0, id: null };
function moveJoy(e) {
  const r = joyEl.getBoundingClientRect();
  let dx = e.clientX - (r.left + r.width / 2);
  let dy = e.clientY - (r.top + r.height / 2);
  const len = Math.hypot(dx, dy) || 1;
  const m = Math.min(40, len);
  dx = dx / len * m; dy = dy / len * m;
  joy.on = true;
  joy.x = dx / 40;
  joy.z = dy / 40;
  knob.style.left = (36 + dx) + 'px';
  knob.style.top = (36 + dy) + 'px';
}
joyEl.addEventListener('pointerdown', (e) => { joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); moveJoy(e); });
joyEl.addEventListener('pointermove', (e) => { if (joy.id === e.pointerId) moveJoy(e); });
function endJoy(e) { if (joy.id === e.pointerId) { joy.on = false; joy.x = joy.z = 0; joy.id = null; knob.style.left = '36px'; knob.style.top = '36px'; } }
joyEl.addEventListener('pointerup', endJoy);
joyEl.addEventListener('pointercancel', endJoy);
if (matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) document.body.classList.add('touch');

const pointer = new THREE.Vector2();
let target = null;
canvas.addEventListener('pointerdown', (e) => {
  if (e.button != null && e.button !== 0) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (!palace) return;
  const hits = raycaster.intersectObject(palace, true);
  const hit = hits.find((h) => h.point.y < 2.4);
  if (hit) target = { x: hit.point.x, z: hit.point.z };
});

document.getElementById('btn-book').addEventListener('click', openJournal);
const creditBtn = document.getElementById('btn-credit');
if (creditBtn) creditBtn.addEventListener('click', openCredits);
document.getElementById('btn-mute').addEventListener('click', toggleMute);
function toggleMute() {
  save.mute = !save.mute;
  document.getElementById('btn-mute').setAttribute('aria-pressed', save.mute ? 'true' : 'false');
  document.getElementById('btn-mute').textContent = save.mute ? '已静音' : '声音';
  persist();
}
if (save.mute) toggleMute();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.15 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (composer) composer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener('pagehide', persist);

let camLock = null;
const camPos = new THREE.Vector3();
const clock = new THREE.Clock();
let phase = 0;
let ready = false;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.033, clock.getDelta());
  const t = clock.elapsedTime;
  let mx = 0, mz = 0, mag = 0;
  if (!sheetOpen && ready) {
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
      if (dist < 0.28) target = null;
      else { mx = dx / dist; mz = dz / dist; mag = Math.min(1, dist / 1.2); }
    }
  }
  const moving = mag > 0;
  if (moving) {
    let nx = avatar.position.x + mx * 3.6 * dt;
    let nz = avatar.position.z + mz * 3.6 * dt;
    const blocked = blockedMove(avatar.position.x, avatar.position.z, nx - avatar.position.x, nz - avatar.position.z);
    if (blocked) {
      if (!blockedMove(avatar.position.x, avatar.position.z, nx - avatar.position.x, 0)) nz = avatar.position.z;
      else if (!blockedMove(avatar.position.x, avatar.position.z, 0, nz - avatar.position.z)) nx = avatar.position.x;
      else { nx = avatar.position.x; nz = avatar.position.z; }
    }
    const gy = groundAt(nx, nz);
    if (gy - avatar.position.y > 1.15) { nx = avatar.position.x; nz = avatar.position.z; }
    avatar.position.x = nx;
    avatar.position.z = nz;
    window.__dbg = { blocked, y: avatar.position.y, gy, z: nz, hit: lastHit };
    avatar.rotation.y = Math.atan2(mx, mz);
    phase += dt * (reduceMotion ? 4 : 8);
  }
  avatar.position.y = THREE.MathUtils.damp(avatar.position.y, groundAt(avatar.position.x, avatar.position.z), 10, dt);
  const bowing = hold === 'bow';
  pose(moving, bowing, phase, t);

  if (hold) {
    holdT = (performance.now() - holdStart) / 1000;
    const need = hold === 'incense' ? 1.15 : 0.9;
    if (holdT >= need) finishHold(hold);
  } else holdStart = 0;

  if (raining) {
    rainT += dt;
    if (rainSpawned < 10 && rainT > rainSpawned * 0.18) {
      rainSpawned++;
      const c = new THREE.Mesh(yuanbaoGeo(0.35), goldMat(0.4, false));
      c.position.set((Math.random() - 0.5) * 3.2, 6.2, (Math.random() - 0.5) * 3.2);
      c.userData = { vy: 0.2 + Math.random(), got: false, age: 0 };
      scene.add(c);
      coins.push(c);
    }
    if (rainT > 3.2) raining = false;
  }
  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    c.userData.vy -= 9 * dt;
    c.position.y += c.userData.vy * dt;
    c.rotation.y += dt * 3;
    if (c.position.y < avatar.position.y + 0.15) { c.position.y = avatar.position.y + 0.15; c.userData.vy *= -0.25; c.userData.age += dt; }
    const dx = avatar.position.x - c.position.x, dz = avatar.position.z - c.position.z;
    if (!c.userData.got && c.position.y < avatar.position.y + 1.5 && dx * dx + dz * dz < 0.7) {
      c.userData.got = true;
      blip(1320, 0.07, 'square', 0.04);
      reward(eco.grant(save, today, 'coin'));
      for (let k = 0; k < 5; k++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffe7a0, transparent: true, depthWrite: false }));
        s.position.copy(c.position);
        s.scale.setScalar(0.12);
        s.userData = { life: 0, vx: (Math.random() - 0.5), vy: 0.6 + Math.random(), vz: (Math.random() - 0.5) };
        scene.add(s);
        sparkles.push(s);
      }
    }
    if (c.userData.got || c.userData.age > 1.4) { scene.remove(c); coins.splice(i, 1); }
  }
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.userData.life += dt;
    s.position.x += s.userData.vx * dt;
    s.position.y += s.userData.vy * dt;
    s.position.z += s.userData.vz * dt;
    s.material.opacity = Math.max(0, 1 - s.userData.life * 1.6);
    if (s.userData.life > 0.7) { scene.remove(s); sparkles.splice(i, 1); }
  }
  if (ensureDay().done.incense && Math.random() < dt * 6) {
    const s = new THREE.Sprite(smokeMat.clone());
    s.position.set(-4.2 + (Math.random() - 0.5) * 0.2, 1.5, -1.2);
    s.scale.setScalar(0.25);
    s.userData = { life: 0 };
    scene.add(s);
    smokes.push(s);
  }
  for (let i = smokes.length - 1; i >= 0; i--) {
    const s = smokes[i];
    s.userData.life += dt;
    s.position.y += dt * 0.45;
    s.material.opacity = Math.max(0, 0.7 - s.userData.life);
    s.scale.setScalar(0.25 + s.userData.life * 0.5);
    if (s.userData.life > 1.3) { scene.remove(s); smokes.splice(i, 1); }
  }

  for (let i = gifts.length - 1; i >= 0; i--) {
    const m = gifts[i];
    m.userData.t += dt * 0.42;
    const u = Math.max(0, Math.min(1, m.userData.t));
    const ease = u * u * (3 - 2 * u);
    const home = avatar.position.clone();
    home.y += 1.15;
    m.userData.to.lerp(home, 0.35);
    m.position.lerpVectors(m.userData.from, m.userData.to, ease);
    m.position.y += Math.sin(u * Math.PI) * 1.35;
    m.rotation.y += dt * 4;
    m.rotation.z += dt * 2;
    if (u >= 1) {
      scene.remove(m);
      gifts.splice(i, 1);
    }
  }

  if (ready && !ensureDay().done.checkin && avatar.position.z < 12) reward(eco.grant(save, today, 'checkin'));

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
    camPos.set(avatar.position.x - Math.sin(yaw) * 5.2, avatar.position.y + 3.15, avatar.position.z - Math.cos(yaw) * 5.2);
    camera.position.lerp(camPos, 1 - Math.pow(0.0015, dt));
    camera.lookAt(avatar.position.x, avatar.position.y + 1.25, avatar.position.z);
  }
  if (composer) composer.render();
  else renderer.render(scene, camera);
}
hud();
requestAnimationFrame(frame);

async function boot() {
  say('殿宇正在展开');
  const rgbe = new RGBELoader();
  const hdrP = rgbe.loadAsync('assets/kiara_1_dawn_1k.hdr').then((tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(tex).texture;
    scene.background = tex;
    scene.backgroundBlurriness = 0.25;
    scene.backgroundIntensity = 0.38;
    scene.environmentIntensity = 0.65;
    pmrem.dispose();
  }).catch(() => { say('天光没载上，仍用日光。'); });
  const palaceP = loader.loadAsync('assets/palace.glb').then((gltf) => {
    palace = gltf.scene;
    dressPalace(palace);
    scene.add(palace);
  });
  await Promise.all([hdrP, palaceP]);
  addCloudSea();
  buildStatue();
  applyGild();
  const hallSign = plaque('财神殿', 2.4, 0.72);
  hallSign.position.set(0, 4.6, -1.15);
  scene.add(hallSign);
  await showCharacter(save.outfit);
  avatar.position.y = groundAt(avatar.position.x, avatar.position.z);
  ready = true;
  window.__cs3d.ready = true;
  if (!save.helpSeen) openHelp();
  else say('走进殿里。财运只是游戏分数。');
}
boot().catch((err) => { say('场景没有载上'); console.error(err); });

window.__cs3d = {
  get avatar() { return avatar; },
  get ready() { return ready; },
  set ready(v) { ready = v; },
  save, eco, camera, scene,
  setPos(x, y, z) {
    camLock = null;
    avatar.position.set(x, y || 0, z);
    avatar.position.y = groundAt(x, z);
  },
  look(px, py, pz, tx, ty, tz) {
    camLock = { pos: new THREE.Vector3(px, py, pz), target: new THREE.Vector3(tx, ty, tz) };
  },
  async wear(o) {
    save.outfit = Object.assign({}, save.outfit, o);
    await showCharacter(save.outfit);
  },
  lastHit() { return lastHit; }
};
