"""Original cartoon sound-effect library (100% synthesised, no samples).
Register new effects in SFX; the timeline refers to them by name."""
import numpy as np
from .dsp import SR, bp, lp, hp, noise, env_ad, rng, add, stereo


def boing(f0=180, dur=0.55, up=1.0):
    t = np.arange(int(SR * dur)) / SR
    f = f0 * (1 + 0.9 * up * (1 - np.exp(-t * 7))) * (1 + 0.08 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 2))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.25 * np.sin(2 * ph)) * env_ad(len(t), 0.005, 0.22) * 0.5


def pop(f0=700):
    t = np.arange(int(SR * 0.12)) / SR
    f = f0 * np.exp(-t * 18) + 120
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * 0.6


def thud(f0=90, d=0.18):
    t = np.arange(int(SR * d)) / SR
    return (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 22) + lp(noise(d), 400) * np.exp(-t * 40) * 0.6) * 0.6


def rustle(dur=0.25, amt=1.0):
    """Paper rustle/crinkle: band-limited hiss + sparse crackles."""
    n = int(SR * dur)
    crack = (rng().random(n) < 0.004 * amt) * rng().uniform(-1, 1, n)
    base = bp(noise(dur), 1800, 7000) * 0.25 + bp(crack, 1500, 9000) * 3.0
    t = np.arange(n) / SR
    return base * np.sin(np.pi * t / dur) ** 0.7 * 0.5


def step():
    n = int(SR * 0.05)
    t = np.arange(n) / SR
    return (bp(noise(0.05), 600, 4000) * np.exp(-t * 90) * 0.6 + np.sin(2 * np.pi * 260 * t) * np.exp(-t * 70) * 0.4) * 0.5


def whoosh(dur=0.4, f1=400, f2=2500):
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = noise(dur)
    out = np.zeros(n)
    seg = 1200
    for s in range(0, n, seg):
        fc = f1 + (f2 - f1) * (s / n)
        out[s:s + seg] = bp(x[s:s + seg], fc * 0.7, fc * 1.4)
    return lp(out, 6000) * np.sin(np.pi * t / dur) ** 1.5 * 0.6


def ping(freq=None):
    freq = freq or rng().uniform(2500, 6000)
    t = np.arange(int(SR * 0.5)) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2.01 * t)) * np.exp(-t * 9) * np.minimum(1, t / 0.001) * 0.12


def shimmer(n=40):
    out = np.zeros(int(SR * (n * 0.025 + 0.6)))
    for k in range(n):
        p = ping(1200 * 2 ** (k / 14))
        i = int(k * 0.025 * SR)
        out[i:i + len(p)] += p
    return out


def slide_whistle(t_dur=0.5, f_a=900, f_b=1500, f_c=600):
    n = int(SR * t_dur)
    t = np.arange(n) / SR
    u = t / t_dur
    f = np.where(u < 0.5, f_a + (f_b - f_a) * (u / 0.5), f_b + (f_c - f_b) * ((u - 0.5) / 0.5))
    f = f * (1 + 0.012 * np.sin(2 * np.pi * 6 * t))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) + bp(noise(t_dur), 1500, 5000) * 0.05
    return y * np.minimum(1, t / 0.03) * np.minimum(1, (t_dur - t) / 0.05) * 0.22


def chirp():
    t = np.arange(int(SR * 0.18)) / SR
    return np.sin(2 * np.pi * np.cumsum(3800 + 900 * np.sin(2 * np.pi * 14 * t)) / SR) * np.exp(-t * 18) * 0.03


# name -> generator (no-arg callables; variations are randomised per call)
SFX = {
    "boing": lambda: boing(170 + rng().uniform(-20, 30), 0.55),
    "boing_hi": lambda: boing(240, 0.45, 1.3),
    "wobble": lambda: boing(150, 0.9, 0.5),
    "pop": lambda: pop(750),
    "thud": lambda: thud(110),
    "thud_soft": lambda: thud(80, 0.25),
    "rustle": lambda: rustle(0.25, 2),
    "rustle_big": lambda: rustle(0.5, 3),
    "step": step,
    "flutter": lambda: whoosh(0.12, 700, 1600) * 0.6,
    "flap": lambda: whoosh(0.22, 250, 900),
    "whoosh": lambda: whoosh(0.18, 600, 2400),
    "whoosh_up": lambda: whoosh(0.6, 300, 3000),
    "ping": ping,
    "shimmer": shimmer,
    "slide_whistle": lambda: slide_whistle(1.6, 500, 1700, 400),
    "slide_up": lambda: slide_whistle(0.5, 600, 1500, 1500),
    "slide_down": lambda: slide_whistle(0.6, 1500, 900, 400),
    "poof": lambda: _poof(),
}


def _poof():
    a = rustle(0.6, 4)
    b = np.pad(thud(80, 0.25), (int(0.15 * SR), len(a)))[:len(a)]
    return a + b


def rumble(speeds, fps, gain=0.55):
    """Rolling-object rumble from per-frame speed (units/s) and travelled distance."""
    n = int(len(speeds) / fps * SR)
    v = np.interp(np.arange(n) / SR * fps, np.arange(len(speeds)), speeds)
    dist = np.cumsum(v) / SR
    base = lp(rng().uniform(-1, 1, n), 160, 2) * 3.0
    bumps = 1 + 0.6 * np.maximum(0, np.sin(dist / 0.8 * 3)) ** 8
    grass = bp(rng().uniform(-1, 1, n), 2000, 6000) * 0.08
    return (base * bumps + grass) * np.clip(v / 3.0, 0, 1) * gain


def render_events(events, nframes, fps, ambience=True):
    n = int(nframes / fps * SR)
    out = stereo(n)
    for f, name, gain, pan in events:
        if name not in SFX:
            raise KeyError(f"unknown sfx '{name}'. Available: {', '.join(sorted(SFX))}")
        add(out, SFX[name](), f / fps, gain, pan)
    if ambience:
        amb = lp(rng().uniform(-1, 1, n), 900) * 0.035
        out[:, 0] += amb
        out[:, 1] += amb
        for t0 in np.arange(0.5, nframes / fps - 1, 2.3):
            add(out, chirp(), t0 + rng().uniform(0, 0.4), 0.6, rng().uniform(-0.8, 0.8))
    return out
