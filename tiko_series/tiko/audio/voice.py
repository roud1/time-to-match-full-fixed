"""Tiko's voice: Kokoro-82M TTS with the series' fixed voice settings + lip-sync envelope."""
import os, subprocess, json
import numpy as np
import soundfile as sf
from .. import config as K

_tts = None


def tts():
    global _tts
    if _tts is None:
        from kokoro_onnx import Kokoro
        _tts = Kokoro(K.TTS_MODEL, K.TTS_VOICES)
    return _tts


def synth_line(text, out_wav, speed=1.0):
    a, sr = tts().create(text, voice=K.TIKO_VOICE, speed=speed, lang="en-us")
    raw = out_wav.replace(".wav", "_raw.wav")
    sf.write(raw, a, sr)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af",
                    K.TIKO_VOICE_FILTER.format(p=K.TIKO_PITCH_RATIO), out_wav], check=True)
    os.remove(raw)
    return sf.info(out_wav).duration


def make_lines(lines, out_dir, force=False):
    """lines: [{"id","start"(frame),"text","speed"?}] -> writes wavs, returns timing list."""
    os.makedirs(out_dir, exist_ok=True)
    timing = []
    for ln in lines:
        p = os.path.join(out_dir, f"{ln['id']}.wav")
        if force or not os.path.exists(p):
            synth_line(ln["text"], p, ln.get("speed", 1.0))
        d = sf.info(p).duration
        timing.append({**ln, "file": p, "dur": d, "end": ln["start"] + int(np.ceil(d * K.FPS))})
    return timing


def lipsync(timing, nframes):
    env = np.zeros(nframes)
    for ln in timing:
        a, sr = sf.read(ln["file"])
        if a.ndim > 1:
            a = a.mean(1)
        spf = sr / K.FPS
        for i in range(int(len(a) / spf) + 1):
            seg = a[int(i * spf):int((i + 1) * spf)]
            f = ln["start"] + i
            if len(seg) and 0 <= f < nframes:
                env[f] = max(env[f], np.sqrt((seg ** 2).mean()))
    if env.max() > 0:
        env = env / env.max()
    env = np.clip((env - 0.06) / 0.6, 0, 1) ** 0.7
    for i in range(1, nframes):
        env[i] = max(env[i], env[i - 1] * 0.55)
    return [round(float(x), 3) for x in env]
