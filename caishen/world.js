/* 云阶殿平面：连续坐标、矩形碰撞、可走进的门洞。不依赖画面。 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CSWorld = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var W = 2100, H = 1680, R = 14;
  var CNY = ['2025-01-29', '2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03', '2031-01-23', '2032-02-11'];

  function parse(s) {
    var p = s.split('-');
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }
  function festival(dateStr) {
    var t = parse(dateStr);
    var mode = 'ordinary';
    var label = '';
    for (var i = 0; i < CNY.length; i++) {
      var diff = Math.round((t - parse(CNY[i])) / 86400000);
      if (diff === -1) { mode = 'eve'; label = '除夕'; }
      else if (diff >= 0 && diff <= 6) { mode = 'spring'; label = '春节'; }
      if (diff === 4) { mode = 'caishen'; label = '正月初五 · 迎财神'; }
      else if (diff === 14) { mode = 'lantern'; label = '元宵'; }
    }
    var month = +dateStr.slice(5, 7);
    var season = month <= 1 || month === 12 ? 'winter' : month <= 4 ? 'spring' : month <= 8 ? 'summer' : 'autumn';
    return { mode: mode, label: label, season: season };
  }
  function hashDate(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function build(dateStr) {
    var solids = [];
    function add(x, y, w, h, kind) { solids.push({ x: x, y: y, w: w, h: h, kind: kind || 'wall' }); }
    add(-80, -80, W + 160, 80, 'void');
    add(-80, H, W + 160, 80, 'void');
    add(-80, 0, 80, H, 'void');
    add(W, 0, 80, H, 'void');

    add(620, 1340, 280, 120, 'wall');
    add(1200, 1340, 280, 120, 'wall');
    add(460, 1340, 160, 80, 'wall');
    add(1480, 1340, 180, 80, 'wall');

    add(460, 860, 80, 220, 'wall');
    add(460, 1240, 80, 100, 'wall');
    add(1560, 860, 80, 140, 'wall');
    add(1560, 1160, 80, 180, 'wall');

    add(120, 160, 60, 1240, 'wall');
    add(120, 1400, 360, 40, 'wall');
    add(180, 60, 1560, 50, 'wall');
    add(1740, 60, 80, 260, 'wall');

    add(680, 300, 80, 580, 'wall');
    add(1340, 300, 80, 580, 'wall');
    add(1020, 300, 320, 80, 'wall');
    add(760, 800, 140, 80, 'wall');
    add(1220, 800, 120, 80, 'wall');

    add(1080, 420, 130, 130, 'statue');
    add(990, 620, 280, 78, 'table');
    add(790, 400, 32, 32, 'pillar');
    add(1310, 400, 32, 32, 'pillar');

    add(1640, 900, 400, 40, 'wall');
    add(2000, 900, 40, 360, 'wall');
    add(1640, 1220, 400, 40, 'wall');
    add(1640, 940, 40, 60, 'wall');
    add(1640, 1160, 40, 60, 'wall');

    add(620, 188, 76, 64, 'well');
    var trees = [[560, 1000], [700, 1260], [1480, 980], [400, 500], [1240, 250]];
    trees.forEach(function (p) { add(p[0] - 16, p[1] - 12, 32, 28, 'tree'); });
    add(1028, 1168, 44, 36, 'burner');
    add(548, 1088, 40, 40, 'bell');

    var spots = {
      burner: { x: 1050, y: 1224, r: 64 },
      bell: { x: 600, y: 1160, r: 70 },
      broom: { x: 390, y: 1180, r: 52 },
      vase: { x: 1320, y: 1040, r: 56 },
      basket: { x: 1460, y: 1260, r: 52 },
      board: { x: 1500, y: 1080, r: 54 },
      tube: { x: 1436, y: 1172, r: 48 },
      jar: { x: 1760, y: 1100, r: 50 },
      cushion: { x: 1120, y: 760, r: 54 },
      statue: { x: 1145, y: 590, r: 100 },
      table: { x: 1130, y: 748, r: 72 },
      mirror: { x: 980, y: 1520, r: 60 },
      brick: { x: 280, y: 720, r: 48 },
      well: { x: 730, y: 220, r: 72 },
      niche: { x: 1580, y: 180, r: 56 },
      tree: { x: 700, y: 1260, r: 58 },
      chest: { x: 1240, y: 1300, r: 50 },
      gildbowl: { x: 860, y: 540, r: 50 }
    };
    var lamps = [{ x: 1720, y: 980, id: 0 }, { x: 1900, y: 980, id: 1 }, { x: 1900, y: 1140, id: 2 }];
    var hooks = [{ x: 860, y: 1390, id: 'h1' }, { x: 1280, y: 1390, id: 'h2' }];
    var leafSpots = [
      { id: 'l1', x: 780, y: 1100 }, { id: 'l2', x: 920, y: 1240 }, { id: 'l3', x: 1180, y: 1288 },
      { id: 'l4', x: 1400, y: 1120 }, { id: 'l5', x: 640, y: 1000 }, { id: 'l6', x: 1100, y: 980 },
      { id: 'l7', x: 300, y: 980 }, { id: 'l8', x: 340, y: 450 }
    ];
    var ashSpots = [
      { id: 'a1', x: 990, y: 1248 }, { id: 'a2', x: 1110, y: 1252 }, { id: 'a3', x: 1050, y: 1288 }, { id: 'a4', x: 1148, y: 1204 }
    ];
    var cachePool = [
      { id: 'c1', x: 240, y: 980 }, { id: 'c2', x: 360, y: 380 }, { id: 'c3', x: 820, y: 180 },
      { id: 'c4', x: 1320, y: 190 }, { id: 'c5', x: 1860, y: 1080 }, { id: 'c6', x: 760, y: 1500 },
      { id: 'c7', x: 1488, y: 920 }, { id: 'c8', x: 900, y: 520 }
    ];
    var dusts = [
      { id: 'd1', x: 1010 }, { id: 'd2', x: 1060 }, { id: 'd3', x: 1110 }, { id: 'd4', x: 1160 }, { id: 'd5', x: 1200 }
    ];
    var rooms = {
      hall: { x: 760, y: 380, w: 580, h: 420, once: 'hall', amount: 2, reason: '第一次走进正殿' },
      side: { x: 1680, y: 940, w: 320, h: 280, once: 'side', amount: 2, reason: '第一次走进侧殿' },
      rear: { x: 200, y: 110, w: 1500, h: 190, once: 'rear', amount: 2, reason: '第一次绕到殿后' }
    };
    var patches = [
      { id: 0, name: '冠' }, { id: 1, name: '脸' }, { id: 2, name: '须' }, { id: 3, name: '胸' },
      { id: 4, name: '左袖' }, { id: 5, name: '右袖' }, { id: 6, name: '如意' }, { id: 7, name: '莲座' }
    ];

    function blocked(x, y, r) {
      r = r == null ? R : r;
      for (var i = 0; i < solids.length; i++) {
        var s = solids[i];
        var cx = Math.max(s.x, Math.min(x, s.x + s.w));
        var cy = Math.max(s.y, Math.min(y, s.y + s.h));
        var dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy < r * r) return true;
      }
      return false;
    }
    function inRect(b, x, y) {
      return x >= b.x && y >= b.y && x <= b.x + b.w && y <= b.y + b.h;
    }
    function pickDaily(list, n, salt) {
      var rng = mulberry32(hashDate((dateStr || '1970-01-01') + ':' + salt));
      var arr = list.slice();
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
      return arr.slice(0, n);
    }

    return {
      W: W, H: H, R: R, solids: solids, spots: spots, lamps: lamps, hooks: hooks,
      leaves: pickDaily(leafSpots, 6, 'leaf'),
      ashes: ashSpots.slice(),
      caches: pickDaily(cachePool, 3, 'cache'),
      dusts: dusts, trees: trees, rooms: rooms, patches: patches,
      blocked: blocked, inRect: inRect, festival: festival(dateStr || '2026-11-14'),
      spawn: { x: 1050, y: 1560 }
    };
  }

  return { build: build, festival: festival, W: W, H: H, R: R };
});
