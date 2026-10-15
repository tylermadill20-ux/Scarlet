# Scarlet

An avatar that reads your dashboard's briefing aloud with lip-sync. Plain JavaScript, no build step.

```
index.html          demo page (open it, or embed it in your dashboard in an iframe)
src/avatar.js       drawing and eye/head/mouth setters. Swap this to change the look or renderer.
src/lipsync.js      visemes, text-to-viseme, smoothing, Rhubarb/timeline support
src/speech.js       Speaker: browser voice, silent mode, or audio + viseme cues
src/feed.js         queue, de-duplication, postMessage and URL polling
src/app.js          wires the page together
tests/smoke.js      headless check (errors, mouth movement, highlight, mobile overflow)
docs/TECH-WATCH.md  newest free lip-sync tech, refreshed daily
.claude/agents/     lipsync-scout, avatar-qa, avatar-realism
```

## Feeding it from a dashboard
- iframe: `frame.contentWindow.postMessage({type:'scarlet:briefing', items:[{id, text, priority}]}, origin)`
- URL: paste a JSON endpoint (`{items:[{id,text,priority}]}`) into "Connect your dashboard". It needs CORS.
- Set `window.SCARLET_ALLOWED_ORIGINS = ['https://your-dashboard']` before `app.js` to accept messages from it.
- Items with the same `id` are read once. `priority:'urgent'` jumps the queue.

## Better lips and voice
Send `audioUrl` and `visemes` (Rhubarb JSON or `[{t, v}]`) with an item and Scarlet follows the audio clock instead of the text estimate.

## Test
`NODE_PATH=<folder with playwright> node tests/smoke.js`
