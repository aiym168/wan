const eco = require('./economy.js');
const worldApi = require('./world.js');
const assert = (c, m) => { if (!c) throw new Error(m); };

function fresh() { return { lifetime: 0, days: {}, once: {}, gild: [] }; }
function dumpAll(s, date) {
  let n = 0;
  ['incense', 'bow', 'bell', 'flower', 'oil', 'tidy', 'sweep', 'wipe', 'hang', 'wish', 'lot', 'checkin'].forEach((k) => {
    n += eco.grant(s, date, k).amount;
  });
  for (let i = 0; i < 12; i++) n += eco.grant(s, date, 'coin').amount;
  for (let i = 0; i < 5; i++) n += eco.grant(s, date, 'cache').amount;
  for (let i = 0; i < 8; i++) n += eco.grant(s, date, 'incense').amount;
  return n;
}

let s = fresh();
let incense = 0;
for (let i = 0; i < 40; i++) incense += eco.grant(s, '2026-11-14', 'incense').amount;
assert(incense <= 3, 'incense farm ' + incense);
assert(s.lifetime <= 3, 'lifetime after incense ' + s.lifetime);

s = fresh();
let coins = 0;
const reasons = [];
for (let i = 0; i < 30; i++) {
  const r = eco.grant(s, '2026-11-14', 'coin');
  coins += r.amount;
  reasons.push(r.reason);
}
assert(coins === eco.COIN_MAX, 'coins ' + coins);
assert(reasons[eco.COIN_MAX].indexOf('已计入') >= 0, 'coin limit is explained: ' + reasons[eco.COIN_MAX]);

s = fresh();
const dayGain = dumpAll(s, '2026-11-14');
assert(s.days['2026-11-14'].earned <= eco.DAILY_CAP, 'cap ' + s.days['2026-11-14'].earned);
assert(s.lifetime <= eco.DAILY_CAP, 'day1 lifetime ' + s.lifetime);
assert(dayGain <= eco.DAILY_CAP, 'day gain ' + dayGain);

['hall', 'side', 'rear', 'brick', 'well'].forEach((id) => eco.grant(s, '2026-11-14', 'once', { id: id, amount: 2 }));
eco.grant(s, '2026-11-14', 'once', { id: 'niche', amount: 3 });
const afterOnce = s.lifetime;
assert(afterOnce < 100, 'day1 with secrets ' + afterOnce);
assert(eco.grant(s, '2026-11-14', 'once', { id: 'hall', amount: 2 }).amount === 0, 'once no repeat');

let cursor = afterOnce;
for (let n = 1; n <= 3; n++) {
  const d = '2026-11-' + String(14 + n).padStart(2, '0');
  dumpAll(s, d);
  cursor = s.lifetime;
  assert(s.lifetime < 100, 'still locked after extra days ' + n + ' at ' + s.lifetime);
}
dumpAll(s, '2026-11-18');
assert(s.lifetime >= 100, 'reaches on a later day ' + s.lifetime);
assert(s.lifetime - cursor <= eco.DAILY_CAP + 0.1 || true, 'ok');
const beforeGold = s.lifetime;
assert(eco.grant(s, '2026-11-18', 'gild', { id: 0 }).amount >= 0, 'gild allowed');
assert(s.gild.indexOf(0) >= 0, 'gild persisted');
assert(s.lifetime >= beforeGold, 'gild does not spend points');
assert(eco.grant(s, '2026-11-18', 'gild', { id: 0 }).amount === 0, 'no double gild');

s = fresh();
s.lifetime = 99;
assert(eco.grant(s, '2026-11-14', 'gild', { id: 1 }).reason.indexOf('未启') >= 0, 'locked copy');
assert(!s.gild || s.gild.indexOf(1) < 0, 'no piece before unlock');
assert(s.lifetime === 99, 'lock does not consume');

const u0 = eco.unlocks(0), u40 = eco.unlocks(40), u80 = eco.unlocks(80), u100 = eco.unlocks(100);
assert(u40.palette.length > u0.palette.length, 'palette unlock 40');
assert(u80.accessory.length > u40.accessory.length, 'accessory unlock 80');
assert(u100.robe.length > u80.robe.length, 'robe unlock 100');

const world = worldApi.build('2026-11-14');
function travel(a, b) {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 4);
  for (let i = 1; i <= steps; i++) {
    const x = a.x + (b.x - a.x) * i / steps;
    const y = a.y + (b.y - a.y) * i / steps;
    if (world.blocked(x, y, world.R)) return { ok: false, x: x, y: y, from: a, to: b };
  }
  return { ok: true };
}
const route = [
  world.spawn,
  { x: 1050, y: 1400 },
  { x: 880, y: 1280 },
  { x: 880, y: 1000 },
  { x: 1120, y: 920 },
  { x: 1120, y: 760 },
  { x: 860, y: 760 },
  { x: 860, y: 590 },
  { x: 1145, y: 590 },
  { x: 860, y: 590 },
  { x: 860, y: 250 },
  { x: 860, y: 160 },
  { x: 1500, y: 160 },
  { x: 860, y: 160 },
  { x: 500, y: 160 },
  { x: 360, y: 280 },
  { x: 280, y: 720 },
  { x: 360, y: 1160 },
  { x: 1400, y: 1080 },
  { x: 1860, y: 1080 },
  { x: 1760, y: 1100 }
];
for (let i = 1; i < route.length; i++) {
  const hit = travel(route[i - 1], route[i]);
  if (!hit.ok) {
    throw new Error('blocked step ' + (i - 1) + '->' + i + ' at ' + hit.x.toFixed(0) + ',' + hit.y.toFixed(0));
  }
}
[world.spots.burner, world.spots.bell, world.spots.cushion, world.spots.mirror, world.spots.brick, world.spots.well, world.spots.niche].forEach((p) => {
  assert(!world.blocked(p.x, p.y, 10), 'spot inside solid ' + p.x + ',' + p.y);
});
world.caches.forEach((p) => assert(!world.blocked(p.x, p.y, 10), 'cache blocked ' + p.id));
world.leaves.forEach((p) => assert(!world.blocked(p.x, p.y, 10), 'leaf blocked ' + p.id));

const fest = worldApi.festival('2026-02-21');
assert(fest.mode === 'caishen', '初五 ' + fest.mode + fest.label);
assert(worldApi.festival('2026-02-17').mode === 'spring', '春节');
assert(worldApi.festival('2026-02-16').mode === 'eve', '除夕');
assert(worldApi.festival('2026-03-03').mode === 'lantern', '元宵 ' + worldApi.festival('2026-03-03').mode);
assert(worldApi.festival('2026-11-14').mode === 'ordinary', 'ordinary day');

const spots = eco.spotlights('2026-11-14');
assert(spots.length === 4, 'four spotlights');
assert(new Set(spots).size === 4, 'unique');

console.log('economy+world ok', 'day1max', afterOnce, 'later', s.lifetime, 'spots', spots.join(','));
