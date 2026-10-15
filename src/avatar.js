/* Scarlet.Avatar: draws the portrait into an <svg> and exposes small setters.
   Nothing here knows about speech. Swap this file to change the renderer. */
(function (G) {
  'use strict';
  var S = (G.Scarlet = G.Scarlet || {});
  var uid = 0;

  function shade(hex, p) {
    var n = parseInt(hex.slice(1), 16), t = p < 0 ? 0 : 255, a = Math.abs(p);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round((t - r) * a + r); g = Math.round((t - g) * a + g); b = Math.round((t - b) * a + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  var DEFAULTS = { skin: '#f1cdb1', hair: '#c78f5c', eyes: '#8197a8', armor: '#8e1f2a', trim: '#d3a94d' };

  S.Avatar = function (svg, options) {
    var o = Object.assign({}, DEFAULTS, options || {});
    var id = 'sc' + (++uid);
    var skin = o.skin, skinD = shade(skin, -0.14), skinL = shade(skin, 0.4), skinS = shade(skin, -0.28);
    var hair = o.hair, hairD = shade(hair, -0.24), hairL = shade(hair, 0.32);
    var armor = o.armor, armorD = shade(armor, -0.38), gold = o.trim, leather = '#3a2216';

    function eye(i, cx) {
      return '<clipPath id="' + id + 'ce' + i + '"><ellipse cx="' + cx + '" cy="192" rx="14" ry="10"/></clipPath>' +
        '<g class="eye" data-cx="' + cx + '">' +
        '<ellipse cx="' + cx + '" cy="192" rx="14" ry="10" fill="#f3efec"/>' +
        '<g clip-path="url(#' + id + 'ce' + i + ')"><g class="iris">' +
        '<circle cx="' + cx + '" cy="192" r="8" fill="url(#' + id + 'ir)"/>' +
        '<circle cx="' + cx + '" cy="192" r="8" fill="none" stroke="' + shade(o.eyes, -0.5) + '" stroke-width="1.4"/>' +
        '<circle cx="' + cx + '" cy="192" r="3.7" fill="#0f1215"/>' +
        '<circle cx="' + (cx + 2.8) + '" cy="189.2" r="2.1" fill="#fff"/><circle cx="' + (cx - 2.6) + '" cy="194.6" r="1" fill="#fff" opacity=".7"/>' +
        '</g><ellipse cx="' + cx + '" cy="184" rx="15" ry="7" fill="#2a1410" opacity=".16"/></g>' +
        '<path d="M' + (cx - 15.5) + ',192 Q' + cx + ',177 ' + (cx + 15.5) + ',192" stroke="#3b2616" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (cx - 14) + ',193.5 Q' + cx + ',201 ' + (cx + 14) + ',193.5" stroke="' + skinS + '" stroke-width="1.2" fill="none" opacity=".55"/>' +
        '</g>' +
        '<path d="M' + (cx - 18) + ',186 Q' + cx + ',170 ' + (cx + 18) + ',186" stroke="' + skinS + '" stroke-width="1.6" fill="none" opacity=".55" stroke-linecap="round"/>';
    }

    var lock = '<path fill="' + hair + '" d="M124,176 C106,232 120,300 102,352 C94,400 112,448 100,510 C132,500 150,448 144,380 C140,334 152,282 140,236 C138,210 134,190 124,176 Z"/>' +
      '<path d="M118,230 C112,290 124,340 110,400" stroke="' + hairD + '" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>' +
      '<path d="M130,250 C126,300 134,340 126,390" stroke="' + hairL + '" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>' +
      '<path d="M112,300 C108,340 118,380 108,430" stroke="' + hairL + '" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round"/>';

    var gears = '';
    [[70, 90, 46], [330, 120, 34], [360, 360, 50], [40, 330, 28]].forEach(function (g, i) {
      gears += '<circle class="gear' + (i % 2 ? ' r' : '') + '" cx="' + g[0] + '" cy="' + g[1] + '" r="' + g[2] + '" fill="none" stroke="#7a5528" stroke-width="' + (g[2] * 0.28) + '" stroke-dasharray="' + (g[2] * 0.5) + ' ' + (g[2] * 0.32) + '" opacity=".45"/>' +
        '<circle cx="' + g[0] + '" cy="' + g[1] + '" r="' + (g[2] * 0.55) + '" fill="none" stroke="#7a5528" stroke-width="2" opacity=".4"/>';
    });

    svg.setAttribute('viewBox', '0 0 400 520');
    svg.innerHTML =
      '<defs>' +
      '<clipPath id="' + id + 'arch"><path d="M10,520 L10,210 A190,190 0 0 1 390,210 L390,520 Z"/></clipPath>' +
      '<radialGradient id="' + id + 'bg" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#34505f"/><stop offset=".55" stop-color="#14202a"/><stop offset="1" stop-color="#0a0f14"/></radialGradient>' +
      '<radialGradient id="' + id + 'sk" cx="42%" cy="38%" r="68%"><stop offset="0" stop-color="' + skinL + '"/><stop offset=".6" stop-color="' + skin + '"/><stop offset="1" stop-color="' + skinD + '"/></radialGradient>' +
      '<radialGradient id="' + id + 'ir" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="' + shade(o.eyes, 0.4) + '"/><stop offset=".65" stop-color="' + o.eyes + '"/><stop offset="1" stop-color="' + shade(o.eyes, -0.35) + '"/></radialGradient>' +
      '<linearGradient id="' + id + 'lp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c25a6c"/><stop offset="1" stop-color="#a8424f"/></linearGradient>' +
      '<clipPath id="' + id + 'mc"><path class="m-clip" d=""/></clipPath>' +
      '</defs>' +
      '<g clip-path="url(#' + id + 'arch)"><rect width="400" height="520" fill="url(#' + id + 'bg)"/>' +
      '<g transform="translate(0,40)">' + gears +
      '<circle cx="90" cy="250" r="2.4" fill="#5fe0d4"/><circle cx="318" cy="210" r="2" fill="#e3bd62"/><circle cx="60" cy="150" r="1.8" fill="#e3bd62"/><circle cx="345" cy="290" r="2.4" fill="#5fe0d4"/>' +
      /* hair behind the head */
      '<g class="head-a"><path fill="' + hairD + '" d="M112,200 C94,90 150,60 200,60 C255,60 306,90 288,200 C302,260 292,300 316,356 C326,404 300,456 316,520 L84,520 C100,456 74,404 84,356 C108,300 98,260 112,200 Z"/></g>' +
      /* neck */
      '<rect x="177" y="250" width="46" height="120" rx="12" fill="' + skin + '"/><ellipse cx="200" cy="292" rx="34" ry="18" fill="' + skinS + '" opacity=".28"/>' +
      /* armor */
      '<g class="body">' +
      '<ellipse cx="82" cy="448" rx="64" ry="46" fill="' + armor + '" stroke="' + gold + '" stroke-width="3"/><ellipse cx="318" cy="448" rx="64" ry="46" fill="' + armor + '" stroke="' + gold + '" stroke-width="3"/>' +
      '<path d="M52,470 C52,392 118,350 200,350 C282,350 348,392 348,470 L348,560 L52,560 Z" fill="' + armor + '"/>' +
      '<path d="M52,470 C52,392 118,350 200,350 C158,372 130,410 126,560 L52,560 Z" fill="' + armorD + '" opacity=".4"/>' +
      '<path d="M138,372 L338,560 L296,560 L120,392 Z" fill="' + leather + '" stroke="' + gold + '" stroke-width="2"/>' +
      '<rect x="236" y="450" width="26" height="22" rx="3" transform="rotate(42 249 461)" fill="' + gold + '"/>' +
      '<path d="M132,455 Q200,420 268,455" stroke="' + gold + '" stroke-width="3" fill="none" stroke-dasharray="2 8" stroke-linecap="round"/>' +
      '<path d="M156,352 Q200,392 244,352 L258,392 Q200,436 142,392 Z" fill="' + armorD + '" stroke="' + gold + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="200" cy="396" r="6" fill="' + gold + '"/></g>' +
      /* head */
      '<g class="head-b">' +
      '<ellipse cx="124" cy="192" rx="12" ry="19" fill="' + skin + '"/><ellipse cx="276" cy="192" rx="12" ry="19" fill="' + skin + '"/>' +
      '<path d="M124,180 C124,115 160,90 200,90 C240,90 276,115 276,180 C276,246 246,287 200,287 C154,287 124,246 124,180 Z" fill="url(#' + id + 'sk)"/>' +
      '<path d="M130,224 C140,266 168,286 200,287 C232,286 260,266 270,224 C262,262 236,280 200,281 C164,280 138,262 130,224 Z" fill="' + skinS + '" opacity=".22"/>' +
      '<ellipse cx="156" cy="224" rx="17" ry="10" fill="#ff8a8a" opacity=".2"/><ellipse cx="244" cy="224" rx="17" ry="10" fill="#ff8a8a" opacity=".2"/>' +
      '<g class="brows"><path d="M150,167 Q172,154 192,163" stroke="' + hairD + '" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<path d="M208,163 Q228,154 250,167" stroke="' + hairD + '" stroke-width="5" stroke-linecap="round" fill="none"/></g>' +
      eye(0, 172) + eye(1, 228) +
      '<path d="M200,196 Q197,214 194,224" stroke="' + skinS + '" stroke-width="2.4" fill="none" opacity=".35" stroke-linecap="round"/>' +
      '<path d="M197,200 Q192,220 190,226 Q200,233 210,226" stroke="' + skinS + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".75"/>' +
      '<ellipse cx="200" cy="222" rx="4" ry="2.4" fill="#fff" opacity=".28"/>' +
      '<path class="m-in" fill="#5b1622" d=""/>' +
      '<g clip-path="url(#' + id + 'mc)"><rect class="m-teeth" x="170" y="243" width="60" height="9" rx="3" fill="#f7f3ee"/><ellipse class="m-tongue" cx="200" cy="262" rx="12" ry="5" fill="#c75a6a"/></g>' +
      '<path class="m-lip" fill="none" stroke="url(#' + id + 'lp)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" d=""/>' +
      '<path class="m-line" fill="none" stroke="#7d2a3a" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" d=""/>' +
      '<ellipse class="m-shine" cx="200" cy="254" rx="7" ry="1.6" fill="#fff" opacity=".28"/>' +
      '<g transform="translate(400,0) scale(-1,1)">' + lock + '</g>' + lock +
      '<path fill="' + hair + '" d="M121,192 C106,96 168,62 208,68 C266,76 298,120 280,192 C270,150 250,122 208,110 C176,130 144,152 121,192 Z"/>' +
      '<path d="M150,92 Q196,70 250,92" stroke="' + hairL + '" stroke-width="5" stroke-linecap="round" fill="none" opacity=".6"/>' +
      '<path d="M140,130 Q170,96 214,96 M236,100 Q266,116 272,152 M158,118 Q190,100 226,104" stroke="' + hairD + '" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".6"/>' +
      '<path d="M206,76 C190,100 170,120 150,140 M222,80 C236,100 252,118 266,150" stroke="' + hairL + '" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".55"/>' +
      '</g></g></g>' +
      '<path d="M10,520 L10,210 A190,190 0 0 1 390,210 L390,520" fill="none" stroke="' + gold + '" stroke-width="3"/>' +
      '<path d="M2,520 L2,210 A198,198 0 0 1 398,210 L398,520" fill="none" stroke="#6d4a2b" stroke-width="1.5"/>';

    var q = function (sel) { return svg.querySelector(sel); };
    var r = {
      mClip: q('.m-clip'), mIn: q('.m-in'), mLip: q('.m-lip'), mLine: q('.m-line'), mShine: q('.m-shine'),
      teeth: q('.m-teeth'), tongue: q('.m-tongue'), brows: q('.brows'), body: q('.body'),
      headA: q('.head-a'), headB: q('.head-b'),
      eyes: Array.prototype.slice.call(svg.querySelectorAll('.eye')),
      irises: Array.prototype.slice.call(svg.querySelectorAll('.iris'))
    };

    function setMouth(open, wide) {
      var cx = 200, cy = 250, hw = 19 + (wide + 1) * 6.5;
      var x0 = cx - hw, x1 = cx + hw, tc = cy - 7 - open * 3, tm = cy - 4 - open * 2, bc = cy + 5 + open * 46;
      var d = 'M' + x0 + ',' + cy + ' Q' + (cx - hw * 0.5) + ',' + tc + ' ' + cx + ',' + tm + ' Q' + (cx + hw * 0.5) + ',' + tc + ' ' + x1 + ',' + cy + ' Q' + cx + ',' + bc + ' ' + x0 + ',' + cy + ' Z';
      r.mClip.setAttribute('d', d); r.mLip.setAttribute('d', d); r.mLine.setAttribute('d', d); r.mIn.setAttribute('d', d);
      r.mIn.setAttribute('opacity', open > 0.06 ? 1 : 0);
      r.teeth.setAttribute('opacity', open > 0.2 ? 1 : 0);
      r.teeth.setAttribute('x', x0); r.teeth.setAttribute('width', hw * 2); r.teeth.setAttribute('y', tm - 1);
      r.tongue.setAttribute('cy', cy + 2 + open * 18); r.tongue.setAttribute('rx', hw * 0.5); r.tongue.setAttribute('ry', 2 + open * 8);
      r.tongue.setAttribute('opacity', open > 0.3 ? 1 : 0);
      r.mShine.setAttribute('cy', cy + 4 + open * 14); r.mShine.setAttribute('opacity', open > 0.5 ? 0 : 0.28);
    }

    function setBlink(lid) { /* lid: 1 open .. 0.08 closed */
      r.eyes.forEach(function (e) {
        var cx = e.getAttribute('data-cx');
        e.setAttribute('transform', 'translate(' + cx + ' 192) scale(1 ' + lid.toFixed(3) + ') translate(' + (-cx) + ' -192)');
      });
    }
    function setGaze(x, y) {
      r.irises.forEach(function (i) { i.setAttribute('transform', 'translate(' + (x * 4).toFixed(2) + ' ' + (y * 2.6).toFixed(2) + ')'); });
    }
    function setHead(rot, ty) {
      var t = 'rotate(' + rot.toFixed(2) + ' 200 340) translate(0 ' + ty.toFixed(2) + ')';
      r.headA.setAttribute('transform', t); r.headB.setAttribute('transform', t);
    }
    function setBrow(lift) { r.brows.setAttribute('transform', 'translate(0 ' + (-lift).toFixed(2) + ')'); }
    function setBreath(y) { r.body.setAttribute('transform', 'translate(0 ' + y.toFixed(2) + ')'); }

    setMouth(0, 0); setBlink(1); setGaze(0, 0);
    return { svg: svg, options: o, setMouth: setMouth, setBlink: setBlink, setGaze: setGaze, setHead: setHead, setBrow: setBrow, setBreath: setBreath };
  };
})(window);
