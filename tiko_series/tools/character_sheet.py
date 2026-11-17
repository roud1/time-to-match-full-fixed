#!/usr/bin/env python3
"""Renders approval sheets for the permanent Tiko asset:
  assets/character/sheet_turnaround_expressions.png   turnaround (front/side/back/3-4) + expression row
  assets/character/sheet_motions.png                  4 key poses of every motion in the library
usage: python3 tools/character_sheet.py [--samples 16]
"""
import os, sys, math, argparse
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import bpy  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402
from tiko import config as K  # noqa: E402
from tiko.blender import scene, character, meshes as G, materials as MAT  # noqa: E402
from tiko.anim.pose import new_pose, blend  # noqa: E402
from tiko.anim import expressions as X, motions as M  # noqa: E402

ap = argparse.ArgumentParser(); ap.add_argument("--samples", type=int, default=16); a = ap.parse_args()
OUT = os.path.join(K.ASSETS, "character")
TMP = "/tmp/tiko_sheet"; os.makedirs(TMP, exist_ok=True)

scene.reset()
scene.world_and_lights("sunrise")
rig = character.load() if os.path.exists(K.CHARACTER_BLEND) else character.build()
floor = G.finish("Floor", G.frustum(48, 6, 6, 0.01, -0.01), MAT.paper("PaperGround", rough=0.9), (0.93, 0.88, 0.8), var=0.02)
cam, tgt = scene.camera()
cam.data.dof.use_dof = False
scene.render_settings("CYCLES", 100, a.samples)
sc = bpy.context.scene


def shot(name, w, h, cam_pos, target, lens):
    sc.render.resolution_x, sc.render.resolution_y = w, h
    cam.location, tgt.location = cam_pos, target
    cam.data.lens = lens
    sc.render.filepath = os.path.join(TMP, name + ".png")
    bpy.ops.render.render(write_still=True)
    return Image.open(sc.render.filepath).convert("RGB")


def pose_with(over=None, face=None):
    p = new_pose()
    if over:
        blend(p, over, 1.0)
    if face:
        blend(p, X.get(face), 1.0)
    return p


font = ImageFont.truetype(os.path.join(K.FONTS, "Fredoka_700Bold.ttf"), 34)
small = ImageFont.truetype(os.path.join(K.FONTS, "Fredoka_700Bold.ttf"), 26)

# ---- turnaround
turn = []
for label, yaw in (("Front", 0), ("Side", 90), ("Back", 180), ("3/4 View", 35)):
    p = pose_with({"wing_spread": 10})
    p["yaw"] = yaw
    character.apply_pose(rig, p)
    turn.append((label, shot(f"turn_{yaw}", 480, 640, (0, -3.6, 0.75), (0, 0, 0.62), 50)))
# ---- expressions (head close-ups)
exprs = ["neutral", "happy", "joy", "surprised", "curious", "excited", "sleepy", "wink", "worried", "determined", "dizzy", "oops"]
heads = []
for e in exprs:
    p = pose_with(face=e)
    if e == "curious":
        p["head_roll"] = 10
    character.apply_pose(rig, p)
    heads.append((e.capitalize(), shot(f"expr_{e}", 320, 320, (0, -2.0, 1.02), (0, 0, 0.95), 70)))

W = 1920
S = Image.new("RGB", (W, 640 + 60 + 2 * 380 + 40), (250, 244, 232))
d = ImageDraw.Draw(S)
for i, (lab, im) in enumerate(turn):
    S.paste(im, (i * 480, 0))
    d.text((i * 480 + 240, 600), lab, font=font, fill=(60, 45, 30), anchor="mm")
y0 = 700
for i, (lab, im) in enumerate(heads):
    x = (i % 6) * 320
    y = y0 + (i // 6) * 380
    S.paste(im, (x, y))
    d.text((x + 160, y + 345), lab, font=small, fill=(60, 45, 30), anchor="mm")
S.save(os.path.join(OUT, "sheet_turnaround_expressions.png"))

# ---- motion library sheet (4 key poses each)
lib = [("run", 20, {}), ("jump", 30, {"height": 0.8}), ("fly", 28, {}), ("laugh", 40, {}), ("surprise", 24, {}),
       ("fall", 50, {}), ("dance", 60, {"bpm": 120}), ("wave", 30, {})]
cells = []
for name, dur, prm in lib:
    row = []
    for k in range(4):
        f = int((k + 0.5) / 4 * dur)
        ov, ad = M.MOTIONS[name](f, dur, prm)
        p = pose_with(ov)
        p["yaw"] = 35
        p["z"] = ad.get("dz", 0.0)
        p["yaw"] += ad.get("dyaw", 0.0)
        character.apply_pose(rig, p)
        row.append(shot(f"mot_{name}_{k}", 300, 400, (0.3, -3.6, 0.9 + p["z"] * 0.6), (0, 0, 0.6 + p["z"] * 0.8), 50))
    cells.append((name, row))
S2 = Image.new("RGB", (220 + 4 * 300, len(cells) * 400), (250, 244, 232))
d2 = ImageDraw.Draw(S2)
for r, (name, row) in enumerate(cells):
    d2.text((110, r * 400 + 200), name.capitalize(), font=font, fill=(60, 45, 30), anchor="mm")
    for k, im in enumerate(row):
        S2.paste(im, (220 + k * 300, r * 400))
S2.save(os.path.join(OUT, "sheet_motions.png"))
print("sheets saved to", OUT)
