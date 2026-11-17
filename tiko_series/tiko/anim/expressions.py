"""Facial expression library — matches the 'Expressions' row of the Tiko reference sheet
(Happy, Surprised, Curious, Excited, Sleepy, Winking) plus extra acting states.
Each entry only lists the face channels it changes; the rest stay at FACE_DEFAULTS.
"""

EXPRESSIONS = {
    "neutral":   {},
    "happy":     {"lid_low_L": 0.35, "lid_low_R": 0.35, "mouth_open": 0.45, "mouth_smile": 1.0, "brow_L": 0.2, "brow_R": 0.2, "blush": 0.4},
    "joy":       {"lid_up_L": 0.55, "lid_up_R": 0.55, "lid_low_L": 0.9, "lid_low_R": 0.9, "mouth_open": 0.85, "mouth_smile": 1.0,
                  "mouth_wide": 0.5, "brow_L": 0.4, "brow_R": 0.4, "blush": 0.8},           # eyes squeezed ^^
    "giggle":    {"lid_up_L": 0.7, "lid_up_R": 0.7, "lid_low_L": 1.0, "lid_low_R": 1.0, "mouth_open": 0.6, "mouth_smile": 1.0,
                  "mouth_wide": 0.3, "brow_L": 0.3, "brow_R": 0.3, "blush": 1.0},
    "surprised": {"brow_L": 1.0, "brow_R": 1.0, "mouth_open": 0.9, "mouth_O": 1.0, "mouth_smile": 0.0, "pupil": 0.8, "eye_sparkle": 1.2},
    "shocked":   {"brow_L": 1.0, "brow_R": 1.0, "brow_tilt": 0.4, "mouth_open": 1.0, "mouth_O": 1.0, "mouth_smile": -0.2, "pupil": 0.65},
    "curious":   {"brow_L": 0.9, "brow_R": -0.2, "mouth_open": 0.05, "mouth_smile": 0.3, "mouth_O": 0.4, "look_y": 0.3, "pupil": 1.15},
    "excited":   {"brow_L": 0.7, "brow_R": 0.7, "mouth_open": 0.8, "mouth_smile": 1.0, "mouth_wide": 0.4, "pupil": 1.3,
                  "eye_sparkle": 1.5, "blush": 0.6},
    "sleepy":    {"lid_up_L": 0.7, "lid_up_R": 0.7, "brow_L": -0.3, "brow_R": -0.3, "brow_tilt": 0.5, "mouth_open": 0.25, "mouth_O": 0.6,
                  "mouth_smile": 0.0},
    "wink":      {"lid_up_L": 1.0, "lid_low_L": 0.6, "brow_L": -0.2, "brow_R": 0.6, "mouth_open": 0.3, "mouth_smile": 1.0, "blush": 0.4},
    "determined": {"brow_L": -0.4, "brow_R": -0.4, "brow_tilt": -0.8, "lid_up_L": 0.2, "lid_up_R": 0.2, "mouth_open": 0.0,
                   "mouth_smile": 0.4},
    "worried":   {"brow_L": 0.5, "brow_R": 0.5, "brow_tilt": 1.0, "mouth_open": 0.15, "mouth_smile": -0.5, "pupil": 0.9},
    "sad":       {"brow_tilt": 1.0, "lid_up_L": 0.35, "lid_up_R": 0.35, "mouth_open": 0.0, "mouth_smile": -1.0, "look_y": -0.5},
    "dizzy":     {"lid_up_L": 0.3, "lid_up_R": 0.5, "brow_tilt": 0.6, "mouth_open": 0.35, "mouth_smile": -0.2, "mouth_O": 0.3},
    "proud":     {"lid_up_L": 0.35, "lid_up_R": 0.35, "lid_low_L": 0.3, "lid_low_R": 0.3, "mouth_smile": 1.0, "mouth_open": 0.15,
                  "brow_L": 0.3, "brow_R": 0.3, "blush": 0.3},
    "oops":      {"brow_tilt": 0.8, "brow_L": 0.4, "brow_R": 0.4, "mouth_open": 0.35, "mouth_wide": 0.6, "mouth_smile": -0.3,
                  "look_x": 0.4, "blush": 0.7},
}


def get(name):
    if name not in EXPRESSIONS:
        raise KeyError(f"Unknown expression '{name}'. Available: {', '.join(EXPRESSIONS)}")
    return EXPRESSIONS[name]
