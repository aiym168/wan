/* 四分之三视角。行走仍用平面坐标；画的时候才抬高、起翘、打光。 */
(function () {
  var AX = 0.86, AY = 0.44;
  var ctx, canvas, scale = 1, cssW = 1, cssH = 1, camX = 0, camY = 0;
  var PAL = [
    { robe: '#efe6d4', trim: '#1f5c62', bottom: '#2a3438', shoe: '#1b1612', accent: '#c4554a' },
    { robe: '#9a3034', trim: '#f0d59a', bottom: '#2c221c', shoe: '#140e0c', accent: '#f4e2b0' },
    { robe: '#1d4e46', trim: '#f0e2c8', bottom: '#24302c', shoe: '#3a2a1e', accent: '#f6edd8' },
    { robe: '#c9a56e', trim: '#6a3828', bottom: '#3a3028', shoe: '#241810', accent: '#f8edd6' },
    { robe: '#1a2c4e', trim: '#e6c98a', bottom: '#12161c', shoe: '#0c0e12', accent: '#f3e6c0' },
    { robe: '#e0b8c8', trim: '#5c3048', bottom: '#3a2a34', shoe: '#241820', accent: '#fbeff4' },
    { robe: '#7a6232', trim: '#fff0b8', bottom: '#2a2416', shoe: '#16120c', accent: '#fff6d0' }
  ];
  var HAIR_C = ['#161210', '#3a2a20', '#4a3424', '#2a2230', '#6a5a48'];
  var SKIN = ['#f6d0b0', '#e8b48e', '#c88860', '#8d5a3c', '#fbe0c8'];

  function iso(x, y, z) {
    var dx = x - camX, dy = y - camY;
    return {
      sx: cssW / 2 + (dx - dy) * AX * scale,
      sy: cssH / 2 + (dx + dy) * AY * scale - (z || 0) * scale
    };
  }
  function screenToWorld(sx, sy) {
    var px = (sx - cssW / 2) / (AX * scale);
    var py = (sy - cssH / 2) / (AY * scale);
    return { x: camX + (py + px) / 2, y: camY + (py - px) / 2 };
  }
  function poly(pts, fill, stroke) {
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      var p = iso(pts[i][0], pts[i][1], pts[i][2] || 0);
      if (i) ctx.lineTo(p.sx, p.sy); else ctx.moveTo(p.sx, p.sy);
    }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
  }
  function quad(x, y, w, h, z, fill, stroke) {
    poly([[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z]], fill, stroke);
  }
  function box(x, y, w, h, z, top, south, east) {
    poly([[x, y + h, 0], [x + w, y + h, 0], [x + w, y + h, z], [x, y + h, z]], south || top);
    poly([[x + w, y, 0], [x + w, y + h, 0], [x + w, y + h, z], [x + w, y, z]], east || south || top);
    quad(x, y, w, h, z, top, 'rgba(90,60,30,.25)');
  }
  function vis(x, y) {
    var p = iso(x, y, 0);
    return p.sx > -180 && p.sx < cssW + 180 && p.sy > -220 && p.sy < cssH + 220;
  }

  function resize(c, w, h) {
    canvas = c;
    ctx = c.getContext('2d');
    cssW = w; cssH = h;
    var dpr = Math.min(window.devicePixelRatio || 1, w < 720 ? 1.5 : 2);
    c.width = Math.max(1, Math.floor(w * dpr));
    c.height = Math.max(1, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = w < 720 ? 1.28 : 0.98;
    return scale;
  }

  function sky(fest) {
    var g = ctx.createLinearGradient(0, 0, 0, cssH);
    if (fest.mode === 'spring' || fest.mode === 'caishen' || fest.mode === 'eve') {
      g.addColorStop(0, '#4a1c28'); g.addColorStop(0.45, '#c45a48'); g.addColorStop(1, '#f0c48a');
    } else if (fest.season === 'winter') {
      g.addColorStop(0, '#1c2c44'); g.addColorStop(0.55, '#8aa0b8'); g.addColorStop(1, '#e6d4bc');
    } else if (fest.season === 'summer') {
      g.addColorStop(0, '#3d7eb8'); g.addColorStop(0.5, '#9ec6e4'); g.addColorStop(1, '#f3e2c4');
    } else {
      g.addColorStop(0, '#35506a'); g.addColorStop(0.42, '#c4846a'); g.addColorStop(1, '#f3d7b0');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.fillStyle = 'rgba(255,220,160,.35)';
    ctx.beginPath(); ctx.arc(cssW * 0.72, cssH * 0.16, Math.min(cssW, cssH) * 0.08, 0, 7); ctx.fill();
    ctx.fillStyle = fest.season === 'winter' ? 'rgba(70,90,110,.55)' : 'rgba(90,70,80,.4)';
    ctx.beginPath();
    ctx.moveTo(0, cssH * 0.42);
    ctx.quadraticCurveTo(cssW * 0.2, cssH * 0.28, cssW * 0.38, cssH * 0.38);
    ctx.quadraticCurveTo(cssW * 0.55, cssH * 0.22, cssW * 0.72, cssH * 0.36);
    ctx.quadraticCurveTo(cssW * 0.88, cssH * 0.26, cssW, cssH * 0.4);
    ctx.lineTo(cssW, cssH); ctx.lineTo(0, cssH);
    ctx.fill();
  }

  function tileField(x0, y0, x1, y1, a, b, step) {
    for (var y = y0; y < y1; y += step) {
      for (var x = x0; x < x1; x += step) {
        if (((x / step) | 0) + ((y / step) | 0) & 1) continue;
        if (!vis(x, y)) continue;
        var shade = ((x * 3 + y * 5) % 17) / 17;
        var col = shade > 0.66 ? a : (shade > 0.33 ? b : mix(a, b));
        quad(x, y, step - 2, step - 2, 0, col);
      }
    }
  }
  function mix(a, b) { return a; }

  function column(x, y, h, r) {
    var a = iso(x, y, 0), b = iso(x, y, h);
    var grd = ctx.createLinearGradient(a.sx - r, 0, a.sx + r, 0);
    grd.addColorStop(0, '#5a1820');
    grd.addColorStop(0.42, '#d85a58');
    grd.addColorStop(1, '#3a1016');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(a.sx - r, a.sy);
    ctx.lineTo(a.sx + r, a.sy);
    ctx.lineTo(b.sx + r * 0.86, b.sy);
    ctx.lineTo(b.sx - r * 0.86, b.sy);
    ctx.fill();
    ctx.fillStyle = '#f0d48a';
    ctx.fillRect(b.sx - r, b.sy, r * 2, 3);
    ctx.fillRect(a.sx - r - 2, a.sy - 5, r * 2 + 4, 5);
    var cap = iso(x, y, h + 8);
    ctx.fillStyle = '#e8c86a';
    ctx.beginPath();
    ctx.moveTo(cap.sx - r - 4, cap.sy + 6);
    ctx.lineTo(cap.sx, cap.sy - 2);
    ctx.lineTo(cap.sx + r + 4, cap.sy + 6);
    ctx.lineTo(cap.sx + r, b.sy + 2);
    ctx.lineTo(cap.sx - r, b.sy + 2);
    ctx.fill();
  }

  function dougong(x, y, w, z) {
    var n = Math.max(3, Math.round(w / 36));
    for (var i = 0; i <= n; i++) {
      var px = x + (w * i) / n;
      box(px - 5, y - 4, 10, 8, z, '#f0d7a0', '#a87840', '#6a4828');
      box(px - 8, y - 2, 16, 6, z + 6, '#e8c878', '#8a6230', '#5a3c20');
    }
  }

  function eave(x, y, w, h, z, lift, fill) {
    poly([
      [x, y, z + lift],
      [x + w * 0.5, y + h * 0.08, z + lift * 0.15],
      [x + w, y, z + lift],
      [x + w + 8, y + h * 0.55, z + lift * 0.85],
      [x + w * 0.5, y + h, z],
      [x - 8, y + h * 0.55, z + lift * 0.85]
    ], fill, 'rgba(228,197,106,.85)');
    ctx.save();
    ctx.strokeStyle = 'rgba(255,244,220,.18)';
    ctx.lineWidth = 1;
    for (var i = 1; i < 7; i++) {
      var p1 = iso(x + w * (i / 7), y, z + lift * 0.7);
      var p2 = iso(x + w * (i / 7), y + h * 0.92, z + lift * 0.2);
      ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
    }
    ctx.restore();
  }

  function lantern(x, y, z, lit) {
    var p = iso(x, y, z);
    var q = iso(x, y, z - 22);
    ctx.strokeStyle = '#5a4030';
    ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(q.sx, q.sy); ctx.stroke();
    var g = ctx.createLinearGradient(q.sx, q.sy, q.sx, q.sy + 16);
    g.addColorStop(0, lit ? '#ffb45a' : '#6a3030');
    g.addColorStop(0.5, lit ? '#e23a3a' : '#4a2024');
    g.addColorStop(1, lit ? '#8a1c24' : '#2a1214');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(q.sx, q.sy);
    ctx.quadraticCurveTo(q.sx + 9, q.sy + 8, q.sx, q.sy + 18);
    ctx.quadraticCurveTo(q.sx - 9, q.sy + 8, q.sx, q.sy);
    ctx.fill();
    ctx.fillStyle = '#f0d48a';
    ctx.fillRect(q.sx - 3, q.sy + 18, 6, 3);
    if (lit) glow(x, y, z - 28, 36 * scale, 'rgba(255,170,70,.45)');
  }

  function glow(x, y, z, rad, color) {
    var p = iso(x, y, z);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createRadialGradient(p.sx, p.sy, 2, p.sx, p.sy, rad);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(255,160,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.sx, p.sy, rad, 0, 7); ctx.fill();
    ctx.restore();
  }

  function tree(x, y, autumn) {
    var p = iso(x, y, 0);
    var top = iso(x, y, 46);
    ctx.strokeStyle = '#3a261c';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(top.sx, top.sy + 8); ctx.stroke();
    var cols = autumn ? ['#e07a28', '#c44820', '#f0b04a'] : ['#1e6a48', '#2f8a58', '#163e2c'];
    [[0, 0, 22], [-14, 8, 16], [12, 6, 15], [0, 14, 18]].forEach(function (c, i) {
      ctx.fillStyle = cols[i % 3];
      ctx.beginPath(); ctx.arc(top.sx + c[0], top.sy + c[1], c[2], 0, 7); ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.arc(top.sx - 6, top.sy + 2, 7, 0, 7); ctx.fill();
  }

  function pond(cx, cy, rx, ry) {
    ctx.beginPath();
    for (var i = 0; i <= 28; i++) {
      var a = (i / 28) * Math.PI * 2;
      var p = iso(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 0);
      if (i) ctx.lineTo(p.sx, p.sy); else ctx.moveTo(p.sx, p.sy);
    }
    var g = ctx.createLinearGradient(0, iso(cx, cy - ry, 0).sy, 0, iso(cx, cy + ry, 0).sy);
    g.addColorStop(0, '#8ec8c8');
    g.addColorStop(0.4, '#2f6a72');
    g.addColorStop(1, '#163e48');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.stroke();
    var t = (Date.now() / 700) % 1;
    ctx.strokeStyle = 'rgba(220,245,245,.45)';
    ctx.beginPath();
    for (var j = 0; j <= 20; j++) {
      var aa = (j / 20) * Math.PI * 2;
      var q = iso(cx + Math.cos(aa) * rx * (0.35 + t * 0.4), cy + Math.sin(aa) * ry * (0.35 + t * 0.4), 1);
      if (j) ctx.lineTo(q.sx, q.sy); else ctx.moveTo(q.sx, q.sy);
    }
    ctx.stroke();
  }

  function burner(x, y, lit) {
    box(x - 18, y - 14, 36, 28, 16, '#8a8078', '#4a4440', '#2e2a28');
    poly([[x - 22, y - 16, 16], [x + 22, y - 16, 16], [x + 16, y + 16, 16], [x - 16, y + 16, 16]], '#c4b4a4', '#5a5048');
    var p = iso(x, y, 28);
    ctx.fillStyle = '#6a5438';
    ctx.fillRect(p.sx - 2, p.sy, 4, 16);
    if (lit) {
      ctx.fillStyle = '#ffb050';
      ctx.beginPath(); ctx.arc(p.sx, p.sy + 2, 3, 0, 7); ctx.fill();
    }
  }

  function bell(x, y, swinging, ang) {
    column(x, y, 78, 5);
    eave(x - 28, y - 22, 56, 36, 86, 16, '#2c343c');
    var p = iso(x, y + ang, 52);
    var top = iso(x, y, 78);
    ctx.strokeStyle = '#6a5434';
    ctx.beginPath(); ctx.moveTo(top.sx, top.sy); ctx.lineTo(p.sx, p.sy); ctx.stroke();
    var g = ctx.createLinearGradient(p.sx - 12, p.sy, p.sx + 12, p.sy);
    g.addColorStop(0, '#8a6a32');
    g.addColorStop(0.5, '#f4e2a8');
    g.addColorStop(1, '#6a4e24');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(p.sx - 12, p.sy);
    ctx.quadraticCurveTo(p.sx - 14, p.sy + 16, p.sx, p.sy + 22);
    ctx.quadraticCurveTo(p.sx + 14, p.sy + 16, p.sx + 12, p.sy);
    ctx.fill();
  }

  function gilt(on, lacquer) {
    if (!on) return lacquer;
    var g = ctx.createLinearGradient(-30, -160, 40, 20);
    g.addColorStop(0, '#fff8dc');
    g.addColorStop(0.42, '#f0c84a');
    g.addColorStop(1, '#a67c22');
    return g;
  }
  function yuanbao(x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    var g = ctx.createLinearGradient(-12, -8, 12, 8);
    g.addColorStop(0, '#fff6c8');
    g.addColorStop(0.5, '#f0c24a');
    g.addColorStop(1, '#b8862a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-14, 2);
    ctx.quadraticCurveTo(-16, -8, -6, -6);
    ctx.quadraticCurveTo(0, -14, 6, -6);
    ctx.quadraticCurveTo(16, -8, 14, 2);
    ctx.quadraticCurveTo(0, 8, -14, 2);
    ctx.fill();
    ctx.strokeStyle = '#8a5a16';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  function statue(x, y, gild, showLock, lifeText, reduce) {
    var p = iso(x, y, 0);
    var has = function (id) { return gild.indexOf(id) >= 0; };
    ctx.save();
    ctx.translate(p.sx, p.sy);
    ctx.scale(1.9, 1.9);
    ctx.fillStyle = 'rgba(40,18,8,.28)';
    ctx.beginPath(); ctx.ellipse(6, 8, 62, 16, 0, 0, 7); ctx.fill();

    var halo = ctx.createRadialGradient(0, -118, 8, 0, -118, 58);
    halo.addColorStop(0, 'rgba(255,220,120,.95)');
    halo.addColorStop(0.55, 'rgba(255,170,50,.35)');
    halo.addColorStop(1, 'rgba(255,140,20,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(0, -118, 58, 0, 7); ctx.fill();

    ctx.fillStyle = gilt(has(7), '#7a1824');
    roundRect(-58, -168, 116, 150, 10);
    ctx.fill();
    ctx.strokeStyle = '#e8c56a';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(240,210,120,.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-30, -150); ctx.quadraticCurveTo(-10, -132, 0, -148); ctx.quadraticCurveTo(10, -132, 30, -150);
    ctx.stroke();
    ctx.fillStyle = '#f6edd4';
    roundRect(-36, -198, 72, 26, 4);
    ctx.fill();
    ctx.strokeStyle = '#8e2f32';
    ctx.stroke();
    ctx.fillStyle = '#6e2430';
    ctx.font = '700 15px "Songti SC","WenQuanYi Micro Hei",serif';
    ctx.textAlign = 'center';
    ctx.fillText('财神殿', 0, -180);

    ctx.fillStyle = gilt(has(7), '#5c1018');
    roundRect(-70, -36, 22, 16, 3); ctx.fill();
    roundRect(48, -36, 22, 16, 3); ctx.fill();
    ctx.strokeStyle = '#e8c56a';
    ctx.strokeRect(-70, -36, 22, 16);
    ctx.strokeRect(48, -36, 22, 16);
    ctx.fillStyle = '#9a2430';
    ctx.beginPath(); ctx.ellipse(0, -16, 46, 14, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#f0d48a';
    ctx.fillRect(-20, -18, 40, 4);

    var robe = gilt(has(3), '#b4232c');
    ctx.fillStyle = robe;
    ctx.beginPath();
    ctx.moveTo(-40, -92);
    ctx.quadraticCurveTo(-58, -48, -46, -6);
    ctx.lineTo(46, -6);
    ctx.quadraticCurveTo(58, -48, 40, -92);
    ctx.quadraticCurveTo(0, -78, -40, -92);
    ctx.fill();
    ctx.strokeStyle = '#f0d48a';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.fillStyle = has(3) ? '#fff1b8' : '#e8c56a';
    [[-16, -70], [16, -70], [0, -52], [-18, -36], [18, -36]].forEach(function (c) {
      ctx.beginPath(); ctx.arc(c[0], c[1], 5, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(c[0], c[1], 2, 0, 7);
      ctx.fillStyle = '#9a1c24'; ctx.fill();
      ctx.fillStyle = has(3) ? '#fff1b8' : '#e8c56a';
    });
    ctx.fillStyle = '#1f6a52';
    roundRect(-28, -46, 56, 10, 3);
    ctx.fill();
    ctx.fillStyle = '#f0d48a';
    for (var i = -2; i <= 2; i++) ctx.fillRect(i * 10 - 3, -45, 6, 8);

    ctx.fillStyle = gilt(has(4), '#8e1c28');
    ctx.beginPath();
    ctx.moveTo(-36, -88); ctx.quadraticCurveTo(-78, -60, -62, -18); ctx.quadraticCurveTo(-40, -28, -28, -78);
    ctx.fill();
    ctx.strokeStyle = '#f0d48a'; ctx.stroke();
    ctx.fillStyle = gilt(has(5), '#8e1c28');
    ctx.beginPath();
    ctx.moveTo(36, -88); ctx.quadraticCurveTo(78, -60, 62, -18); ctx.quadraticCurveTo(40, -28, 28, -78);
    ctx.fill();
    ctx.stroke();

    yuanbao(0, -28, has(6) ? 1.35 : 1.15);
    ctx.strokeStyle = gilt(has(6), '#e8c56a');
    ctx.fillStyle = gilt(has(6), '#f0d48a');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-24, -40);
    ctx.quadraticCurveTo(-8, -58, 8, -36);
    ctx.quadraticCurveTo(18, -48, 22, -34);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(22, -34, 5, 0, 7); ctx.fill();

    ctx.save();
    ctx.translate(78, -10);
    ctx.fillStyle = '#c9a05a';
    ctx.beginPath();
    ctx.moveTo(-22, -6);
    ctx.quadraticCurveTo(-24, 16, 0, 18);
    ctx.quadraticCurveTo(24, 16, 22, -6);
    ctx.quadraticCurveTo(0, -2, -22, -6);
    ctx.fill();
    ctx.strokeStyle = '#7a5420';
    ctx.stroke();
    yuanbao(-8, -16, 0.55);
    yuanbao(6, -14, 0.5);
    yuanbao(0, -24, 0.42);
    ctx.fillStyle = '#d42838';
    ctx.beginPath(); ctx.arc(10, -22, 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#3aa07a';
    ctx.beginPath(); ctx.arc(-10, -22, 2.4, 0, 7); ctx.fill();
    ctx.restore();

    var skin = gilt(has(1), '#f3c7a4');
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.ellipse(-24, -102, 6, 9, -0.2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(24, -102, 6, 9, 0.2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -108, 26, 24, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(214,90,90,.28)';
    ctx.beginPath(); ctx.ellipse(-12, -100, 5, 3, 0, 0, 7); ctx.ellipse(12, -100, 5, 3, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3a2418';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-9, -112, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.arc(9, -112, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -98, 7, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
    ctx.fillStyle = '#c44848';
    ctx.beginPath(); ctx.ellipse(0, -96, 3.2, 2, 0, 0, 7); ctx.fill();

    ctx.fillStyle = has(2) ? '#2a1c10' : '#140e0c';
    ctx.beginPath();
    ctx.moveTo(-8, -90);
    ctx.quadraticCurveTo(-22, -70, -12, -48);
    ctx.quadraticCurveTo(-4, -58, 0, -42);
    ctx.quadraticCurveTo(4, -58, 12, -48);
    ctx.quadraticCurveTo(22, -70, 8, -90);
    ctx.quadraticCurveTo(0, -84, -8, -90);
    ctx.fill();
    ctx.strokeStyle = has(2) ? '#e8c56a' : '#140e0c';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = gilt(has(0), '#1a120e');
    ctx.beginPath(); ctx.ellipse(0, -128, 22, 10, 0, 0, 7); ctx.fill();
    roundRect(-16, -146, 32, 20, 4);
    ctx.fill();
    ctx.strokeStyle = '#f0d48a';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    function wing(dir) {
      ctx.fillStyle = gilt(has(0), '#16120e');
      ctx.beginPath();
      ctx.moveTo(dir * 14, -132);
      ctx.quadraticCurveTo(dir * 48, -150, dir * 86, -128);
      ctx.lineTo(dir * 84, -122);
      ctx.quadraticCurveTo(dir * 46, -138, dir * 14, -124);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f0d48a';
      ctx.stroke();
    }
    wing(-1); wing(1);
    ctx.fillStyle = '#c43838';
    ctx.beginPath(); ctx.arc(0, -136, 3.5, 0, 7); ctx.fill();

    if (gild.length && !reduce) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = '#fff8dc';
      ctx.lineWidth = 3;
      var s = (Date.now() / 16) % 70;
      ctx.beginPath();
      ctx.moveTo(-40 + s, -150);
      ctx.lineTo(-55 + s, -20);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#f6edd4';
    roundRect(-40, 10, 80, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#6e2430';
    ctx.font = '700 12px "Songti SC","WenQuanYi Micro Hei",serif';
    ctx.textAlign = 'center';
    ctx.fillText('招财进宝', 0, 23);
    if (showLock) {
      ctx.fillStyle = 'rgba(246,237,212,.94)';
      roundRect(-36, 30, 72, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#6e2430';
      ctx.font = '700 11px "WenQuanYi Micro Hei",sans-serif';
      ctx.fillText(lifeText, 0, 42);
    }
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function person(o, face, pose, phase, hold, reduce) {
    var pal = PAL[o.palette] || PAL[0];
    var skin = SKIN[o.skin] || SKIN[0];
    var hair = HAIR_C[o.hairColor] || HAIR_C[0];
    var back = face === 'n';
    var side = face === 'e' || face === 'w';
    var swing = (pose === 'walk' || pose === 'sweep') && !reduce ? Math.sin(phase) : 0;
    var bob = pose === 'walk' && !reduce ? Math.abs(Math.sin(phase)) * 2.2 : 0;
    ctx.save();
    if (face === 'w') ctx.scale(-1, 1);
    ctx.translate(0, -bob);
    ctx.fillStyle = 'rgba(30,16,8,.32)';
    ctx.beginPath(); ctx.ellipse(0, 2, 14, 5, 0, 0, 7); ctx.fill();
    if (pose === 'sit') ctx.translate(0, 10);
    if (o.robe === 3) {
      ctx.fillStyle = pal.accent;
      ctx.beginPath(); ctx.ellipse(0, -28, 18, 22, 0, 0, 7); ctx.fill();
    }
    ctx.fillStyle = pal.bottom;
    if (pose === 'sit') {
      ctx.beginPath(); ctx.ellipse(0, -6, 14, 5, 0, 0, 7); ctx.fill();
    } else if (o.bottom === 0 && o.robe !== 1) {
      ctx.beginPath();
      ctx.moveTo(-11, -24); ctx.lineTo(11, -24);
      ctx.quadraticCurveTo(14, -8, 12 + swing * 2, -2);
      ctx.lineTo(-12 + swing * 2, -2);
      ctx.quadraticCurveTo(-14, -8, -11, -24);
      ctx.fill();
    } else {
      leg(-6 + swing * 3, pal.bottom);
      leg(3 - swing * 3, pal.bottom);
    }
    ctx.fillStyle = pal.shoe;
    if (pose !== 'sit') {
      shoe(-8 + swing * 3, o.shoes);
      shoe(2 - swing * 3, o.shoes);
    }
    drawRobe(o, pal, skin, swing, pose, back);
    if (o.accessory === 1) {
      ctx.strokeStyle = pal.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-6, -20); ctx.quadraticCurveTo(4, -12, 8, -6); ctx.stroke();
    }
    if (o.accessory === 4) { ctx.fillStyle = pal.accent; ctx.fillRect(-6, -34, 16, 6); }
    if (o.accessory === 5) { ctx.fillStyle = '#6fbfa8'; ctx.beginPath(); ctx.arc(0, -24, 3.5, 0, 7); ctx.fill(); }
    if (o.accessory === 2) {
      ctx.strokeStyle = pal.trim; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(8, -18); ctx.lineTo(16, -4); ctx.stroke();
      ctx.fillStyle = pal.accent;
      ctx.beginPath(); ctx.arc(16, -2, 3, 0, 7); ctx.fill();
    }
    ctx.fillStyle = hair;
    if (!back && (o.hair === 1 || o.hair === 4)) hairBack(o.hair);
    ctx.fillStyle = skin;
    if (back) {
      ctx.beginPath(); ctx.arc(0, -52, 13, 0, 7); ctx.fill();
      ctx.fillStyle = hair; hairFront(o.hair, true);
    } else {
      ctx.beginPath(); ctx.ellipse(side ? 2 : 0, -52, side ? 11 : 13, 14, 0, 0, 7); ctx.fill();
      if (pose !== 'bow') facePaint(side);
      else { ctx.fillStyle = '#2a1c16'; ctx.fillRect(-4, -48, 8, 2); }
      ctx.fillStyle = hair; hairFront(o.hair, false);
      if (o.accessory === 3) { ctx.fillStyle = pal.accent; ctx.beginPath(); ctx.arc(11, -48, 2, 0, 7); ctx.fill(); }
    }
    hat(o.hat, pal);
    held(hold, pal, pose, phase);
    ctx.restore();
  }
  function leg(x, color) {
    ctx.fillStyle = color;
    roundRect(x, -26, 5, 18, 2); ctx.fill();
  }
  function shoe(x, kind) {
    ctx.fillStyle = PAL[0].shoe;
    var h = kind === 1 ? 7 : 5;
    roundRect(x, -8, kind === 2 ? 8 : 7, h, 2); ctx.fill();
    if (kind === 3) { ctx.fillStyle = '#f0d48a'; ctx.fillRect(x, -5, 7, 2); }
  }
  function drawRobe(o, pal, skin, swing, pose, back) {
    ctx.fillStyle = pal.robe;
    if (o.robe === 1) {
      roundRect(-12, -46, 24, 24, 6); ctx.fill();
      ctx.strokeStyle = pal.trim; ctx.stroke();
    } else if (o.robe === 4) {
      roundRect(-10, -46, 20, 22, 4); ctx.fill();
      ctx.fillStyle = skin;
      roundRect(-16, -44, 6, 14, 2); ctx.fill();
      roundRect(10, -44, 6, 14, 2); ctx.fill();
      ctx.fillStyle = pal.robe;
    } else if (o.robe === 2 || o.robe === 5) {
      ctx.beginPath();
      ctx.moveTo(-12, -48);
      ctx.quadraticCurveTo(-14, -20, -11, -6);
      ctx.lineTo(11, -6);
      ctx.quadraticCurveTo(14, -20, 12, -48);
      ctx.quadraticCurveTo(0, -42, -12, -48);
      ctx.fill();
      if (o.robe === 5) { ctx.strokeStyle = pal.trim; ctx.lineWidth = 2.4; ctx.stroke(); }
    } else {
      ctx.beginPath();
      ctx.moveTo(-10, -48);
      ctx.quadraticCurveTo(-16, -24, -13, -10);
      ctx.lineTo(13, -10);
      ctx.quadraticCurveTo(16, -24, 10, -48);
      ctx.closePath();
      ctx.fill();
    }
    if (o.robe !== 4) {
      sleeve(-16, -40, swing, pose, pal.robe);
      sleeve(8, -40, -swing, pose, pal.robe);
    }
    if (!back && o.robe !== 4) {
      ctx.strokeStyle = pal.trim; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -46); ctx.lineTo(-4, -34); ctx.lineTo(4, -34); ctx.closePath();
      ctx.stroke();
    }
  }
  function sleeve(x, y, swing, pose, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((pose === 'offer' || pose === 'apply' ? -0.9 : 0) + swing * 0.35);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.quadraticCurveTo(8, 6, 6, 16); ctx.lineTo(-2, 16); ctx.quadraticCurveTo(-2, 6, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  function facePaint(side) {
    ctx.fillStyle = '#2a1c16';
    if (side) {
      ctx.beginPath(); ctx.ellipse(6, -54, 2, 2.2, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(5, -56, 1.2, 1.2);
    } else {
      ctx.beginPath(); ctx.ellipse(-5, -54, 2, 2.2, 0, 0, 7); ctx.ellipse(5, -54, 2, 2.2, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-6, -56, 1.3, 1.3); ctx.fillRect(4, -56, 1.3, 1.3);
      ctx.strokeStyle = '#a86858'; ctx.beginPath(); ctx.arc(0, -46, 3, 0.2, Math.PI - 0.2); ctx.stroke();
      ctx.fillStyle = 'rgba(220,120,120,.35)';
      ctx.beginPath(); ctx.arc(-8, -48, 2.2, 0, 7); ctx.arc(8, -48, 2.2, 0, 7); ctx.fill();
    }
  }
  function hairBack(id) {
    ctx.fillStyle = HAIR_C[0];
  }
  function hairFront(id, back) {
    if (id === 0) { ctx.beginPath(); ctx.arc(0, -66, 6, 0, 7); ctx.fill(); }
    else if (id === 1) { ctx.fillRect(-12, -58, 5, back ? 34 : 26); ctx.fillRect(7, -58, 5, back ? 34 : 26); }
    else if (id === 2) {
      ctx.beginPath(); ctx.arc(0, -60, 14, Math.PI, 0); ctx.fill();
    } else if (id === 3) {
      ctx.beginPath(); ctx.arc(-9, -62, 5, 0, 7); ctx.arc(9, -62, 5, 0, 7); ctx.fill();
    } else if (id === 4) { ctx.fillRect(6, -56, 4, 30); ctx.beginPath(); ctx.arc(8, -28, 3, 0, 7); ctx.fill(); }
    else {
      ctx.beginPath(); ctx.arc(0, -70, 7, 0, 7); ctx.fill();
      ctx.strokeStyle = '#e4c56a'; ctx.beginPath(); ctx.moveTo(-6, -70); ctx.lineTo(8, -62); ctx.stroke();
    }
  }
  function hat(id, pal) {
    if (!id) return;
    if (id === 1) { ctx.fillStyle = pal.accent; ctx.fillRect(-12, -60, 24, 4); }
    else if (id === 2) {
      ctx.fillStyle = pal.trim;
      ctx.beginPath(); ctx.ellipse(0, -66, 14, 6, 0, 0, 7); ctx.fill();
      ctx.fillRect(-12, -66, 24, 6);
    } else if (id === 3) {
      ctx.fillStyle = '#d7b56a';
      ctx.beginPath(); ctx.ellipse(0, -64, 20, 6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#f3e2b8';
      ctx.beginPath(); ctx.ellipse(0, -66, 8, 4, 0, 0, 7); ctx.fill();
    } else if (id === 4) {
      ctx.fillStyle = 'rgba(246,239,226,.88)';
      ctx.fillRect(-14, -58, 28, 18);
      ctx.strokeStyle = pal.trim; ctx.strokeRect(-14, -58, 28, 18);
    }
  }
  function held(hold, pal, pose, phase) {
    if (hold === 'broom' || hold === 'stick') {
      ctx.strokeStyle = '#6b422c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(12, -24); ctx.lineTo(20, pose === 'sweep' ? 2 + Math.sin(phase) * 8 : 6); ctx.stroke();
      if (hold === 'broom') { ctx.strokeStyle = '#c4a060'; ctx.beginPath(); ctx.moveTo(16, 4); ctx.lineTo(26, 10); ctx.stroke(); }
    } else if (hold === 'flower') {
      ctx.strokeStyle = '#2f6a48'; ctx.beginPath(); ctx.moveTo(12, -28); ctx.lineTo(16, -46); ctx.stroke();
      ctx.fillStyle = '#e05058'; ctx.beginPath(); ctx.arc(16, -48, 4, 0, 7); ctx.fill();
    } else if (hold === 'ladle') {
      ctx.fillStyle = '#e4c56a'; roundRect(12, -36, 5, 14, 2); ctx.fill();
    } else if (hold === 'lantern') {
      ctx.fillStyle = '#c43838';
      ctx.beginPath(); ctx.arc(16, -40, 7, 0, 7); ctx.fill();
      ctx.fillStyle = '#f0d48a'; ctx.fillRect(13, -34, 6, 3);
    } else if (hold === 'leaf') {
      ctx.fillStyle = '#f6e29a';
      ctx.beginPath(); ctx.ellipse(16, -34, 6, 4, 0.4, 0, 7); ctx.fill();
    } else if (hold === 'cloth') {
      ctx.fillStyle = '#f6efe2'; ctx.fillRect(10, -28, 12, 8);
    } else if (hold === 'tag') {
      ctx.fillStyle = '#a32830'; roundRect(12, -40, 8, 14, 2); ctx.fill();
    } else if (pose === 'bow') {
      ctx.fillStyle = pal.accent;
      ctx.beginPath(); ctx.arc(0, -32, 5, 0, 7); ctx.fill();
    }
  }

  function draw(env) {
    camX = env.camX; camY = env.camY;
    var fest = env.world.festival;
    var player = env.player;
    var day = env.ensureDay();
    var reduce = env.reduce;
    sky(fest);
    var sprites = [];
    function put(k, fn) { sprites.push({ k: k, fn: fn }); }

    tileField(500, 880, 1600, 1360, '#d9cbb6', '#c4b49c', 42);
    tileField(880, 1460, 1280, 1660, '#cfc1ac', '#b7a892', 46);
    quad(180, 120, 1560, 200, 0, '#5c7a58');
    quad(160, 300, 340, 1080, 0, '#4e684c');
    quad(760, 380, 580, 430, 0, '#7a4e34');
    for (var by = 400; by < 780; by += 18) {
      if (!vis(1000, by)) continue;
      quad(780, by, 540, 16, 0.4, by % 36 ? '#8a5a3c' : '#6e4630');
    }
    quad(1680, 940, 320, 280, 0, '#6e4630');
    quad(980, 700, 200, 120, 1, '#7a2430', '#e4c56a');
    if (vis(420, 230)) pond(430, 230, 70, 36);
    if (vis(700, 1280)) {
      box(620, 1248, 90, 28, 10, '#d9d0c4', '#a89888', '#8a7c6e');
      pond(665, 1260, 28, 10);
    }

    [[860, 900], [900, 960], [940, 1020]].forEach(function (s, i) {
      put(900 + s[1], function () {
        box(900, s[1], 280, 36, 8 + i * 2, i === 2 ? '#e7d8c4' : '#d7c8b2', '#b7a894', '#9a8876');
      });
    });

    env.world.trees.forEach(function (t) {
      put(t[0] + t[1], function () { tree(t[0], t[1], fest.season === 'autumn' || fest.season === 'winter'); });
    });
    [[640, 1090], [1488, 1120], [360, 640]].forEach(function (t) {
      put(t[0] + t[1], function () { tree(t[0], t[1], fest.season !== 'summer'); });
    });

    put(1050 + 1220, function () { burner(1050, 1204, !!day.done.incense); });
    put(580 + 1160, function () {
      var ang = env.bell && !env.bell.resolved ? Math.sin(env.bell.t * 14) * 10 : 0;
      bell(590, 1120, !!env.bell, ang);
    });
    put(658 + 250, function () {
      box(630, 188, 70, 50, 18, '#c8beb0', '#8d8274', '#6e6458');
      pond(665, 210, 18, 8);
    });

    [[800, 470], [1320, 470], [800, 760], [1320, 760]].forEach(function (c) {
      put(c[0] + c[1] - 20, function () { column(c[0], c[1], 118, 9); });
    });
    [[1760, 1000], [1920, 1000], [1920, 1160]].forEach(function (c) {
      put(c[0] + c[1], function () { column(c[0], c[1], 78, 7); });
    });

    put(1130 + 690, function () {
      box(990, 630, 280, 70, 28, '#f3e6d2', '#a87858', '#7a5438');
      env.world.dusts.forEach(function (d) {
        if (day.dust[d.id]) return;
        var p = iso(d.x, 668, 30);
        ctx.fillStyle = 'rgba(90,70,50,.45)';
        ctx.beginPath(); ctx.ellipse(p.sx, p.sy, 10, 4, 0, 0, 7); ctx.fill();
      });
    });
    put(1145 + 520, function () {
      statue(1145, 500, env.save.gild || [], (env.save.lifetime || 0) < env.goldAt, '金身 ' + (env.save.lifetime || 0) + '/' + env.goldAt, reduce);
    });

    if ((day.flowers || 0) > 0) {
      put(1320 + 1040, function () {
        var p = iso(1320, 1040, 18);
        ctx.fillStyle = '#1f5c62';
        ctx.fillRect(p.sx - 6, p.sy - 16, 12, 16);
        ctx.strokeStyle = '#e05058';
        for (var i = 0; i < day.flowers; i++) {
          ctx.beginPath(); ctx.moveTo(p.sx, p.sy - 16); ctx.quadraticCurveTo(p.sx - 8 + i * 8, p.sy - 36, p.sx + (i - 1) * 6, p.sy - 30); ctx.stroke();
        }
      });
    }

    [[860, 1410], [1240, 1410]].forEach(function (h) {
      put(h[0] + h[1] + 40, function () { column(h[0], h[1], 96, 11); });
    });
    if (player.y > 1320) {
      put(1050 + 1480, function () {
        eave(760, 1288, 580, 70, 108, 28, '#243038');
        eave(800, 1268, 500, 60, 132, 26, '#3a4650');
        dougong(860, 1310, 380, 100);
        var a = iso(930, 1336, 78), b = iso(1170, 1336, 78);
        ctx.fillStyle = '#f7f0e2';
        ctx.fillRect(Math.min(a.sx, b.sx), a.sy - 28, Math.abs(b.sx - a.sx), 36);
        ctx.strokeStyle = '#8e2f32'; ctx.lineWidth = 2;
        ctx.strokeRect(Math.min(a.sx, b.sx) + 4, a.sy - 24, Math.abs(b.sx - a.sx) - 8, 28);
        ctx.fillStyle = '#6e2430';
        ctx.font = '700 22px "Songti SC","WenQuanYi Micro Hei",serif';
        ctx.textAlign = 'center';
        ctx.fillText('云阶殿', (a.sx + b.sx) / 2, a.sy - 4);
        lantern(900, 1360, 70, true);
        lantern(1200, 1360, 70, true);
      });
    } else {
      put(1050 + 1500, function () {
        eave(800, 1320, 500, 50, 70, 16, '#2c343c');
        lantern(900, 1360, 48, true);
        lantern(1200, 1360, 48, true);
      });
    }

    if (player.y > 860) {
      put(1100 + 980, function () {
        eave(700, 760, 700, 90, 150, 36, '#1e262c');
        eave(740, 740, 620, 80, 178, 32, '#323b44');
        dougong(820, 800, 460, 146);
        var a = iso(960, 820, 120), b = iso(1220, 820, 120);
        ctx.fillStyle = '#f7f0e2';
        ctx.fillRect(Math.min(a.sx, b.sx), a.sy - 22, Math.abs(b.sx - a.sx), 30);
        ctx.fillStyle = '#6e2430';
        ctx.font = '700 18px "Songti SC","WenQuanYi Micro Hei",serif';
        ctx.textAlign = 'center';
        ctx.fillText(fest.mode === 'caishen' ? '迎财神' : '正殿', (a.sx + b.sx) / 2, a.sy);
        lantern(860, 800, 130, true);
        lantern(1260, 800, 130, true);
      });
    }
    put(1000 + 360, function () {
      eave(680, 300, 740, 80, 168, 34, '#1c242a');
      eave(720, 280, 660, 70, 198, 30, '#31404a');
      eave(760, 268, 580, 56, 224, 26, '#4a3428');
      dougong(800, 340, 480, 160);
    });
    put(1800 + 900, function () {
      eave(1660, 900, 360, 50, 96, 18, '#2c343c');
      lantern(1720, 980, 70, !!day.lamps[0]);
      lantern(1900, 980, 70, !!day.lamps[1]);
      lantern(1900, 1140, 70, !!day.lamps[2]);
    });

    if (fest.mode === 'caishen' || fest.mode === 'spring' || fest.mode === 'eve' || fest.mode === 'lantern') {
      [[780, 1000], [1420, 1000]].forEach(function (b) {
        put(b[0] + b[1], function () {
          var p = iso(b[0], b[1], 70);
          ctx.fillStyle = '#8e2430';
          ctx.fillRect(p.sx, p.sy, 14, 48);
          ctx.fillStyle = '#f0d48a';
          ctx.font = '12px "WenQuanYi Micro Hei",sans-serif';
          ctx.fillText(fest.mode === 'caishen' ? '迎' : '春', p.sx + 2, p.sy + 20);
        });
      });
    }

    env.world.leaves.forEach(function (l) {
      if (day.swept[l.id]) return;
      put(l.x + l.y, function () {
        var p = iso(l.x, l.y, 2);
        ctx.fillStyle = '#d85a28';
        ctx.beginPath(); ctx.ellipse(p.sx, p.sy, 6, 3, 0.6, 0, 7); ctx.fill();
      });
    });
    env.world.caches.forEach(function (c) {
      if (day.found[c.id]) return;
      put(c.x + c.y, function () {
        var p = iso(c.x, c.y, 4);
        ctx.fillStyle = '#f0d060';
        ctx.beginPath(); ctx.arc(p.sx, p.sy, 4, 0, 7); ctx.fill();
      });
    });

    put(player.x + player.y + 1, function () {
      var p = iso(player.x, player.y, 0);
      ctx.save();
      ctx.translate(p.sx, p.sy);
      ctx.scale(1.15, 1.15);
      person(player.outfit, player.facing, player.pose, player.phase, player.hold, reduce);
      ctx.restore();
    });

    env.coins.forEach(function (c) {
      put(c.x + c.y + 2, function () {
        var gnd = iso(c.x, c.y, 0);
        var p = iso(c.x, c.y, c.z);
        ctx.fillStyle = 'rgba(40,24,10,.28)';
        ctx.beginPath(); ctx.ellipse(gnd.sx, gnd.sy, 8, 3.5, 0, 0, 7); ctx.fill();
        ctx.save();
        ctx.translate(p.sx, p.sy);
        ctx.rotate(Math.sin(c.t || 0) * 0.5);
        var coin = ctx.createLinearGradient(-8, -8, 8, 8);
        coin.addColorStop(0, '#fff1b0');
        coin.addColorStop(0.45, '#f0c44a');
        coin.addColorStop(1, '#a87820');
        ctx.fillStyle = coin;
        ctx.beginPath(); ctx.ellipse(0, 0, 8, 8 * (0.55 + Math.abs(Math.cos(c.t || 0)) * 0.45), 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#6a4018';
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();
        if (!reduce) glow(c.x, c.y, c.z, 16, 'rgba(255,210,90,.35)');
      });
    });

    sprites.sort(function (a, b) { return a.k - b.k; });
    sprites.forEach(function (s) { s.fn(); });

    if (player.x > 760 && player.x < 1420 && player.y > 380 && player.y < 860) {
      glow(1145, 520, 80, 150 * scale, 'rgba(255,186,90,.55)');
      glow(860, 700, 40, 70, 'rgba(255,140,60,.25)');
    }
    if (day.done.incense) glow(1050, 1204, 30, 50, 'rgba(255,150,60,.3)');

    env.smokes.forEach(function (s) {
      var p = iso(s.x, s.y, 36 + (1 - s.life) * 40);
      ctx.fillStyle = 'rgba(245,240,230,' + (s.life * 0.28) + ')';
      ctx.beginPath(); ctx.ellipse(p.sx, p.sy, 5 + (1 - s.life) * 14, 8 + (1 - s.life) * 10, 0, 0, 7); ctx.fill();
    });
    env.sparks.forEach(function (s) {
      var p = iso(s.x, s.y, 20 + (0.6 - s.life) * 30);
      ctx.globalAlpha = Math.max(0, s.life * 1.6);
      ctx.fillStyle = '#ffe9a0';
      ctx.fillRect(p.sx, p.sy, 3, 3);
      ctx.globalAlpha = 1;
    });
    if (env.bell && !env.bell.resolved && !reduce) {
      var bp = iso(590, 1120, 60);
      ctx.strokeStyle = 'rgba(240,212,138,.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bp.sx, bp.sy, 16 + (1.2 - (env.bell.t % 1.2)) * 28, 0, 7);
      ctx.stroke();
    }
    var n = env.nearest();
    if (n && !env.sheetOpen && n.r < 200) {
      var np = iso(n.x, n.y, 6);
      ctx.strokeStyle = 'rgba(240,212,138,.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(np.sx, np.sy, reduce ? 12 : 11 + Math.sin(env.now / 200) * 2, 0, 7);
      ctx.stroke();
    }
    env.floats.forEach(function (f) {
      var p = iso(f.x, f.y, 78);
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      ctx.font = '700 13px "WenQuanYi Micro Hei",sans-serif';
      ctx.textAlign = 'center';
      var w = ctx.measureText(f.text).width + 14;
      ctx.fillStyle = 'rgba(28,16,10,.78)';
      roundRect(p.sx - w / 2, p.sy - 14, w, 20, 8);
      ctx.fill();
      ctx.fillStyle = '#f6efe2';
      ctx.fillText(f.text, p.sx, p.sy);
      ctx.globalAlpha = 1;
    });
  }

  window.CSView = {
    resize: resize,
    screenToWorld: screenToWorld,
    draw: draw,
    iso: iso,
    setScale: function (s) { scale = s; }
  };
})();
