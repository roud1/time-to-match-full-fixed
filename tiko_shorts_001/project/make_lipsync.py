# Per-frame mouth-open envelope from the real dialogue audio (drives Tiko's lip sync).
import json, numpy as np, soundfile as sf, os
H = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(H, "..", "assets", "voice")
FPS, NF = 30, 600
LINES = [  # (start_frame, file, subtitle)
    (3,   "01_whoa",   "WHOA!"),
    (100, "02_wait",   "Hey! Wait for me!"),
    (258, "03_flying", "I'm flying!"),
    (425, "04_wobble", "Whoa, whoa, whoa!"),
    (522, "05_giggle", "Hee hee hee!"),
    (558, "06_again",  "Again!"),
]
env = np.zeros(NF); out = []
for st, name, sub in LINES:
    a, sr = sf.read(os.path.join(A, name + ".wav"))
    if a.ndim > 1: a = a.mean(1)
    spf = sr / FPS; n = int(len(a) / spf) + 1
    for i in range(n):
        seg = a[int(i * spf):int((i + 1) * spf)]
        if len(seg) and st + i < NF:
            env[st + i] = max(env[st + i], np.sqrt((seg ** 2).mean()))
    out.append([st, st + n, name, sub, len(a) / sr])
env = env / env.max()
env = np.clip((env - 0.06) / 0.6, 0, 1) ** 0.7
sm = env.copy()
for i in range(1, NF): sm[i] = max(env[i], sm[i - 1] * 0.55)  # quick close, no jitter
json.dump({"env": [round(float(x), 3) for x in sm], "lines": out}, open(os.path.join(H, "lipsync.json"), "w"))
print(out)
