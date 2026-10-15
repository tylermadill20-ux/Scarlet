/* Scarlet lip-sync core: viseme table, text-to-viseme mapping, smoothing, and timeline
   support (Rhubarb cues or any {t, v} list). Pure logic, no DOM. */
(function (G) {
  'use strict';
  var S = (G.Scarlet = G.Scarlet || {});

  /* o = jaw opening 0..1, w = mouth width -1 (rounded) .. 1 (wide) */
  var VIS = {
    rest: { o: 0,    w: 0,    n: 'REST' },
    aa:   { o: 0.95, w: 0.15, n: 'AH' },
    ee:   { o: 0.5,  w: 0.9,  n: 'EE' },
    ih:   { o: 0.35, w: 0.6,  n: 'IH' },
    oh:   { o: 0.75, w: -0.85, n: 'OH' },
    oo:   { o: 0.35, w: -1,   n: 'OO' },
    mbp:  { o: 0,    w: -0.1, n: 'M/B/P' },
    fv:   { o: 0.14, w: 0.45, n: 'F/V' },
    sz:   { o: 0.18, w: 0.7,  n: 'S/Z' },
    ln:   { o: 0.3,  w: 0.2,  n: 'L/T/N' },
    ww:   { o: 0.3,  w: -1,   n: 'W' },
    rr:   { o: 0.3,  w: -0.4, n: 'R' }
  };

  function visFor(ch) {
    ch = (ch || ' ').toLowerCase();
    if (ch === 'a') return 'aa';
    if (ch === 'e') return 'ee';
    if (ch === 'i' || ch === 'y') return 'ih';
    if (ch === 'o') return 'oh';
    if (ch === 'u') return 'oo';
    if ('bmp'.indexOf(ch) > -1) return 'mbp';
    if ('fv'.indexOf(ch) > -1) return 'fv';
    if ('szcxj'.indexOf(ch) > -1) return 'sz';
    if (ch === 'w') return 'ww';
    if (ch === 'r') return 'rr';
    if ('ltdngkqh'.indexOf(ch) > -1) return 'ln';
    if (/[0-9]/.test(ch)) return 'ln';
    return 'rest';
  }

  /* Viseme for the character at fractional position pos in text. */
  function visemeAt(text, pos) {
    var i = Math.floor(pos), ch = text.charAt(i);
    if (/[.,!?;:]/.test(ch)) return 'rest';
    var name = visFor(ch);
    if (name === 'rest' && /[a-z]/i.test(text.charAt(i - 1))) name = 'ln';
    return name;
  }

  /* Rhubarb Lip Sync shape letters to our visemes (A..H plus X). */
  var RHUBARB = { A: 'mbp', B: 'ee', C: 'ih', D: 'aa', E: 'oh', F: 'oo', G: 'fv', H: 'ln', X: 'rest' };

  /* Accepts Rhubarb JSON ({mouthCues:[{start,end,value}]}) or [{t, v}]; returns sorted [{t, v}]. */
  function normalizeTimeline(input) {
    var cues = [];
    if (input && input.mouthCues) {
      input.mouthCues.forEach(function (c) { cues.push({ t: +c.start, v: RHUBARB[c.value] || 'rest' }); });
    } else if (Array.isArray(input)) {
      input.forEach(function (c) { cues.push({ t: +c.t, v: VIS[c.v] ? c.v : (RHUBARB[c.v] || 'rest') }); });
    }
    cues.sort(function (a, b) { return a.t - b.t; });
    return cues;
  }

  function timelineAt(tl, t) {
    var lo = 0, hi = tl.length - 1, best = -1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (tl[mid].t <= t) { best = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return best < 0 ? 'rest' : tl[best].v;
  }

  /* Eases the mouth toward the target viseme each frame. */
  function Smoother() { this.o = 0; this.w = 0; }
  Smoother.prototype.step = function (name, speaking) {
    var tgt = VIS[name] || VIS.rest, k = speaking ? 0.5 : 0.35;
    this.o += (tgt.o - this.o) * k; this.w += (tgt.w - this.w) * k;
    return this;
  };

  S.VISEMES = VIS;
  S.visemeAt = visemeAt;
  S.normalizeTimeline = normalizeTimeline;
  S.timelineAt = timelineAt;
  S.Smoother = Smoother;
})(window);
