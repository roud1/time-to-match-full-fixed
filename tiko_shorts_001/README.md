# Tiko — The Origami Explorer · Shorts 001 "The Flying Apple"

| Deliverable | File |
|---|---|
| Final YouTube Short (1080×1920, 30 fps, H.264 + AAC, 20.000 s) | `Tiko_Shorts_001.mp4` |
| English subtitles (also burned into the video) | `Tiko_Shorts_001.srt` |
| Dialogue script / shot list | `Tiko_Shorts_001_script.txt` |
| Thumbnail (1080×1920) | `Tiko_Shorts_001_thumbnail.png` |
| Production assets (voice, music, SFX stems, font) | `assets/` |
| Editable project (Blender scene + all generator scripts) | `project/` |

## How it was made (all tools ran locally in this container)

| Stage | Tool | Notes |
|---|---|---|
| 3D character, set, animation, camera | Blender 5.3 (`bpy` from PyPI), Cycles CPU | Tiko is modelled procedurally in `project/tiko_build.py` as a faceted folded-paper sculpture (flat-shaded facets, per-face paper tones, fibre bump, gold emissive markings), from the reference sheet. All 600 frames are keyframed in `project/tiko_shorts_001.blend`. |
| Render | Cycles, 12 spp + OpenImageDenoise, 720×1280 | Upscaled to 1080×1920 with Lanczos in the edit. A native 1080×1920 render took ~100 s/frame on this 4-core CPU with no GPU (~17 h), so the lower internal resolution was used to finish in a single session. |
| Voice | Kokoro-82M TTS (Apache-2.0 licence, commercial use permitted), voice `af_heart` | Pitch +3.5 st with formant shift for a young, cheerful voice; same processing on every line (`project/make_voice.py`). |
| Music & SFX | Synthesised from scratch in Python/NumPy (`project/make_audio.py`) | 100% original: Karplus-Strong pizzicato, bells, pads, bassoon, percussion; paper rustle, footsteps, rolling, boings, slide whistle, sparkles, wing whooshes. No samples or third-party audio. |
| Lip-sync | `project/make_lipsync.py` | Mouth opening driven per frame by the dialogue audio envelope. |
| Edit | FFmpeg + libass (`project/assemble.sh`) | Lanczos upscale, soft bloom, burned subtitles (Fredoka Bold, SIL OFL — licence in `assets/fonts/`), loudness normalised to −14 LUFS, true peak −1.5 dBTP. |

## Re-building

```bash
pip install bpy==5.3.0 kokoro-onnx soundfile scipy   # + Kokoro model files in /opt/tts
cd project
python3 make_voice.py      # dialogue  -> ../assets/voice
python3 make_lipsync.py    # timing + mouth envelope -> lipsync.json
python3 tiko_build.py      # scene + animation -> tiko_shorts_001.blend
python3 make_audio.py      # music, SFX, mix -> mix.wav
python3 make_subs.py       # SRT + ASS
python3 render.py /path/frames 0-599 67 12   # (100 = native 1080x1920)
./assemble.sh /path/frames ../Tiko_Shorts_001.mp4
```

## Known limitations (honest notes)

- No generative video/image AI or GPU was available; the animation is procedural 3D made in Blender. Tiko is a faithful *stylised* interpretation of the reference sheet (same colours, amber eyes, asymmetrical horns/ears, fan wings with gold star on his left wing, spirals, segmented tail with glowing star) but simpler and lower-poly than the painted concept art.
- Rendered at 720×1280 internally and upscaled; the frame is delivered at 1080×1920.
- The voice is neural TTS, not a voice actor. For the long-running series, a professional or licensed character voice (e.g. a voice actor or a commercial TTS service with an API key) would add more emotional range, especially for the giggle.
