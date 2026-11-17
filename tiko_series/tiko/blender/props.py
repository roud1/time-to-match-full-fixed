"""Reusable props. Each builder returns a root object whose origin is the prop's pivot
(for rolling props: the centre). Register new props in PROPS."""
import bpy, math
from mathutils import Vector
from . import meshes as G
from . import materials as MAT


def _apple_mat():
    if MAT.get("Apple"):
        return MAT.get("Apple")
    m = bpy.data.materials.new("Apple")
    n, l = MAT._nodes(m)
    p = MAT.principled(m)
    nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 4; nz.inputs["Detail"].default_value = 6
    tc = n.new("ShaderNodeTexCoord")
    mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.5, 1.5, 3.5)
    l.new(tc.outputs["Object"], mp.inputs["Vector"]); l.new(mp.outputs[0], nz.inputs["Vector"])
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[0].color = (0.55, 0.015, 0.02, 1)
    ramp.color_ramp.elements[1].position = 0.75; ramp.color_ramp.elements[1].color = (0.92, 0.10, 0.05, 1)
    l.new(nz.outputs["Fac"], ramp.inputs["Fac"]); l.new(ramp.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.32
    p.inputs["Coat Weight"].default_value = 0.8
    p.inputs["Coat Roughness"].default_value = 0.08
    return m


def apple(name, radius=0.8, coll=None):
    root = G.empty(name, coll=coll)
    bm = G.uvsphere(radius, 48, 28)
    for v in bm.verts:
        d = v.co.length
        z = v.co.z / d
        bulge = 1 + 0.06 * (1 - z * z) + 0.03 * z
        dimple = -0.22 * math.exp(-((1 - abs(z)) / 0.05)) if abs(z) > 0.85 else 0
        v.co = v.co * bulge + Vector((0, 0, dimple * radius * (1 if z > 0 else -1)))
    G.finish(f"{name}_Body", bm, _apple_mat(), parent=root, smooth=True, coll=coll)
    stem = G.finish(f"{name}_Stem", G.frustum(6, 0.035, 0.022, 0.32, radius * 0.7), MAT.basic("Stem", (0.25, 0.13, 0.05), rough=0.8),
                    parent=root, smooth=True, coll=coll)
    stem.rotation_euler = (0, math.radians(10), 0)
    leaf = G.finish(f"{name}_Leaf", G.poly([(0, 0, 0), (0.16, -0.07, 0.03), (0.38, 0, 0.06), (0.16, 0.07, 0.03), (0.17, 0, 0.0)],
                                           [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)]), MAT.paper("PaperSet"),
                    lambda i, p: ((0.32, 0.66, 0.22), (0.42, 0.76, 0.28))[i % 2], var=0.04, parent=root, coll=coll)
    leaf.location = (0.03, 0, radius * 0.98)
    leaf.rotation_euler = (math.radians(15), math.radians(-25), math.radians(30))
    return root


def paper_boat(name, size=1.0, color=(0.98, 0.95, 0.88), coll=None):
    """Classic folded paper boat (hull + sail fold), origin at waterline centre."""
    root = G.empty(name, coll=coll)
    s = size
    v = [(-0.6 * s, 0, 0.0), (0.6 * s, 0, 0.0), (-0.85 * s, -0.25 * s, 0.25 * s), (0.85 * s, -0.25 * s, 0.25 * s),
         (-0.85 * s, 0.25 * s, 0.25 * s), (0.85 * s, 0.25 * s, 0.25 * s), (0, -0.05 * s, 0.75 * s), (0, 0.05 * s, 0.75 * s),
         (-0.4 * s, 0, 0.25 * s), (0.4 * s, 0, 0.25 * s)]
    f = [(0, 1, 3, 2), (1, 0, 4, 5), (0, 2, 4), (1, 5, 3), (2, 3, 9, 6, 8), (5, 4, 8, 7, 9), (8, 6, 7), (9, 7, 6)]
    G.finish(f"{name}_Paper", G.poly(v, f), MAT.paper("PaperSet"), color, var=0.05, crease=0.01, crease_angle=10, parent=root, coll=coll)
    return root


def star_pickup(name, size=0.25, coll=None):
    root = G.empty(name, coll=coll)
    G.finish(f"{name}_Star", G.star3d(size, size * 0.45, size * 0.35), MAT.basic("TikoTailStar", (1.0, 0.8, 0.3)), parent=root, coll=coll)
    return root


PROPS = {"apple": apple, "paper_boat": paper_boat, "star": star_pickup}
