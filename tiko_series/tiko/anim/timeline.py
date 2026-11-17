"""Bakes an episode script (see episodes/_template/episode.py) into per-frame data:

    frames[f] = {"tiko": pose_dict, "props": {name: (loc, rot, scale)},
                 "camera": (pos, target, lens), "sparkles": [(loc, scale, spin), ...]}
    events    = [(frame, sfx_name, gain, pan), ...]

Pure Python (no Blender), so whole episodes can be checked and previewed quickly.
"""
import math, random
from .curves import Track, Spring, smooth, lerp_t
from .pose import new_pose, blend, FACE_KEYS
from . import motions as M
from . import expressions as X
from . import camera as C


def _vec_tracks(keys):
    """[(frame, (x,y,z)), ...] -> three Tracks."""
    return [Track([(f, v[i]) for f, v in keys]) for i in range(3)]


class PropTrack:
    def __init__(self, name, spec, nf):
        self.name, self.spec = name, spec
        self.xyz = _vec_tracks(spec["path"])
        self.yaw = Track(spec.get("yaw", [(0, 0.0)]))
        self.r = spec.get("radius", 0.5)
        self.loc, self.rot = [], []
        rx = ry = 0.0
        prev = None
        for f in range(nf):
            p = tuple(t(f) for t in self.xyz)
            if spec.get("roll") and prev is not None:
                ry += (p[0] - prev[0]) / self.r
                rx -= (p[1] - prev[1]) / self.r
            rock = 0.0
            for rf in spec.get("rock_at", []):  # wobble when stopping
                if f > rf:
                    rock += 0.12 * math.sin((f - rf) * 0.35) * math.exp(-(f - rf) / 25)
            bob = spec.get("bob", 0.0) * math.sin(f * spec.get("bob_rate", 0.12))
            self.loc.append((p[0], p[1], p[2] + bob))
            self.rot.append((rx, ry + rock, math.radians(self.yaw(f))))
            prev = p


def _clip_weight(c, f):
    bi, bo = c.get("bi", 3), c.get("bo", 3)
    w = smooth(c["start"] - 0.001, c["start"] + bi, f) if bi > 0 else (1.0 if f >= c["start"] else 0.0)
    if f > c["end"] - bo:
        w *= 1 - smooth(c["end"] - bo, c["end"] + 0.001, f)
    return w if c["start"] <= f <= c["end"] else 0.0


def bake(ep, lipsync_env=None, seed=1):
    nf = ep["frames"]
    rng = random.Random(seed)
    T = ep["tiko"]
    props = {n: PropTrack(n, s, nf) for n, s in ep.get("props", {}).items()}

    # normalise clips
    clips = []
    for c in T.get("clips", []):
        c = dict(c)
        if c["m"] not in M.MOTIONS:
            raise KeyError(f"Unknown motion '{c['m']}'. Available: {', '.join(M.names())}")
        if "end" not in c:
            c["end"] = c["start"] + c.get("dur", M.DEFAULT_DUR.get(c["m"], 30)) - 1
        clips.append(c)
    exprs = [dict(e) for e in T.get("expr", [])]
    for e in exprs:
        X.get(e["e"])

    path = _vec_tracks(T["path"])
    yaw_tr = Track(T.get("yaw", [(0, 0.0)]))
    attach = T.get("attach", [])

    # automatic blinks
    blinks = []
    if T.get("blinks", "auto") == "auto":
        f = rng.randint(40, 80)
        while f < nf:
            blinks.append(f)
            f += rng.randint(65, 120)
    else:
        blinks = list(T.get("blinks", []))

    poses, roots = [], []
    for f in range(nf):
        p = new_pose()
        add = {"dz": 0.0, "dfwd": 0.0, "dside": 0.0, "dyaw": 0.0}
        for c in clips:
            w = _clip_weight(c, f)
            if w <= 0:
                continue
            lf = f - c["start"]
            dur = c["end"] - c["start"] + 1
            ov, ad = M.MOTIONS[c["m"]](lf, dur, c)
            blend(p, ov, w)
            for k, v in ad.items():
                add[k] += v * w
        for e in exprs:
            w = _clip_weight({**e, "bi": e.get("bi", 4), "bo": e.get("bo", 6)}, f)
            if w > 0:
                face = {k: v for k, v in {**{k: p[k] for k in FACE_KEYS}, **X.get(e["e"])}.items()}
                blend(p, face, w * e.get("amount", 1.0), keys=FACE_KEYS)
        # root position
        pos = [t(f) for t in path]
        for a in attach:
            if a["start"] <= f <= a.get("end", nf):
                base = props[a["prop"]].loc[f]
                off = a.get("offset", (0, 0, 0))
                pos = [base[0] + off[0], base[1] + off[1], base[2] + off[2]]
        yaw = yaw_tr(f) + add["dyaw"]
        yr = math.radians(yaw)
        fwd = (math.sin(yr), -math.cos(yr))       # Tiko faces -Y at yaw 0
        pos[0] += fwd[0] * add["dfwd"] + fwd[1] * add["dside"]
        pos[1] += fwd[1] * add["dfwd"] - fwd[0] * add["dside"]
        pos[2] += add["dz"]
        p["x"], p["y"], p["z"], p["yaw"] = pos[0], pos[1], pos[2], yaw
        # blinks (skip when eyes already mostly closed)
        b = max([max(0.0, 1 - abs(f - bf) / 3.0) for bf in blinks] + [0.0])
        if b > 0:
            for s in "LR":
                if p[f"lid_up_{s}"] < 0.5:
                    p[f"lid_up_{s}"] += (1 - p[f"lid_up_{s}"]) * b
        # lip sync
        if lipsync_env is not None and f < len(lipsync_env):
            sp = lipsync_env[f]
            p["mouth_open"] = max(p["mouth_open"], sp)
            p["mouth_O"] = p["mouth_O"] * (1 - 0.3 * sp)
        poses.append(p)
        roots.append(pos)

    # secondary motion: ears & tail follow accelerations with springs (overlapping action)
    ear_s, tail_s = Spring(0.2, 0.7), Spring(0.12, 0.8)
    for f in range(nf):
        a = roots[max(0, f - 1)][2] - 2 * roots[f][2] + roots[min(nf - 1, f + 1)][2] if 0 < f < nf - 1 else 0.0
        yv = poses[f]["yaw"] - poses[f - 1]["yaw"] if f else 0.0
        e = ear_s.step(max(-35, min(35, -a * 900)))
        t = tail_s.step(max(-40, min(40, -yv * 2.5)))
        poses[f]["ear_L"] += e
        poses[f]["ear_R"] += e * 1.15
        poses[f]["tail_sway"] += t

    # FX: sparkle trails & bursts
    particles = []
    for (a, b) in ep.get("fx", {}).get("sparkle_trail", []):
        for f in range(a, b, 2):
            for _ in range(2):
                r = roots[f]
                particles.append((f, (r[0] + rng.uniform(-0.15, 0.15), r[1] + rng.uniform(-0.2, 0.2), r[2] + 0.45 + rng.uniform(-0.15, 0.15)),
                                  (rng.uniform(-0.03, 0), rng.uniform(-0.01, 0.01), rng.uniform(-0.02, 0.005)), rng.randint(18, 30), rng.uniform(0.7, 1.4)))
    for f in ep.get("fx", {}).get("bursts", []):
        r = roots[min(f, nf - 1)]
        for k in range(16):
            a = 2 * math.pi * k / 16
            particles.append((f, (r[0], r[1] - 0.1, r[2] + 0.5), (math.cos(a) * 0.05, -0.01, math.sin(a) * 0.05), 22, 1.2))

    frames = []
    cam = C.CameraRig(ep.get("camera", []))
    for f in range(nf):
        subj = {"tiko": tuple(roots[f]), **{n: pt.loc[f] for n, pt in props.items()}}
        sp = []
        for (b, p0, v, life, sz) in particles:
            if b <= f < b + life:
                age = f - b
                u = age / life
                sc = sz * math.sin(math.pi * min(1, u * 1.3 + 0.05)) * (0.75 + 0.25 * math.sin(age * 1.7))
                sp.append(((p0[0] + v[0] * age, p0[1] + v[1] * age, p0[2] + v[2] * age), sc, age * 0.25))
        frames.append({"tiko": poses[f],
                       "props": {n: (pt.loc[f], pt.rot[f]) for n, pt in props.items()},
                       "camera": cam.at(f, subj),
                       "sparkles": sp})

    # sound events
    ev = []
    for c in clips:
        fn = M.EVENTS.get(c["m"])
        if fn and c.get("sfx", True):
            dur = c["end"] - c["start"] + 1
            for lf, name, g in fn(dur, c):
                if lf < dur:
                    ev.append((c["start"] + lf, name, g * c.get("sfx_gain", 1.0), 0.0))
    for item in ep.get("sfx", []):
        f, name, g = item[:3]
        ev.append((f, name, g, item[3] if len(item) > 3 else 0.0))
    ev.sort()
    return frames, ev
