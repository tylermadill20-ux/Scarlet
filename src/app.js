/* Wires the modules to the page: avatar, speaker, feed, controls, and the per-frame loop. */
(function () {
  'use strict';
  var Sc = window.Scarlet;
  var NAME = 'Tyler';
  var $ = function (id) { return document.getElementById(id); };

  var avatar = new Sc.Avatar($('avatar'));
  var speaker = new Sc.Speaker();
  var feed = new Sc.Feed(speaker, { autoRead: true, allowedOrigins: window.SCARLET_ALLOWED_ORIGINS });
  var smooth = new Sc.Smoother();

  /* ---------- greeting and sample content (examples, not live data) ---------- */
  var hr = new Date().getHours();
  var part = hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening';
  $('greet').textContent = 'Good ' + part + ', ' + NAME + '.';
  var SAMPLES = [
    'Good ' + part + ', ' + NAME + '. Here is your briefing. You have three things on today\'s list. First, review the open draft and send it before noon. Second, the afternoon call moves to three o\'clock, so protect that hour. Third, check the weekly numbers when you get a quiet moment. That is everything for now. I will keep watch.',
    'Quick update. A new order came in just now, and stock on the best seller is running low. You may want to reorder before the weekend.',
    'Heads up. Your next meeting starts in ten minutes. The notes from last week are ready if you want a quick refresher.'
  ];
  var sampleIdx = 0;

  /* ---------- script box with word highlight ---------- */
  var words = [], wi = -1, shown = '';
  function showText(text) {
    shown = text; wi = -1;
    var box = $('script'); box.textContent = ''; words = [];
    var re = /\S+/g, m;
    while ((m = re.exec(text))) {
      var s = document.createElement('span'); s.className = 'w'; s.textContent = m[0];
      box.appendChild(s); box.appendChild(document.createTextNode(' '));
      words.push({ s: m.index, el: s });
    }
    var n = words.length;
    $('s-words').textContent = n; $('s-min').textContent = (n / 150).toFixed(1);
  }
  showText(SAMPLES[0]);
  $('text').value = SAMPLES[0];

  /* ---------- queue list ---------- */
  function renderQueue(q) {
    var ul = $('queue'); ul.textContent = '';
    if (!q.length) { var e = document.createElement('li'); e.className = 'empty'; e.textContent = 'Nothing waiting. New items from your dashboard appear here.'; ul.appendChild(e); }
    q.slice(0, 5).forEach(function (it) {
      var li = document.createElement('li'), b = document.createElement('i'), t = document.createElement('span');
      b.className = 'badge'; b.textContent = it.priority === 'urgent' ? 'Urgent' : 'Next'; t.textContent = it.text;
      li.appendChild(b); li.appendChild(t); ul.appendChild(li);
    });
    if (q.length > 5) { var more = document.createElement('li'); more.className = 'empty'; more.textContent = '+ ' + (q.length - 5) + ' more'; ul.appendChild(more); }
    $('s-queue').textContent = q.length;
  }
  renderQueue([]);

  /* ---------- status ---------- */
  function setLive(live) {
    $('dot').className = 'dot' + (live ? ' live' : '');
    $('avatar').classList.toggle('live', live);
    $('status').textContent = live ? 'Scarlet · Live, reading your briefing' : (feed.ready ? 'Scarlet · Ready' : 'Scarlet · Click anywhere to unlock sound');
    $('tagline').textContent = live ? 'Listen in. I mark each word as I go.' : 'Press play and I will read your briefing.';
  }
  setLive(false);

  speaker.onStart = function (item) { showText(item.text); setLive(true); };
  speaker.onEnd = function () { setLive(false); };
  speaker.onVoices = function (vs) {
    var sel = $('voice'); sel.textContent = '';
    vs.forEach(function (v, i) { var o = document.createElement('option'); o.value = i; o.textContent = v.name + ' (' + v.lang + ')'; sel.appendChild(o); });
    if (!vs.length) { var o = document.createElement('option'); o.textContent = 'No voices found: silent lip-sync'; sel.appendChild(o); }
    else sel.value = speaker.voiceIndex;
  };
  speaker.onVoices(speaker.voices);
  feed.onChange = renderQueue;
  feed.onSpoken = function () { $('s-today').textContent = feed.spokenToday; };
  feed.onError = function () { $('note').textContent = 'Could not reach the feed URL. It must allow cross-origin requests (CORS) from this page.'; };

  /* browsers allow sound only after a click */
  function unlock() { if (!feed.ready) { feed.ready = true; setLive(speaker.speaking); feed.pump(); } }
  ['pointerdown', 'keydown'].forEach(function (ev) { window.addEventListener(ev, unlock, { once: false, passive: true }); });

  /* ---------- controls ---------- */
  $('play').addEventListener('click', function () {
    unlock(); feed.push({ id: 'manual-' + Date.now(), text: $('text').value, interrupt: true, priority: 'urgent' });
  });
  $('stop').addEventListener('click', function () { feed.clear(); speaker.stop(); });
  $('skip').addEventListener('click', function () { feed.skip(); });
  $('add').addEventListener('click', function () { unlock(); feed.push({ id: 'manual-' + Date.now(), text: $('text').value }); });
  $('sim').addEventListener('click', function () {
    unlock(); feed.push({ id: 'sim-' + Date.now(), text: SAMPLES[1 + (sampleIdx++ % 2)] });
    $('note').textContent = 'Example item sent as if your dashboard had pushed it.';
  });
  $('voice').addEventListener('change', function () { speaker.voiceIndex = +$('voice').value; });
  $('rate').addEventListener('input', function () { speaker.rate = +$('rate').value; });
  $('auto').addEventListener('change', function () { feed.autoRead = $('auto').checked; feed.pump(); });
  $('mute').addEventListener('change', function () { speaker.muted = $('mute').checked; });
  $('connect').addEventListener('click', function () {
    var url = $('feedurl').value.trim();
    if (!url) { feed.stopPolling(); $('note').textContent = 'Feed polling stopped.'; return; }
    feed.poll(url, 60000); $('note').textContent = 'Checking ' + url + ' every minute.';
  });
  $('copycode').addEventListener('click', function () {
    var txt = $('embed').textContent;
    try { navigator.clipboard.writeText(txt).then(function () { $('note').textContent = 'Embed code copied.'; }, function () { selectEmbed(); }); } catch (e) { selectEmbed(); }
  });
  function selectEmbed() { var r = document.createRange(); r.selectNodeContents($('embed')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); $('note').textContent = 'Press copy on your keyboard.'; }
  window.addEventListener('pagehide', function () { speaker.stop(); });

  /* ---------- idle life: blinking, gaze, breathing ---------- */
  var blinkAt = 2500, blinkT = -1, gaze = { x: 0, y: 0, tx: 0, ty: 0 }, nextGaze = 1500, last = 0;
  function frame(t) {
    var dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    var s = speaker.sample(dt);
    smooth.step(s.name, s.speaking);
    avatar.setMouth(smooth.o, smooth.w);

    if (s.speaking) {
      var idx = -1;
      for (var k = 0; k < words.length; k++) { if (words[k].s <= s.pos) idx = k; else break; }
      if (idx !== wi) { wi = idx; words.forEach(function (w, j) { w.el.className = 'w' + (j < idx ? ' done' : j === idx ? ' on' : ''); }); }
    } else if (wi !== -1) { wi = -1; words.forEach(function (w) { w.el.className = 'w'; }); }
    $('vis').textContent = Sc.VISEMES[s.name].n;

    /* blink on a random schedule */
    if (blinkT < 0 && t > blinkAt) { blinkT = 0; }
    var lid = 1;
    if (blinkT >= 0) { blinkT += dt; var p = blinkT / 0.18; lid = p < 0.5 ? 1 - p * 1.84 : p < 1 ? 0.08 + (p - 0.5) * 1.84 : 1; if (p >= 1) { blinkT = -1; blinkAt = t + 2200 + Math.random() * 4200; } }
    avatar.setBlink(Math.max(0.08, lid));

    /* eyes drift to a new point now and then, and return to the viewer while talking */
    if (t > nextGaze) {
      if (s.speaking && Math.random() < 0.7) { gaze.tx = 0; gaze.ty = 0; } else { gaze.tx = (Math.random() - 0.5) * 1.6; gaze.ty = (Math.random() - 0.4) * 1; }
      nextGaze = t + 900 + Math.random() * 2600;
    }
    gaze.x += (gaze.tx - gaze.x) * 0.18; gaze.y += (gaze.ty - gaze.y) * 0.18;
    avatar.setGaze(gaze.x, gaze.y);

    var amp = s.speaking ? 1 : 0.35, sec = t / 1000;
    avatar.setHead(Math.sin(sec * 1.3) * 1.1 * amp + (s.speaking ? Math.sin(sec * 3.1) * 0.6 : 0), Math.sin(sec * 1.9) * 1.6 * amp);
    avatar.setBrow(smooth.o * 2.5);
    avatar.setBreath(Math.sin(sec * 1.1) * 1.2);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* test hook */
  window.__scarlet = { avatar: avatar, speaker: speaker, feed: feed };
})();
