"""Final mix: dialogue on top, music ducked under lines, SFX bed; exact length."""
import numpy as np
import soundfile as sf
from .dsp import SR, lp, stereo, add, rng
from .. import config as K


def _load(path, n):
    a, sr = sf.read(path)
    assert sr == SR, f"{path}: {sr} Hz"
    if a.ndim == 1:
        a = np.stack([a, a], 1)
    out = stereo(n)
    m = min(n, len(a))
    out[:m] = a[:m]
    return out


def mix(nframes, voice_timing, music_wav, sfx_track, out_wav, stems_dir=None,
        voice_gain=1.0, music_gain=0.85, sfx_gain=0.8, duck=0.45):
    n = int(round(nframes / K.FPS * SR))
    voice = stereo(n)
    for ln in voice_timing:
        v, sr = sf.read(ln["file"])
        if v.ndim > 1:
            v = v.mean(1)
        add(voice, v / (np.abs(v).max() + 1e-9), ln["start"] / K.FPS, 0.62 * ln.get("gain", 1.0), ln.get("pan", 0.0))
    ir_n = int(0.25 * SR)
    ir = lp(rng().uniform(-1, 1, ir_n) * np.exp(-np.arange(ir_n) / SR * 18), 5000) * 0.05
    for c in range(2):
        voice[:, c] += np.convolve(voice[:, c], ir)[:n]
    music = _load(music_wav, n) if music_wav else stereo(n)
    d = np.ones(n)
    for ln in voice_timing:
        a = int((ln["start"] / K.FPS - 0.08) * SR); b = int((ln["end"] / K.FPS + 0.15) * SR)
        d[max(0, a):min(n, b)] = duck
    music *= lp(d, 8, 1)[:, None]
    music = music / (np.abs(music).max() + 1e-9) * 0.5
    sfx = sfx_track[:n] if len(sfx_track) >= n else np.pad(sfx_track, ((0, n - len(sfx_track)), (0, 0)))
    sfx = sfx / (np.abs(sfx).max() + 1e-9) * 0.55
    out = music * music_gain + sfx * sfx_gain + voice * voice_gain
    fade = int(0.25 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    out = np.tanh(out * 1.1) / np.tanh(1.1)
    sf.write(out_wav, out, SR)
    if stems_dir:
        sf.write(f"{stems_dir}/music.wav", music, SR); sf.write(f"{stems_dir}/sfx.wav", sfx, SR); sf.write(f"{stems_dir}/dialogue.wav", voice, SR)
    return out_wav
