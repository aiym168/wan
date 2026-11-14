/* 财运值规则。纯函数，方便用节点直接核对：一天刷不满 100。 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CSEconomy = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var DAILY_CAP = 18;
  var COIN_MAX = 8;
  var CACHE_MAX = 3;
  var CACHE_POINTS = 2;
  var CASUAL_POOL = 4;
  var GOLD_AT = 100;
  var ACTIONS = {
    incense: { name: '上香', spot: 3, casual: 1 },
    bow: { name: '作揖', spot: 3, casual: 1 },
    bell: { name: '敲钟', spot: 3, casual: 1 },
    flower: { name: '供花', spot: 3, casual: 1 },
    oil: { name: '添灯油', spot: 3, casual: 1 },
    tidy: { name: '整理香炉', spot: 3, casual: 1 },
    sweep: { name: '打扫庭院', spot: 3, casual: 1 },
    wipe: { name: '擦供桌', spot: 3, casual: 1 },
    hang: { name: '悬挂', spot: 3, casual: 1 },
    wish: { name: '许愿', spot: 2, casual: 1 },
    lot: { name: '祝福签', spot: 2, casual: 1 },
    checkin: { name: '进殿', spot: 2, casual: 2 }
  };
  var SPOT_POOL = ['incense', 'bow', 'bell', 'flower', 'oil', 'tidy', 'sweep', 'wipe', 'hang', 'wish', 'lot'];

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
  function spotlights(dateStr) {
    var rng = mulberry32(hashDate(dateStr));
    var arr = SPOT_POOL.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr.slice(0, 4);
  }
  function blankDay() {
    return { earned: 0, done: {}, coins: 0, caches: 0, casual: 0 };
  }
  function dayOf(state, date) {
    state.days = state.days || {};
    if (!state.days[date]) state.days[date] = blankDay();
    var d = state.days[date];
    d.done = d.done || {};
    d.earned = d.earned || 0;
    d.coins = d.coins || 0;
    d.caches = d.caches || 0;
    d.casual = d.casual || 0;
    return d;
  }
  function result(state, day, amount, reason, extra) {
    var o = {
      amount: amount,
      reason: reason,
      lifetime: state.lifetime,
      dayEarned: day ? day.earned : 0,
      cap: DAILY_CAP
    };
    if (extra) {
      for (var k in extra) o[k] = extra[k];
    }
    return o;
  }
  function tryAdd(state, day, want, okReason) {
    var room = DAILY_CAP - day.earned;
    var got = Math.max(0, Math.min(want, room));
    day.earned += got;
    state.lifetime += got;
    if (got <= 0) return result(state, day, 0, '今日计入已满 ' + DAILY_CAP + '/' + DAILY_CAP);
    if (got < want) return result(state, day, got, okReason + '（今日计入已到顶 ' + DAILY_CAP + '/' + DAILY_CAP + '）');
    return result(state, day, got, okReason);
  }

  /**
   * kind: 动作 id、coin、cache、once、gild
   * opts.id 用于 once / gild；opts.amount 仅 once 使用
   * 一次性发现不占每日上限，也不能靠重复同一个动作刷到 100。
   */
  function grant(state, date, kind, opts) {
    opts = opts || {};
    state.lifetime = state.lifetime || 0;
    var day = dayOf(state, date);
    if (kind === 'coin') {
      if (day.coins >= COIN_MAX) {
        return result(state, day, 0, '今日金雨已计入 ' + COIN_MAX + '/' + COIN_MAX, { coins: day.coins });
      }
      day.coins += 1;
      return tryAdd(state, day, 1, '接住一枚 ' + day.coins + '/' + COIN_MAX, { coins: day.coins });
    }
    if (kind === 'cache') {
      if (day.caches >= CACHE_MAX) {
        return result(state, day, 0, '今日散钱已找完 ' + CACHE_MAX + '/' + CACHE_MAX);
      }
      day.caches += 1;
      return tryAdd(state, day, CACHE_POINTS, '寻到散钱 ' + day.caches + '/' + CACHE_MAX);
    }
    if (kind === 'once') {
      state.once = state.once || {};
      if (state.once[opts.id]) return result(state, day, 0, '这里已经看过了');
      state.once[opts.id] = true;
      var add = opts.amount || 2;
      state.lifetime += add;
      return result(state, day, add, opts.reason || '第一次走到这里', { once: true });
    }
    if (kind === 'gild') {
      state.gild = state.gild || [];
      if (state.lifetime < GOLD_AT) return result(state, day, 0, '金身未启，累计财运满 ' + GOLD_AT + ' 才打开');
      if (state.gild.indexOf(opts.id) >= 0) return result(state, day, 0, '这片金箔已经贴上了');
      state.gild.push(opts.id);
      return tryAdd(state, day, 1, '贴上一片金箔');
    }
    var spec = ACTIONS[kind];
    if (!spec) return result(state, day, 0, '未知动作');
    if (day.done[kind]) return result(state, day, 0, '今天已经' + spec.name + '过了，再做不加分');
    var spot = spotlights(date);
    var isSpot = spot.indexOf(kind) >= 0 || kind === 'checkin';
    var want = isSpot ? spec.spot : spec.casual;
    if (!isSpot) {
      if (day.casual >= CASUAL_POOL) {
        day.done[kind] = true;
        return result(state, day, 0, '今日随手加分已满 ' + CASUAL_POOL + '，这件明天也许会轮到鲜活');
      }
    }
    day.done[kind] = true;
    var granted = tryAdd(state, day, want, spec.name + ' +' + want);
    if (!isSpot && granted.amount > 0) day.casual += granted.amount;
    return granted;
  }

  function unlocks(lifetime) {
    var palette = [0, 1, 2, 3];
    var robe = [0, 1, 2, 3];
    var hat = [0, 1, 2, 3];
    var accessory = [0, 1, 2, 3];
    var bottom = [0, 1, 2];
    var shoes = [0, 1, 2];
    var hair = [0, 1, 2, 3, 4, 5];
    if (lifetime >= 40) {
      palette.push(4);
      robe.push(4);
      hat.push(4);
    }
    if (lifetime >= 80) {
      palette.push(5);
      accessory.push(4);
      shoes.push(3);
    }
    if (lifetime >= GOLD_AT) {
      palette.push(6);
      robe.push(5);
      accessory.push(5);
    }
    return {
      skin: [0, 1, 2, 3, 4],
      hair: hair,
      hairColor: [0, 1, 2, 3, 4],
      robe: robe,
      palette: palette,
      bottom: bottom,
      shoes: shoes,
      hat: hat,
      accessory: accessory
    };
  }

  return {
    DAILY_CAP: DAILY_CAP,
    COIN_MAX: COIN_MAX,
    CACHE_MAX: CACHE_MAX,
    CASUAL_POOL: CASUAL_POOL,
    GOLD_AT: GOLD_AT,
    ACTIONS: ACTIONS,
    spotlights: spotlights,
    grant: grant,
    unlocks: unlocks,
    blankDay: blankDay
  };
});
