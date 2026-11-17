#!/usr/bin/env python3
"""Builds the permanent Tiko asset: assets/character/tiko_character.blend.
Run once (or after an approved design change). Every episode appends this file, so Tiko
looks identical in every episode."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import bpy  # noqa: E402
from tiko import config as K  # noqa: E402
from tiko.blender import scene, character  # noqa: E402
from tiko.anim.pose import new_pose  # noqa: E402

scene.reset()
rig = character.build()
character.apply_pose(rig, new_pose(), None)
os.makedirs(os.path.dirname(K.CHARACTER_BLEND), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=K.CHARACTER_BLEND, compress=True)
n = [o for o in bpy.data.collections["Tiko"].all_objects]
print("saved", K.CHARACTER_BLEND, "objects:", len(n), "polys:", sum(len(o.data.polygons) for o in n if o.type == "MESH"))
