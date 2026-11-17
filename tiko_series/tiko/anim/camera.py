"""Camera shot library for vertical 9:16 framing.

A camera track is a list of segments:
    {"shot": "follow", "start": 0, "subject": "tiko", "blend": 30, ...params}
Each segment lasts until the next one starts; `blend` frames cross-fade from the previous shot.

Shots
  static     pos, target, lens
  follow     subject, dist (camera -Y distance), height, aim (z offset of look point),
             lead (x offset), z_follow (0..1 how much camera rises with subject)
  two_shot   a, b subjects; frames both (camera centred between them)
  closeup    subject, dist, height, aim  (face-level push)
  orbit      subject, dist, height, aim, deg0, deg1 (arc around subject)
All shots accept: lens, shake (handheld amplitude, units), dutch is not used (kids-friendly, stable horizon).
"""
import math
from .curves import smooth, lerp_t, lerp


def _shot(seg, f, subj):
    s = seg["shot"]
    lens = seg.get("lens", 32)
    if s == "static":
        return tuple(seg["pos"]), tuple(seg["target"]), lens
    if s in ("follow", "closeup"):
        x, y, z = subj[seg.get("subject", "tiko")]
        dist = seg.get("dist", 2.6 if s == "closeup" else 4.0)
        h = seg.get("height", 1.0)
        aim = seg.get("aim", 0.9 if s == "closeup" else 0.6)
        zf = seg.get("z_follow", 1.0 if s == "closeup" else 0.85)
        lead = seg.get("lead", 0.0)
        return (x + lead, y - dist, h + z * zf), (x + lead, y, aim + z), lens
    if s == "two_shot":
        a, b = subj[seg["a"]], subj[seg["b"]]
        cx, cy = 0.5 * (a[0] + b[0]), 0.5 * (a[1] + b[1])
        cz = 0.5 * (a[2] + b[2])
        sep = math.hypot(a[0] - b[0], a[1] - b[1])
        dist = max(seg.get("min_dist", 3.4), sep * seg.get("fit", 1.5))
        return (cx, cy - dist, seg.get("height", 0.8) + cz * 0.3), (cx, cy, seg.get("aim", 0.7) + cz * 0.3), lens
    if s == "orbit":
        x, y, z = subj[seg.get("subject", "tiko")]
        u = smooth(seg["start"], seg.get("end", seg["start"] + 60), f)
        d = math.radians(lerp(seg.get("deg0", -20), seg.get("deg1", 20), u))
        dist = seg.get("dist", 3.5)
        return (x + math.sin(d) * dist, y - math.cos(d) * dist, seg.get("height", 1.0) + z), (x, y, seg.get("aim", 0.6) + z), lens
    raise KeyError(f"unknown shot {s}")


class CameraRig:
    def __init__(self, segments):
        self.segs = sorted(segments, key=lambda s: s["start"]) or [{"shot": "follow", "start": 0}]

    def at(self, f, subj):
        idx = 0
        for i, s in enumerate(self.segs):
            if s["start"] <= f:
                idx = i
        cur = self.segs[idx]
        c, t, l = _shot(cur, f, subj)
        b = cur.get("blend", 0)
        if idx > 0 and b > 0 and f < cur["start"] + b:
            c0, t0, l0 = _shot(self.segs[idx - 1], f, subj)
            u = smooth(cur["start"], cur["start"] + b, f)
            c, t, l = lerp_t(c0, c, u), lerp_t(t0, t, u), lerp(l0, l, u)
        sh = cur.get("shake", 0.0)
        if sh:
            c = (c[0] + sh * math.sin(f * 0.37) * math.sin(f * 0.11), c[1], c[2] + sh * math.sin(f * 0.29 + 1.3))
        return c, t, l
