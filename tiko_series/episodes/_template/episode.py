"""EPISODE SCRIPT TEMPLATE — copy this folder to episodes/epNNN_short_name/ and edit.

Units: frames at 30 fps (600 frames = 20 s). World: ground at z=0, action lane along +X at y≈0,
camera looks toward +Y. Tiko faces -Y (camera) at yaw 0, +X at yaw 90.

Then run:
  python3 tools/make_episode.py episodes/epNNN_short_name --stage voice      # dialogue wavs
  python3 tools/make_episode.py episodes/epNNN_short_name --stage animatic   # quick low-res check video
  python3 tools/make_episode.py episodes/epNNN_short_name --stage audio      # music + sfx + mix
  # review the animatic, then create the empty file APPROVED in the episode folder
  python3 tools/make_episode.py episodes/epNNN_short_name --stage final      # full render + MP4
"""

EPISODE = {
    "id": "epNNN",
    "title": "Tiko and the ...",
    "frames": 600,                      # exactly 20 s
    "set": "meadow",
    "set_params": {"seed": 11, "x_range": (-6, 14), "flower_beds": [(8.0, 0.0, 1.2)]},
    "lighting": "sunrise",              # sunrise | day | sunset

    # ---- dialogue (English). start = frame. 'sub' overrides subtitle text.
    "lines": [
        {"id": "01", "start": 6, "text": "Hello!", "speed": 1.0},
    ],

    # ---- props: path keys [(frame, (x, y, z))]; roll=True rotates like a ball
    "props": {
        # "apple": {"type": "apple", "build": {"radius": 0.8}, "path": [(0, (3, 0, 0.8))], "roll": True, "radius": 0.8, "rumble": True},
    },

    # ---- Tiko
    "tiko": {
        "path": [(0, (0, 0, 0)), (600, (0, 0, 0))],      # root position keys
        "yaw": [(0, 0)],                                 # facing keys (deg)
        "attach": [],                                    # [{"prop": "apple", "start": f, "end": f, "offset": (0,0,0.81)}]
        "clips": [                                       # motion library: tiko/anim/motions.py
            {"m": "idle", "start": 0, "end": 599},
            {"m": "wave", "start": 560, "end": 599, "side": "R"},
        ],
        "expr": [                                        # expressions: tiko/anim/expressions.py
            {"e": "happy", "start": 0, "end": 599},
        ],
        "blinks": "auto",
    },

    # ---- camera segments (tiko/anim/camera.py)
    "camera": [
        {"shot": "follow", "start": 0, "dist": 3.4, "height": 1.0, "aim": 0.8},
        {"shot": "closeup", "start": 500, "blend": 40, "dist": 2.4},
    ],

    # ---- FX
    "fx": {"sparkle_trail": [], "bursts": []},

    # ---- extra sound effects [(frame, name, gain, pan)] — names in tiko/audio/sfx.py
    "sfx": [],

    # ---- music (tiko/audio/music.py); 120 BPM => beat = 15 frames
    "music": {
        "bpm": 120, "theme": "tiko_main",
        "chords": [(0, "C"), (8, "Am"), (12, "F"), (16, "G"), (20, "C")],
        "sections": [{"start": 0, "end": 38, "mood": "gentle"}],
        "hits": [], "sting": 38.8,
    },
}
