/* Scarlet.Speaker: reads one item at a time and reports, per frame, which viseme to show.
   Modes: 'timeline' (audio file + viseme cues, most accurate), 'tts' (browser voice),
   'silent' (lips move on a text clock, no sound). */
(function (G) {
  'use strict';
  var S = (G.Scarlet = G.Scarlet || {});
  var IDLE = { speaking: false, name: 'rest', pos: 0 };

  function sentencesOf(text) {
    var out = [], re = /[^.!?]+[.!?]*\s*/g, m;
    while ((m = re.exec(text))) { if (m[0].trim()) out.push({ start: m.index, txt: m[0] }); }
    return out;
  }
  function wordsOf(text) {
    var out = [], re = /\S+/g, m;
    while ((m = re.exec(text))) out.push({ s: m.index, e: m.index + m[0].length });
    return out;
  }

  S.Speaker = function () {
    var self = this, tok = 0, cur = null;
    var hasTTS = 'speechSynthesis' in G;
    self.rate = 1; self.voiceIndex = 0; self.muted = false; self.voices = []; self.speaking = false;
    self.onStart = null; self.onEnd = null; self.onVoices = null;

    function loadVoices() {
      if (!hasTTS) return;
      self.voices = speechSynthesis.getVoices().filter(function (v) { return /^en/i.test(v.lang); });
      var pref = /(samantha|aria|jenny|zira|google uk english female|google us english|karen|moira|serena|female)/i;
      self.voiceIndex = 0;
      for (var i = 0; i < self.voices.length; i++) { if (pref.test(self.voices[i].name)) { self.voiceIndex = i; break; } }
      if (self.onVoices) self.onVoices(self.voices);
    }
    if (hasTTS) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

    self.stop = function () {
      tok++;
      if (hasTTS) speechSynthesis.cancel();
      if (cur) {
        if (cur.audio) { try { cur.audio.pause(); } catch (e) { /* ignore */ } }
        cur.finish(false);
      }
    };

    /* item: { text, audioUrl?, visemes? }. Resolves true when finished, false if stopped. */
    self.speak = function (item) {
      self.stop();
      return new Promise(function (resolve) {
        var text = String(item.text || '').replace(/\s+/g, ' ').trim().slice(0, 4000);
        if (!text) { resolve(true); return; }
        var t = ++tok, fin = false;
        var c = cur = {
          text: text, words: wordsOf(text), sentences: sentencesOf(text), mode: 'silent',
          pos: 0, base: 0, got: false, audio: null, timeline: null,
          finish: function (done) {
            if (fin) return; fin = true;
            if (cur === c) cur = null;
            self.speaking = false;
            if (self.onEnd) self.onEnd(item);
            resolve(done !== false);
          }
        };
        self.speaking = true;
        if (self.onStart) self.onStart(item, c);

        if (item.audioUrl && item.visemes && !self.muted) {
          c.timeline = S.normalizeTimeline(item.visemes);
          c.audio = new Audio(item.audioUrl);
          c.mode = 'timeline';
          c.audio.onended = function () { c.finish(true); };
          c.audio.onerror = function () { c.mode = 'silent'; };
          var p = c.audio.play(); if (p && p.catch) p.catch(function () { c.mode = 'silent'; });
          return;
        }
        if (!self.muted && hasTTS && self.voices.length) {
          c.mode = 'tts';
          var speakSentence = function (i) {
            if (t !== tok) return;
            if (i >= c.sentences.length) { c.finish(true); return; }
            c.base = c.sentences[i].start; c.pos = c.base;
            var u = new SpeechSynthesisUtterance(c.sentences[i].txt);
            var v = self.voices[self.voiceIndex]; if (v) { u.voice = v; u.lang = v.lang; }
            u.rate = self.rate; u.pitch = 1.05;
            u.onboundary = function (e) { if (t !== tok || e.name === 'sentence') return; c.got = true; c.pos = c.base + e.charIndex; };
            u.onend = function () { speakSentence(i + 1); };
            u.onerror = function () { speakSentence(i + 1); };
            speechSynthesis.speak(u);
          };
          speakSentence(0);
        }
      });
    };

    /* Call once per animation frame. */
    self.sample = function (dt) {
      var c = cur;
      if (!c) return IDLE;
      if (c.mode === 'timeline') {
        var ts = c.audio.currentTime, dur = c.audio.duration;
        if (dur && isFinite(dur)) c.pos = c.text.length * Math.min(1, ts / dur);
        return { speaking: true, name: S.timelineAt(c.timeline, ts), pos: c.pos };
      }
      var next = c.pos + 14.5 * self.rate * dt;
      if (c.mode === 'tts' && c.got) {
        for (var k = 0; k < c.words.length; k++) {
          if (c.words[k].s <= c.pos + 0.01 && c.words[k].e >= c.pos - 1) { if (next > c.words[k].e + 1.2) next = c.words[k].e + 1.2; break; }
        }
      }
      c.pos = next;
      if (c.mode === 'silent' && c.pos >= c.text.length + 3) { c.finish(true); return IDLE; }
      return { speaking: true, name: S.visemeAt(c.text, c.pos), pos: c.pos, mode: c.mode };
    };

    self.current = function () { return cur; };
  };
})(window);
