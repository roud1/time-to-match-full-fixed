"""Reusable motion library for Tiko.

Every motion is a function  motion(f, dur, p) -> (override, add, )  where
  f    local frame inside the clip (0 .. dur-1)
  dur  clip length in frames
  p    parameter dict from the episode script
  override  pose channels to blend toward (body + optional face)
  add       additive root offsets: dz, dfwd (along facing), dside, dyaw
and an optional  events(dur, p) -> [(local_frame, sfx_name, gain)]  used to place sound effects.

Principles baked in: anticipation, squash & stretch, overshoot, overlapping action
(secondary motion of ears/tail is added later by the timeline springs).
"""
import math
from .curves import smooth, pulse, ease_out_back
from . import expressions as X

MOTIONS = {}
EVENTS = {}
DEFAULT_DUR = {}


def motion(name, dur=None):
    def deco(fn):
        MOTIONS[name] = fn
        if dur:
            DEFAULT_DUR[name] = dur
        return fn
    return deco


def events(name):
    def deco(fn):
        EVENTS[name] = fn
        return fn
    return deco


def _face(name, k=1.0):
    return {key: val for key, val in X.get(name).items()} if k == 1.0 else {key: val * k for key, val in X.get(name).items()}


# ---------------------------------------------------------------- idle / locomotion
@motion("idle")
def idle(f, dur, p):
    s = p.get("energy", 1.0)
    return ({"sq": 0.015 * s * math.sin(f * 0.12), "tail_sway": 8 * s * math.sin(f * 0.07),
             "wing_flap_L": 4 * math.sin(f * 0.1), "wing_flap_R": 4 * math.sin(f * 0.1 + 0.4),
             "head_roll": 2.5 * s * math.sin(f * 0.05), "head_pitch": 1.5 * math.sin(f * 0.09)}, {})


@motion("walk")
def walk(f, dur, p):
    ph = f * 0.36 * p.get("speed", 1.0)
    sw = math.sin(ph)
    return ({"leg_FL": 25 * sw, "leg_FR": -25 * sw, "leg_BL": -25 * sw, "leg_BR": 25 * sw,
             "wing_flap_L": 8 * math.sin(ph * 2), "wing_flap_R": 8 * math.sin(ph * 2),
             "tail_sway": 14 * math.sin(ph), "pitch": 4, "head_pitch": 3 * math.sin(ph * 2),
             "roll": 3 * sw, "sq": 0.02 * math.sin(ph * 2)},
            {"dz": abs(sw) * 0.025})


@events("walk")
def walk_ev(dur, p):
    period = math.pi / (0.36 * p.get("speed", 1.0))
    return [(i * period, "step", 0.3) for i in range(int(dur / period) + 1)]


@motion("run")
def run(f, dur, p):
    ph = f * 0.62 * p.get("speed", 1.0)
    sw = math.sin(ph)
    return ({"leg_FL": 40 * sw, "leg_FR": -40 * sw, "leg_BL": -40 * sw, "leg_BR": 40 * sw,
             "wing_flap_L": 45 * math.sin(f * 1.25), "wing_flap_R": 45 * math.sin(f * 1.25), "wing_spread": 20,
             "tail_sway": 18 * math.sin(ph * 0.5), "pitch": 10, "head_pitch": -6 + 4 * math.sin(ph * 2),
             "sq": 0.04 * math.sin(ph * 2)},
            {"dz": abs(sw) * 0.07})


@events("run")
def run_ev(dur, p):
    period = math.pi / (0.62 * p.get("speed", 1.0))
    ev = [(i * period, "step", 0.45) for i in range(int(dur / period) + 1)]
    ev += [(i * 2 * math.pi / 1.25, "flutter", 0.08) for i in range(int(dur / (2 * math.pi / 1.25)) + 1)]
    return ev


# ---------------------------------------------------------------- jump / land / fall
@motion("jump", 30)
def jump(f, dur, p):
    """Anticipation crouch -> stretch launch -> arc -> squash landing."""
    u = f / max(1, dur - 1)
    h = p.get("height", 1.0)
    air0, air1 = 0.22, 0.86
    t = (u - air0) / (air1 - air0)
    dz = 4 * h * t * (1 - t) if 0 <= t <= 1 else 0.0
    crouch = smooth(0.0, air0, u) * (1 - smooth(air0, air0 + 0.06, u))
    sq = -0.18 * crouch + 0.14 * pulse(u, air0 + 0.06, 0.06) - 0.2 * pulse(u, air1 + 0.04, 0.05)
    tuck = smooth(air0, air0 + 0.15, u) * (1 - smooth(air1 - 0.1, air1, u))
    return ({"sq": sq, "leg_FL": -30 * tuck, "leg_FR": -30 * tuck, "leg_BL": 35 * tuck, "leg_BR": 35 * tuck,
             "wing_spread": 45 * tuck, "wing_flap_L": 30 * math.sin(f * 1.3) * tuck, "wing_flap_R": 30 * math.sin(f * 1.3) * tuck,
             "tail_lift": 25 * tuck, "head_pitch": 10 * crouch - 8 * tuck, "pitch": -8 * crouch + 6 * tuck,
             "ear_L": 15 * tuck, "ear_R": 15 * tuck},
            {"dz": dz, "dfwd": p.get("forward", 0.0) * smooth(air0, air1, u)})


@events("jump")
def jump_ev(dur, p):
    return [(0.2 * dur, "boing", 0.5), (0.24 * dur, "rustle", 0.3), (0.88 * dur, "thud", 0.5)]


@motion("land", 12)
def land(f, dur, p):
    u = f / max(1, dur - 1)
    return ({"sq": -0.22 * pulse(u, 0.15, 0.15) + 0.06 * pulse(u, 0.55, 0.15), "head_pitch": 8 * pulse(u, 0.2, 0.2),
             "wing_spread": 25 * (1 - u)}, {})


@events("land")
def land_ev(dur, p):
    return [(0, "pop", 0.6), (1, "rustle", 0.3)]


@motion("fall", 50)
def fall(f, dur, p):
    """Trip forward, plop onto bottom, sit dizzy for a moment (Tiko is a little clumsy)."""
    u = f / max(1, dur - 1)
    trip = smooth(0, 0.22, u) * (1 - smooth(0.22, 0.4, u))
    sit = smooth(0.3, 0.45, u)
    flail = math.sin(f * 1.8) * (1 - smooth(0.35, 0.5, u))
    wob = math.sin(f * 0.5) * smooth(0.45, 0.6, u) * (1 - smooth(0.85, 1.0, u))
    face = _face("dizzy")
    face.update({"mouth_O": 0.8 * (1 - sit), "brow_L": 0.8 * (1 - sit), "brow_R": 0.8 * (1 - sit)})
    ov = {"pitch": 35 * trip - 22 * sit, "sq": -0.25 * pulse(u, 0.45, 0.05) + 0.05 * pulse(u, 0.55, 0.06),
          "leg_FL": -60 * sit + 30 * flail, "leg_FR": -60 * sit - 30 * flail, "leg_BL": 70 * sit, "leg_BR": 70 * sit,
          "wing_flap_L": 50 * flail, "wing_flap_R": -50 * flail, "wing_spread": 35 * (1 - sit) + 10,
          "head_roll": 12 * wob, "head_pitch": -10 * sit, "tail_lift": -15 * sit, "ear_L": -20 * sit, "ear_R": -25 * sit}
    ov.update(face)
    return (ov, {"dz": 0.12 * math.sin(math.pi * min(1, u / 0.42)) - 0.05 * sit, "dfwd": 0.25 * smooth(0, 0.42, u)})


@events("fall")
def fall_ev(dur, p):
    return [(1, "slide_down", 0.5), (0.45 * dur, "thud", 0.7), (0.47 * dur, "rustle", 0.5), (0.6 * dur, "wobble", 0.3)]


# ---------------------------------------------------------------- flight
@motion("takeoff", 40)
def takeoff(f, dur, p):
    """Golden markings glow, wings unfold, unsteady first lift."""
    u = f / max(1, dur - 1)
    unfold = smooth(0.1, 0.6, u)
    flap = (30 + 25 * unfold) * math.sin(f * 1.3)
    face = _face("surprised", 0.7)
    return ({"glow": smooth(0.05, 0.6, u), "wing_scale": 1 + 0.55 * unfold, "wing_spread": 20 + 45 * unfold,
             "wing_flap_L": flap, "wing_flap_R": flap, "roll": 16 * math.sin(f * 0.5) * unfold, "sq": 0.12 * pulse(u, 0.05, 0.06),
             "leg_FL": -30, "leg_FR": -30, "leg_BL": 35, "leg_BR": 35, "tail_lift": 12, "ear_L": 20, "ear_R": 20, **face},
            {"dz": p.get("lift", 0.9) * smooth(0.15, 1.0, u) ** 1.4})


@events("takeoff")
def takeoff_ev(dur, p):
    return [(0, "whoosh_up", 0.5), (2, "shimmer", 0.6), (6, "rustle_big", 0.5)]


@motion("fly")
def fly(f, dur, p):
    amp = p.get("flap", 55)
    rate = p.get("rate", 0.9)
    fl = amp * math.sin(f * rate)
    return ({"glow": p.get("glow", 1.0), "wing_scale": p.get("wing_scale", 1.55), "wing_spread": 65,
             "wing_flap_L": fl, "wing_flap_R": fl, "pitch": p.get("lean", 16), "leg_FL": -30, "leg_FR": -30,
             "leg_BL": 35, "leg_BR": 35, "tail_lift": 10 + 6 * math.sin(f * 0.4), "ear_L": 10, "ear_R": 10},
            {"dz": p.get("bob", 0.05) * math.sin(f * rate)})


@events("fly")
def fly_ev(dur, p):
    period = 2 * math.pi / p.get("rate", 0.9)
    ev = [(i * period, "flap", 0.25) for i in range(int(dur / period) + 1)]
    ev += [(i * 4, "ping", 0.3) for i in range(int(dur / 4))] if p.get("sparkles", True) else []
    return ev


# ---------------------------------------------------------------- emotions / acting
@motion("surprise", 24)
def surprise(f, dur, p):
    u = f / max(1, dur - 1)
    hop = math.sin(math.pi * min(1, u / 0.45)) if u < 0.45 else 0
    pop = ease_out_back(min(1, u / 0.25))
    face = _face(p.get("face", "surprised"))
    ov = {"sq": 0.15 * pulse(u, 0.08, 0.08) - 0.12 * pulse(u, 0.47, 0.06), "wing_spread": 40 * pop,
          "wing_flap_L": 25 * math.sin(f * 1.5) * (1 - u), "wing_flap_R": 25 * math.sin(f * 1.5) * (1 - u),
          "ear_L": 25 * pop, "ear_R": 25 * pop, "tail_lift": 25 * pop, "head_pitch": -10 * pop, **face}
    return (ov, {"dz": 0.18 * p.get("hop", 1.0) * hop, "dfwd": -0.12 * p.get("hop", 1.0) * smooth(0, 0.45, u)})


@events("surprise")
def surprise_ev(dur, p):
    return [(0, "boing", 0.45), (1, "rustle", 0.35)]


@motion("laugh", 40)
def laugh(f, dur, p):
    u = f / max(1, dur - 1)
    g = smooth(0, 0.1, u) * (1 - smooth(0.9, 1.0, u))
    face = _face(p.get("face", "giggle"))
    face = {k: v * g for k, v in face.items()}
    return ({"head_roll": 6 * math.sin(f * 0.55) * g, "head_pitch": 8 * g, "roll": 3 * math.sin(f * 1.6) * g,
             "sq": 0.03 * math.sin(f * 1.1) * g, "wing_flap_L": 12 * math.sin(f * 1.1) * g, "wing_flap_R": 12 * math.sin(f * 1.1) * g,
             "tail_sway": 20 * math.sin(f * 0.6) * g, **face},
            {"dz": 0.03 * abs(math.sin(f * 1.1)) * g})


@motion("dance")
def dance(f, dur, p):
    bpm = p.get("bpm", 120)
    beat = f * bpm / 60.0 / 30.0 * 2 * math.pi        # one radian cycle per beat
    sway = math.sin(beat / 2)
    face = _face(p.get("face", "excited"))
    return ({"roll": 12 * sway, "head_roll": -8 * sway, "head_pitch": 8 * math.sin(beat), "sq": 0.05 * math.cos(beat),
             "wing_flap_L": 45 * max(0, sway), "wing_flap_R": 45 * max(0, -sway), "wing_spread": 25,
             "leg_FL": 20 * max(0, sway), "leg_FR": 20 * max(0, -sway), "tail_sway": 30 * sway, "ear_L": 10 * sway,
             "ear_R": -10 * sway, **face},
            {"dz": 0.06 * abs(math.sin(beat / 2 * 2)), "dyaw": 10 * math.sin(beat / 4)})


@events("dance")
def dance_ev(dur, p):
    period = 30 * 60.0 / p.get("bpm", 120)
    return [(i * period, "step", 0.35) for i in range(int(dur / period) + 1)]


@motion("wave", 30)
def wave(f, dur, p):
    side = p.get("side", "R")
    k = f"wing_flap_{side}"
    other = "wing_flap_L" if side == "R" else "wing_flap_R"
    return ({k: 25 + 35 * math.sin(f * 0.55), other: 5, "wing_spread": 30, "head_roll": 5 * math.sin(f * 0.3),
             **_face(p.get("face", "happy"))}, {})


@events("wave")
def wave_ev(dur, p):
    return [(i * 11.4, "flutter", 0.12) for i in range(int(dur / 11.4) + 1)]


@motion("spin", 40)
def spin(f, dur, p):
    u = f / max(1, dur - 1)
    return ({"wing_spread": 50, "wing_flap_L": 50 * math.sin(f * 1.6), "wing_flap_R": 50 * math.sin(f * 1.6),
             "roll": 12 * math.sin(f * 0.4), "tail_sway": 35 * math.sin(f * 0.5), **_face("shocked", 0.8)},
            {"dyaw": 360 * p.get("turns", 2) * smooth(0, 1, u)})


@events("spin")
def spin_ev(dur, p):
    return [(0, "slide_whistle", 0.5)] + [(i * 8, "whoosh", 0.25) for i in range(int(dur / 8))]


@motion("look", 20)
def look(f, dur, p):
    return ({"head_yaw": p.get("yaw", 0), "head_pitch": p.get("pitch", 0), "head_roll": p.get("roll", 0),
             "look_x": p.get("eyes_x", max(-1, min(1, p.get("yaw", 0) / 45))), "look_y": p.get("eyes_y", 0)}, {})


@motion("shake_head", 20)
def shake_head(f, dur, p):
    u = f / max(1, dur - 1)
    return ({"head_yaw": 18 * math.sin(f * 0.9) * (1 - u), "head_roll": 8 * math.sin(f * 0.8) * (1 - u)}, {})


@events("shake_head")
def shake_ev(dur, p):
    return [(0, "rustle", 0.35)]


@motion("ride")
def ride(f, dur, p):
    """Balancing / running on top of a moving object."""
    ph = f * 0.9
    sw = math.sin(ph)
    return ({"leg_FL": 50 * sw, "leg_FR": -50 * sw, "leg_BL": -50 * sw, "leg_BR": 50 * sw,
             "wing_flap_L": 60 * math.sin(f * 1.6), "wing_flap_R": 60 * math.sin(f * 1.6), "wing_spread": 50,
             "roll": 15 * math.sin(f * 0.35), "tail_sway": 35 * math.sin(f * 0.5), **_face("shocked", 0.6)},
            {"dz": abs(sw) * 0.05})


@events("ride")
def ride_ev(dur, p):
    return [(i * math.pi / 0.9, "step", 0.4) for i in range(int(dur / (math.pi / 0.9)) + 1)]


@motion("sit")
def sit(f, dur, p):
    return ({"leg_FL": -20, "leg_FR": -20, "leg_BL": 30, "leg_BR": 30, "tail_sway": 12 * math.sin(f * 0.15),
             "sq": 0.012 * math.sin(f * 0.12)}, {})


def names():
    return sorted(MOTIONS)
