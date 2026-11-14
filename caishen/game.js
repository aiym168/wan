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
    scale = window.CSView.resize(canvas, cssW, cssH);
  }
  function screenToWorld(sx, sy) {
    return window.CSView.screenToWorld(sx, sy);
  }
  function draw() {
    window.CSView.draw({
      camX: camX, camY: camY,
      world: world, player: player, save: save,
      ensureDay: ensureDay,
      coins: coins, smokes: smokes, sparks: sparks, floats: floats,
      bell: bell, reduce: reduce, sheetOpen: sheetOpen,
      nearest: nearest, now: last, goldAt: eco.GOLD_AT
    });
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
    camX = clamp(camX, 30, world.W - 30);
    camY = clamp(camY, 30, world.H - 30);

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
        if (!world.blocked(cx, cy, 8)) coins.push({ x: cx, y: cy, z: 260, vz: 20, got: false, age: 0, t: rnd() * 6 });
        rainSpawned++;
      }
      if (rainT > 14) raining = false;
    }
    for (var i = coins.length - 1; i >= 0; i--) {
      var c = coins[i];
      c.t = (c.t || 0) + dt * 7;
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
    if (ensureDay().done.incense && smokes.length < 46 && rnd() < dt * 16) {
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
