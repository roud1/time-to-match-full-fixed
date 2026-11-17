"""
Original score + sound effects for Tiko Shorts 001, synthesized from scratch (no samples,
no third-party audio), then mixed with the Kokoro dialogue.
Outputs: assets/music/music.wav, assets/sfx/sfx.wav, project/mix.wav (exactly 20.000 s, 48 kHz stereo)
"""
import json, os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

H = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(H, "..", "assets")
SR, DUR = 48000, 20.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
BPM = 120.0; BEAT = 60.0 / BPM

def buf(): return np.zeros((N, 2))
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)

def add(dst, sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N: return
    if i0 < 0: sig = sig[-i0:]; i0 = 0
    n = min(len(sig), N - i0)
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    dst[i0:i0 + n, 0] += sig[:n] * gain * l * 1.414
    dst[i0:i0 + n, 1] += sig[:n] * gain * r * 1.414

# ------------------------------------------------------------------ instruments
def pizz(freq, dur=0.5, bright=0.5):
    """Karplus-Strong plucked string (pizzicato)."""
    n = int(SR * (dur + 0.3)); P = max(2, int(SR / freq))
    y = np.zeros(n); y[:P] = lp(rng.uniform(-1, 1, P), 1500 + 5000 * bright, 1)
    decay = 0.996 - 0.004 * (freq / 1000)
    for s in range(P, n, P):
        e = min(n, s + P); prev = y[s - P:e - P]; prev1 = np.concatenate([[y[s - P - 1] if s - P - 1 >= 0 else 0], prev[:-1]])
        y[s:e] = 0.5 * (prev + prev1) * decay
    env = np.ones(n); rel = int(0.06 * SR); k = int(dur * SR)
    if k + rel < n: env[k:k + rel] = np.linspace(1, 0, rel); env[k + rel:] = 0
    return y * env * 0.6

def bell(freq, dur=1.6, amp=1.0):
    t = np.arange(int(SR * dur)) / SR
    parts = [(1, 1.0, 2.2), (2.76, 0.45, 4.0), (5.4, 0.22, 7.0), (8.93, 0.1, 10.0)]
    y = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t * d) for r, a, d in parts)
    y *= np.minimum(1, t / 0.002)
    return y * 0.35 * amp

def pad(freqs, dur, attack=0.5):
    t = np.arange(int(SR * dur)) / SR
    y = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ph = 2 * np.pi * f * (1 + det / 100) * t + rng.uniform(0, 6.28)
            y += (2 * ((f * (1 + det / 100) * t + ph / 6.28) % 1) - 1)
    y = lp(y, 1800, 2) * 0.04
    env = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / 0.6)
    return y * np.clip(env, 0, 1) * (1 + 0.05 * np.sin(2 * np.pi * 5 * t))

def bassoon(freq, dur):
    t = np.arange(int(SR * (dur + 0.05))) / SR
    y = np.sign(np.sin(2 * np.pi * freq * t)) * 0.5 + np.sin(2 * np.pi * freq * t)
    y = lp(y, 900, 2)
    env = np.minimum(1, t / 0.015) * np.exp(-t * 5) * (t < dur)
    return y * env * 0.25

def shaker(dur=0.06):
    n = int(SR * dur); t = np.arange(n) / SR
    return bp(rng.uniform(-1, 1, n), 5000, 12000) * np.exp(-t * 60) * 0.25

def woodblock(freq=900):
    t = np.arange(int(SR * 0.08)) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2.7 * t)) * np.exp(-t * 70) * 0.35

def kick(freq=70, dur=0.35):
    t = np.arange(int(SR * dur)) / SR
    f = freq * (1 + 1.5 * np.exp(-t * 30))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.6

def cymbal_swell(dur=1.0):
    n = int(SR * dur); t = np.arange(n) / SR
    return hp(rng.uniform(-1, 1, n), 6000) * (t / dur) ** 2 * 0.12

# ------------------------------------------------------------------ score
music = buf()
B = lambda b: b * BEAT  # beat -> seconds
roots = {0: 48, 4: 48, 6: 43, 8: 45, 10: 41, 12: 43, 16: 41, 18: 48, 20: 50, 22: 43,
         24: 48, 26: 45, 28: 41, 30: 43, 32: 48, 36: 43}
def root_at(b):
    k = max(x for x in roots if x <= b); return roots[k]
triad = {48: [0, 4, 7], 43: [0, 4, 7], 45: [0, 3, 7], 41: [0, 4, 7], 50: [0, 3, 7]}

# hook hit at 0
for m in (48, 60, 64, 67, 72): add(music, pizz(mtof(m), 0.6, 0.8), 0.0, 0.5)
add(music, bell(mtof(84)), 0.0, 0.5); add(music, kick(), 0.0, 0.6)
add(music, cymbal_swell(0.25), 0.0, 0.3)
# quick pizz pickup run into the groove
for i, m in enumerate([72, 74, 76, 79, 81, 84]):
    add(music, pizz(mtof(m), 0.12, 0.7), 1.2 + i * 0.12, 0.35, 0.2)

# bass "oom-pah" pizz (beats 2..36)
for b in range(2, 36):
    r = root_at(b)
    if 28 <= b < 32:  # comic bassoon section
        add(music, bassoon(mtof(r - 12 + (7 if b % 2 else 0)), 0.22), B(b), 0.9, -0.1)
        continue
    m = r - 12 + (7 if b % 2 else 0)
    add(music, pizz(mtof(m), 0.35, 0.3), B(b), 0.7, -0.15)
# off-beat chord pizz in chase & comic sections
for b in list(range(2, 14)) + list(range(24, 32)):
    r = root_at(b)
    for iv in triad[r]: add(music, pizz(mtof(r + 12 + iv), 0.15, 0.5), B(b + 0.5), 0.16, 0.25)
# shaker 8ths + woodblock
for k in range(4, 28 * 2):
    b = k / 2
    if 2 <= b < 14 or 24 <= b < 32: add(music, shaker(), B(b), 0.6 if k % 2 else 0.35, 0.4)
for b in range(24, 32):
    if b % 2: add(music, woodblock(1000 if b % 4 == 1 else 800), B(b), 0.5, 0.3)
for b in range(4, 14, 4): add(music, kick(80, 0.25), B(b), 0.35)

melody = [(4, 76, .5), (4.5, 79, .5), (5, 84, .5), (5.5, 79, .5), (6, 81, .5), (6.5, 79, .5), (7, 76, 1),
          (8, 72, .5), (8.5, 76, .5), (9, 81, .5), (9.5, 76, .5), (10, 77, .5), (10.5, 81, .5), (11, 84, .5), (11.5, 81, .5),
          (12, 79, .5), (12.5, 83, .5), (13, 86, .5), (13.5, 83, .5),
          (14, 79, .25), (14.25, 81, .25), (14.5, 83, .25), (14.75, 84, .25), (15, 86, 1),
          (24, 72, .5), (24.5, 79, .25), (25, 76, .5), (26, 74, .5), (26.5, 77, .25), (27, 81, .5),
          (28, 79, .5), (28.5, 78, .5), (29, 77, .5), (29.5, 76, .5), (30, 75, .5), (30.5, 74, .5), (31, 72, 1),
          (36, 72, .5), (36.5, 76, .5), (37.5, 79, .5)]
for b, m, d in melody:
    add(music, pizz(mtof(m), d * BEAT * 0.8, 0.75), B(b), 0.42, 0.1)
# magic: harp gliss at the leap + glock soaring melody + string pad
for i, m in enumerate([60, 64, 67, 72, 76, 79, 84, 88, 91, 96]):
    add(music, pizz(mtof(m), 0.6, 0.9), B(14) + i * 0.045, 0.3, -0.3 + i * 0.06)
for b, m in [(16, 84), (17, 88), (18, 91), (19.5, 89), (20, 88), (21, 86), (22, 83), (23, 79)]:
    add(music, bell(mtof(m), 1.4), B(b), 0.55, 0.2)
for b in (16, 17, 18, 19, 20, 21, 22, 23):  # sparkly arpeggio 8ths
    r = root_at(b)
    for k, iv in enumerate(triad[r]):
        add(music, bell(mtof(r + 36 + iv), 0.5, 0.5), B(b) + k * BEAT / 3, 0.18, 0.5 - k * 0.4)
add(music, pad([mtof(53), mtof(65), mtof(69), mtof(72)], 4.2, 0.6), B(15.5), 1.0)
add(music, pad([mtof(50), mtof(62), mtof(65), mtof(69)], 2.2, 0.3), B(20), 0.9)
# gentle ending bars
for b, m in [(32, 76), (33, 79), (34, 84), (35, 83)]:
    add(music, bell(mtof(m), 1.2, 0.8), B(b), 0.35)
add(music, pad([mtof(48), mtof(60), mtof(64), mtof(67)], 3.5, 0.8), B(32), 0.7)
# final "ta-da" sting at 19.4 s
T_STING = 19.4
add(music, pizz(mtof(67), 0.12, 0.8), T_STING - 0.24, 0.5); add(music, pizz(mtof(71), 0.12, 0.8), T_STING - 0.12, 0.5)
for m in (48, 55, 60, 64, 67, 72, 76):
    add(music, pizz(mtof(m), 0.5, 0.9), T_STING, 0.45)
for i, m in enumerate([84, 88, 91, 96]): add(music, bell(mtof(m), 0.8), T_STING + i * 0.04, 0.45)
add(music, kick(65, 0.4), T_STING, 0.5)
add(music, cymbal_swell(0.6), T_STING - 0.6, 0.6)

# ------------------------------------------------------------------ SFX
sfx = buf()
def noise(d): return rng.uniform(-1, 1, int(SR * d))
def env_ad(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def boing(f0=180, dur=0.55, up=1.0):
    t = np.arange(int(SR * dur)) / SR
    f = f0 * (1 + 0.9 * up * (1 - np.exp(-t * 7))) * (1 + 0.08 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 2))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return y * env_ad(len(t), 0.005, 0.22) * 0.5

def pop(f0=700):
    t = np.arange(int(SR * 0.12)) / SR
    f = f0 * np.exp(-t * 18) + 120
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * 0.6

def thud(f0=90, d=0.18):
    t = np.arange(int(SR * d)) / SR
    return (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 22) + lp(noise(d), 400) * np.exp(-t * 40) * 0.6) * 0.6

def rustle(dur=0.25, amt=1.0):
    n = int(SR * dur)
    crack = (rng.random(n) < 0.004 * amt) * rng.uniform(-1, 1, n)
    base = bp(noise(dur), 1800, 7000) * 0.25 + bp(crack, 1500, 9000) * 3.0
    t = np.arange(n) / SR
    return base * np.sin(np.pi * t / dur) ** 0.7 * 0.5

def step():
    n = int(SR * 0.05); t = np.arange(n) / SR
    return (bp(noise(0.05), 600, 4000) * np.exp(-t * 90) * 0.6 + np.sin(2 * np.pi * 260 * t) * np.exp(-t * 70) * 0.4) * 0.5

def whoosh(dur=0.4, f1=400, f2=2500):
    n = int(SR * dur); t = np.arange(n) / SR
    x = noise(dur); out = np.zeros(n); seg = 1200
    for s in range(0, n, seg):
        fc = f1 + (f2 - f1) * (s / n)
        out[s:s + seg] = bp(x[s:s + seg + 0][:seg] if s + seg <= n else x[s:], fc * 0.7, fc * 1.4)
    return lp(out, 6000) * np.sin(np.pi * t / dur) ** 1.5 * 0.6

def ping(freq):
    t = np.arange(int(SR * 0.5)) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2.01 * t)) * np.exp(-t * 9) * np.minimum(1, t / 0.001) * 0.12

def slide_whistle(t_dur, f_a, f_b, f_c):
    n = int(SR * t_dur); t = np.arange(n) / SR; u = t / t_dur
    f = np.where(u < 0.5, f_a + (f_b - f_a) * (u / 0.5), f_b + (f_c - f_b) * ((u - 0.5) / 0.5))
    f = f * (1 + 0.012 * np.sin(2 * np.pi * 6 * t))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) + bp(noise(t_dur), 1500, 5000) * 0.05
    return y * np.minimum(1, t / 0.03) * np.minimum(1, (t_dur - t) / 0.05) * 0.22

def rumble_track():
    """Apple rolling: low rumble following apple speed + soft periodic grass bumps."""
    keys = [(0, -1.95), (8, -1.3), (20, 0.0), (36, 1.15), (60, 2.0), (90, 2.8), (150, 5.2), (210, 8.6), (240, 9.75),
            (270, 10.8), (300, 11.9), (330, 13.0), (360, 13.85), (375, 14.2), (385, 14.3), (395, 14.25), (420, 13.65),
            (450, 12.75), (480, 12.0), (505, 11.6), (520, 11.45), (600, 11.45)]
    from scipy.interpolate import PchipInterpolator
    f = PchipInterpolator([k[0] for k in keys], [k[1] for k in keys])
    tt = np.arange(N) / SR
    x = f(np.clip(tt * 30, 0, 599)); v = np.abs(np.gradient(x) * SR)  # units/s
    rot = x / 0.8
    base = lp(rng.uniform(-1, 1, N), 160, 2) * 3.0
    bumps = 1 + 0.6 * np.maximum(0, np.sin(rot * 3)) ** 8
    grass = bp(rng.uniform(-1, 1, N), 2000, 6000) * 0.08
    amp = np.clip(v / 3.0, 0, 1)
    y = (base * bumps + grass) * amp
    return y

rum = rumble_track() * 0.55
sfx[:, 0] += rum; sfx[:, 1] += rum

T = lambda f: f / 30.0
# ACT 1
add(sfx, boing(170, 0.6), T(3), 0.6)                       # surprise jump
add(sfx, whoosh(0.35, 300, 1500), T(14), 0.5, -0.3)          # apple whizzes under
add(sfx, rustle(0.3, 2), T(6), 0.5, 0.1)
add(sfx, thud(110), T(36), 0.6); add(sfx, rustle(0.25, 2), T(36), 0.5)
add(sfx, rustle(0.35, 1.5), T(47), 0.35)                    # head shake
# ACT 2 footsteps (leg phase f*0.62 -> step every ~5 frames) + wing flutter
f = 75.0
while f < 204:
    add(sfx, step(), T(f), 0.45 * (0.8 + 0.4 * rng.random()), 0.1 * np.sin(f))
    if int(f) % 3 == 0: add(sfx, rustle(0.08, 3), T(f), 0.2)
    f += np.pi / 0.62
for f in np.arange(92, 204, 2 * np.pi / 1.25):
    add(sfx, whoosh(0.12, 700, 1600), T(f), 0.08, -0.1)
# ACT 3 magic leap
add(sfx, boing(220, 0.5, 1.4), T(211), 0.45)
add(sfx, whoosh(0.6, 300, 3000), T(212), 0.5)
for k in range(40):  # rising shimmer as markings glow
    add(sfx, ping(1200 * 2 ** (k / 14)), T(214) + k * 0.025, 0.5, rng.uniform(-0.6, 0.6))
add(sfx, rustle(0.5, 3), T(218), 0.5)                       # wings unfold (paper)
for f in np.arange(240, 372, 2 * np.pi / 0.9):
    add(sfx, whoosh(0.22, 250, 900), T(f), 0.25, -0.05)
for f in range(220, 372, 4):
    add(sfx, ping(rng.uniform(2500, 6000)), T(f) + rng.uniform(0, 0.05), 0.35, rng.uniform(-0.7, 0.7))
# ACT 4 funny moment
add(sfx, pop(750), T(375), 0.8); add(sfx, boing(260, 0.4, 0.6), T(376), 0.4); add(sfx, rustle(0.2, 3), T(375), 0.4)
add(sfx, slide_whistle(0.5, 900, 1500, 600), T(392), 0.6)    # apple reverses
f = 396.0
while f < 470:
    add(sfx, step(), T(f), 0.4, 0.15); f += np.pi / 0.9
add(sfx, slide_whistle(1.6, 500, 1700, 400), T(420), 0.55)   # comic spin
for f in np.arange(420, 470, 8):
    add(sfx, whoosh(0.18, 600, 2400), T(f), 0.25, 0.3 * np.sin(f))
add(sfx, boing(150, 0.9, 0.5), T(472), 0.45)                 # wobble
add(sfx, thud(140, 0.12), T(498), 0.4); add(sfx, rustle(0.2, 2), T(498), 0.3)
# ACT 5 ending
add(sfx, rustle(0.6, 4), T(512), 0.6); add(sfx, thud(80, 0.25), T(518), 0.4)  # soft flower-bed stop
for k in range(16): add(sfx, ping(rng.uniform(3000, 7000)), T(562) + k * 0.02, 0.45, rng.uniform(-0.8, 0.8))
add(sfx, rustle(0.4, 2), T(572), 0.35)
for f in (575, 586, 597): add(sfx, whoosh(0.15, 800, 1800), T(f), 0.12, -0.3)

# ------------------------------------------------------------------ dialogue
LS = json.load(open(os.path.join(H, "lipsync.json")))
voice = buf()
for st, en, name, sub, d in LS["lines"]:
    v, sr = sf.read(os.path.join(A, "voice", name + ".wav"))
    if v.ndim > 1: v = v.mean(1)
    assert sr == SR
    v = v / (np.abs(v).max() + 1e-9)
    add(voice, v, st / 30.0, 0.62, 0.0)
# small room ambience on voice
ir_n = int(0.25 * SR); ir = rng.uniform(-1, 1, ir_n) * np.exp(-np.arange(ir_n) / SR * 18)
ir = lp(ir, 5000) * 0.05
for c in range(2): voice[:, c] = voice[:, c] + np.convolve(voice[:, c], ir)[:N]

# forest ambience: soft air + distant birds (synth)
amb = lp(rng.uniform(-1, 1, N), 900) * 0.035
for t0 in np.arange(0.5, 19, 2.3):
    t = np.arange(int(SR * 0.18)) / SR
    chirp = np.sin(2 * np.pi * np.cumsum(3800 + 900 * np.sin(2 * np.pi * 14 * t)) / SR) * np.exp(-t * 18) * 0.03
    add(sfx, chirp, t0 + rng.uniform(0, 0.4), 0.6, rng.uniform(-0.8, 0.8))
sfx[:, 0] += amb; sfx[:, 1] += amb

# ------------------------------------------------------------------ mix
duck = np.ones(N)
for st, en, *_ in LS["lines"]:
    a, b = int((st / 30 - 0.08) * SR), int((en / 30 + 0.15) * SR)
    duck[max(0, a):min(N, b)] = 0.45
duck = lp(duck, 8, 1)
music *= duck[:, None]
music = music / np.abs(music).max() * 0.5
sfx = sfx / np.abs(sfx).max() * 0.55
mix = music * 0.85 + sfx * 0.8 + voice * 1.0
fade = int(0.25 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1)  # gentle soft-clip
os.makedirs(os.path.join(A, "music"), exist_ok=True); os.makedirs(os.path.join(A, "sfx"), exist_ok=True)
sf.write(os.path.join(A, "music", "music_original.wav"), music, SR)
sf.write(os.path.join(A, "sfx", "sfx_original.wav"), sfx, SR)
sf.write(os.path.join(A, "voice", "dialogue_stem.wav"), voice, SR)
sf.write(os.path.join(H, "mix.wav"), mix, SR)
print("mix", mix.shape, np.abs(mix).max())
