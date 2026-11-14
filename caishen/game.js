/* 云阶财神殿
   自己写的画布小游戏：连续坐标、分开轴向的碰撞、镜头跟随、
   键盘 / 虚拟摇杆 / 点地走路、靠近才出现互动。
   参考过的是公开引擎的做法（镜头、摇杆、靠近互动），没有搬它们的代码或素材。
*/
(function () {
  var eco = window.CSEconomy;
  var World = window.CSWorld;
  var canvas = document.getElementById('view');
  var ctx = canvas.getContext('2d');
  var actBtn = document.getElementById('act');
  var sheet = document.getElementById('sheet');
  var scoreEl = document.getElementById('score');
  var live = document.getElementById('live');
  var joyEl = document.getElementById('joy');
  var knob = document.getElementById('knob');
  var KEY = 'caishen.v1';

  var PAL = [
    { name: '月白', robe: '#e7e1d4', trim: '#245e62', bottom: '#243236', shoe: '#1b1916', accent: '#c4554a' },
    { name: '朱砂', robe: '#8d3034', trim: '#e6c78a', bottom: '#2a211e', shoe: '#16120f', accent: '#f0d78c' },
    { name: '松绿', robe: '#1e4c44', trim: '#e4d2b0', bottom: '#2c332e', shoe: '#3a2a20', accent: '#f3e6c8' },
    { name: '秋香', robe: '#c6a36e', trim: '#6a3828', bottom: '#3c322a', shoe: '#241c16', accent: '#f6ead4' },
    { name: '墨蓝', robe: '#1b2c4c', trim: '#e0c48a', bottom: '#141820', shoe: '#0e1014', accent: '#f0e2bc' },
    { name: '藕荷', robe: '#d7b4c4', trim: '#5c3048', bottom: '#3a2a34', shoe: '#241820', accent: '#f8e8ee' },
    { name: '泥金', robe: '#6e5830', trim: '#f3e2a6', bottom: '#2a2418', shoe: '#1a140c', accent: '#fff3c8' }
  ];
  var HAIR_C = ['#1a1412', '#3a2a22', '#4a3424', '#2c2430', '#5c5148'];
  var SKIN = ['#f3c7a2', '#e2ad86', '#c48860', '#8d5a3c', '#f8d8ba'];
  var NAMES = {
    hair: ['束髻', '披发', '短发', '双鬟', '单辫', '高髻'],
    robe: ['交领广袖', '短褐', '圆领长袍', '披风', '比甲', '金缘袍'],
    bottom: ['褶裙', '宽裤', '窄裤'],
    shoes: ['布履', '短靴', '草鞋', '云履'],
    hat: ['不戴冠', '抹额', '软巾', '斗笠', '帷帽'],
    accessory: ['无配饰', '绦带', '腰扇', '耳坠', '披巾', '玉佩']
  };
  var LOTS = [
    ['慢一点', '今日宜把脚步放慢。路会自己让一让。'],
    ['手温', '手里的事做得细致，就是很好的一天。'],
    ['有人', '有人记得问你吃饭没有，这就很金贵。'],
    ['窗光', '把桌子擦一擦，光会愿意落下来。'],
    ['回声', '你认真敲过的那一下，殿里还留着。'],
    ['花瓶', '花不必多，端正地站着就好。'],
    ['灯芯', '灯油添够了，夜路就没那么黑。'],
    ['扫过', '叶子扫到一边。院子还是这个院子，只是你来过。'],
    ['井水', '先看见角落，再看见自己。'],
    ['红绳', '把愿望写短一点，短的比较站得住。'],
    ['暖袖', '袖口温着，出去也从容。'],
    ['新苔', '旧砖缝里有一点新绿，不算迟到。'],
    ['同路', '今天适合跟一个旧人说一句近况。'],
    ['留缝', '不必把日子过满。留一条缝，风才进得来。'],
    ['归处', '走远了也记得门口的方向。'],
    ['清香', '香燃完就完了。人还在，就够。']
  ];
  var CHARMS = ['红绳结', '小铜铃', '桂花干', '纸灯芯', '松针', '墨点', '糖纸', '井纹片'];

  function todayStr(d) {
    d = d || new Date();
    var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10);
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hypot(x, y) { return Math.sqrt(x * x + y * y); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function rnd() { return Math.random(); }

  var save = load();
  var today = todayStr();
  var world = World.build(today);
  var player = {
    x: save.px || world.spawn.x,
    y: save.py || world.spawn.y,
    facing: 'n',
    phase: 0,
    hold: null,
    outfit: save.outfit,
    pose: 'idle',
    poseT: 0
  };
  save.charms = save.charms || [];
  save.notes = save.notes || [];
  save.gild = save.gild || [];
  save.hooks = save.hooks || {};
  save.once = save.once || {};
  save.wishes = save.wishes || [];
  if (!player.outfit) player.outfit = rollOutfit(rnd);
  var camX = player.x, camY = player.y;
  var keys = {};
  var joy = { on: false, x: 0, y: 0, id: null };
  var target = null;
  var pointer = null;
  var activeHold = null;
  var holdT = 0;
  var bell = null;
  var raining = false;
  var rainT = 0;
  var rainSpawned = 0;
  var coins = [];
  var floats = [];
  var sparks = [];
  var smokes = [];
  var last = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !!save.reduce;
  var ac = null;
  var drone = null;
  var sheetOpen = false;
  var scale = 1.4;
  var cssW = 1, cssH = 1;
  var stoneTex = null, woodTex = null;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && o.outfit) return o;
      }
    } catch (e) {}
    return {
      outfit: null, lifetime: 0, days: {}, once: {}, gild: [], hooks: {},
      wishes: [], charms: [], notes: [], salt: Math.floor(Math.random() * 1e9),
      mute: false, helpSeen: false, lanternsHung: false, visitDays: 0, px: null, py: null
    };
  }
  function persist() {
    save.px = Math.round(player.x);
    save.py = Math.round(player.y);
    save.outfit = player.outfit;
    save.reduce = reduce;
    try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {}
  }
  var persistTimer = 0;
  function saveSoon() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(persist, 250);
  }
  function ensureDay() {
    if (!save.days[today]) {
      save.days[today] = Object.assign(eco.blankDay(), {
        lamps: {}, swept: {}, ashes: {}, dust: {}, found: {}, flowers: 0, tags: 0, lot: null, visited: false
      });
    }
    var d = save.days[today];
    d.done = d.done || {};
    d.lamps = d.lamps || {};
    d.swept = d.swept || {};
    d.ashes = d.ashes || {};
    d.dust = d.dust || {};
    d.found = d.found || {};
    return d;
  }
  function rollOutfit(rng) {
    var u = eco.unlocks(save.lifetime || 0);
    function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
    var hatPool = u.hat.filter(function (h) { return h !== 0; });
    var accPool = u.accessory.filter(function (h) { return h !== 0; });
    return {
      skin: pick(u.skin),
      hair: pick(u.hair),
      hairColor: pick(u.hairColor),
      robe: pick(u.robe),
      palette: pick(u.palette),
      bottom: pick(u.bottom),
      shoes: pick(u.shoes),
      hat: rng() < 0.58 || !hatPool.length ? 0 : pick(hatPool),
      accessory: rng() < 0.42 || !accPool.length ? 0 : pick(accPool)
    };
  }
  function say(text) {
    live.textContent = text;
    floats.push({ x: player.x, y: player.y - 62, text: text, life: 2.1 });
    if (floats.length > 6) floats.shift();
  }
  function reward(res) {
    if (!res) return;
    say((res.amount > 0 ? '+' + res.amount + ' ' : '+0 ') + res.reason);
    if (res.amount > 0) blip(880, 0.08, 'triangle', 0.05);
    hud();
    saveSoon();
  }

  function audioUnlock() {
    if (save.mute) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ac) ac = new AC();
    if (ac.state === 'suspended') ac.resume();
    if (!drone && !reduce) {
      drone = [];
      [196, 294].forEach(function (f) {
        var o = ac.createOscillator();
        var g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.value = 0.012;
        o.connect(g); g.connect(ac.destination);
        o.start();
        drone.push(o, g);
      });
    }
  }
  function blip(freq, dur, type, gain) {
    if (save.mute || !ac) return;
    var o = ac.createOscillator();
    var g = ac.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.04, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.connect(g); g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + dur + 0.02);
  }
  function chime() {
    [523, 659, 784].forEach(function (f, i) { setTimeout(function () { blip(f, 0.35, 'sine', 0.05); }, i * 90); });
  }
  function bellSound(good) {
    if (good) [392, 523, 784].forEach(function (f) { blip(f, 1.1, 'sine', 0.04); });
    else blip(180, 0.2, 'triangle', 0.05);
  }
  function stopDrone() {
    if (!drone || !ac) return;
    drone.forEach(function (n) { try { if (n.stop) n.stop(); } catch (e) {} });
    drone = null;
  }

  function candidates() {
    var S = world.spots;
    var d = ensureDay();
    var list = [];
    function push(spot, o) {
      list.push({ x: spot.x, y: spot.y, r: spot.r || 52, label: o.label, press: o.press || null, hold: !!o.hold, holdFor: o.holdFor || '', extra: o.extra || null });
    }
    var hold = player.hold;
    if (hold === 'flower') push(S.vase, { label: '把花插入瓶中', press: placeFlower });
    else if (hold === 'ladle') {
      world.lamps.forEach(function (l) {
        if (!d.lamps[l.id]) push(l, { label: '按住给这盏灯添油', hold: true, holdFor: 'oil', extra: l.id });
      });
    } else if (hold === 'lantern') {
      world.hooks.forEach(function (h) {
        if (!save.hooks[h.id]) push(h, { label: '挂上这盏灯笼', press: function () { hangHook(h.id); } });
      });
    } else if (hold === 'leaf') {
      push(S.statue, { label: '把金箔贴上' + nextPatchName(), press: applyLeaf });
    } else if (hold === 'tag') {
      push(S.tree, { label: '把祈福牌挂上枝头', press: hangTag });
    } else if (hold === 'cloth') {
      push(S.table, { label: '贴着桌沿左右走，把灰擦掉', press: function () { say('人贴着桌沿走，灰会跟着掉。'); } });
    } else if (!hold) {
      push(S.burner, d.done.incense
        ? { label: '这炷香还亮着', press: function () { reward(eco.grant(save, today, 'incense')); } }
        : { label: '按住上香', hold: true, holdFor: 'incense' });
      push(S.bell, { label: bell && !bell.resolved ? '看准了再敲' : '拉动钟绳', press: bell && !bell.resolved ? strikeBell : startBell });
      if (!allSwept()) push(S.broom, { label: '拿起扫帚', press: function () { player.hold = 'broom'; say('扫帚在手里，走进落叶就行。'); } });
      if (!allAsh()) push({ x: 1050, y: 1272, r: 56 }, { label: '拿香箸整理香灰', press: function () { player.hold = 'stick'; say('把香灰拨回炉里。'); } });
      if ((d.flowers || 0) < 3) push(S.basket, { label: '拈一支花', press: function () { player.hold = 'flower'; say('花在手里，送到瓶边。'); } });
      if ((d.flowers || 0) > 0) push(S.vase, { label: '看看花瓶', press: function () { say('瓶里已有 ' + d.flowers + ' 枝。'); } });
      var lampsLeft = world.lamps.some(function (l) { return !d.lamps[l.id]; });
      if (lampsLeft) push(S.jar, { label: '舀一勺灯油', press: function () { player.hold = 'ladle'; say('油勺端稳，走到未亮的灯前。'); } });
      if (!save.lanternsHung) push(S.chest, { label: '抱起一盏灯笼', press: function () { player.hold = 'lantern'; say('灯笼不沉，挂到檐下的钩上。'); } });
      else if (!d.done.hang) push(S.tree, { label: '取一块祈福牌', press: function () { player.hold = 'tag'; say('写好的牌子，挂到松枝上。'); } });
      push(S.board, { label: '写一张愿望', press: openWish });
      push(S.tube, { label: d.lot != null ? '看看今天的祝福' : '抽一张祝福签', press: drawLot });
      push(S.cushion, { label: cushionLabel(), press: startRain });
      push(S.table, dustLeft() ? { label: '拿起帕子擦供桌', press: function () { player.hold = 'cloth'; say('贴着桌子南边走，灰会擦掉。'); } } : { label: '供桌已经干净', press: function () { reward(eco.grant(save, today, 'wipe')); } });
      push(S.statue, { label: bowLabel(), hold: save.lifetime >= 0, holdFor: 'bow' });
      push(S.gildbowl, { label: gildLabel(), press: takeLeaf });
      push(S.mirror, { label: '照一照衣冠', press: openWardrobe });
      push(S.brick, { label: '摸摸这块砖', press: touchBrick });
      push(S.well, { label: '探看井栏', press: touchWell });
      push(S.niche, { label: '看看壁龛', press: touchNiche });
      world.caches.forEach(function (c) {
        if (!d.found[c.id]) push(c, { label: '捡起散落的铜钱', press: function () { foundCache(c); } });
      });
    }
    return list;
  }
  function nearest() {
    if (bell && !bell.resolved) {
      return { x: world.spots.bell.x, y: world.spots.bell.y, r: 90, label: '现在敲', press: strikeBell, hold: false };
    }
    var list = candidates();
    var best = null, bd = 1e9;
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var dist = hypot(player.x - s.x, player.y - s.y);
      if (dist <= s.r && dist < bd) { best = s; bd = dist; }
    }
    if (!best && player.hold) return { x: player.x, y: player.y, r: 999, label: '放下手里的东西', press: function () { player.hold = null; }, hold: false };
    return best;
  }
  function cushionLabel() {
    var d = ensureDay();
    if ((d.coins || 0) >= eco.COIN_MAX) return '今日金雨已满 ' + eco.COIN_MAX + '/' + eco.COIN_MAX;
    return '在蒲团上坐下，等金雨';
  }
  function bowLabel() { return ensureDay().done.bow ? '再作一个揖' : '按住作揖'; }
  function gildLabel() {
    if ((save.lifetime || 0) < eco.GOLD_AT) return '金身未启 ' + (save.lifetime || 0) + '/' + eco.GOLD_AT;
    if ((save.gild || []).length >= 8) return '金身已经圆满';
    return '取一片金箔（' + (save.gild || []).length + '/8）';
  }
  function nextPatchName() {
    var g = save.gild || [];
    for (var i = 0; i < world.patches.length; i++) if (g.indexOf(world.patches[i].id) < 0) return world.patches[i].name;
    return '金身';
  }
  function allSwept() {
    var d = ensureDay();
    return world.leaves.every(function (l) { return d.swept[l.id]; });
  }
  function allAsh() {
    var d = ensureDay();
    return world.ashes.every(function (a) { return d.ashes[a.id]; });
  }
  function dustLeft() {
    var d = ensureDay();
    return world.dusts.some(function (x) { return !d.dust[x.id]; });
  }

  function placeFlower() {
    player.hold = null;
    var d = ensureDay();
    d.flowers = Math.min(3, (d.flowers || 0) + 1);
    say('插好一枝，瓶里现在有 ' + d.flowers + ' 枝。');
    if (d.flowers >= 3) reward(eco.grant(save, today, 'flower'));
    else saveSoon();
  }
  function hangHook(id) {
    player.hold = null;
    save.hooks[id] = true;
    var both = world.hooks.every(function (h) { return save.hooks[h.id]; });
    if (both) {
      save.lanternsHung = true;
      reward(eco.grant(save, today, 'hang'));
    } else say('这一盏挂稳了，还有一只钩空着。');
    saveSoon();
  }
  function hangTag() {
    player.hold = null;
    var d = ensureDay();
    d.tags = (d.tags || 0) + 1;
    if (d.tags >= 2) reward(eco.grant(save, today, 'hang'));
    else { say('牌子轻轻晃了一下。再挂一块。'); saveSoon(); }
  }
  function startBell() {
    bell = { t: 0, resolved: false, tries: 0 };
    player.pose = 'pull';
  }
  function strikeBell() {
    if (!bell || bell.resolved) return;
    var good = bell.t > 0.45 && bell.t < 0.92;
    bell.tries += 1;
    if (good || bell.tries >= 3) {
      bell.resolved = true;
      bellSound(good);
      player.poseT = 0.4;
      reward(eco.grant(save, today, 'bell'));
      if (!good) say('第三下也算数。钟声闷一点，今日仍记下了。');
    } else {
      bellSound(false);
      say('早了一点或晚了一点，钟绳还在，再来（' + bell.tries + '/3）。');
      bell.t = 0.15;
    }
  }
  function startRain() {
    var d = ensureDay();
    if ((d.coins || 0) >= eco.COIN_MAX) {
      say('今日金雨已计入 ' + eco.COIN_MAX + '/' + eco.COIN_MAX + '。坐着听听也安心，不再落币。');
      return;
    }
    if (raining) return;
    raining = true;
    rainT = 0;
    rainSpawned = 0;
    player.pose = 'sit';
    player.poseT = 0.75;
    say('先坐一会儿。金雨落下后，走到币下用身子接。今日前 ' + eco.COIN_MAX + ' 枚计入。');
  }
  function takeLeaf() {
    if ((save.lifetime || 0) < eco.GOLD_AT) { openGoldLock(); return; }
    if ((save.gild || []).length >= 8) { say('金身每一处都亮了。'); return; }
    player.hold = 'leaf';
    say('金箔很薄，走到像前，贴在还没亮的地方。');
  }
  function applyLeaf() {
    var g = save.gild || [];
    var patch = null;
    for (var i = 0; i < world.patches.length; i++) if (g.indexOf(world.patches[i].id) < 0) { patch = world.patches[i]; break; }
    if (!patch) return;
    player.hold = null;
    player.pose = 'apply';
    player.poseT = 0.45;
    reward(eco.grant(save, today, 'gild', { id: patch.id }));
    if ((save.gild || []).length >= 8) chime();
  }
  function foundCache(c) {
    var d = ensureDay();
    if (d.found[c.id]) return;
    d.found[c.id] = true;
    sparkle(c.x, c.y);
    reward(eco.grant(save, today, 'cache'));
  }
  function touchBrick() {
    if (save.once && save.once.brick) { say('砖已经松过，线还指向井。'); return; }
    note('西廊砖缝里划着一条线，指向殿后的井。');
    reward(eco.grant(save, today, 'once', { id: 'brick', amount: 2, reason: '发现松动的砖' }));
  }
  function touchWell() {
    if (!save.once || !save.once.brick) { say('井栏光滑。也许别处有一块松动的砖。'); return; }
    if (save.once.well) { say('三个小点还在，像在数墙。'); return; }
    note('井栏内侧刻着三个点，殿后东边的壁龛对得上。');
    reward(eco.grant(save, today, 'once', { id: 'well', amount: 2, reason: '读到井栏刻痕' }));
  }
  function touchNiche() {
    if (!save.once || !save.once.well) { say('壁龛是空的，像在等一个先看见井的人。'); return; }
    if (save.once.niche) { say('井纹片已经在手帐里。'); return; }
    if (save.charms.indexOf('井纹片') < 0) save.charms.push('井纹片');
    note('壁龛里搁着一枚井纹片，收进了手帐。');
    reward(eco.grant(save, today, 'once', { id: 'niche', amount: 3, reason: '找到井纹片' }));
  }
  function note(text) {
    save.notes = save.notes || [];
    if (save.notes.indexOf(text) < 0) save.notes.push(text);
  }
  function openWish() {
    openSheet(
      '<h2>写给自己的愿望</h2><p class="muted">只留在这台浏览器里，不上传。写短一点。</p>' +
      '<textarea id="wish" maxlength="40" placeholder="例如：这周把一件小事做完"></textarea>' +
      '<div class="row"><button type="button" data-close>先不写</button><button type="button" id="wish-ok">折好，留下</button></div>'
    );
    var ta = sheet.querySelector('#wish');
    ta.focus();
    sheet.querySelector('#wish-ok').onclick = function () {
      var text = ta.value.trim();
      if (!text) { closeSheet(); return; }
      save.wishes = save.wishes || [];
      save.wishes.unshift({ t: today, text: text.slice(0, 40) });
      if (save.wishes.length > 30) save.wishes.pop();
      closeSheet();
      reward(eco.grant(save, today, 'wish'));
    };
  }
  function drawLot() {
    var d = ensureDay();
    if (d.lot == null) {
      var h = save.salt || 1;
      for (var i = 0; i < today.length; i++) h = Math.imul(h ^ today.charCodeAt(i), 16777619);
      d.lot = Math.abs(h) % LOTS.length;
    }
    var lot = LOTS[d.lot];
    openSheet(
      '<h2>祝福 · ' + esc(lot[0]) + '</h2><p>' + esc(lot[1]) + '</p>' +
      '<p class="muted">这是一句祝福，不是吉凶，也不预测发财、债务或抽奖。</p>' +
      '<div class="row"><button type="button" id="lot-card">生成祝福卡</button><button type="button" data-close>收好</button></div>'
    );
    sheet.querySelector('#lot-card').onclick = function () { downloadCard(); };
    reward(eco.grant(save, today, 'lot'));
    chime();
  }

  function openGoldLock() {
    var n = save.lifetime || 0;
    openSheet(
      '<h2>金身还锁着</h2>' +
      '<p>累计获得的财运到 <b>' + eco.GOLD_AT + '</b> 就永久打开。打开时<b>不扣除</b>这 ' + eco.GOLD_AT + ' 分。</p>' +
      '<div class="bar"><i style="width:' + Math.min(100, n / eco.GOLD_AT * 100) + '%"></i></div>' +
      '<p>现在 ' + n + ' / ' + eco.GOLD_AT + '。</p>' +
      '<p class="muted">上香、洒扫、敲钟、把角落走一遍、接住金雨，都能慢慢攒。一天最多计入 ' + eco.DAILY_CAP + ' 分，同一件事反复做不加分。这是游戏分数，不能换成钱。</p>' +
      '<button type="button" data-close>知道了，再去走走</button>'
    );
  }
  function openJournal() {
    var d = ensureDay();
    var spot = eco.spotlights(today).map(function (id) { return eco.ACTIONS[id].name; }).join('、');
    var found = world.caches.filter(function (c) { return !d.found[c.id]; }).length;
    var notes = (save.notes || []).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') || '<li>还没有多出来的发现。</li>';
    var wishes = (save.wishes || []).slice(0, 5).map(function (w) { return '<li>' + esc(w.text) + '</li>'; }).join('') || '<li>还没写。</li>';
    var charms = (save.charms || []).join('、') || '还没有';
    var fest = world.festival;
    openSheet(
      '<h2>手帐</h2>' +
      (fest.label ? '<p>今日殿里的布置：' + esc(fest.label) + '。仍是游戏。</p>' : '') +
      '<p>累计财运 <b>' + (save.lifetime || 0) + '</b> · 今日计入 <b>' + (d.earned || 0) + '/' + eco.DAILY_CAP + '</b> · 金雨 <b>' + (d.coins || 0) + '/' + eco.COIN_MAX + '</b></p>' +
      '<div class="bar"><i style="width:' + Math.min(100, (save.lifetime || 0) / eco.GOLD_AT * 100) + '%"></i></div>' +
      '<p class="muted">贴金身在累计 ' + eco.GOLD_AT + ' 时永久打开，不扣分。今日鲜活：' + esc(spot) + '。其余事情每天共享 ' + eco.CASUAL_POOL + ' 点随手分。散钱今天还剩 ' + found + ' 处。</p>' +
      '<p class="keys">电脑 WASD / 方向键，E 或空格互动，J 手帐，M 静音。手机用左下摇杆，或点地面走过去。走近了，事情才会出现。</p>' +
      '<h2>发现</h2><ul>' + notes + '</ul>' +
      '<p>小物：' + esc(charms) + '</p>' +
      '<h2>愿望</h2><ul>' + wishes + '</ul>' +
      '<p class="muted">愿望和进度只在这台浏览器里。财运不能换钱，不预测发财、还债或中奖。云阶殿是虚构的，不属于任何真实寺庙。</p>' +
      '<div class="row"><button type="button" id="j-card">祝福卡</button><button type="button" id="j-motion">' + (reduce ? '恢复动效' : '减少动效') + '</button><button type="button" data-close>合上</button></div>'
    );
    sheet.querySelector('#j-card').onclick = function () { downloadCard(); };
    sheet.querySelector('#j-motion').onclick = function () {
      reduce = !reduce;
      if (reduce) stopDrone();
      saveSoon();
      openJournal();
    };
  }
  function openWardrobe() {
    var o = player.outfit;
    var u = eco.unlocks(save.lifetime || 0);
    function line(key, label) {
      var name = key === 'palette' ? PAL[o.palette].name : key === 'skin' ? ('肤色 ' + (o.skin + 1)) : key === 'hairColor' ? ('发色 ' + (o.hairColor + 1)) : NAMES[key][o[key]];
      return '<div class="row"><button type="button" data-k="' + key + '" data-d="-1">上一个</button><b>' + esc(label) + ' · ' + esc(name) + '</b><button type="button" data-k="' + key + '" data-d="1">下一个</button></div>';
    }
    var next = '';
    if ((save.lifetime || 0) < 40) next = '财运 40 会多一套墨蓝和比甲。';
    else if ((save.lifetime || 0) < 80) next = '财运 80 会多藕荷、披巾和云履。';
    else if ((save.lifetime || 0) < 100) next = '财运 100 打开贴金身，并多一件金缘袍。那 100 分不会被扣掉。';
    openSheet(
      '<h2>衣冠</h2><p class="muted">庭院里站着的就是你。换装会立刻穿在身上，存在这台浏览器里。' + esc(next) + '</p>' +
      line('palette', '配色') + line('robe', '上衣') + line('bottom', '下裳') + line('shoes', '鞋') +
      line('hair', '发型') + line('hairColor', '发色') + line('hat', '头上') + line('accessory', '配饰') + line('skin', '肤色') +
      '<div class="row"><button type="button" id="reroll">换一身</button><button type="button" data-close>照完了</button></div>' +
      '<p class="muted">已解锁上衣 ' + u.robe.length + ' 种、配色 ' + u.palette.length + ' 套。</p>'
    );
    sheet.querySelectorAll('[data-k]').forEach(function (b) {
      b.onclick = function () { cycle(b.getAttribute('data-k'), +b.getAttribute('data-d')); };
    });
    sheet.querySelector('#reroll').onclick = function () {
      player.outfit = rollOutfit(rnd);
      saveSoon();
      openWardrobe();
    };
  }
  function cycle(key, dir) {
    var u = eco.unlocks(save.lifetime || 0)[key];
    var i = u.indexOf(player.outfit[key]);
    if (i < 0) i = 0;
    player.outfit[key] = u[(i + dir + u.length) % u.length];
    saveSoon();
    openWardrobe();
  }
  function openHelp() {
    openSheet(
      '<h2>进云阶殿</h2>' +
      '<p>这是一座虚构的小殿。人要自己走：电脑用 WASD 或方向键，也可以点地面；手机用左下角摇杆，或点你要去的地方。</p>' +
      '<p>走近香炉、钟、供桌、蒲团、侧殿和殿后，脚下亮了，才出现能做的事。金雨要走过去用身子接。</p>' +
      '<p class="muted">财运是游戏分数。一天有上限，反复做同一件事不加分。累计 100 永久打开贴金身，不扣这 100 分。不收款，不预测发财。</p>' +
      '<button type="button" id="goin">我走了</button>'
    );
    sheet.querySelector('#goin').onclick = function () { save.helpSeen = true; closeSheet(); persist(); };
  }
  function openSheet(html) {
    sheetOpen = true;
    target = null;
    sheet.hidden = false;
    sheet.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>';
    sheet.querySelectorAll('[data-close]').forEach(function (b) { b.onclick = closeSheet; });
    var f = sheet.querySelector('button,textarea');
    if (f) f.focus();
  }
  function closeSheet() {
    sheetOpen = false;
    sheet.hidden = true;
    sheet.innerHTML = '';
  }
  sheet.addEventListener('pointerdown', function (e) { if (e.target === sheet) closeSheet(); });

  function downloadCard() {
    var c = document.createElement('canvas');
    c.width = 750; c.height = 1000;
    var g = c.getContext('2d');
    drawCard(g);
    c.toBlob(function (blob) {
      var file = new File([blob], 'yunjie-blessing.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: '云阶殿的一句祝福', text: '民俗小游戏，不是预测。' }).catch(function () { saveBlob(blob); });
      } else saveBlob(blob);
    }, 'image/png');
  }
  function saveBlob(blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'yunjie-blessing.png';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }
  function drawCard(g) {
    var d = ensureDay();
    var lot = d.lot != null ? LOTS[d.lot] : ['路过', '人到了，殿就亮一点。'];
    g.fillStyle = '#6e2430';
    g.fillRect(0, 0, 750, 1000);
    g.fillStyle = '#f6efe2';
    g.fillRect(28, 28, 694, 944);
    g.strokeStyle = '#c4554a';
    g.lineWidth = 3;
    g.strokeRect(44, 44, 662, 912);
    g.fillStyle = '#6e2430';
    g.font = '700 42px "Songti SC","Noto Serif SC","WenQuanYi Micro Hei",serif';
    g.textAlign = 'center';
    g.fillText('云阶财神殿', 375, 120);
    g.font = '20px "WenQuanYi Micro Hei",sans-serif';
    g.fillStyle = '#6d5844';
    g.fillText('一句祝福 · 不是吉凶', 375, 158);
    g.save();
    g.translate(375, 430);
    g.scale(4.2, 4.2);
    drawPerson(g, 0, 0, player.outfit, 's', 'idle', 0, null);
    g.restore();
    g.fillStyle = '#24180f';
    g.font = '700 36px "Songti SC","WenQuanYi Micro Hei",serif';
    g.fillText(lot[0], 375, 620);
    g.font = '26px "WenQuanYi Micro Hei",sans-serif';
    wrapText(g, lot[1], 375, 670, 520, 40);
    var wish = (save.wishes || [])[0];
    if (wish) {
      g.fillStyle = '#6d5844';
      g.font = '22px "WenQuanYi Micro Hei",sans-serif';
      wrapText(g, '愿望：' + wish.text, 375, 780, 520, 32);
    }
    g.fillStyle = '#8e2a2a';
    g.font = '700 22px "WenQuanYi Micro Hei",sans-serif';
    g.fillText('财运 ' + (save.lifetime || 0) + ' · 游戏分数', 375, 860);
    g.fillStyle = '#6d5844';
    g.font = '16px "WenQuanYi Micro Hei",sans-serif';
    g.fillText('虚构民俗小游戏，不预测发财，也不收款', 375, 900);
    g.fillText('wan.is-my.app/caishen/', 375, 928);
  }
  function wrapText(g, text, x, y, max, lh) {
    var line = '';
    for (var i = 0; i < text.length; i++) {
      var t = line + text[i];
      if (g.measureText(t).width > max) { g.fillText(line, x, y); line = text[i]; y += lh; }
      else line = t;
    }
    g.fillText(line, x, y);
  }

  function hud() {
    var d = ensureDay();
    scoreEl.querySelector('b').textContent = '财运 ' + (save.lifetime || 0);
    scoreEl.querySelector('small').textContent = '游戏分数 · 今日 ' + (d.earned || 0) + '/' + eco.DAILY_CAP + ' · 金雨 ' + (d.coins || 0) + '/' + eco.COIN_MAX;
  }
  function sparkle(x, y) {
    for (var i = 0; i < 8; i++) sparks.push({ x: x, y: y, vx: (rnd() - 0.5) * 40, vy: -20 - rnd() * 30, life: 0.6 });
  }

  function resize() {
    cssW = canvas.clientWidth;
    cssH = canvas.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, cssW < 720 ? 1.5 : 2);
    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = cssW < 720 ? 2.05 : 1.5;
  }
  function screenToWorld(sx, sy) {
    return { x: (sx - cssW / 2) / scale + camX, y: (sy - cssH / 2) / scale + camY };
  }

  function makeTex(kind) {
    var c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    var g = c.getContext('2d');
    g.fillStyle = kind === 'stone' ? '#c4b7a4' : '#6d4630';
    g.fillRect(0, 0, 128, 128);
    for (var i = 0; i < 90; i++) {
      var x = (i * 37) % 128, y = (i * 19) % 128;
      g.fillStyle = kind === 'stone'
        ? (i % 3 ? 'rgba(90,70,50,.08)' : 'rgba(255,248,236,.18)')
        : (i % 2 ? 'rgba(0,0,0,.08)' : 'rgba(255,220,170,.06)');
      g.fillRect(x, y, kind === 'stone' ? 18 : 40, kind === 'stone' ? 10 : 6);
    }
    if (kind === 'wood') {
      g.strokeStyle = 'rgba(40,20,10,.18)';
      for (var yy = 8; yy < 128; yy += 14) {
        g.beginPath(); g.moveTo(0, yy); g.lineTo(128, yy + 2); g.stroke();
      }
    }
    return c;
  }
  function fillPat(img, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = ctx.createPattern(img, 'repeat');
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  function frame(t) {
    if (!last) last = t;
    var dt = Math.min(0.033, (t - last) / 1000);
    last = t;
    if (document.hidden) { requestAnimationFrame(frame); return; }
    var nd = todayStr();
    if (nd !== today) { today = nd; world = World.build(today); }
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function update(dt) {
    var typing = document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT');
    var mx = 0, my = 0, mag = 0;
    if (!sheetOpen && !typing) {
      if (joy.on) {
        mx = joy.x; my = joy.y; mag = hypot(mx, my);
        if (mag > 1) { mx /= mag; my /= mag; mag = 1; }
        if (mag < 0.18) mag = 0;
      } else {
        if (keys.a || keys.arrowleft) mx -= 1;
        if (keys.d || keys.arrowright) mx += 1;
        if (keys.w || keys.arrowup) my -= 1;
        if (keys.s || keys.arrowdown) my += 1;
        mag = hypot(mx, my);
        if (mag > 0) { mx /= mag; my /= mag; mag = 1; }
      }
      if (mag > 0) target = null;
      else if (target) {
        var dx = target.x - player.x, dy = target.y - player.y, dist = hypot(dx, dy);
        if (dist < 8) target = null;
        else { mx = dx / dist; my = dy / dist; mag = Math.min(1, dist / 40); }
      }
    }
    var freeze = (player.poseT > 0 && (player.pose === 'sit' || player.pose === 'apply')) || (activeHold && activeHold.holdFor === 'bow') || (bell && !bell.resolved);
    if (freeze) mag = 0;
    var speed = 172 * mag * dt;
    var beforeX = player.x, beforeY = player.y;
    if (speed > 0) {
      var nx = player.x + mx * speed, ny = player.y + my * speed;
      if (!world.blocked(nx, player.y, world.R)) player.x = nx;
      if (!world.blocked(player.x, ny, world.R)) player.y = ny;
      if (target && Math.abs(player.x - beforeX) < 0.2 && Math.abs(player.y - beforeY) < 0.2) target = null;
      player.phase += dt * 9 * mag;
      player.pose = player.hold === 'broom' || player.hold === 'stick' ? 'sweep' : 'walk';
      if (Math.abs(mx) > Math.abs(my)) player.facing = mx > 0 ? 'e' : 'w';
      else if (my) player.facing = my > 0 ? 's' : 'n';
      save.steps = (save.steps || 0) + speed;
    } else if (player.poseT <= 0 && !(bell && !bell.resolved)) {
      player.pose = player.hold === 'broom' ? 'sweep' : 'idle';
    }
    if (player.poseT > 0) {
      player.poseT -= dt;
      if (player.poseT <= 0 && player.pose === 'sit') player.pose = 'idle';
    }
    var k = 1 - Math.pow(0.0015, dt);
    camX += (player.x - camX) * k;
    camY += (player.y - camY) * k;
    var viewW = cssW / scale, viewH = cssH / scale;
    camX = clamp(camX, viewW / 2 - 40, world.W - viewW / 2 + 40);
    camY = clamp(camY, viewH / 2 - 40, world.H - viewH / 2 + 40);

    if (activeHold) {
      holdT += dt;
      var need = activeHold.holdFor === 'incense' ? 1.15 : activeHold.holdFor === 'bow' ? 0.95 : 0.85;
      if (holdT >= need) {
        var kind = activeHold.holdFor;
        var extra = activeHold.extra;
        activeHold = null;
        holdT = 0;
        if (kind === 'incense') {
          player.pose = 'offer';
          player.poseT = 0.5;
          reward(eco.grant(save, today, 'incense'));
          blip(660, 0.2, 'sine', 0.04);
        } else if (kind === 'bow') {
          player.pose = 'bow';
          player.poseT = 0.7;
          reward(eco.grant(save, today, 'bow'));
        } else if (kind === 'oil') {
          ensureDay().lamps[extra] = true;
          player.pose = 'offer';
          player.poseT = 0.35;
          blip(520, 0.12, 'triangle', 0.04);
          if (world.lamps.every(function (l) { return ensureDay().lamps[l.id]; })) {
            player.hold = null;
            reward(eco.grant(save, today, 'oil'));
          } else say('这盏亮了。还有灯没添。');
        }
      }
    }
    if (bell && !bell.resolved) {
      bell.t += dt;
      if (bell.t > 1.35) {
        bell.tries += 1;
        bell.t = 0.15;
        if (bell.tries >= 3) {
          bell.resolved = true;
          bellSound(false);
          reward(eco.grant(save, today, 'bell'));
          say('钟还是响了。今日这一下记下。');
        }
      }
    }
    if (player.hold === 'broom') {
      var d0 = ensureDay();
      world.leaves.forEach(function (l) {
        if (!d0.swept[l.id] && hypot(player.x - l.x, player.y - l.y) < 28) {
          d0.swept[l.id] = true;
          sparkle(l.x, l.y);
        }
      });
      if (allSwept()) { player.hold = null; reward(eco.grant(save, today, 'sweep')); }
    }
    if (player.hold === 'stick') {
      var d1 = ensureDay();
      world.ashes.forEach(function (a) {
        if (!d1.ashes[a.id] && hypot(player.x - a.x, player.y - a.y) < 26) d1.ashes[a.id] = true;
      });
      if (allAsh()) { player.hold = null; reward(eco.grant(save, today, 'tidy')); }
    }
    if (player.hold === 'cloth') {
      var d2 = ensureDay();
      world.dusts.forEach(function (dust) {
        if (!d2.dust[dust.id] && Math.abs(player.x - dust.x) < 28 && player.y > 710 && player.y < 820) d2.dust[dust.id] = true;
      });
      if (!dustLeft()) { player.hold = null; reward(eco.grant(save, today, 'wipe')); }
    }
    if (raining) {
      rainT += dt;
      if (player.pose !== 'sit' && rainSpawned < 14 && rainT > 0.45 + rainSpawned * 0.42) {
        var cx = 980 + rnd() * 200;
        var cy = 730 + rnd() * 50;
        if (!world.blocked(cx, cy, 8)) coins.push({ x: cx, y: cy, z: 210, vz: 0, got: false, age: 0 });
        rainSpawned++;
      }
      if (rainT > 14) raining = false;
    }
    for (var i = coins.length - 1; i >= 0; i--) {
      var c = coins[i];
      c.vz -= 760 * dt;
      c.z += c.vz * dt;
      if (c.z <= 0) { c.z = 0; c.vz = c.vz < -40 ? -c.vz * 0.28 : 0; c.age += dt; }
      if (!c.got && c.z < 36 && hypot(player.x - c.x, player.y - c.y) < 24) {
        c.got = true;
        sparkle(c.x, c.y - 10);
        blip(1320, 0.07, 'square', 0.04);
        reward(eco.grant(save, today, 'coin'));
      }
      if (c.got || c.age > 1.6) coins.splice(i, 1);
    }
    if (ensureDay().done.incense && smokes.length < 28 && rnd() < dt * 10) {
      smokes.push({ x: 1050 + (rnd() - 0.5) * 10, y: 1168, life: 1, vy: -18 - rnd() * 16, vx: (rnd() - 0.5) * 8 });
    }
    smokes.forEach(function (s) { s.y += s.vy * dt; s.x += s.vx * dt; s.life -= dt * 0.35; });
    smokes = smokes.filter(function (s) { return s.life > 0; });
    sparks.forEach(function (s) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; });
    sparks = sparks.filter(function (s) { return s.life > 0; });
    floats.forEach(function (f) { f.y -= 16 * dt; f.life -= dt; });
    floats = floats.filter(function (f) { return f.life > 0; });

    var dly = ensureDay();
    if (!dly.done.checkin && player.y < 1465 && player.x > 880 && player.x < 1240 && player.y > 1320) {
      if (save.charms.indexOf(CHARMS[(save.visitDays || 0) % CHARMS.length]) < 0) {
        /* charm chosen below */
      }
      if (!dly.visited) { dly.visited = true; save.visitDays = (save.visitDays || 0) + 1; }
      var charm = CHARMS[(save.visitDays - 1) % (CHARMS.length - 1)];
      if (save.charms.indexOf(charm) < 0) save.charms.push(charm);
      reward(eco.grant(save, today, 'checkin'));
    }
    Object.keys(world.rooms).forEach(function (name) {
      var room = world.rooms[name];
      if (world.inRect(room, player.x, player.y)) {
        var res = eco.grant(save, today, 'once', { id: room.once, amount: room.amount, reason: room.reason });
        if (res.amount > 0) reward(res);
      }
    });

    var n = nearest();
    if (!n || sheetOpen) actBtn.hidden = true;
    else {
      actBtn.hidden = false;
      actBtn.textContent = n.hold && activeHold ? n.label + ' ' + Math.min(100, Math.round(holdT / (n.holdFor === 'incense' ? 1.15 : 0.9) * 100)) + '%' : n.label;
    }
    if (Math.random() < 0.02) saveSoon();
  }

  function draw() {
    var fest = world.festival;
    var sky = ctx.createLinearGradient(0, 0, 0, cssH);
    if (fest.mode === 'spring' || fest.mode === 'caishen' || fest.mode === 'eve') {
      sky.addColorStop(0, '#6a2430'); sky.addColorStop(1, '#e7b15a');
    } else if (fest.season === 'winter') {
      sky.addColorStop(0, '#24344a'); sky.addColorStop(1, '#d7c6ae');
    } else if (fest.season === 'summer') {
      sky.addColorStop(0, '#6ea0c8'); sky.addColorStop(1, '#f0e2c4');
    } else {
      sky.addColorStop(0, '#7f96ae'); sky.addColorStop(1, '#f0d8b4');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.save();
    ctx.translate(cssW / 2, cssH / 2);
    ctx.scale(scale, scale);
    ctx.translate(-camX, -camY);
    if (!stoneTex) { stoneTex = makeTex('stone'); woodTex = makeTex('wood'); }
    ctx.fillStyle = '#5e6b56';
    ctx.fillRect(0, 0, world.W, world.H);
    fillPat(stoneTex, 480, 860, 1160, 620);
    fillPat(stoneTex, 860, 1460, 420, 200);
    ctx.fillStyle = 'rgba(90,70,50,.18)';
    ctx.fillRect(900, 900, 300, 460);
    ctx.fillStyle = '#54664c';
    ctx.fillRect(180, 110, 1560, 220);
    ctx.fillStyle = '#465443';
    ctx.fillRect(180, 300, 500, 1100);
    fillPat(woodTex, 760, 380, 580, 420);
    fillPat(woodTex, 1680, 940, 320, 280);
    ctx.fillStyle = '#7a2430';
    ctx.fillRect(980, 700, 220, 90);
    ctx.fillStyle = '#f0d9a0';
    ctx.fillRect(1004, 716, 172, 8);
    ctx.fillStyle = '#c4554a';
    ctx.fillRect(1088, 748, 56, 22);
    if ((ensureDay().flowers || 0) > 0) drawVase(1320, 1040, ensureDay().flowers);
    drawFlatProps();
    var sprites = [];
    world.solids.forEach(function (s) {
      if (s.kind === 'void' || s.kind === 'statue' || s.kind === 'table' || s.kind === 'burner' || s.kind === 'bell' || s.kind === 'well' || s.kind === 'tree') return;
      sprites.push({ y: s.y + s.h, draw: function () { drawWall(s); } });
    });
    world.trees.forEach(function (p) { sprites.push({ y: p[1], draw: function () { drawTree(p[0], p[1]); } }); });
    sprites.push({ y: 1186, draw: function () { drawBurner(1050, 1186); } });
    sprites.push({ y: 1128, draw: function () { drawBell(568, 1128); } });
    sprites.push({ y: 250, draw: function () { drawWell(658, 250); } });
    sprites.push({ y: 698, draw: function () { drawTable(1130, 698); } });
    sprites.push({ y: 550, draw: function () { drawStatue(1145, 550); } });
    world.lamps.forEach(function (l) { sprites.push({ y: l.y, draw: function () { drawLamp(l.x, l.y, !!ensureDay().lamps[l.id]); } }); });
    var py = player.y;
    sprites.push({ y: py, draw: function () { drawPerson(ctx, player.x, player.y, player.outfit, player.facing, player.pose, player.phase, player.hold); } });
    sprites.sort(function (a, b) { return a.y - b.y; });
    sprites.forEach(function (s) { s.draw(); });
    drawRoof();
    var gateA = clamp((player.y - 1380) / 90, 0, 1);
    if (gateA > 0.02) drawGate(gateA);
    var frontA = clamp((player.y - 900) / 110, 0, 1);
    if (frontA > 0.02) drawHallFace(frontA);
    if (fest.mode === 'caishen' || fest.mode === 'spring' || fest.mode === 'eve') drawBanners();
    smokes.forEach(function (s) {
      ctx.fillStyle = 'rgba(230,230,230,' + (s.life * 0.35) + ')';
      ctx.beginPath(); ctx.ellipse(s.x, s.y, 6 + (1 - s.life) * 8, 8, 0, 0, 7); ctx.fill();
    });
    coins.forEach(function (c) { drawCoin(c); });
    sparks.forEach(function (s) {
      ctx.globalAlpha = Math.max(0, s.life * 2);
      ctx.fillStyle = '#f0d48a';
      ctx.fillRect(s.x, s.y, 3, 3);
      ctx.globalAlpha = 1;
    });
    var n = nearest();
    if (n && !sheetOpen && n.r < 200) {
      ctx.strokeStyle = 'rgba(240,212,138,.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, reduce ? 16 : 15 + Math.sin(last / 200) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    floats.forEach(function (f) {
      ctx.globalAlpha = clamp(f.life, 0, 1);
      ctx.fillStyle = '#2a160f';
      ctx.font = '700 13px "WenQuanYi Micro Hei",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    });
    if (player.y > 380 && player.y < 860 && player.x > 760 && player.x < 1420) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var g = ctx.createRadialGradient(1145, 480, 10, 1145, 560, 220);
      g.addColorStop(0, 'rgba(255,196,110,.28)');
      g.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = g;
      ctx.fillRect(760, 380, 600, 460);
      ctx.restore();
    }
    ctx.restore();
    if (bell && !bell.resolved) {
      var p = worldToScreen(world.spots.bell.x, world.spots.bell.y - 30);
      ctx.strokeStyle = '#f0d48a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 22 + (1.2 - (bell.t % 1.2)) * 18, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  function worldToScreen(x, y) {
    return { x: (x - camX) * scale + cssW / 2, y: (y - camY) * scale + cssH / 2 };
  }
  function drawFlatProps() {
    var d = ensureDay();
    world.leaves.forEach(function (l) {
      if (d.swept[l.id]) return;
      ctx.fillStyle = '#c4552a';
      ctx.beginPath();
      ctx.ellipse(l.x, l.y, 7, 3, 0.6, 0, 7);
      ctx.fill();
    });
    world.ashes.forEach(function (a) {
      if (d.ashes[a.id]) return;
      ctx.fillStyle = '#6b6560';
      ctx.beginPath(); ctx.arc(a.x, a.y, 4, 0, 7); ctx.fill();
    });
    world.caches.forEach(function (c) {
      if (d.found[c.id]) return;
      ctx.fillStyle = reduce ? '#e4c56a' : 'rgba(228,197,106,' + (0.45 + Math.sin(last / 260 + c.x) * 0.35) + ')';
      ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, 7); ctx.fill();
    });
    if (!save.once || !save.once.brick) {
      ctx.fillStyle = '#8a7564';
      ctx.fillRect(268, 728, 22, 10);
    }
  }
  function drawWall(s) {
    var hall = s.x >= 680 && s.x < 1500 && s.y >= 280 && s.y < 900;
    var h = hall ? 92 : s.y > 1280 ? 110 : 58;
    var grd = ctx.createLinearGradient(s.x, s.y - h, s.x, s.y + s.h);
    if (hall) { grd.addColorStop(0, '#a33b40'); grd.addColorStop(1, '#5c1c24'); }
    else { grd.addColorStop(0, '#efe6d6'); grd.addColorStop(1, '#b7a894'); }
    ctx.fillStyle = grd;
    ctx.fillRect(s.x, s.y - h, s.w, h + s.h);
    ctx.fillStyle = hall ? '#e4c56a' : '#8d7b66';
    ctx.fillRect(s.x, s.y - h, s.w, 7);
    ctx.fillStyle = hall ? '#3a1418' : '#6d5c4c';
    ctx.fillRect(s.x, s.y + s.h - 8, s.w, 8);
    if (hall && s.w > 50) {
      ctx.fillStyle = '#f0d48a';
      for (var x = s.x + 12; x < s.x + s.w - 6; x += 16) ctx.beginPath(), ctx.arc(x, s.y - h + 24, 1.6, 0, 7), ctx.fill();
    }
  }
  function drawTree(x, y) {
    ctx.fillStyle = '#3e2a22';
    ctx.fillRect(x - 4, y - 26, 8, 26);
    ctx.fillStyle = world.festival.season === 'autumn' ? '#c4552a' : '#2f6a48';
    ctx.beginPath(); ctx.arc(x, y - 40, 18, 0, 7); ctx.fill();
    ctx.fillStyle = world.festival.season === 'autumn' ? '#e0a040' : '#3e8060';
    ctx.beginPath(); ctx.arc(x + 8, y - 34, 12, 0, 7); ctx.fill();
  }
  function drawBurner(x, y) {
    ctx.fillStyle = '#5c5148';
    ctx.fillRect(x - 16, y - 18, 32, 18);
    ctx.fillStyle = '#8a8074';
    ctx.fillRect(x - 22, y - 22, 44, 6);
    if (ensureDay().done.incense) {
      ctx.strokeStyle = '#c4554a';
      ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(x, y - 40); ctx.stroke();
    }
  }
  function drawBell(x, y) {
    ctx.strokeStyle = '#6b5436';
    ctx.beginPath(); ctx.moveTo(x, y - 70); ctx.lineTo(x, y - 28); ctx.stroke();
    var swing = bell && !bell.resolved ? Math.sin(bell.t * 14) * 6 : 0;
    ctx.save();
    ctx.translate(x + swing, y - 10);
    ctx.fillStyle = '#c6a15a';
    ctx.beginPath(); ctx.moveTo(-14, -20); ctx.lineTo(14, -20); ctx.lineTo(8, 8); ctx.lineTo(-8, 8); ctx.fill();
    ctx.restore();
  }
  function drawWell(x, y) {
    ctx.fillStyle = '#8d8276';
    ctx.beginPath(); ctx.ellipse(x, y - 8, 28, 12, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#1c242c';
    ctx.beginPath(); ctx.ellipse(x, y - 10, 16, 7, 0, 0, 7); ctx.fill();
  }
  function drawTable(x, y) {
    ctx.fillStyle = '#6b422c';
    ctx.fillRect(x - 140, y - 70, 280, 70);
    ctx.fillStyle = '#e8dcc4';
    ctx.fillRect(x - 120, y - 78, 240, 16);
    var d = ensureDay();
    world.dusts.forEach(function (dust) {
      if (d.dust[dust.id]) return;
      ctx.fillStyle = 'rgba(90,80,70,.55)';
      ctx.beginPath(); ctx.ellipse(dust.x, y - 70, 14, 6, 0, 0, 7); ctx.fill();
    });
  }
  function drawVase(x, y, n) {
    ctx.fillStyle = '#2f5d62';
    ctx.fillRect(x - 8, y - 16, 16, 16);
    ctx.strokeStyle = '#c4554a';
    for (var i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.quadraticCurveTo(x - 10 + i * 8, y - 36, x - 6 + i * 6, y - 28);
      ctx.stroke();
    }
  }
  function drawLamp(x, y, lit) {
    ctx.fillStyle = '#3a2a22';
    ctx.fillRect(x - 4, y - 28, 8, 28);
    ctx.fillStyle = lit ? '#f0c36a' : '#5c5148';
    ctx.beginPath(); ctx.arc(x, y - 34, 8, 0, 7); ctx.fill();
  }
  function drawEave(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + 28, y);
    ctx.lineTo(x + w - 28, y);
    ctx.quadraticCurveTo(x + w + 10, y + h * 0.35, x + w - 6, y + h);
    ctx.lineTo(x + 6, y + h);
    ctx.quadraticCurveTo(x - 10, y + h * 0.35, x + 28, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e4c56a';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 1;
    var n = Math.max(4, Math.floor(w / 36));
    for (var i = 1; i < n; i++) {
      var px = x + (w * i) / n;
      ctx.beginPath();
      ctx.moveTo(px, y + 3);
      ctx.lineTo(px, y + h - 3);
      ctx.stroke();
    }
  }
  function drawHangingLantern(x, y) {
    ctx.strokeStyle = '#6b5436';
    ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = '#9a2e32';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8, y + 8); ctx.lineTo(x, y + 22); ctx.lineTo(x - 8, y + 8); ctx.fill();
    ctx.fillStyle = '#f0d48a';
    ctx.fillRect(x - 2, y + 8, 4, 6);
  }
  function drawRoof() {
    if (player.y < 340) return;
    drawEave(620, 168, 860, 34, '#242a30');
    drawEave(660, 132, 780, 28, '#343b44');
    drawEave(710, 102, 680, 22, '#4a342c');
    ctx.fillStyle = '#e4c56a';
    ctx.fillRect(1040, 78, 8, 28);
  }
  function drawGate(a) {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#7a242c';
    ctx.fillRect(830, 1268, 42, 160);
    ctx.fillRect(1228, 1268, 42, 160);
    ctx.fillStyle = '#efe6d4';
    ctx.fillRect(812, 1408, 78, 24);
    ctx.fillRect(1210, 1408, 78, 24);
    drawEave(760, 1228, 580, 40, '#2a3138');
    drawEave(800, 1192, 500, 30, '#3c4650');
    ctx.fillStyle = '#f6efe2';
    ctx.fillRect(930, 1248, 240, 62);
    ctx.strokeStyle = '#8e2f32';
    ctx.lineWidth = 2;
    ctx.strokeRect(938, 1256, 224, 46);
    ctx.fillStyle = '#6e2430';
    ctx.font = '700 34px "Songti SC","WenQuanYi Micro Hei",serif';
    ctx.textAlign = 'center';
    ctx.fillText('云阶殿', 1050, 1290);
    drawHangingLantern(900, 1296);
    drawHangingLantern(1200, 1296);
    ctx.restore();
  }
  function drawHallFace(a) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.92, a);
    drawEave(720, 690, 660, 46, '#2a3138');
    drawEave(760, 656, 580, 32, '#3c4650');
    ctx.fillStyle = '#f6efe2';
    ctx.fillRect(930, 748, 240, 52);
    ctx.strokeStyle = '#8e2f32';
    ctx.strokeRect(938, 756, 224, 36);
    ctx.fillStyle = '#6e2430';
    ctx.font = '700 26px "Songti SC","WenQuanYi Micro Hei",serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.festival.mode === 'caishen' ? '迎财神' : '正殿', 1050, 782);
    drawHangingLantern(860, 760);
    drawHangingLantern(1240, 760);
    ctx.restore();
  }
  function drawBanners() {
    ctx.fillStyle = '#8e2a2a';
    ctx.fillRect(760, 900, 18, 70);
    ctx.fillRect(1400, 900, 18, 70);
    ctx.fillStyle = '#f0d48a';
    ctx.font = '12px "WenQuanYi Micro Hei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.festival.mode === 'caishen' ? '迎' : '春', 769, 940);
  }
  function drawCoin(c) {
    ctx.save();
    ctx.translate(c.x, c.y - c.z);
    ctx.fillStyle = 'rgba(40,24,16,.25)';
    ctx.beginPath(); ctx.ellipse(0, c.z * 0.15, 7, 3, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#e4c56a';
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill();
    ctx.fillStyle = '#6b422c';
    ctx.fillRect(-2, -2, 4, 4);
    ctx.restore();
  }
  function drawStatue(x, y) {
    var gild = save.gild || [];
    function tone(id, lacquer, hi) {
      if (gild.indexOf(id) < 0) return lacquer;
      var g = ctx.createLinearGradient(x - 20, y - 120, x + 24, y);
      g.addColorStop(0, hi || '#fff1c2');
      g.addColorStop(0.45, '#e4c56a');
      g.addColorStop(1, '#a37b2c');
      return g;
    }
    ctx.fillStyle = tone(7, '#4a342c');
    ctx.beginPath(); ctx.ellipse(x, y - 4, 50, 16, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#e4c56a';
    ctx.stroke();
    ctx.fillStyle = tone(3, '#3a2a24');
    ctx.beginPath();
    ctx.moveTo(x - 26, y - 86);
    ctx.lineTo(x + 26, y - 86);
    ctx.lineTo(x + 34, y - 18);
    ctx.lineTo(x - 34, y - 18);
    ctx.fill();
    ctx.fillStyle = tone(4, '#3a2a24');
    ctx.beginPath();
    ctx.moveTo(x - 26, y - 80); ctx.lineTo(x - 48, y - 70); ctx.lineTo(x - 40, y - 28); ctx.lineTo(x - 22, y - 40);
    ctx.fill();
    ctx.fillStyle = tone(5, '#3a2a24');
    ctx.beginPath();
    ctx.moveTo(x + 26, y - 80); ctx.lineTo(x + 48, y - 70); ctx.lineTo(x + 40, y - 28); ctx.lineTo(x + 22, y - 40);
    ctx.fill();
    ctx.fillStyle = tone(6, '#6b5436', '#fff6d4');
    ctx.fillRect(x - 4, y - 58, 8, 30);
    ctx.beginPath(); ctx.arc(x + 8, y - 62, 9, 0, 7); ctx.fill();
    ctx.fillStyle = tone(1, '#e4b898', '#ffe7c4');
    ctx.beginPath(); ctx.ellipse(x, y - 104, 18, 20, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a241c';
    ctx.beginPath(); ctx.arc(x - 6, y - 106, 1.7, 0, 7); ctx.arc(x + 6, y - 106, 1.7, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3a241c';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y - 96, 5, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 8, y - 112); ctx.quadraticCurveTo(x - 4, y - 108, x - 1, y - 112); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 1, y - 112); ctx.quadraticCurveTo(x + 4, y - 108, x + 8, y - 112); ctx.stroke();
    ctx.strokeStyle = gild.indexOf(2) >= 0 ? '#8a6428' : '#2a211c';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 90); ctx.quadraticCurveTo(x - 18, y - 70, x - 6, y - 64);
    ctx.moveTo(x, y - 88); ctx.quadraticCurveTo(x - 2, y - 68, x, y - 58);
    ctx.moveTo(x + 8, y - 90); ctx.quadraticCurveTo(x + 18, y - 70, x + 6, y - 64);
    ctx.stroke();
    ctx.fillStyle = tone(0, '#2a211c', '#f3e2a8');
    ctx.fillRect(x - 20, y - 132, 40, 16);
    ctx.fillRect(x - 8, y - 148, 16, 18);
    ctx.fillRect(x - 28, y - 124, 10, 4);
    ctx.fillRect(x + 18, y - 124, 10, 4);
    if (gild.length && !reduce) {
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = '#fff6d0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 10 + ((last / 40) % 30), y - 130);
      ctx.lineTo(x - 18 + ((last / 40) % 30), y - 40);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if ((save.lifetime || 0) < eco.GOLD_AT) {
      ctx.fillStyle = '#f6efe2';
      ctx.fillRect(x - 38, y - 16, 76, 18);
      ctx.fillStyle = '#6e2430';
      ctx.font = '12px "WenQuanYi Micro Hei",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('金身 ' + (save.lifetime || 0) + '/' + eco.GOLD_AT, x, y - 3);
    }
  }

  function drawPerson(g, x, y, o, face, pose, phase, hold) {
    var pal = PAL[o.palette] || PAL[0];
    var skin = SKIN[o.skin] || SKIN[0];
    var hair = HAIR_C[o.hairColor] || HAIR_C[0];
    var side = face === 'w' || face === 'e';
    var back = face === 'n';
    var bob = pose === 'walk' && !reduce ? Math.abs(Math.sin(phase)) * 1.7 : 0;
    var swing = pose === 'walk' || pose === 'sweep' ? Math.sin(phase) : 0;
    if (pose === 'bow') bob = 4;
    g.save();
    g.translate(x, y);
    g.scale(face === 'w' ? -1.65 : 1.65, 1.65);
    g.fillStyle = 'rgba(40,24,16,.35)';
    g.beginPath(); g.ellipse(0, 2, 11, 4, 0, 0, 7); g.fill();
    g.translate(0, -bob);
    if (pose === 'sit') g.translate(0, 8);
    if (o.robe === 3) {
      g.fillStyle = pal.accent;
      g.beginPath(); g.ellipse(0, -24, 16, 20, 0, 0, 7); g.fill();
    }
    g.fillStyle = pal.bottom;
    if (pose === 'sit') {
      g.fillRect(-12, -8, 24, 6);
    } else if (o.bottom === 0 && o.robe !== 1) {
      g.beginPath();
      g.moveTo(-10, -22); g.lineTo(10, -22); g.lineTo(13 + swing, -3); g.lineTo(-13 + swing, -3);
      g.fill();
    } else {
      g.fillRect(-7 + swing * 2, -22, 5, 16);
      g.fillRect(2 - swing * 2, -22, 5, 16);
    }
    g.fillStyle = pal.shoe;
    if (pose !== 'sit') {
      var shoeH = o.shoes === 1 ? 6 : 4;
      g.fillRect(-8 + swing * 2, -6, o.shoes === 2 ? 7 : 6, shoeH);
      g.fillRect(2 - swing * 2, -6, o.shoes === 2 ? 7 : 6, shoeH);
      if (o.shoes === 3) { g.fillStyle = pal.accent; g.fillRect(-8, -4, 6, 2); g.fillRect(2, -4, 6, 2); }
    }
    var robeTop = o.robe === 1 || o.robe === 4 ? -34 : -40;
    var robeBot = o.robe === 1 ? -16 : -8;
    g.fillStyle = pal.robe;
    if (o.robe === 2 || o.robe === 5) g.fillRect(-11, -42, 22, 36);
    else if (o.robe === 4) { g.fillRect(-9, -36, 18, 20); g.fillStyle = skin; g.fillRect(-14, -34, 5, 12); g.fillRect(9, -34, 5, 12); g.fillStyle = pal.robe; }
    else {
      g.beginPath();
      g.moveTo(-8, robeTop); g.lineTo(8, robeTop); g.lineTo(12, robeBot); g.lineTo(-12, robeBot);
      g.fill();
    }
    if (o.robe !== 4) {
      g.fillStyle = pal.robe;
      var arm = pose === 'bow' ? 0 : swing * 5;
      g.fillRect(-16, -34, 6, 16 + (pose === 'sweep' ? 4 : 0));
      g.save();
      g.translate(12, -32);
      g.rotate(arm * 0.08 + (pose === 'offer' || pose === 'apply' ? -0.8 : 0));
      g.fillRect(0, 0, 6, 16);
      g.restore();
    }
    g.strokeStyle = pal.trim;
    g.lineWidth = o.robe === 5 ? 2.4 : 1.4;
    g.strokeRect(-8, robeTop, 16, 10);
    if (!back && o.robe !== 4) {
      g.beginPath();
      g.moveTo(0, robeTop + 2); g.lineTo(-3, robeTop + 12); g.lineTo(3, robeTop + 12); g.closePath();
      g.stroke();
    }
    if (o.accessory === 1) { g.strokeStyle = pal.accent; g.beginPath(); g.moveTo(-6, -18); g.lineTo(8, -8); g.stroke(); }
    if (o.accessory === 4) { g.fillStyle = pal.accent; g.fillRect(-4, -30, 14, 5); }
    if (back) {
      g.fillStyle = hair;
      drawHair(g, o.hair, true);
      g.fillStyle = skin;
      g.beginPath(); g.arc(0, -44, 8, 0, 7); g.fill();
      g.fillStyle = hair;
      drawHair(g, o.hair, true);
    } else {
      g.fillStyle = hair;
      if (o.hair === 1 || o.hair === 4) drawHair(g, o.hair, true);
      g.fillStyle = skin;
      g.beginPath(); g.ellipse(side ? 2 : 0, -44, side ? 7 : 8, 8.5, 0, 0, 7); g.fill();
      g.fillStyle = '#2a211c';
      if (pose === 'bow') {
        g.fillRect(-3, -42, 6, 2);
      } else if (!side) {
        g.fillRect(-4, -46, 2, 2); g.fillRect(2, -46, 2, 2);
        g.fillRect(-1, -41, 2, 1);
      } else g.fillRect(4, -46, 2,2, 2);
      g.fillStyle = hair;
      drawHair(g, o.hair, false);
    }
    drawHat(g, o.hat, pal);
    if (o.accessory === 3 && !back) { g.fillStyle = pal.accent; g.fillRect(side ? 8 : 8, -42, 2, 4); }
    if (o.accessory === 5) { g.fillStyle = '#7eb8a4'; g.beginPath(); g.arc(0, -22, 3, 0, 7); g.fill(); }
    if (o.accessory === 2) { g.strokeStyle = pal.trim; g.beginPath(); g.moveTo(8, -16); g.lineTo(14, -6); g.stroke(); }
    drawHold(g, hold, pal, pose);
    g.restore();
  }
  function drawHair(g, id, back) {
    if (id === 0) { g.beginPath(); g.arc(0, -54, 5, 0, 7); g.fill(); }
    else if (id === 1) {
      g.fillRect(-9, -48, 4, back ? 28 : 22);
      g.fillRect(5, -48, 4, back ? 28 : 22);
    } else if (id === 2) { g.fillRect(-8, -52, 16, 8); }
    else if (id === 3) {
      g.beginPath(); g.arc(-7, -50, 4, 0, 7); g.arc(7, -50, 4, 0, 7); g.fill();
    } else if (id === 4) { g.fillRect(4, -46, 4, 26); }
    else { g.beginPath(); g.arc(0, -56, 6, 0, 7); g.fill(); g.strokeStyle = '#e4c56a'; g.beginPath(); g.moveTo(-4, -56); g.lineTo(6, -50); g.stroke(); }
  }
  function drawHat(g, id, pal) {
    if (!id) return;
    if (id === 1) { g.fillStyle = pal.accent; g.fillRect(-9, -50, 18, 3); }
    else if (id === 2) { g.fillStyle = pal.trim; g.fillRect(-9, -58, 18, 8); }
    else if (id === 3) {
      g.fillStyle = '#c6a36e';
      g.beginPath(); g.ellipse(0, -52, 16, 5, 0, 0, 7); g.fill();
    } else if (id === 4) {
      g.fillStyle = 'rgba(246,239,226,.85)';
      g.fillRect(-10, -48, 20, 16);
    }
  }
  function drawHold(g, hold, pal, pose) {
    if (hold === 'broom' || hold === 'stick') {
      g.strokeStyle = '#6b422c';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(10, -20);
      g.lineTo(18, pose === 'sweep' ? -2 + Math.sin(player.phase) * 6 : 4);
      g.stroke();
    } else if (hold === 'flower') {
      g.strokeStyle = '#2f6a48';
      g.beginPath(); g.moveTo(12, -24); g.lineTo(16, -38); g.stroke();
      g.fillStyle = '#c4554a';
      g.beginPath(); g.arc(16, -40, 3, 0, 7); g.fill();
    } else if (hold === 'ladle') {
      g.fillStyle = '#c6a15a';
      g.fillRect(12, -28, 4, 12);
    } else if (hold === 'lantern') {
      g.fillStyle = '#8e2a2a';
      g.fillRect(10, -36, 10, 12);
    } else if (hold === 'leaf') {
      g.fillStyle = '#f0d48a';
      g.fillRect(10, -30, 8, 8);
    } else if (hold === 'cloth') {
      g.fillStyle = '#f6efe2';
      g.fillRect(8, -22, 10, 7);
    } else if (hold === 'tag') {
      g.fillStyle = '#c4554a';
      g.fillRect(10, -32, 8, 12);
    } else if (pose === 'bow') {
      g.fillStyle = pal.accent;
      g.beginPath(); g.arc(0, -28, 4, 0, 7); g.fill();
    }
  }

  function actDown() {
    audioUnlock();
    var n = nearest();
    if (!n) return;
    if (n.hold) { activeHold = n; holdT = 0; if (n.holdFor === 'bow') player.pose = 'bow'; }
    else if (n.press) n.press();
  }
  function actUp() { activeHold = null; holdT = 0; }

  window.addEventListener('keydown', function (e) {
    var typing = document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT');
    if (typing) {
      if (e.key === 'Escape') closeSheet();
      return;
    }
    keys[e.key.toLowerCase()] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(e.key.toLowerCase()) >= 0) e.preventDefault();
    if (e.repeat) return;
    if (e.key === 'e' || e.key === 'E' || e.key === ' ') { audioUnlock(); actDown(); }
    if (e.key === 'Escape') { if (bell && !bell.resolved) bell = null; closeSheet(); }
    if (e.key === 'j' || e.key === 'J') openJournal();
    if (e.key === 'm' || e.key === 'M') toggleMute();
  });
  window.addEventListener('keyup', function (e) {
    keys[e.key.toLowerCase()] = false;
    if (e.key === 'e' || e.key === 'E' || e.key === ' ') actUp();
  });
  actBtn.addEventListener('pointerdown', function (e) { e.preventDefault(); actDown(); });
  actBtn.addEventListener('pointerup', actUp);
  actBtn.addEventListener('pointerleave', actUp);
  document.getElementById('btn-book').onclick = function () { audioUnlock(); openJournal(); };
  document.getElementById('btn-mute').onclick = toggleMute;
  function toggleMute() {
    save.mute = !save.mute;
    document.getElementById('btn-mute').setAttribute('aria-pressed', save.mute ? 'true' : 'false');
    document.getElementById('btn-mute').textContent = save.mute ? '已静音' : '声音';
    if (save.mute) stopDrone(); else audioUnlock();
    persist();
  }
  canvas.addEventListener('pointerdown', function (e) {
    if (e.target !== canvas) return;
    audioUnlock();
    pointer = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  canvas.addEventListener('pointerup', function (e) {
    if (!pointer || pointer.id !== e.pointerId) return;
    var dx = e.clientX - pointer.x, dy = e.clientY - pointer.y;
    pointer = null;
    if (sheetOpen) return;
    if (dx * dx + dy * dy > 64) return;
    target = screenToWorld(e.clientX, e.clientY);
    joy.on = false;
  });
  joyEl.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    e.stopPropagation();
    audioUnlock();
    joy.id = e.pointerId;
    joyEl.setPointerCapture(e.pointerId);
    moveJoy(e);
  });
  joyEl.addEventListener('pointermove', function (e) { if (joy.id === e.pointerId) moveJoy(e); });
  function endJoy(e) { if (joy.id === e.pointerId) { joy.on = false; joy.x = 0; joy.y = 0; joy.id = null; knob.style.left = '36px'; knob.style.top = '36px'; } }
  joyEl.addEventListener('pointerup', endJoy);
  joyEl.addEventListener('pointercancel', endJoy);
  function moveJoy(e) {
    var r = joyEl.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var dx = e.clientX - cx, dy = e.clientY - cy;
    var m = hypot(dx, dy) || 1;
    var lim = 40;
    var k = Math.min(lim, m) / m;
    joy.on = true;
    joy.x = dx / lim;
    joy.y = dy / lim;
    knob.style.left = (36 + dx * k) + 'px';
    knob.style.top = (36 + dy * k) + 'px';
    target = null;
  }
  if (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) document.body.classList.add('touch');
  window.addEventListener('touchstart', function () { document.body.classList.add('touch'); }, { once: true });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () { if (document.hidden) persist(); });
  window.addEventListener('pagehide', persist);

  resize();
  hud();
  if (save.mute) document.getElementById('btn-mute').textContent = '已静音';
  if (!save.helpSeen) openHelp();
  requestAnimationFrame(frame);

  window.__cs = {
    player: player,
    save: save,
    world: world,
    eco: eco,
    setPos: function (x, y) { player.x = x; player.y = y; camX = x; camY = y; },
    setOutfit: function (o) { Object.assign(player.outfit, o); saveSoon(); },
    setLifetime: function (n) { save.lifetime = n; hud(); },
    roll: function () { player.outfit = rollOutfit(rnd); saveSoon(); return player.outfit; },
    startRain: startRain,
    setFest: function (mode) { world.festival = { mode: mode, label: mode, season: world.festival.season }; },
    hold: function (h) { player.hold = h; },
    pose: function (p) { player.pose = p; },
    ready: true
  };
})();
