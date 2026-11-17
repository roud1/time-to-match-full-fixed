"""Episode 2 (DRAFT for review) — 'Tiko and the Dancing Star'

0–3 s   HOOK: a tiny golden star drops from the sky and bounces right in front of Tiko. "Ooh! A star!"
3–7 s   It hops away; Tiko hops after it, jump by jump. "Come back, little star!"
7–10 s  Tiko trips over a mushroom and plops onto his bottom (clumsy!). "Oopsie!"
10–16 s The star bounces around him to the beat; Tiko jumps up and dances along. "I can dance!"
16–20 s The star lands on his tail tip and both stars glow; Tiko giggles and winks. "Dance with me!"
"""
STAR_PATH = [(0, (0.9, -0.2, 3.5)), (14, (0.9, -0.2, 0.34)), (22, (1.1, -0.2, 0.8)), (32, (1.4, -0.2, 0.34)),
             (90, (1.6, -0.1, 0.34)), (102, (2.3, 0, 0.9)), (114, (3.0, 0, 0.34)), (126, (3.7, 0, 0.9)),
             (138, (4.4, 0, 0.34)), (150, (5.1, 0, 0.9)), (162, (5.8, 0, 0.34)), (230, (5.9, 0, 0.34))]
# dancing bounce around Tiko on the beat (15 frames per beat)
for k in range(12):
    f = 300 + k * 15
    STAR_PATH.append((f, (5.1 + 0.8 * (1 if k % 2 else -1), -0.4, 0.36 if k % 2 == 0 else 1.05)))
STAR_PATH += [(486, (4.6, 0.3, 1.2)), (500, (4.86, 0.42, 0.95))]

EPISODE = {
    "id": "ep002", "title": "Tiko and the Dancing Star", "frames": 600,
    "set": "meadow", "set_params": {"seed": 23, "x_range": (-6, 14), "flower_beds": [(5.6, 2.3, 0.8)]},
    "lighting": "day",
    "lines": [
        {"id": "01_ooh", "start": 20, "text": "Ooh! A star!"},
        {"id": "02_comeback", "start": 96, "text": "Come back, little star!", "speed": 1.1},
        {"id": "03_oops", "start": 236, "text": "Oopsie!"},
        {"id": "04_dance", "start": 330, "text": "I can dance!", "speed": 1.05},
        {"id": "05_giggle", "start": 505, "text": "Hee hee!"},
        {"id": "06_withme", "start": 548, "text": "Dance with me!"},
    ],
    "props": {
        "star": {"type": "star", "build": {"size": 0.3}, "path": STAR_PATH, "yaw": [(0, 0), (600, 1440)], "bob": 0.0},
    },
    "tiko": {
        "path": [(0, (0, 0, 0)), (90, (0.1, 0, 0)), (102, (0.8, 0, 0)), (126, (2.0, 0, 0)), (150, (3.2, 0, 0)),
                 (174, (4.4, 0, 0)), (200, (4.6, 0, 0)), (230, (5.0, 0, 0)), (600, (5.0, 0, 0))],
        "yaw": [(0, 0), (40, 15), (90, 50), (200, 60), (235, 40), (290, 0), (600, 0)],
        "clips": [
            {"m": "idle", "start": 0, "end": 20},
            {"m": "surprise", "start": 14, "dur": 24},
            {"m": "look", "start": 40, "end": 90, "yaw": 25, "pitch": 10},
            {"m": "jump", "start": 96, "dur": 24, "height": 0.5, "bi": 0},
            {"m": "jump", "start": 120, "dur": 24, "height": 0.6, "bi": 0},
            {"m": "jump", "start": 144, "dur": 24, "height": 0.5, "bi": 0},
            {"m": "walk", "start": 170, "end": 205, "speed": 1.6},
            {"m": "fall", "start": 205, "dur": 60},
            {"m": "sit", "start": 262, "end": 290},
            {"m": "jump", "start": 284, "dur": 22, "height": 0.35, "bi": 0},
            {"m": "dance", "start": 305, "end": 480, "bpm": 120},
            {"m": "laugh", "start": 500, "dur": 40},
            {"m": "wave", "start": 560, "end": 599, "side": "L", "face": "wink"},
        ],
        "expr": [
            {"e": "curious", "start": 40, "end": 92},
            {"e": "determined", "start": 96, "end": 200},
            {"e": "oops", "start": 262, "end": 290},
            {"e": "joy", "start": 470, "end": 500},
            {"e": "wink", "start": 548, "end": 599},
        ],
    },
    "camera": [
        {"shot": "follow", "start": 0, "dist": 3.2, "height": 1.0, "aim": 0.85},
        {"shot": "two_shot", "start": 90, "blend": 30, "a": "tiko", "b": "star", "min_dist": 4.0, "fit": 1.4, "height": 0.8, "aim": 0.7},
        {"shot": "follow", "start": 200, "blend": 20, "dist": 3.0, "height": 0.8, "aim": 0.6},
        {"shot": "orbit", "start": 300, "end": 480, "blend": 30, "dist": 3.6, "height": 1.0, "aim": 0.7, "deg0": -25, "deg1": 25},
        {"shot": "closeup", "start": 480, "blend": 40, "dist": 2.4, "height": 1.15, "aim": 0.95},
    ],
    "fx": {"sparkle_trail": [(492, 520)], "bursts": [14, 500]},
    "sfx": [(14, "ping", 0.6), (22, "boing_hi", 0.3), (32, "boing_hi", 0.25), (500, "shimmer", 0.6)],
    "music": {
        "bpm": 120, "theme": "tiko_main",
        "chords": [(0, "C"), (4, "F"), (6, "G"), (8, "C"), (12, "Am"), (14, "G"), (16, "F"), (18, "C"), (20, "F"), (22, "G"),
                   (24, "C"), (26, "Am"), (28, "F"), (30, "G"), (32, "C"), (36, "G"), (38.8, "C")],
        "sections": [{"start": 0, "end": 2, "mood": "hook"}, {"start": 2, "end": 13, "mood": "chase"},
                     {"start": 13, "end": 20, "mood": "comic"}, {"start": 20, "end": 32, "mood": "chase"},
                     {"start": 32, "end": 38.8, "mood": "gentle"}],
        "hits": [{"beat": 0, "type": "tutti"}, {"beat": 14, "type": "slide_comic"}, {"beat": 33, "type": "harp_gliss"}],
        "sting": 38.8,
    },
}
