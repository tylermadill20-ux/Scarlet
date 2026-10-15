# Lip-sync tech watch

Last scouted: 2026-10-15. GitHub API was blocked during this pass, so "last update" is the newest dated README note, not a verified commit date.

| Name | License | Runs where | Fit for Scarlet |
|---|---|---|---|
| TalkingHead.js (met4citizen) | MIT | Browser, Three.js | 3D avatar with viseme blendshapes and word-timed lip-sync. Needs a rigged GLB. Best path to a more realistic head. |
| HeadTTS / Kokoro (met4citizen) | MIT, model Apache-2.0 | Browser (WebGPU, WASM fallback) or Node | Free TTS that returns word and viseme timings. Matches the `audioUrl` + `visemes` input in `src/speech.js`. |
| wawa-lipsync | MIT | Browser, Web Audio | Reads visemes from any audio element. Good drop-in for a second speech mode. |
| lipsync-engine (Amoner) | MIT | Browser, AudioWorklet | Has SVG and canvas renderers. Very young (3 commits). |
| Rhubarb Lip Sync | Unconfirmed (page links LICENSE.md) | CLI, offline | Make mouth-cue JSON from briefing audio on a server. Already supported by `normalizeTimeline`. |
| MuseTalk | MIT | GPU server | Real-time video lip-sync of a real face. Path to a photoreal Scarlet. |
| LatentSync | Apache-2.0 | GPU, 8-18 GB VRAM | Highest quality, offline. |
| Wav2Lip | Non-commercial | GPU | Skip for licence reasons. |

Not verified: SadTalker, Hallo, EchoMimic, Sonic, InfiniteTalk.

## Recommendation
- No GPU: keep the SVG renderer, add HeadTTS (Kokoro) for natural voice and exact viseme timings, or wawa-lipsync on any audio.
- Cheapest upgrade: server renders briefing audio, Rhubarb makes cues, page plays both.
- Photoreal Scarlet: MuseTalk or LatentSync on a GPU server, driven by the same briefing audio.
