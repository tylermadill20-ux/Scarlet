/* Scarlet.Feed: the dashboard connection. Holds a queue of briefing items, removes duplicates,
   and hands them to the Speaker one at a time. Items arrive three ways:
     1. feed.push({ id, text, priority })               (same page)
     2. window.postMessage({ type:'scarlet:briefing' })  (dashboard in a parent window or iframe)
     3. feed.poll(url, everyMs)                          (JSON endpoint on your dashboard)       */
(function (G) {
  'use strict';
  var S = (G.Scarlet = G.Scarlet || {});

  function hash(s) { var h = 5381, i; for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h); }

  S.Feed = function (speaker, opts) {
    opts = opts || {};
    var self = this, queue = [], seen = {}, busy = false, timer = null;
    self.autoRead = opts.autoRead !== false;
    self.ready = false;                       /* browsers only allow sound after a click */
    self.allowedOrigins = opts.allowedOrigins || [G.location.origin];
    self.onChange = null; self.onSpoken = null; self.onError = null;
    self.spokenToday = 0;

    function changed() { if (self.onChange) self.onChange(queue.slice()); }

    self.push = function (item) {
      if (typeof item === 'string') item = { text: item };
      var text = String((item && item.text) || '').trim().slice(0, 4000);
      if (!text) return false;
      var id = item.id ? String(item.id) : hash(text);
      if (seen[id] && !item.force) return false;
      seen[id] = Date.now();
      var it = { id: id, text: text, priority: item.priority === 'urgent' ? 'urgent' : 'normal', audioUrl: item.audioUrl, visemes: item.visemes };
      if (item.interrupt || it.priority === 'urgent') queue.unshift(it); else queue.push(it);
      changed();
      if (item.interrupt && busy) speaker.stop();   /* its promise resolves, then pump() plays this item */
      else self.pump();
      return true;
    };

    self.pump = function () {
      if (busy || !self.ready || !self.autoRead || !queue.length) return;
      busy = true;
      var it = queue.shift(); changed();
      speaker.speak(it).then(function (done) {
        if (done) { self.spokenToday++; if (self.onSpoken) self.onSpoken(it); }
        busy = false; self.pump();
      });
    };

    self.clear = function () { queue.length = 0; changed(); };
    self.skip = function () { speaker.stop(); };
    self.size = function () { return queue.length; };

    function ingest(data) {
      if (!data) return;
      if (typeof data === 'string') { self.push({ text: data }); return; }
      var list = data.items || (data.text ? [data] : []);
      list.forEach(function (x) { self.push(x); });
    }

    G.addEventListener('message', function (e) {
      var ok = self.allowedOrigins.indexOf('*') > -1 || self.allowedOrigins.indexOf(e.origin) > -1;
      var d = e.data;
      if (!ok || !d || typeof d !== 'object') return;
      if (d.type === 'scarlet:briefing') ingest(d);
      else if (d.type === 'scarlet:stop') { self.clear(); speaker.stop(); }
      else if (d.type === 'scarlet:mute') { speaker.muted = !!d.on; }
    });

    /* Expects JSON {items:[{id,text,priority}]} or plain text. Needs CORS access to the URL. */
    self.poll = function (url, everyMs) {
      clearInterval(timer);
      function once() {
        fetch(url, { cache: 'no-store' }).then(function (r) {
          var ct = r.headers.get('content-type') || '';
          return ct.indexOf('json') > -1 ? r.json() : r.text();
        }).then(ingest).catch(function (err) { if (self.onError) self.onError(err); });
      }
      once(); timer = setInterval(once, Math.max(10000, everyMs || 60000));
    };
    self.stopPolling = function () { clearInterval(timer); timer = null; };
  };
})(window);
