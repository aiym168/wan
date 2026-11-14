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
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc9866a);
scene.fog = new THREE.FogExp2(0xd7a888, 0.012);
const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.08, 80);
camera.position.set(0, 4, 12);

const hemi = new THREE.HemisphereLight(0xffe2c4, 0x3a2a22, 0.35);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d8, 1.35);
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
  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.32, 0.42, 0.84);
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
  const red = lacquerMat();
  const skin = skinMat();
  const black = new THREE.MeshStandardMaterial({ color: 0x16120e, roughness: 0.5, metalness: 0.05 });
  const jade = new THREE.MeshPhysicalMaterial({ color: 0x1c7a58, roughness: 0.28, metalness: 0.25, clearcoat: 0.4 });

  const throne = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.8, 0.18), red);
  throne.position.set(0, 1.35, -0.55);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.22, 1.15), red);
  seat.position.y = 0.62;
  g.add(throne, seat);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.7), red);
    arm.position.set(side * 0.78, 0.95, -0.05);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), gold);
    cap.position.set(side * 0.78, 1.18, 0.28);
    g.add(arm, cap);
  }

  const robePts = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const y = t * 1.05;
    let r = 0.78 - t * 0.46;
    if (t > 0.82) r = 0.26;
    robePts.push(new THREE.Vector2(Math.max(0.22, r), y));
  }
  const robe = new THREE.Mesh(foldLathe(robePts, 48, 9, 0.035), red);
  robe.position.y = 0.62;
  g.add(robe);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.045, 8, 24), jade);
  belt.rotation.x = Math.PI / 2;
  belt.position.set(0, 1.05, 0.02);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.06), gold);
  buckle.position.set(0, 1.05, 0.4);
  g.add(belt, buckle);
  for (const side of [-1, 1]) {
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.28, 6, 12), red);
    sleeve.rotation.z = side * 0.9;
    sleeve.position.set(side * 0.48, 1.22, 0.12);
    g.add(sleeve);
  }
  for (const sx of [-0.22, 0.22]) {
    const roundel = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 16), gold);
    roundel.position.set(sx, 1.35, 0.46);
    g.add(roundel);
  }

  const head = new THREE.Mesh(faceGeo(), skin);
  head.position.set(0, 1.72, 0.02);
  head.scale.setScalar(0.62);
  g.add(head);
  for (const ex of [-0.1, 0.1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshStandardMaterial({ color: 0xf7f1ea, roughness: 0.4 }));
    white.scale.set(1.15, 0.85, 0.6);
    white.position.set(ex, 2.14, 0.28);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), black);
    pupil.position.set(ex, 2.14, 0.31);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.012), black);
    brow.position.set(ex, 2.22, 0.28);
    brow.rotation.z = ex < 0 ? 0.3 : -0.3;
    g.add(white, pupil, brow);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), skin);
  nose.scale.set(0.7, 0.8, 1.2);
  nose.position.set(0, 2.05, 0.32);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.01, 6, 14, Math.PI), new THREE.MeshStandardMaterial({ color: 0xc44848, roughness: 0.45 }));
  smile.rotation.z = Math.PI;
  smile.position.set(0, 1.96, 0.3);
  g.add(nose, smile);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), skin);
    ear.scale.set(0.45, 0.9, 0.55);
    ear.position.set(side * 0.26, 2.1, 0.02);
    g.add(ear);
  }

  const beardPts = [0.02, 0.16, 0.2, 0.16, 0.18, 0.12, 0.04].map((r, i) => new THREE.Vector2(r, i * 0.16));
  const beard = new THREE.Mesh(new THREE.LatheGeometry(beardPts, 18), black);
  beard.scale.set(1.05, 1.15, 0.62);
  beard.position.set(0, 1.55, 0.36);
  const mustache = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.16, 4, 8), black);
  mustache.rotation.z = Math.PI / 2;
  mustache.position.set(0, 1.96, 0.34);
  g.add(beard, mustache);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.18, 16), black);
  cap.position.set(0, 2.42, 0);
  const wingGeo = new THREE.BoxGeometry(0.72, 0.035, 0.08);
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(wingGeo, black);
    wing.position.set(side * 0.5, 2.4, 0);
    wing.rotation.z = side * -0.12;
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.012, 0.09), gold);
    edge.position.copy(wing.position);
    edge.rotation.copy(wing.rotation);
    g.add(wing, edge);
  }
  const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshStandardMaterial({
    color: 0xc43838, emissive: 0x661111, emissiveIntensity: 0.5, roughness: 0.3
  }));
  jewel.position.set(0, 2.5, 0.16);
  g.add(cap, jewel);

  const halo = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.55, 40), new THREE.MeshBasicMaterial({
    color: 0xffe7a8, side: THREE.DoubleSide, transparent: true, opacity: 0.9
  }));
  halo.position.set(0, 2.28, -0.28);
  g.add(halo);
  const glow = new THREE.PointLight(0xffc56a, 6, 5, 2);
  glow.position.set(0, 2.2, 0.4);
  g.add(glow);

  const ingot = new THREE.Mesh(yuanbaoGeo(0.7), gold);
  ingot.position.set(0.05, 1.15, 0.42);
  ingot.rotation.x = -0.5;
  const ruyiPath = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.35, 1.2, 0.4),
    new THREE.Vector3(-0.05, 1.55, 0.55),
    new THREE.Vector3(0.12, 1.25, 0.48)
  );
  const ruyi = new THREE.Mesh(new THREE.TubeGeometry(ruyiPath, 16, 0.025, 6, false), gold);
  g.add(ingot, ruyi);

  const bowlPts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    bowlPts.push(new THREE.Vector2(0.12 + Math.sin(t * Math.PI) * 0.22, t * 0.28));
  }
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(bowlPts, 24), gold);
  bowl.position.set(0.85, 0.62, 0.15);
  g.add(bowl);
  [[-0.08, 0.18], [0.08, 0.16], [0, 0.26]].forEach((p, i) => {
    const yb = new THREE.Mesh(yuanbaoGeo(0.28 - i * 0.04), gold);
    yb.position.set(0.85 + p[0], 0.7 + p[1], 0.15);
    g.add(yb);
  });

  const board = plaque('招财进宝', 1.1, 0.34);
  board.position.set(0, 0.42, 0.7);
  g.add(board);

  g.position.set(0, 1.12, -10.2);
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
  return (outfit.robe % 2 === 1) ? 'king' : 'witch';
}

function tintCharacter(root, outfit) {
  const cloth = new THREE.Color(CLOTH[outfit.palette % CLOTH.length]);
  const skin = new THREE.Color(SKIN[outfit.skin % SKIN.length]);
  const hair = new THREE.Color(HAIR[outfit.hairColor % HAIR.length]);
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    list.forEach((src) => {
      if (!src.userData.base) src.userData.base = src.color.clone();
      const name = src.name || '';
      if (/skin/i.test(name)) src.color.copy(skin);
      else if (/hair/i.test(name)) src.color.copy(hair);
      else if (/eye/i.test(name)) src.color.copy(src.userData.base);
      else if (/gold|metal/i.test(name)) {
        src.color.setHex(0xd4a24a);
        src.metalness = 0.85;
        src.roughness = 0.32;
      } else src.color.copy(cloth);
      src.roughness = src.roughness == null ? 0.6 : src.roughness;
    });
    o.castShadow = true;
    o.receiveShadow = true;
    o.frustumCulled = false;
  });
}

function clearHat() {
  if (hatAnchor) {
    hatAnchor.parent && hatAnchor.parent.remove(hatAnchor);
    hatAnchor = null;
  }
}
function addHat(outfit) {
  clearHat();
  const head = bones.Head;
  if (!head || !outfit.hat) return;
  const h = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color: CLOTH[outfit.palette % CLOTH.length], roughness: 0.6 });
  const straw = new THREE.MeshStandardMaterial({ color: 0xd7b56a, roughness: 0.55 });
  if (outfit.hat === 1) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 6, 16), cloth);
    band.rotation.x = Math.PI / 2;
    h.add(band);
  } else if (outfit.hat === 2) {
    h.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.1, 12), cloth));
  } else if (outfit.hat === 3) {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16), straw);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0xf3e2b8, roughness: 0.5 }));
    cone.position.y = 0.06;
    h.add(brim, cone);
  } else {
    const veil = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 12), cloth);
    veil.material.transparent = true;
    veil.material.opacity = 0.85;
    h.add(veil);
  }
  const end = bones.Head_end;
  if (end) h.position.copy(end.position);
  else h.position.y = 0.12;
  head.add(h);
  hatAnchor = h;
}

function captureRest() {
  bones = {};
  rest = {};
  avatar.traverse((o) => {
    if (o.isBone || (o.name && restAllowed(o.name))) {
      bones[o.name] = o;
      rest[o.name] = o.quaternion.clone();
    }
  });
}
function restAllowed(name) {
  return /^(Hips|Abdomen|Torso|Chest|Neck|Head|UpperArm|LowerArm|UpperLeg|LowerLeg|Foot)/.test(name);
}

function fitCharacter(root) {
  root.scale.setScalar(1);
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const h = Math.max(0.001, box.max.y - box.min.y);
  const s = 1.68 / h;
  root.scale.setScalar(s);
  root.position.y = -box.min.y * s;
  root.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
}

async function showCharacter(outfit) {
  const name = modelName(outfit);
  if (!models[name]) models[name] = await loader.loadAsync('assets/' + name + '.glb');
  const prev = avatar.children.slice();
  prev.forEach((ch) => avatar.remove(ch));
  clearHat();
  const root = models[name].scene;
  fitCharacter(root);
  tintCharacter(root, outfit);
  avatar.add(root);
  if (!root.userData.rest) {
    captureRest();
    root.userData.rest = rest;
    root.userData.bones = bones;
  } else {
    bones = root.userData.bones;
    rest = root.userData.rest;
    Object.keys(rest).forEach((name) => { if (bones[name]) bones[name].quaternion.copy(rest[name]); });
  }
  addHat(outfit);
}

const _e = new THREE.Euler();
const _q = new THREE.Quaternion();
const _dir = new THREE.Vector3();
const _local = new THREE.Vector3();
function setBone(name, x, y, z) {
  const b = bones[name];
  if (!b || !rest[name]) return;
  b.quaternion.copy(rest[name]);
  _e.set(x, y, z);
  _q.setFromEuler(_e);
  b.quaternion.multiply(_q);
}
function pointBone(name, worldDir) {
  const b = bones[name];
  const child = b && b.children && (b.children.find((c) => /LowerArm|LowerLeg|Hand/.test(c.name || '')) || b.children[0]);
  if (!b || !child) return;
  b.parent.updateWorldMatrix(true, false);
  const parentQ = new THREE.Quaternion();
  b.parent.getWorldQuaternion(parentQ);
  _local.copy(child.position);
  if (_local.lengthSq() < 1e-8) return;
  _local.normalize();
  _dir.copy(worldDir).normalize().applyQuaternion(parentQ.invert());
  _q.setFromUnitVectors(_local, _dir);
  b.quaternion.copy(_q);
}
function pose(moving, bowing, phase, t) {
  const s = Math.sin(phase);
  const swing = reduceMotion ? 0.15 : 0.55;
  const armL = bowing ? new THREE.Vector3(0.35, -0.2, 0.8) : new THREE.Vector3(0.25, -1, (moving ? -s : 0) * 0.55);
  const armR = bowing ? new THREE.Vector3(-0.35, -0.2, 0.8) : new THREE.Vector3(-0.25, -1, (moving ? s : 0) * 0.55);
  pointBone('UpperArmL', armL);
  pointBone('UpperArmR', armR);
  if (bowing) {
    setBone('Chest', 0.6, 0, 0);
    setBone('Head', 0.35, 0, 0);
    return;
  }
  if (moving) {
    setBone('UpperLegL', s * swing, 0, 0);
    setBone('UpperLegR', -s * swing, 0, 0);
    setBone('LowerLegL', Math.max(0, -s) * 0.9, 0, 0);
    setBone('LowerLegR', Math.max(0, s) * 0.9, 0, 0);
  } else {
    const b = Math.sin(t * 1.6) * 0.025;
    setBone('Chest', b, 0, 0);
  }
}

function dressPalace(root) {
  const lanternPos = [];
  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m) return;
        m.envMapIntensity = 1.15;
        if (m.metalness > 0.5) m.roughness = Math.min(m.roughness == null ? 0.4 : m.roughness, 0.45);
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
  openSheet('<h2>进云阶殿</h2><p>这是一座虚构的三维殿院。电脑用 WASD 或方向键，也可以点地面。手机用左下摇杆。</p><p>走近香炉、钟、财神和蒲团，才会出现能做的事。金雨要自己走过去接。</p><p class="muted">财运是游戏分数。一天有上限。累计 100 才打开贴金，不扣分。不收款，不预测发财。殿和人的出处在「署名」。</p><button type="button" id="goin">我走了</button>');
  sheet.querySelector('#goin').onclick = () => { save.helpSeen = true; closeSheet(); persist(); };
}
function openJournal() {
  const d = ensureDay();
  openSheet('<h2>手帐</h2><p>累计财运 <b>' + (save.lifetime || 0) + '</b> · 今日 <b>' + (d.earned || 0) + '/' + eco.DAILY_CAP + '</b> · 金雨 <b>' + (d.coins || 0) + '/' + eco.COIN_MAX + '</b></p><div class="bar"><i style="width:' + Math.min(100, (save.lifetime || 0) / eco.GOLD_AT * 100) + '%"></i></div><p class="muted">贴金身在累计 ' + eco.GOLD_AT + ' 时永久打开，不扣分。这是游戏分数。云阶殿是虚构的。</p><button type="button" data-close>合上</button>');
}
function openCredits() {
  openSheet('<h2>署名</h2><p>殿院：3D Assets，Imperial China Palace and Garden，CC0。</p><p>行人：Quaternius 的 King 与 Witch，CC0。走和作揖是本页按骨骼驱动的，模型本身不带动画片段。</p><p>天光：Greg Zaal，Kiara 1 Dawn，Poly Haven，CC0。</p><p>引擎：Three.js r170，MIT。</p><p class="muted">财神像是本页原创。没有下到授权合适的雕塑。完整链接在仓库的 caishen/CREDITS.md。没有用付费素材，也没有 Sansa。</p><button type="button" data-close>合上</button>');
}
function openWardrobe() {
  const o = save.outfit;
  const who = modelName(o) === 'king' ? '宽袍' : '长袍';
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
let hold = null, holdT = 0, raining = false, rainT = 0, rainSpawned = 0;
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
function finishHold(kind) {
  if (kind === 'incense') reward(eco.grant(save, today, 'incense'));
  if (kind === 'bow') reward(eco.grant(save, today, 'bow'));
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
  if (s.hold) { hold = s.hold; holdT = 0; }
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
    holdT += dt;
    const need = hold === 'incense' ? 1.15 : 0.9;
    if (holdT >= need) finishHold(hold);
  }

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
    camPos.set(avatar.position.x - Math.sin(yaw) * 4.4, avatar.position.y + 2.7, avatar.position.z - Math.cos(yaw) * 4.4);
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
    pmrem.dispose();
  }).catch(() => { say('天光没载上，仍用日光。'); });
  const palaceP = loader.loadAsync('assets/palace.glb').then((gltf) => {
    palace = gltf.scene;
    dressPalace(palace);
    scene.add(palace);
  });
  const peopleP = Promise.all(['witch', 'king'].map(async (name) => {
    models[name] = await loader.loadAsync('assets/' + name + '.glb');
  }));
  await Promise.all([hdrP, palaceP, peopleP]);
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
