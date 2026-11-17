"""Tiko's pose = a flat dict of named channels. This is the contract between the
animation layer (pure Python) and the Blender rig (tiko.blender.character.apply_pose).

Angles are degrees. Face channels are normalised 0..1 (or -1..1) and mapped to the
rig inside the character module, so motions never deal with geometry.
"""

BODY_DEFAULTS = {
    # root (world)
    "x": 0.0, "y": 0.0, "z": 0.0, "yaw": 0.0,
    # body
    "pitch": 0.0, "roll": 0.0, "sq": 0.0,          # sq > 0 stretch, < 0 squash
    "head_yaw": 0.0, "head_pitch": 0.0, "head_roll": 0.0,
    "wing_flap_L": 0.0, "wing_flap_R": 0.0, "wing_spread": 0.0, "wing_scale": 1.0,
    "leg_FL": 0.0, "leg_FR": 0.0, "leg_BL": 0.0, "leg_BR": 0.0,
    "tail_sway": 0.0, "tail_lift": 0.0, "tail_curl": 1.0,
    "ear_L": 0.0, "ear_R": 0.0,
    "glow": 0.0,
}

FACE_DEFAULTS = {
    "lid_up_L": 0.0, "lid_up_R": 0.0,      # 0 open, 1 closed
    "lid_low_L": 0.0, "lid_low_R": 0.0,    # 0 relaxed, 1 squint (happy eyes)
    "brow_L": 0.0, "brow_R": 0.0,          # -1 low .. 1 raised
    "brow_tilt": 0.0,                      # -1 angry/determined .. 1 worried/sad
    "mouth_open": 0.1, "mouth_smile": 0.6, "mouth_O": 0.0, "mouth_wide": 0.0,
    "pupil": 1.0, "look_x": 0.0, "look_y": 0.0,
    "blush": 0.0, "eye_sparkle": 1.0,
}

DEFAULTS = {**BODY_DEFAULTS, **FACE_DEFAULTS}
FACE_KEYS = tuple(FACE_DEFAULTS)
ANGLE_KEYS = ("yaw", "pitch", "roll", "head_yaw", "head_pitch", "head_roll", "wing_flap_L", "wing_flap_R",
              "wing_spread", "leg_FL", "leg_FR", "leg_BL", "leg_BR", "tail_sway", "tail_lift", "ear_L", "ear_R")


def new_pose():
    return dict(DEFAULTS)


def blend(base, over, w, keys=None):
    """Blend channels of `over` into `base` with weight w (0..1). Returns base."""
    if w <= 0:
        return base
    for k, v in over.items():
        if keys is not None and k not in keys:
            continue
        if k not in base:
            base[k] = v
        else:
            base[k] = base[k] + (v - base[k]) * min(1.0, w)
    return base
