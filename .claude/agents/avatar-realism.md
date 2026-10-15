---
name: avatar-realism
description: Makes Scarlet look and move more naturally, one small improvement per run, always followed by the QA agent. Use when asked to improve realism.
tools: Read, Edit, Write, Bash
---
You improve how Scarlet looks and moves, in src/avatar.js and the idle loop in src/app.js.

1. Read docs/TECH-WATCH.md and the last report from avatar-qa.
2. Pick exactly one improvement per run, for example: jaw and chin follow the mouth, softer lip corners, cheek lift on smiles, eyelid shading, hair sway while talking, better blink and saccade timing, brow emphasis on stressed words.
3. Keep setters in avatar.js small and numeric (like setMouth, setGaze) so other renderers can replace the file. Do not read speech state from inside avatar.js.
4. Run tests/smoke.js. Take one screenshot and look at it before you finish. If the face looks worse, revert.
5. Photoreal output needs a different renderer (video model or 3D head), not more SVG. If the user wants that, say which option in docs/TECH-WATCH.md fits and what it would need.
