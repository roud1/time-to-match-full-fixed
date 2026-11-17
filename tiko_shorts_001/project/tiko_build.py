"""
Tiko — The Origami Explorer | Shorts 001 "The Flying Apple"
Builds the full Blender scene procedurally (character, set, lights, camera),
bakes all animation as keyframes and saves an editable .blend.

Run:  python3 tiko_build.py [--lipsync timing.json] [--out tiko_shorts_001.blend]
"""
import bpy, bmesh, math, random, json, sys, os
from mathutils import Vector, Matrix, Euler
import numpy as np
from scipy.interpolate import PchipInterpolator

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
OUT = os.path.join(HERE, "tiko_shorts_001.blend")
LIPSYNC = os.path.join(HERE, "lipsync.json")
for i, a in enumerate(args):
    if a == "--out": OUT = args[i + 1]
    if a == "--lipsync": LIPSYNC = args[i + 1]

FPS, NF = 30, 600
rng = random.Random(7)

# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.frame_start, scene.frame_end = 0, NF - 1
scene.render.fps = FPS
scene.render.resolution_x, scene.render.resolution_y = 1080, 1920
scene.render.resolution_percentage = 100

# ---------------------------------------------------------------- materials
def _nodes(mat):
    try: mat.use_nodes = True
    except Exception: pass
    return mat.node_tree.nodes, mat.node_tree.links

def principled(mat):
    n, _ = _nodes(mat)
    return next(x for x in n if x.type == "BSDF_PRINCIPLED")

def mat_paper(name="Paper", rough=0.78, bump=0.05):
    """Matte cardstock: colour comes from the per-face 'col' attribute (origami facets)."""
    m = bpy.data.materials.new(name)
    n, l = _nodes(m)
    p = principled(m)
    at = n.new("ShaderNodeAttribute"); at.attribute_name = "col"; at.attribute_type = "GEOMETRY"
    cd = n.new("ShaderNodeCameraData")
    mr = n.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 7; mr.inputs["From Max"].default_value = 30
    mr.inputs["To Max"].default_value = 0.4
    l.new(cd.outputs["View Distance"], mr.inputs["Value"])
    mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"
    l.new(mr.outputs["Result"], mix.inputs[0]); l.new(at.outputs["Color"], mix.inputs[6])
    mix.inputs[7].default_value = (1.0, 0.86, 0.78, 1)
    l.new(mix.outputs[2], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = rough
    p.inputs["Sheen Weight"].default_value = 0.35
    p.inputs["Sheen Tint"].default_value = (1, 0.97, 0.9, 1)
    tc = n.new("ShaderNodeTexCoord")
    nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 260; nz.inputs["Detail"].default_value = 3
    w = n.new("ShaderNodeTexWave"); w.inputs["Scale"].default_value = 90; w.inputs["Distortion"].default_value = 18
    l.new(tc.outputs["Object"], nz.inputs["Vector"]); l.new(tc.outputs["Object"], w.inputs["Vector"])
    mx = n.new("ShaderNodeMath"); mx.operation = "ADD"
    l.new(nz.outputs["Fac"], mx.inputs[0]); l.new(w.outputs["Fac"], mx.inputs[1])
    b = n.new("ShaderNodeBump"); b.inputs["Strength"].default_value = bump; b.inputs["Distance"].default_value = 0.002
    l.new(mx.outputs[0], b.inputs["Height"]); l.new(b.outputs["Normal"], p.inputs["Normal"])
    return m

def mat_basic(name, col, rough=0.5, metal=0.0, emit=None, estr=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    p = principled(m)
    p.inputs["Base Color"].default_value = (*col, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    p.inputs["Coat Weight"].default_value = coat
    if emit is not None:
        p.inputs["Emission Color"].default_value = (*emit, 1)
        p.inputs["Emission Strength"].default_value = estr
    return m

def mat_emit(name, col, strength):
    m = bpy.data.materials.new(name)
    n, l = _nodes(m)
    for x in list(n):
        if x.type == "BSDF_PRINCIPLED": n.remove(x)
    out = next(x for x in n if x.type == "OUTPUT_MATERIAL")
    e = n.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (*col, 1); e.inputs["Strength"].default_value = strength
    l.new(e.outputs[0], out.inputs["Surface"])
    return m

M_PAPER = mat_paper()
M_GROUND = mat_paper("PaperGround", rough=0.9, bump=0.03)
M_GOLD = mat_basic("GoldMarkings", (1.0, 0.74, 0.25), rough=0.3, metal=0.85, emit=(1.0, 0.55, 0.08), estr=0.25)
M_STAR = mat_basic("TailStar", (1.0, 0.8, 0.3), rough=0.25, metal=0.5, emit=(1.0, 0.6, 0.12), estr=2.5)
M_EYEW = mat_basic("EyeWhite", (0.95, 0.94, 0.92), rough=0.15, coat=0.6)
M_IRIS = mat_basic("Iris", (0.85, 0.42, 0.06), rough=0.12, emit=(1.0, 0.55, 0.1), estr=0.45, coat=1.0)
M_PUPIL = mat_basic("Pupil", (0.03, 0.015, 0.01), rough=0.1, coat=1.0)
M_HILITE = mat_emit("EyeHighlight", (1, 1, 1), 6.0)
M_MOUTH = mat_basic("Mouth", (0.32, 0.04, 0.06), rough=0.6)
M_TONGUE = mat_basic("Tongue", (0.95, 0.42, 0.45), rough=0.45)
M_BROW = mat_basic("Brow", (0.12, 0.09, 0.07), rough=0.7)
M_SPARK = mat_emit("Sparkle", (1.0, 0.7, 0.2), 16.0)
M_FIREFLY = mat_emit("Firefly", (1.0, 0.9, 0.6), 6.0)

# apple: glossy red with subtle streaks
def mat_apple():
    m = bpy.data.materials.new("Apple")
    n, l = _nodes(m); p = principled(m)
    nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 4; nz.inputs["Detail"].default_value = 6
    tc = n.new("ShaderNodeTexCoord"); l.new(tc.outputs["Object"], nz.inputs["Vector"])
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
M_APPLE = mat_apple()
M_STEM = mat_basic("Stem", (0.25, 0.13, 0.05), rough=0.8)

# ---------------------------------------------------------------- mesh helpers
def to_obj(name, bm, mat, cols=None, var=0.07, parent=None, loc=(0, 0, 0), smooth=False, seed=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    if smooth:
        for poly in me.polygons: poly.use_smooth = True
    me.materials.append(mat)
    if cols is not None:
        r = random.Random(seed if seed is not None else hash(name) & 0xffff)
        at = me.attributes.new("col", "FLOAT_COLOR", "FACE")
        data = []
        for i, poly in enumerate(me.polygons):
            c = cols(i, poly) if callable(cols) else cols
            k = 1 + r.uniform(-var, var)
            data += [min(1, c[0] * k), min(1, c[1] * k), min(1, c[2] * k), 1]
        at.data.foreach_set("color", data)
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    ob.location = loc
    if parent: ob.parent = parent
    return ob

def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None)
    scene.collection.objects.link(e)
    e.location = loc
    if parent: e.parent = parent
    e.empty_display_size = 0.05
    return e

def bm_ico(r=1, sub=1, scale=(1, 1, 1), jitter=0.0, seed=0, offset=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    rr = random.Random(seed)
    for v in bm.verts:
        v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2]))
        if jitter: v.co += Vector((rr.uniform(-1, 1), rr.uniform(-1, 1), rr.uniform(-1, 1))) * jitter
        v.co += Vector(offset)
    return bm

def bm_uvsphere(r=1, seg=32, ring=16, scale=(1, 1, 1), offset=(0, 0, 0), keep=None):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=r)
    if keep:
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not keep(v.co)], context="VERTS")
    for v in bm.verts:
        v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2])) + Vector(offset)
    return bm

def bm_poly(verts, faces):
    bm = bmesh.new()
    vs = [bm.verts.new(v) for v in verts]
    for f in faces:
        try: bm.faces.new([vs[i] for i in f])
        except ValueError: pass
    return bm

def bm_frustum(n, r1, r2, h, z0=0, rot=0.0, scale=(1, 1, 1)):
    """n-sided prism/pyramid along +Z from z0 to z0+h (r2=0 -> pointed)."""
    verts, faces = [], []
    for i in range(n):
        a = rot + 2 * math.pi * i / n
        verts.append((math.cos(a) * r1 * scale[0], math.sin(a) * r1 * scale[1], z0))
    if r2 > 0:
        for i in range(n):
            a = rot + 2 * math.pi * i / n
            verts.append((math.cos(a) * r2 * scale[0], math.sin(a) * r2 * scale[1], z0 + h))
        for i in range(n):
            faces.append((i, (i + 1) % n, n + (i + 1) % n, n + i))
        faces.append(tuple(range(n - 1, -1, -1))); faces.append(tuple(range(n, 2 * n)))
    else:
        verts.append((0, 0, z0 + h))
        for i in range(n): faces.append((i, (i + 1) % n, n))
        faces.append(tuple(range(n - 1, -1, -1)))
    return bm_poly(verts, faces)

def bm_star3d(r_out, r_in, depth, points=5):
    """Origami 3D star: 10 rim verts, pointed centre front and back."""
    verts = []
    for i in range(points * 2):
        a = math.pi / 2 + math.pi * i / points
        r = r_out if i % 2 == 0 else r_in
        verts.append((math.cos(a) * r, 0, math.sin(a) * r))
    verts += [(0, -depth, 0), (0, depth, 0)]
    nr = points * 2
    faces = [(i, (i + 1) % nr, nr) for i in range(nr)] + [((i + 1) % nr, i, nr + 1) for i in range(nr)]
    return bm_poly(verts, faces)

def spiral_obj(name, parent, loc, rot, size=0.06, turns=2.2, mat=None):
    cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "3D"
    cu.bevel_depth = size * 0.09; cu.bevel_resolution = 1
    sp = cu.splines.new("POLY")
    N = 40
    sp.points.add(N - 1)
    for i in range(N):
        t = i / (N - 1); a = t * turns * 2 * math.pi
        r = size * (0.12 + 0.88 * t)
        sp.points[i].co = (math.cos(a) * r, math.sin(a) * r, 0, 1)
    ob = bpy.data.objects.new(name, cu); scene.collection.objects.link(ob)
    cu.materials.append(mat or M_GOLD)
    ob.parent = parent; ob.location = loc; ob.rotation_euler = rot
    return ob

# ---------------------------------------------------------------- palette
MINT = (0.24, 0.70, 0.64)
MINT_L = (0.40, 0.80, 0.72)
MINT_D = (0.17, 0.55, 0.52)
CREAM = (0.96, 0.86, 0.64)
CREAM_W = (1.0, 0.80, 0.45)
def mint_mix(i, p):
    return (MINT, MINT_L, MINT, MINT_D)[i % 4]

# ================================================================= TIKO
tiko = empty("Tiko_Root")
body_ctrl = empty("Tiko_Body", (0, 0, 0), tiko)  # squash/lean pivot at feet
to_obj("Tiko_Torso", bm_ico(0.27, 1, (0.95, 0.85, 1.08), 0.012, 3, (0, 0.03, 0.37)), M_PAPER, mint_mix, parent=body_ctrl)
# chest chevron plates (cream belly)
for k, (z, s) in enumerate([(0.24, 0.17), (0.34, 0.15), (0.44, 0.12)]):
    v = [(-s, 0, z + 0.03), (0, 0, z - s * 0.55), (s, 0, z + 0.03), (0, 0, z + s * 0.5), (0, -0.07, z)]
    f = [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)]
    ob = to_obj(f"Tiko_Belly{k}", bm_poly(v, f), M_PAPER, lambda i, p: (CREAM, CREAM_W)[i % 2], 0.04, body_ctrl)
    ob.location = (0, -0.185 + k * 0.012, 0.04); ob.scale = (0.8, 0.8, 0.8)
# haunches
for sx in (-1, 1):
    to_obj(f"Tiko_Haunch{sx}", bm_ico(0.11, 1, (0.9, 1.1, 1.0), 0.008, 5 + sx, (sx * 0.17, 0.09, 0.2)), M_PAPER, mint_mix, parent=body_ctrl)
spiral_obj("Tiko_HipSpiral_L", body_ctrl, (0.262, 0.05, 0.24), (0, math.radians(90), 0), 0.045)
spiral_obj("Tiko_HipSpiral_R", body_ctrl, (-0.262, 0.05, 0.24), (0, math.radians(-90), 0), 0.045)

# legs (pivot at hip, hanging down)
LEGS = {}
for name, (x, y, top, r) in {"FL": (0.11, -0.12, 0.22, 0.055), "FR": (-0.11, -0.12, 0.22, 0.055),
                              "BL": (0.17, 0.11, 0.2, 0.06), "BR": (-0.17, 0.11, 0.2, 0.06)}.items():
    piv = empty(f"Tiko_Leg{name}", (x, y, top), body_ctrl)
    to_obj(f"Tiko_LegMesh{name}", bm_frustum(5, r * 0.85, r, top - 0.02, -top + 0.02, 0.3), M_PAPER, mint_mix, parent=piv)
    for t in (-1, 0, 1):  # cream claws
        bm = bm_frustum(3, 0.018, 0, 0.05, 0, 0)
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(100), 3, "X"))
        c = to_obj(f"Tiko_Claw{name}{t}", bm, M_PAPER, CREAM, 0.05, piv)
        c.location = (t * 0.03, -0.035, -top + 0.02)
    LEGS[name] = piv

# wings (pivot at shoulder). Fan of pleated panels in local X(out)-Z(up) plane
WINGS = {}
def wing_bm(side):
    ribs = [(8, 0.52), (34, 0.62), (60, 0.58), (86, 0.46)]
    verts = [(0, 0, 0)]
    for k, (ang, L) in enumerate(ribs):
        a = math.radians(ang)
        verts.append((side * math.cos(a) * L, 0.0, math.sin(a) * L))
        if k < len(ribs) - 1:
            a2 = math.radians((ang + ribs[k + 1][0]) / 2)
            Lv = 0.72 * (L + ribs[k + 1][1]) / 2
            verts.append((side * math.cos(a2) * Lv, 0.045, math.sin(a2) * Lv))
    faces = []
    for k in range(len(verts) - 2):
        faces.append((0, k + 1, k + 2))
    return bm_poly(verts, faces)
for side, nm in ((1, "L"), (-1, "R")):
    piv = empty(f"Tiko_Wing{nm}", (side * 0.15, 0.12, 0.5), body_ctrl)
    ob = to_obj(f"Tiko_WingMesh{nm}", wing_bm(side), M_PAPER,
                lambda i, p: (MINT_L, CREAM, MINT, CREAM_W, MINT_L, CREAM)[i % 6], 0.05, piv)
    ob.rotation_euler = (0, 0, side * math.radians(-25))  # swept back
    WINGS[nm] = piv
# golden star on Tiko's LEFT wing (+X side)
st = to_obj("Tiko_WingStar", bm_star3d(0.06, 0.026, 0.018), M_GOLD, parent=bpy.data.objects["Tiko_WingMeshL"])
st.location = (0.19, -0.03, 0.17)

# tail chain
TAIL = []
parent, base = body_ctrl, (0, 0.24, 0.24)
seg = [(0.14, 0.075), (0.13, 0.062), (0.12, 0.052), (0.11, 0.043), (0.10, 0.035), (0.09, 0.028)]
for k, (L, r) in enumerate(seg):
    piv = empty(f"Tiko_Tail{k}", base if k == 0 else (0, 0, seg[k - 1][0]), parent)
    bm = bm_frustum(4, r, r * 0.8, L, 0, math.pi / 4)
    to_obj(f"Tiko_TailMesh{k}", bm, M_PAPER, lambda i, p: (MINT, CREAM, MINT_L, MINT_D)[i % 4], 0.05, piv)
    TAIL.append(piv); parent = piv
star = to_obj("Tiko_TailStar", bm_star3d(0.1, 0.045, 0.035), M_STAR, parent=TAIL[-1])
star.location = (0, 0, seg[-1][0] + 0.08)
TAIL_REST = [(-55, 0), (28, 0), (24, 0), (22, 0), (18, 0), (14, 0)]  # x-rotations: point back, curl up

# head
head = empty("Tiko_Head", (0, -0.02, 0.58), body_ctrl)
head.scale = (1.17, 1.17, 1.17)
to_obj("Tiko_HeadMesh", bm_ico(0.33, 1, (1.12, 0.9, 0.93), 0.01, 11, (0, 0, 0.25)), M_PAPER, mint_mix, parent=head)
to_obj("Tiko_Snout", bm_ico(0.13, 1, (1.25, 0.95, 0.7), 0.004, 12, (0, -0.21, 0.13)), M_PAPER, lambda i, p: (MINT_L, MINT)[i % 2], parent=head)
spiral_obj("Tiko_CheekSpiral_L", head, (0.33, -0.12, 0.17), (math.radians(90), 0, math.radians(70)), 0.04)
spiral_obj("Tiko_CheekSpiral_R", head, (-0.33, -0.12, 0.17), (math.radians(90), 0, math.radians(-70)), 0.04)
# ears / horns (asymmetrical)
def flap(name, base_c, tip, w, mat_cols, par):
    bx, by, bz = base_c
    v = [(bx - w * 0.6, by - w, bz), (bx + w * 0.6, by - w * 0.2, bz - w * 0.3), (bx, by + w, bz + w * 0.2),
         tip, ((bx + tip[0]) / 2 * 1.0, (by + tip[1]) / 2 - w * 0.55, (bz + tip[2]) / 2 + 0.02)]
    f = [(0, 1, 4), (1, 3, 4), (4, 3, 0), (1, 2, 3), (2, 0, 3)]
    return to_obj(name, bm_poly(v, f), M_PAPER, mat_cols, 0.05, par)
flap("Tiko_EarBig", (-0.24, 0.02, 0.48), (-0.66, 0.06, 0.72), 0.1, lambda i, p: (CREAM, CREAM_W, MINT_L, CREAM, MINT)[i % 5], head)
flap("Tiko_EarSmall", (0.25, 0.02, 0.46), (0.52, 0.08, 0.66), 0.08, lambda i, p: (CREAM, CREAM_W, MINT_L, CREAM, MINT)[i % 5], head)
spiral_obj("Tiko_EarSun", bpy.data.objects["Tiko_EarBig"], (-0.42, -0.06, 0.6), (math.radians(80), 0, math.radians(-20)), 0.035, 1.3)
h1 = bm_frustum(4, 0.05, 0.035, 0.16, 0, 0.4)
horn = to_obj("Tiko_Horn", h1, M_PAPER, lambda i, p: (MINT_L, CREAM)[i % 2], 0.05, head)
horn.location = (0.08, 0.05, 0.5); horn.rotation_euler = (math.radians(-10), math.radians(15), 0)
h2 = bm_frustum(4, 0.035, 0, 0.17, 0, 0.4)
horn2 = to_obj("Tiko_HornTip", h2, M_PAPER, CREAM_W, 0.05, horn)
horn2.location = (0, 0, 0.15); horn2.rotation_euler = (0, math.radians(70), 0)

# eyes
EYES, LIDS, PUPILS = {}, {}, {}
for side, nm in ((1, "L"), (-1, "R")):
    eg = empty(f"Tiko_Eye{nm}", (side * 0.15, -0.2, 0.27), head)
    eg.rotation_euler = (0, 0, side * math.radians(7))
    to_obj(f"Tiko_EyeWhite{nm}", bm_uvsphere(0.108, 32, 16), M_EYEW, parent=eg, smooth=True)
    look = empty(f"Tiko_Look{nm}", (0, 0, 0), eg)
    to_obj(f"Tiko_Iris{nm}", bm_uvsphere(0.088, 32, 16, (1, 0.3, 1), (0, -0.084, 0)), M_IRIS, parent=look, smooth=True)
    to_obj(f"Tiko_Pupil{nm}", bm_uvsphere(0.052, 24, 12, (1, 0.3, 1.08), (0, -0.1, 0)), M_PUPIL, parent=look, smooth=True)
    to_obj(f"Tiko_Hilite{nm}", bm_uvsphere(0.021, 12, 8, (1, 0.5, 1), (side * -0.022, -0.115, 0.032)), M_HILITE, parent=look, smooth=True)
    to_obj(f"Tiko_Hilite2{nm}", bm_uvsphere(0.01, 10, 6, (1, 0.5, 1), (side * 0.025, -0.113, -0.03)), M_HILITE, parent=look, smooth=True)
    lid = to_obj(f"Tiko_Lid{nm}", bm_uvsphere(0.116, 32, 16, keep=lambda c: c.y <= 0.001), M_PAPER, MINT_L, 0.0, eg, smooth=True)
    brow = to_obj(f"Tiko_Brow{nm}", bm_uvsphere(0.05, 16, 8, (1.0, 0.25, 0.22)), M_BROW, parent=head, smooth=True)
    EYES[nm], LIDS[nm], PUPILS[nm] = eg, lid, look
    brow.location = (side * 0.15, -0.27, 0.42)
BROWS = {"L": bpy.data.objects["Tiko_BrowL"], "R": bpy.data.objects["Tiko_BrowR"]}
# mouth (D-shaped open smile) + tongue
mouth = empty("Tiko_Mouth", (0, -0.305, 0.085), head)
to_obj("Tiko_MouthMesh", bm_uvsphere(0.085, 32, 16, (1.25, 0.55, 1.0), keep=lambda c: c.z <= 0.001), M_MOUTH, parent=mouth, smooth=True)
tg = to_obj("Tiko_Tongue", bm_uvsphere(0.045, 20, 10, (1.2, 0.6, 0.6)), M_TONGUE, parent=mouth, smooth=True)
tg.location = (0, -0.006, -0.045)

# ================================================================= APPLE
R_APPLE = 0.8
apple = empty("Apple_Root", (0, 0, R_APPLE))
def apple_bm():
    bm = bm_uvsphere(R_APPLE, 48, 28)
    for v in bm.verts:
        d = v.co.length; z = v.co.z / d
        bulge = 1 + 0.06 * (1 - z * z) + 0.03 * z
        dimple = -0.22 * math.exp(-((1 - abs(z)) / 0.05)) if abs(z) > 0.85 else 0
        v.co = v.co * (bulge) + Vector((0, 0, dimple * R_APPLE * (1 if z > 0 else -1)))
    return bm
to_obj("Apple_Body", apple_bm(), M_APPLE, parent=apple, smooth=True)
stem = to_obj("Apple_Stem", bm_frustum(6, 0.035, 0.022, 0.32, R_APPLE * 0.7), M_STEM, parent=apple, smooth=True)
stem.rotation_euler = (0, math.radians(10), 0)
leaf = to_obj("Apple_Leaf", bm_poly([(0, 0, 0), (0.16, -0.07, 0.03), (0.38, 0, 0.06), (0.16, 0.07, 0.03), (0.17, 0, 0.0)],
              [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)]), M_PAPER, lambda i, p: ((0.32, 0.66, 0.22), (0.42, 0.76, 0.28))[i % 2], 0.04, apple)
leaf.location = (0.03, 0, R_APPLE * 0.98); leaf.rotation_euler = (math.radians(15), math.radians(-25), math.radians(30))

# ================================================================= WORLD / SET
def height(x, y):
    """Flat action lane around y=0, rolling paper hills behind."""
    lane = 0.0
    if y > 1.6: lane = (y - 1.6) ** 1.35 * 0.22
    if y < -2.8: lane = (-2.8 - y) * 0.15
    w = 0.12 * math.sin(x * 0.7 + y * 0.4) + 0.08 * math.sin(x * 1.7 - y * 1.1)
    return lane + w * min(1, max(0, (abs(y) - 1.4) / 1.5))

def ground():
    bm = bmesh.new()
    nx, ny = 110, 60
    x0, x1, y0, y1 = -14, 30, -9, 34
    vs = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            x = x0 + (x1 - x0) * i / nx + (rng.uniform(-0.12, 0.12) if 0 < i < nx else 0)
            y = y0 + (y1 - y0) * (j / ny) ** 1.25
            row.append(bm.verts.new((x, y, height(x, y))))
        vs.append(row)
    for j in range(ny):
        for i in range(nx):
            a, b, c, d = vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]
            if (i + j) % 2: bm.faces.new((a, b, c)); bm.faces.new((a, c, d))
            else: bm.faces.new((a, b, d)); bm.faces.new((b, c, d))
    greens = [(0.40, 0.72, 0.28), (0.50, 0.78, 0.30), (0.36, 0.68, 0.32), (0.58, 0.80, 0.34), (0.46, 0.74, 0.40)]
    gr = random.Random(3)
    return to_obj("Set_Ground", bm, M_GROUND, lambda i, p: gr.choice(greens), 0.05)
ground()

def place(proto, name, loc, scl, rotz):
    ob = bpy.data.objects.new(name, proto.data)
    scene.collection.objects.link(ob)
    ob.location = loc; ob.scale = (scl, scl, scl); ob.rotation_euler = (0, 0, rotz)
    return ob

def protos():
    P = {}
    # cone trees (stacked origami pyramids)
    for ci, col in enumerate([(0.30, 0.62, 0.55), (0.42, 0.72, 0.58), (0.36, 0.58, 0.62), (0.55, 0.75, 0.55)]):
        bm = bm_frustum(6, 0.12, 0.1, 0.6, 0, 0)
        for k, (z, r) in enumerate([(0.5, 0.9), (1.2, 0.72), (1.85, 0.52)]):
            t = bm_frustum(7, r, 0, 1.2 - k * 0.15, z, k * 0.4)
            me = bpy.data.meshes.new("tmp"); t.to_mesh(me); t.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
        ob = to_obj(f"Proto_Tree{ci}", bm, M_PAPER, lambda i, p, c=col: c if i > 7 else (0.55, 0.38, 0.3), 0.08)
        P.setdefault("tree", []).append(ob)
    # blossom trees
    for ci, col in enumerate([(1.0, 0.68, 0.78), (0.95, 0.75, 0.9), (1.0, 0.8, 0.62), (0.8, 0.7, 0.98)]):
        bm = bm_frustum(5, 0.1, 0.07, 1.3, 0, 0)
        for k, (o, r) in enumerate([((0, 0, 1.8), 0.75), ((0.45, 0.1, 1.45), 0.5), ((-0.4, -0.1, 1.5), 0.52)]):
            t = bm_ico(r, 1, (1, 1, 0.9), 0.04, ci * 10 + k, o)
            me = bpy.data.meshes.new("tmp"); t.to_mesh(me); t.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
        ob = to_obj(f"Proto_Blossom{ci}", bm, M_PAPER, lambda i, p, c=col: c if i > 6 else (0.55, 0.38, 0.3), 0.08)
        P.setdefault("blossom", []).append(ob)
    # bushes
    for ci, col in enumerate([(0.38, 0.68, 0.45), (0.5, 0.76, 0.5), (0.42, 0.7, 0.6)]):
        P.setdefault("bush", []).append(to_obj(f"Proto_Bush{ci}", bm_ico(0.5, 1, (1.3, 1, 0.75), 0.05, ci, (0, 0, 0.25)), M_PAPER, col, 0.1))
    # paper flowers
    for ci, col in enumerate([(1.0, 0.55, 0.72), (0.8, 0.6, 1.0), (1.0, 0.85, 0.4), (1.0, 0.75, 0.65), (0.98, 0.95, 0.9)]):
        bm = bm_frustum(4, 0.012, 0.01, 0.32, 0, 0)
        for k in range(5):
            a = 2 * math.pi * k / 5
            c, s = math.cos(a), math.sin(a)
            pv = [(0, 0, 0.32), (c * 0.13 - s * 0.05, s * 0.13 + c * 0.05, 0.36), (c * 0.2, s * 0.2, 0.34),
                  (c * 0.13 + s * 0.05, s * 0.13 - c * 0.05, 0.36), (c * 0.1, s * 0.1, 0.31)]
            t = bm_poly(pv, [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)])
            me = bpy.data.meshes.new("tmp"); t.to_mesh(me); t.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
        t = bm_ico(0.045, 1, (1, 1, 0.6), 0, 1, (0, 0, 0.36))
        me = bpy.data.meshes.new("tmp"); t.to_mesh(me); t.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
        def fc(i, p, c=col):
            if i < 6: return (0.35, 0.62, 0.3)
            if i >= 26: return (1.0, 0.8, 0.25)
            return c
        P.setdefault("flower", []).append(to_obj(f"Proto_Flower{ci}", bm, M_PAPER, fc, 0.06))
    # grass tuft
    for ci, col in enumerate([(0.45, 0.75, 0.38), (0.58, 0.82, 0.42)]):
        v, f = [], []
        for k in range(4):
            a = k * 1.7; c, s = math.cos(a), math.sin(a)
            b = len(v)
            v += [(c * 0.03 - s * 0.02, s * 0.03 + c * 0.02, 0), (c * 0.03 + s * 0.02, s * 0.03 - c * 0.02, 0), (c * 0.1, s * 0.1, 0.16 + 0.04 * k)]
            f.append((b, b + 1, b + 2))
        P.setdefault("grass", []).append(to_obj(f"Proto_Grass{ci}", bm_poly(v, f), M_PAPER, col, 0.1))
    # mushroom
    bm = bm_frustum(6, 0.05, 0.04, 0.16, 0, 0)
    t = bm_frustum(8, 0.16, 0, 0.12, 0.14, 0)
    me = bpy.data.meshes.new("tmp"); t.to_mesh(me); t.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
    P["mush"] = [to_obj("Proto_Mushroom", bm, M_PAPER, lambda i, p: (0.98, 0.92, 0.85) if i < 8 else (1.0, 0.5, 0.45), 0.05)]
    P["rock"] = [to_obj("Proto_Rock", bm_ico(0.3, 1, (1.3, 1, 0.6), 0.06, 9, (0, 0, 0.08)), M_PAPER, (0.72, 0.68, 0.78), 0.08)]
    for lst in P.values():
        for o in lst: o.hide_render = True; o.hide_viewport = True; o.location = (0, -50, -50)
    return P
P = protos()

n = 0
def put(kind, x, y, s, z_off=0.0):
    global n; n += 1
    return place(rng.choice(P[kind]), f"Set_{kind}_{n:04d}", (x, y, height(x, y) + z_off), s, rng.uniform(0, 6.28))

for _ in range(120):  # back forest
    x = rng.uniform(-12, 28); y = rng.uniform(6, 30)
    k = rng.choice(["tree", "tree", "blossom"])
    put(k, x, y, rng.uniform(1.0, 2.2) * (0.75 if k == "blossom" else 1) * (1 + (y - 4) / 30))
for _ in range(40):
    x = rng.uniform(-12, 28); y = rng.uniform(2.2, 5)
    put("bush", x, y, rng.uniform(0.6, 1.2))
for _ in range(420):  # flowers beside the lane
    x = rng.uniform(-8, 22)
    y = rng.choice([rng.uniform(1.15, 3.5), rng.uniform(1.15, 3.5), rng.uniform(-2.0, -1.3)])
    put("flower", x, y, rng.uniform(0.7, 1.4))
for _ in range(900):
    x = rng.uniform(-8, 22); y = rng.uniform(-3.5, 4)
    if abs(y) < 1.0 and rng.random() < 0.75: continue
    put("grass", x, y, rng.uniform(0.8, 1.5))
for x, y in [(-1.8, 1.6), (3.1, -1.5), (7.5, 1.4), (12.9, -1.4), (16, 1.5)]:
    put("mush", x, y, rng.uniform(1.4, 2.0))
for x, y in [(1.5, 2.0), (9.2, -1.8), (15.5, 2.2), (-3, -1.7)]:
    put("rock", x, y, rng.uniform(0.8, 1.4))
BED_X = 11.45
for _ in range(110):  # soft flower bed where the apple stops
    a = rng.uniform(0, 6.28); r = 1.45 * math.sqrt(rng.random())
    x, y = BED_X + math.cos(a) * r * 1.2, math.sin(a) * r * 0.9
    put("flower", x, y, rng.uniform(1.4, 2.1))

# fireflies / floating motes
FIREFLIES = []
for k in range(55):
    me = bm_ico(0.012, 1)
    ob = to_obj(f"FX_Mote{k:02d}", me, M_FIREFLY)
    FIREFLIES.append((ob, (rng.uniform(-3, 17), rng.uniform(-0.8, 3.5), rng.uniform(0.3, 3.4)), rng.uniform(0, 6.28), rng.uniform(0.5, 1.3)))
# sparkle pool
SPARKS = []
for k in range(90):
    ob = to_obj(f"FX_Sparkle{k:02d}", bm_star3d(0.045, 0.014, 0.012, 4), M_SPARK)
    ob.scale = (0, 0, 0)
    SPARKS.append(ob)

# ---------------------------------------------------------------- world + lights
world = bpy.data.worlds.new("Sky"); scene.world = world
wn, wl = _nodes(world)
bg = next(x for x in wn if x.type == "BACKGROUND")
tc = wn.new("ShaderNodeTexCoord"); sep = wn.new("ShaderNodeSeparateXYZ")
ramp = wn.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (1.0, 0.78, 0.62, 1)
ramp.color_ramp.elements[1].position = 0.55; ramp.color_ramp.elements[1].color = (0.62, 0.74, 1.0, 1)
el = ramp.color_ramp.elements.new(0.18); el.color = (1.0, 0.86, 0.8, 1)
wl.new(tc.outputs["Generated"], sep.inputs[0]); wl.new(sep.outputs["Z"], ramp.inputs["Fac"])
wl.new(ramp.outputs["Color"], bg.inputs["Color"]); bg.inputs["Strength"].default_value = 0.7
# Generated coords for world are a direction; remap z (-1..1) -> 0..1
mr = wn.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = -0.05; mr.inputs["From Max"].default_value = 0.6
wl.new(sep.outputs["Z"], mr.inputs["Value"]); wl.new(mr.outputs["Result"], ramp.inputs["Fac"])

def light(name, kind, energy, color, rot, size=None):
    ld = bpy.data.lights.new(name, kind); ld.energy = energy; ld.color = color
    if kind == "SUN": ld.angle = math.radians(size or 3)
    ob = bpy.data.objects.new(name, ld); scene.collection.objects.link(ob)
    ob.rotation_euler = [math.radians(a) for a in rot]
    return ob
light("Light_KeySun", "SUN", 4.6, (1.0, 0.86, 0.68), (58, 0, -38), 4)
light("Light_RimSun", "SUN", 4.0, (1.0, 0.66, 0.38), (72, 0, 150), 6)

glow_ld = bpy.data.lights.new("Tiko_GlowLight", "POINT"); glow_ld.color = (1.0, 0.75, 0.35); glow_ld.shadow_soft_size = 0.3
glow_light = bpy.data.objects.new("Tiko_GlowLight", glow_ld); scene.collection.objects.link(glow_light)
glow_light.parent = tiko; glow_light.location = (0, -0.6, 0.9)

# ---------------------------------------------------------------- camera
camd = bpy.data.cameras.new("Cam"); camd.lens = 32; camd.sensor_fit = "VERTICAL"; camd.sensor_height = 36
camd.dof.use_dof = True; camd.dof.aperture_fstop = 1.2
cam = bpy.data.objects.new("Camera", camd); scene.collection.objects.link(cam); scene.camera = cam
cam_target = empty("Camera_Target")
tr = cam.constraints.new("TRACK_TO"); tr.target = cam_target; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"
camd.dof.focus_object = cam_target

# ================================================================= ANIMATION
def P_(keys):
    xs = np.array([k[0] for k in keys], float); ys = np.array([k[1] for k in keys], float)
    f = PchipInterpolator(xs, ys, extrapolate=False)
    return lambda t: float(f(min(max(t, xs[0]), xs[-1])))
def smooth(a, b, t):
    t = min(1, max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t)
def pulse(t, c, w):
    return math.exp(-((t - c) / w) ** 2)

apple_x = P_([(0, -1.95), (8, -1.3), (20, 0.0), (36, 1.15), (60, 2.0), (90, 2.8), (150, 5.2), (210, 8.6), (240, 9.75), (270, 10.8),
              (300, 11.9), (330, 13.0), (360, 13.85), (375, 14.2), (385, 14.3), (395, 14.25), (420, 13.65),
              (450, 12.75), (480, 12.0), (505, 11.6), (520, 11.45), (600, 11.45)])
# Tiko root path
tx_k = P_([(0, 0), (8, 0), (36, -0.05), (60, -0.05), (75, 0.15), (90, 0.55), (120, 1.95), (150, 3.6), (180, 5.25),
           (205, 6.7), (212, 6.95), (230, 7.7), (255, 8.9), (285, 10.4), (315, 12.1), (340, 13.2), (360, 13.9), (375, 14.2)])
tz_k = P_([(212, 0), (230, 0.95), (255, 1.75), (285, 2.35), (315, 2.6), (340, 2.55), (360, 2.15), (375, 1.62)])
yaw_k = P_([(0, -10), (8, -15), (36, 20), (46, 0), (55, 40), (75, 70), (90, 62), (210, 62), (230, 70), (360, 75),
            (375, 85), (400, 90), (420, 90), (470, 90 + 720), (490, 90 + 700), (505, 720 + 20), (525, 720), (600, 720)])

with open(LIPSYNC) as fh:
    LS = json.load(fh)   # {"env": [per-frame 0..1], "lines": [[start,end,name],...]}
ENV = LS["env"]
def speaking(f):
    return ENV[f] if 0 <= f < len(ENV) else 0

def blink(f):
    v = 0
    for b in (70, 168, 300, 405, 512, 596):
        v = max(v, 1 - abs(f - b) / 3.0)
    return max(0, v)

def tiko_state(f):
    """Return dict of pose params for frame f."""
    s = dict(x=0, y=0, z=0, yaw=0, pitch=0, roll=0, sq=0, head_yaw=0, head_pitch=0, head_roll=0,
             wing_flap=0, wing_spread=0, wing_scale=1.0, legs=[0, 0, 0, 0], tail_sway=0, tail_lift=0,
             lid=-135, mouth_open=0.12, mouth_w=1.0, brow=0, look=(0, 0), glow=0.0)
    s["x"] = tx_k(min(f, 375)); s["yaw"] = yaw_k(f)
    # ---- ACT 1 : hook (0-90)
    if f < 90:
        if f < 36:  # surprise jump, apple rolls underneath
            t = (f - 4) / 32.0
            s["z"] = max(0, 4 * 2.0 * t * (1 - t)) if f >= 4 else 0
            s["sq"] = -0.16 * pulse(f, 1, 2.5) + 0.12 * pulse(f, 7, 3)
            s["wing_flap"] = math.sin(f * 1.4) * 40 * smooth(6, 10, f)
            s["wing_spread"] = 25 * smooth(6, 12, f)
            s["legs"] = [25, 25, -25, -25] if f > 8 else [0] * 4
            s["head_yaw"] = -35 if f < 12 else -35 + 70 * smooth(12, 30, f)
            s["head_pitch"] = -10 * smooth(14, 22, f)
            s["lid"] = -140; s["brow"] = 0.03
            s["tail_lift"] = 25 * smooth(8, 16, f)
            s["look"] = (-0.012, 0.0) if f < 16 else (0.008, -0.01)
        else:
            s["sq"] = -0.16 * pulse(f, 38, 2.5) + 0.06 * pulse(f, 43, 3)
            s["head_yaw"] = 35 - 35 * smooth(46, 60, f) + 12 * math.sin(f * 0.9) * pulse(f, 50, 6)
            s["head_roll"] = 8 * math.sin(f * 0.8) * pulse(f, 52, 7)
            s["lid"] = -138; s["brow"] = 0.02 * (1 - smooth(55, 75, f))
            s["look"] = (0.012, 0)
            if f > 75: s["legs"] = [20 * math.sin(f * 0.6), -20 * math.sin(f * 0.6), -20 * math.sin(f * 0.6), 20 * math.sin(f * 0.6)]
    # ---- ACT 2 : chase (90-212)
    elif f < 212:
        ph = f * 0.62
        s["z"] = abs(math.sin(ph)) * 0.07
        s["pitch"] = 10
        s["legs"] = [40 * math.sin(ph), -40 * math.sin(ph), -40 * math.sin(ph), 40 * math.sin(ph)]
        s["wing_flap"] = 45 * math.sin(f * 1.25); s["wing_spread"] = 20
        s["tail_sway"] = 18 * math.sin(ph * 0.5)
        s["head_pitch"] = -6 + 4 * math.sin(ph * 2)
        s["lid"] = -135; s["look"] = (0.012, 0)
        s["sq"] = 0.04 * math.sin(ph * 2)
        if f > 202:  # crouch before the leap
            s["sq"] = -0.15 * smooth(202, 211, f); s["z"] = 0
    # ---- ACT 3 : magic flight (212-375)
    elif f < 375:
        s["z"] = tz_k(f)
        s["glow"] = smooth(215, 240, f) * (1 - 0.5 * smooth(365, 400, f))
        s["wing_scale"] = 1 + 0.55 * smooth(218, 242, f)
        s["wing_spread"] = 20 + 45 * smooth(218, 242, f)
        amp = 30 + 25 * smooth(225, 250, f)
        s["wing_flap"] = amp * math.sin(f * (0.9 if f > 250 else 1.3))
        wob = 1 - smooth(240, 275, f)
        s["roll"] = 18 * math.sin(f * 0.5) * wob
        s["pitch"] = 18 * smooth(250, 280, f) * (1 - smooth(355, 372, f)) - 10 * pulse(f, 214, 4)
        s["z"] += 0.05 * math.sin(f * 0.9) * smooth(250, 270, f)
        s["sq"] = 0.12 * pulse(f, 214, 3)
        s["legs"] = [-30, -30, 35, 35]
        s["tail_lift"] = 10 + 6 * math.sin(f * 0.4)
        s["lid"] = -140 if f < 270 else -134
        s["brow"] = 0.025 * pulse(f, 235, 12)
        s["head_pitch"] = -8 + 12 * smooth(330, 360, f)
        s["look"] = (0.0, -0.01) if f < 300 else (0, 0.012)
        if f > 362: s["legs"] = [15, 15, -15, -15]
    # ---- ACT 4 : funny ride (375-510)
    elif f < 510:
        s["x"] = apple_x(f); s["z"] = 2 * R_APPLE + 0.01
        s["glow"] = 0.5 * (1 - smooth(375, 410, f))
        s["sq"] = -0.22 * pulse(f, 377, 2.5) + 0.08 * pulse(f, 383, 3)
        if f < 395:
            s["wing_flap"] = 20 * math.sin(f * 0.8) * (1 - smooth(380, 394, f)); s["wing_spread"] = 30
        elif f < 470:  # running on the rolling apple, then comic spin
            ph = f * 0.9
            s["legs"] = [50 * math.sin(ph), -50 * math.sin(ph), -50 * math.sin(ph), 50 * math.sin(ph)]
            s["z"] += abs(math.sin(ph)) * 0.05
            s["wing_flap"] = 60 * math.sin(f * 1.6); s["wing_spread"] = 50
            s["roll"] = 15 * math.sin(f * 0.35)
            s["lid"] = -140; s["brow"] = 0.03
            s["tail_sway"] = 35 * math.sin(f * 0.5)
        else:
            s["roll"] = 12 * math.sin(f * 0.6) * (1 - smooth(470, 500, f))
            s["head_roll"] = 14 * math.sin(f * 0.45) * (1 - smooth(470, 505, f))
            s["wing_spread"] = 30 * (1 - smooth(480, 505, f))
            s["sq"] = -0.12 * pulse(f, 498, 4)
            s["lid"] = -110 - 25 * smooth(490, 505, f)
            s["look"] = (0.01 * math.sin(f * 0.8), 0.01 * math.cos(f * 0.8)) if f < 490 else (0, 0)
    # ---- ACT 5 : ending (510-600)
    else:
        s["x"] = apple_x(f); s["z"] = 2 * R_APPLE + 0.01
        s["legs"] = [-20, -20, 30, 30]
        s["tail_sway"] = 12 * math.sin(f * 0.15)
        s["lid"] = -135
        if 520 <= f < 556:  # giggle: eyes squeezed shut, bouncing
            g = smooth(520, 524, f) * (1 - smooth(551, 556, f))
            s["lid"] = -135 + 125 * g
            s["z"] += 0.03 * abs(math.sin(f * 1.1)) * g
            s["head_roll"] = 6 * math.sin(f * 0.55) * g
            s["head_pitch"] = 8 * g
            s["mouth_open"] = 0.5 * g
        if f >= 556:  # "Again!" + wing wave
            s["lid"] = -142; s["brow"] = 0.035 * smooth(556, 562, f)
            s["glow"] = 0.6 * pulse(f, 566, 10)
            s["wing_spread"] = 40 * smooth(556, 565, f)
            s["wing_flap"] = 10
            s["head_pitch"] = -5
            s["sq"] = 0.1 * pulse(f, 562, 4)
        s["head_yaw"] = 0
    # universal: speech + blink
    sp = speaking(f)
    s["mouth_open"] = max(s["mouth_open"], sp)
    b = blink(f)
    if b > 0 and s["lid"] < -90: s["lid"] = s["lid"] + (0 - s["lid"]) * b
    if f < 36 or 556 <= f: s["mouth_w"] = 0.8 if f < 36 else 1.05
    return s

def K(ob, path):
    ob.keyframe_insert(path, frame=FR)

legs_order = ["FL", "FR", "BL", "BR"]
glow_in = principled(M_GOLD).inputs["Emission Strength"]
star_in = principled(M_STAR).inputs["Emission Strength"]
iris_in = principled(M_IRIS).inputs["Emission Strength"]
mouth_ob = bpy.data.objects["Tiko_Mouth"]

# sparkles: list of (birth, pos, vel, life, size)
particles = []
for f in range(222, 380, 2):
    pass  # filled lazily in loop using tiko pos
bursts = []

# camera keys
def _lerp(a, b, u): return tuple(x + (y - x) * u for x, y in zip(a, b))
def cam_state(f, s, ax):
    z = s["z"]
    def act1():   # hook: follow the surprise jump vertically
        return (0.05, -3.4, 1.0 + 0.55 * z), (0.0, 0, 1.05 + 0.6 * z)
    def chase():  # keep both Tiko and the apple in frame
        cx = 0.5 * (s["x"] + ax)
        return (cx, -4.7, 0.78 + 0.03 * math.sin(f * 0.62)), (cx, 0, 0.72)
    def flight(): # stay with Tiko in the air, apple below
        cx = s["x"] + 0.3
        return (cx, -3.7, 0.6 + z * 0.85), (cx, 0, z + 0.4)
    def ride():   # apple + Tiko on top
        return (ax, -4.5, 1.9), (ax, 0, 2.0)
    def end():    # push-in to Tiko's face
        return (ax, -2.55, 2.45), (ax, 0, 2.32)
    if f < 40: return act1()
    if f < 100:
        u = smooth(40, 100, f); c1, t1 = act1(); c2, t2 = chase()
        return _lerp(c1, c2, u), _lerp(t1, t2, u)
    if f < 205: return chase()
    if f < 350:
        u = smooth(205, 240, f); c1, t1 = chase(); c2, t2 = flight()
        return _lerp(c1, c2, u), _lerp(t1, t2, u)
    if f < 512:
        u = smooth(350, 390, f); c1, t1 = flight(); c2, t2 = ride()
        return _lerp(c1, c2, u), _lerp(t1, t2, u)
    u = smooth(512, 560, f); c1, t1 = ride(); c2, t2 = end()
    return _lerp(c1, c2, u), _lerp(t1, t2, u)

def lens(f):
    return 32 + 3 * smooth(512, 560, f)

prev_cam = None
for FR in range(NF):
    f = FR
    s = tiko_state(f)
    ax = apple_x(f)
    # --- apple
    apple.location = (ax, 0, R_APPLE + (0.025 * abs(math.sin(ax * 2.2)) if f < 375 else 0))
    rock = 0.12 * math.sin((f - 520) * 0.35) * math.exp(-(f - 520) / 25) if f > 520 else 0
    apple.rotation_euler = (0, (ax + 1.5) / R_APPLE + rock, 0)
    K(apple, "location"); K(apple, "rotation_euler")
    # --- tiko root
    tiko.location = (s["x"], s["y"], s["z"])
    tiko.rotation_euler = (0, 0, math.radians(s["yaw"]))
    K(tiko, "location"); K(tiko, "rotation_euler")
    sq = s["sq"]
    body_ctrl.scale = (1 + sq * 0.6, 1 + sq * 0.6, 1 - sq)
    body_ctrl.rotation_euler = (math.radians(-s["pitch"]), math.radians(s["roll"]), 0)
    K(body_ctrl, "scale"); K(body_ctrl, "rotation_euler")
    head.rotation_euler = (math.radians(s["head_pitch"]), math.radians(s["head_roll"]), math.radians(s["head_yaw"]))
    K(head, "rotation_euler")
    for nm, piv in WINGS.items():
        side = 1 if nm == "L" else -1
        flap_a = s["wing_flap"]
        if nm == "R" and f >= 572:  # playful wave goodbye
            flap_a = 25 + 35 * math.sin((f - 572) * 0.55)
        piv.rotation_euler = (0, math.radians(-side * (flap_a + s["wing_spread"] - 10)), math.radians(side * 10))
        sc = s["wing_scale"]; piv.scale = (sc, sc, sc)
        K(piv, "rotation_euler"); K(piv, "scale")
    for nm, a in zip(legs_order, s["legs"]):
        LEGS[nm].rotation_euler = (math.radians(a), 0, 0); K(LEGS[nm], "rotation_euler")
    for k, piv in enumerate(TAIL):
        rx, _ = TAIL_REST[k]
        sway = s["tail_sway"] * (k + 1) / 6 + 6 * math.sin(f * 0.18 - k * 0.6)
        lift = s["tail_lift"] / 6 if k else 0
        piv.rotation_euler = (math.radians(rx - lift), math.radians(sway / 2), 0)
        K(piv, "rotation_euler")
    for nm in ("L", "R"):
        LIDS[nm].rotation_euler = (math.radians(s["lid"]), 0, 0); K(LIDS[nm], "rotation_euler")
        lx, lz = s["look"]
        PUPILS[nm].location = (lx * (1 if nm == "L" else 1), 0, lz); K(PUPILS[nm], "location")
        side = 1 if nm == "L" else -1
        BROWS[nm].location = (side * 0.15, -0.27, 0.42 + s["brow"])
        BROWS[nm].rotation_euler = (0, math.radians(side * (12 - 300 * s["brow"])), 0)
        K(BROWS[nm], "location"); K(BROWS[nm], "rotation_euler")
    mo = s["mouth_open"]
    mouth_ob.scale = (s["mouth_w"] * (1 - 0.15 * mo), 1, 0.12 + 0.95 * mo)
    K(mouth_ob, "scale")
    # --- glow
    g = s["glow"]
    glow_in.default_value = 0.25 + 16 * g; glow_in.keyframe_insert("default_value", frame=f)
    star_in.default_value = 2.5 + 10 * g; star_in.keyframe_insert("default_value", frame=f)
    iris_in.default_value = 0.45 + 1.2 * g; iris_in.keyframe_insert("default_value", frame=f)
    glow_ld.energy = 2 + 35 * g; glow_ld.keyframe_insert("energy", frame=f)
    # --- sparkle emission
    if 216 <= f <= 372 and f % 2 == 0:
        for _ in range(2):
            particles.append((f, Vector((s["x"] + rng.uniform(-0.15, 0.15), rng.uniform(-0.2, 0.2), s["z"] + 0.45 + rng.uniform(-0.15, 0.15))),
                              Vector((rng.uniform(-0.03, 0), rng.uniform(-0.01, 0.01), rng.uniform(-0.02, 0.005))), rng.randint(18, 30), rng.uniform(0.7, 1.4)))
    if f in (216, 562):
        cz = s["z"] + 0.5
        for k in range(16):
            a = 2 * math.pi * k / 16
            particles.append((f, Vector((s["x"], -0.1, cz)), Vector((math.cos(a) * 0.05, -0.01, math.sin(a) * 0.05)), 22, 1.2))
    alive = [p for p in particles if p[0] <= f < p[0] + p[3]]
    for k, ob in enumerate(SPARKS):
        if k < len(alive):
            b, p0, v, life, sz = alive[k]
            age = f - b; u = age / life
            ob.location = p0 + v * age
            sc = sz * math.sin(math.pi * min(1, u * 1.3 + 0.05)) * (0.75 + 0.25 * math.sin(age * 1.7))
            ob.scale = (sc, sc, sc)
            ob.rotation_euler = (0, age * 0.25 + k, 0)
        else:
            ob.scale = (0, 0, 0)
        K(ob, "location"); K(ob, "scale"); K(ob, "rotation_euler")
    # --- floating motes
    if f % 2 == 0 or f == NF - 1:
        for ob, (x0, y0, z0), ph, spd in FIREFLIES:
            ob.location = (x0 + 0.15 * math.sin(f * 0.02 * spd + ph), y0 + 0.1 * math.cos(f * 0.017 + ph), z0 + 0.2 * math.sin(f * 0.025 * spd + ph * 2))
            K(ob, "location")
    # --- camera
    c, t = cam_state(f, s, ax)
    cam.location = c; cam_target.location = t
    camd.lens = lens(f)
    K(cam, "location"); K(cam_target, "location"); camd.keyframe_insert("lens", frame=f)

# ---------------------------------------------------------------- render settings
r = scene.render
r.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 40
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.03
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 4
scene.cycles.diffuse_bounces = 2
scene.cycles.glossy_bounces = 2
scene.cycles.transmission_bounces = 2
scene.cycles.transparent_max_bounces = 2
scene.cycles.caustics_reflective = False
scene.cycles.caustics_refractive = False
scene.cycles.blur_glossy = 1.0
r.use_persistent_data = True
r.film_transparent = False
r.image_settings.file_format = "PNG"
r.image_settings.color_depth = "8"
try:
    scene.view_settings.view_transform = "Khronos PBR Neutral"
    scene.view_settings.look = "None"
except Exception:
    pass
scene.view_settings.exposure = -0.3

bpy.ops.wm.save_as_mainfile(filepath=OUT, compress=True)
print("SAVED", OUT)
