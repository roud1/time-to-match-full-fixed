"""Episode 1 — 'Tiko and the Flying Apple', re-expressed in the series script format.

The delivered episode-1 master lives in tiko_shorts_001/ (frozen). This script reproduces the same
story/timing with the reusable pipeline and is the reference example for writing new episodes
(and allows a remaster with the upgraded character/music if desired).
"""
APPLE_X = [(0, -1.95), (8, -1.3), (20, 0.0), (36, 1.15), (60, 2.0), (90, 2.8), (150, 5.2), (210, 8.6), (240, 9.75),
           (270, 10.8), (300, 11.9), (330, 13.0), (360, 13.85), (375, 14.2), (385, 14.3), (395, 14.25), (420, 13.65),
           (450, 12.75), (480, 12.0), (505, 11.6), (520, 11.45), (600, 11.45)]
R = 0.8

EPISODE = {
    "id": "ep001", "title": "Tiko and the Flying Apple", "frames": 600,
    "set": "meadow", "set_params": {"seed": 7, "x_range": (-8, 22), "flower_beds": [(11.45, 0.0, 1.45)]},
    "lighting": "sunrise",
    "lines": [
        {"id": "01_whoa", "start": 3, "text": "Whoaaa!", "sub": "WHOA!"},
        {"id": "02_wait", "start": 100, "text": "Hey! Wait for me!", "speed": 1.15},
        {"id": "03_flying", "start": 258, "text": "I'm flying!", "speed": 1.05},
        {"id": "04_wobble", "start": 425, "text": "Whoa, whoa, whoa!", "speed": 1.25},
        {"id": "05_giggle", "start": 522, "text": "Hee hee hee!", "speed": 1.1},
        {"id": "06_again", "start": 558, "text": "Again!"},
    ],
    "props": {
        "apple": {"type": "apple", "build": {"radius": R}, "path": [(f, (x, 0, R)) for f, x in APPLE_X],
                  "roll": True, "radius": R, "rumble": True, "rock_at": [520]},
    },
    "tiko": {
        "path": [(0, (0, 0, 0)), (60, (-0.05, 0, 0)), (75, (0.15, 0, 0)), (90, (0.55, 0, 0)), (150, (3.6, 0, 0)),
                 (205, (6.7, 0, 0)), (212, (6.95, 0, 0)), (230, (7.7, 0, 0.95)), (255, (8.9, 0, 1.75)),
                 (285, (10.4, 0, 2.35)), (315, (12.1, 0, 2.6)), (340, (13.2, 0, 2.55)), (360, (13.9, 0, 2.15)),
                 (375, (14.2, 0, 1.62))],
        "yaw": [(0, -10), (8, -15), (36, 20), (46, 0), (55, 40), (75, 70), (90, 62), (210, 62), (230, 70), (360, 75),
                (375, 85), (400, 90), (420, 90), (470, 810), (490, 790), (505, 740), (525, 720), (600, 720)],
        "attach": [{"prop": "apple", "start": 375, "end": 600, "offset": (0, 0, R + 0.01)}],
        "clips": [
            {"m": "jump", "start": 0, "dur": 40, "height": 2.0, "bi": 0},
            {"m": "shake_head", "start": 44, "dur": 20},
            {"m": "walk", "start": 66, "end": 90, "speed": 1.4},
            {"m": "run", "start": 88, "end": 204},
            {"m": "takeoff", "start": 204, "dur": 46, "lift": 0.0},
            {"m": "fly", "start": 246, "end": 372, "bi": 6},
            {"m": "land", "start": 374, "dur": 14},
            {"m": "ride", "start": 395, "end": 470},
            {"m": "shake_head", "start": 470, "dur": 30},
            {"m": "sit", "start": 500, "end": 599},
            {"m": "laugh", "start": 520, "dur": 36},
            {"m": "wave", "start": 572, "end": 599, "side": "R"},
        ],
        "expr": [
            {"e": "surprised", "start": 0, "end": 44},
            {"e": "curious", "start": 50, "end": 88},
            {"e": "determined", "start": 92, "end": 204},
            {"e": "excited", "start": 250, "end": 372},
            {"e": "dizzy", "start": 472, "end": 505},
            {"e": "happy", "start": 505, "end": 520},
            {"e": "excited", "start": 556, "end": 599},
        ],
    },
    "camera": [
        {"shot": "follow", "start": 0, "dist": 3.4, "height": 1.0, "aim": 1.05, "z_follow": 0.55},
        {"shot": "two_shot", "start": 40, "blend": 60, "a": "tiko", "b": "apple", "min_dist": 4.7, "fit": 1.2, "height": 0.78, "aim": 0.72},
        {"shot": "follow", "start": 205, "blend": 35, "dist": 3.7, "height": 0.6, "aim": 0.4, "lead": 0.3},
        {"shot": "follow", "start": 350, "blend": 40, "subject": "apple", "dist": 4.5, "height": 1.9, "aim": 1.2, "z_follow": 0.0},
        {"shot": "follow", "start": 512, "blend": 48, "subject": "apple", "dist": 2.55, "height": 2.45, "aim": 1.52, "z_follow": 0.0, "lens": 35},
    ],
    "fx": {"sparkle_trail": [(216, 372)], "bursts": [216, 562]},
    "sfx": [(14, "whoosh", 0.5, -0.3), (392, "slide_up", 0.6), (420, "slide_whistle", 0.55), (512, "poof", 0.6)],
    "music": {
        "bpm": 120, "theme": "tiko_main",
        "chords": [(0, "C"), (6, "G"), (8, "Am"), (10, "F"), (12, "G"), (16, "F"), (18, "C"), (20, "Dm"), (22, "G"),
                   (24, "C"), (26, "Am"), (28, "F"), (30, "G"), (32, "C"), (36, "G"), (38.8, "C")],
        "sections": [{"start": 0, "end": 2, "mood": "hook"}, {"start": 2, "end": 12, "mood": "chase"},
                     {"start": 12, "end": 16, "mood": "build"}, {"start": 16, "end": 24, "mood": "magic"},
                     {"start": 24, "end": 32, "mood": "comic"}, {"start": 32, "end": 38.8, "mood": "gentle"}],
        "hits": [{"beat": 0, "type": "tutti"}, {"beat": 2.4, "type": "pickup"}, {"beat": 14, "type": "harp_gliss"},
                 {"beat": 28, "type": "slide_comic"}],
        "sting": 38.8,
    },
}
