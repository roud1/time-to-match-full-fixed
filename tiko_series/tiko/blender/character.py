"""Tiko — the permanent character asset.

build()        creates the 'Tiko' collection (geometry + control hierarchy) in the current file
load()         appends the saved asset (assets/character/tiko_character.blend) into an episode
get_rig()      finds the control objects by name
apply_pose()   maps a pose dict (tiko.anim.pose) onto the rig and optionally keyframes it

Design rules (series bible): mint-turquoise folded cardstock, cream layered belly, amber eyes,
asymmetrical ears/horn, fan wings with gold star on his LEFT wing (+X), gold spirals, 6-segment
tail with glowing star. Tiko faces -Y at yaw 0; his left is +X. Height ≈ 1.1 units.
"""
import bpy, math
from mathutils import Matrix
from .. import config as K
from . import meshes as G
from . import materials as MAT

COLL = "Tiko"
TAIL_REST = [-55, 28, 24, 22, 18, 14]


def _mint(i, f):
    return (K.MINT, K.MINT_L, K.MINT, K.MINT_D)[i % 4]


# ---------------------------------------------------------------- mouth with shape keys
MOUTH_U, MOUTH_V = 24, 6


def _mouth_shape(kind):
    """Return (half_width, top(u), bottom(u)) for each mouth key."""
    import math as m
    if kind == "Basis":      # closed little smile
        return 0.07, (lambda u: 0.004 - 0.012 * (1 - u * u)), (lambda u: -0.003 - 0.018 * (1 - u * u))
    if kind == "open":       # big D-shaped open smile
        return 0.08, (lambda u: 0.004 - 0.008 * (1 - u * u)), (lambda u: -0.075 * (1 - u * u) ** 0.6)
    if kind == "O":
        return 0.045, (lambda u: 0.035 * m.sqrt(max(0, 1 - u * u))), (lambda u: -0.042 * m.sqrt(max(0, 1 - u * u)))
    if kind == "frown":
        return 0.065, (lambda u: 0.012 * (1 - u * u)), (lambda u: 0.004 * (1 - u * u) - 0.004)
    if kind == "wide":
        return 0.1, (lambda u: 0.002 - 0.006 * (1 - u * u)), (lambda u: -0.05 * (1 - u * u) ** 0.7)
    raise KeyError(kind)


def _mouth_coords(kind):
    w, top, bot = _mouth_shape(kind)
    co = []
    for j in range(MOUTH_V + 1):
        v = j / MOUTH_V
        for i in range(MOUTH_U + 1):
            u = -1 + 2 * i / MOUTH_U
            x = w * u
            z = top(u) + (bot(u) - top(u)) * v
            y = 1.8 * x * x            # curve back around the snout
            co.append((x, y, z))
    return co


def _build_mouth(name, mat, parent, coll):
    co = _mouth_coords("Basis")
    faces = []
    for j in range(MOUTH_V):
        for i in range(MOUTH_U):
            a = j * (MOUTH_U + 1) + i
            faces.append((a, a + 1, a + MOUTH_U + 2, a + MOUTH_U + 1))

    def col(idx, f):
        j, i = divmod(idx, MOUTH_U)
        u = -1 + 2 * (i + 0.5) / MOUTH_U
        return (0.95, 0.45, 0.48) if (j >= MOUTH_V - 2 and abs(u) < 0.55) else (0.32, 0.04, 0.06)
    ob = G.finish(name, G.poly(co, faces), mat, col, 0.0, parent=parent, coll=coll, smooth=True)
    ob.shape_key_add(name="Basis", from_mix=False)
    for kind in ("open", "O", "frown", "wide"):
        k = ob.shape_key_add(name=kind, from_mix=False)
        for i, c in enumerate(_mouth_coords(kind)):
            k.data[i].co = c
    return ob


# ---------------------------------------------------------------- build
def build():
    if COLL in bpy.data.collections:
        raise RuntimeError("Tiko already exists in this file")
    coll = bpy.data.collections.new(COLL)
    bpy.context.scene.collection.children.link(coll)
    M = MAT.character_set()
    P = M["paper"]
    E = lambda *a, **k: G.empty(*a, coll=coll, **k)
    F = lambda *a, **k: G.finish(*a, coll=coll, **k)

    root = E("Tiko_Root")
    body = E("Tiko_Body", (0, 0, 0), root)
    F("Tiko_Torso", G.ico(0.27, 1, (0.95, 0.85, 1.08), 0.012, 3, (0, 0.03, 0.37)), P, _mint, crease=0.007, parent=body)
    for k, (z, s) in enumerate([(0.24, 0.17), (0.34, 0.15), (0.44, 0.12)]):
        v = [(-s, 0, z + 0.03), (0, 0, z - s * 0.55), (s, 0, z + 0.03), (0, 0, z + s * 0.5), (0, -0.07, z)]
        ob = F(f"Tiko_Belly{k}", G.poly(v, [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)]), P,
               lambda i, f: (K.CREAM, K.CREAM_W)[i % 2], var=0.04, crease=0.004, parent=body)
        ob.location = (0, -0.185 + k * 0.012, 0.04)
        ob.scale = (0.8, 0.8, 0.8)
    for sx in (-1, 1):
        F(f"Tiko_Haunch{'L' if sx > 0 else 'R'}", G.ico(0.11, 1, (0.9, 1.1, 1.0), 0.008, 5 + sx, (sx * 0.17, 0.09, 0.2)), P, _mint,
          crease=0.005, parent=body)
    G.spiral("Tiko_HipSpiral_L", body, (0.262, 0.05, 0.24), (0, math.radians(90), 0), 0.045, mat=M["gold"], coll=coll)
    G.spiral("Tiko_HipSpiral_R", body, (-0.262, 0.05, 0.24), (0, math.radians(-90), 0), 0.045, mat=M["gold"], coll=coll)

    for name, (x, y, top, r) in {"FL": (0.11, -0.12, 0.22, 0.055), "FR": (-0.11, -0.12, 0.22, 0.055),
                                  "BL": (0.17, 0.11, 0.2, 0.06), "BR": (-0.17, 0.11, 0.2, 0.06)}.items():
        piv = E(f"Tiko_Leg{name}", (x, y, top), body)
        F(f"Tiko_LegMesh{name}", G.frustum(5, r * 0.85, r, top - 0.02, -top + 0.02, 0.3), P, _mint, crease=0.004, parent=piv)
        for t in (-1, 0, 1):
            bm = G.frustum(3, 0.018, 0, 0.05, 0, 0)
            import bmesh
            bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(100), 3, "X"))
            c = F(f"Tiko_Claw{name}{t + 1}", bm, P, K.CREAM, var=0.05, parent=piv)
            c.location = (t * 0.03, -0.035, -top + 0.02)

    def wing_bm(side):
        ribs = [(8, 0.52), (34, 0.62), (60, 0.58), (86, 0.46)]
        verts = [(0, 0, 0)]
        for k, (ang, L) in enumerate(ribs):
            a = math.radians(ang)
            verts.append((side * math.cos(a) * L, 0.0, math.sin(a) * L))
            if k < len(ribs) - 1:
                a2 = math.radians((ang + ribs[k + 1][0]) / 2)
                lv = 0.72 * (L + ribs[k + 1][1]) / 2
                verts.append((side * math.cos(a2) * lv, 0.045, math.sin(a2) * lv))
        return G.poly(verts, [(0, k + 1, k + 2) for k in range(len(verts) - 2)])
    for side, nm in ((1, "L"), (-1, "R")):
        piv = E(f"Tiko_Wing{nm}", (side * 0.15, 0.12, 0.5), body)
        ob = F(f"Tiko_WingMesh{nm}", wing_bm(side), M["wing"],
               lambda i, f: (K.MINT_L, K.CREAM, K.MINT, K.CREAM_W, K.MINT_L, K.CREAM)[i % 6], var=0.05, crease=0.004,
               crease_angle=8, parent=piv)
        ob.rotation_euler = (0, 0, side * math.radians(-25))
    st = F("Tiko_WingStar", G.star3d(0.06, 0.026, 0.018), M["gold"], parent=bpy.data.objects["Tiko_WingMeshL"])
    st.location = (0.19, -0.03, 0.17)

    parent, base = body, (0, 0.24, 0.24)
    seg = [(0.14, 0.075), (0.13, 0.062), (0.12, 0.052), (0.11, 0.043), (0.10, 0.035), (0.09, 0.028)]
    for k, (L, r) in enumerate(seg):
        piv = E(f"Tiko_Tail{k}", base if k == 0 else (0, 0, seg[k - 1][0]), parent)
        F(f"Tiko_TailMesh{k}", G.frustum(4, r, r * 0.8, L, 0, math.pi / 4), P,
          lambda i, f: (K.MINT, K.CREAM, K.MINT_L, K.MINT_D)[i % 4], var=0.05, crease=0.003, parent=piv)
        parent = piv
    star = F("Tiko_TailStar", G.star3d(0.1, 0.045, 0.035), M["star"], parent=parent)
    star.location = (0, 0, seg[-1][0] + 0.08)

    head = E("Tiko_Head", (0, -0.02, 0.58), body)
    head.scale = (1.17, 1.17, 1.17)
    F("Tiko_HeadMesh", G.ico(0.33, 1, (1.12, 0.9, 0.93), 0.01, 11, (0, 0, 0.25)), P, _mint, crease=0.007, parent=head)
    F("Tiko_Snout", G.ico(0.13, 1, (1.25, 0.95, 0.7), 0.004, 12, (0, -0.21, 0.13)), P,
      lambda i, f: (K.MINT_L, K.MINT)[i % 2], crease=0.004, parent=head)
    G.spiral("Tiko_CheekSpiral_L", head, (0.33, -0.12, 0.17), (math.radians(90), 0, math.radians(70)), 0.04, mat=M["gold"], coll=coll)
    G.spiral("Tiko_CheekSpiral_R", head, (-0.33, -0.12, 0.17), (math.radians(90), 0, math.radians(-70)), 0.04, mat=M["gold"], coll=coll)

    def flap(name, piv_loc, tip, w):
        piv = E(f"{name}_Pivot", piv_loc, head)
        v = [(-w * 0.6, -w, 0), (w * 0.6, -w * 0.2, -w * 0.3), (0, w, w * 0.2), tip,
             (tip[0] / 2, tip[1] / 2 - w * 0.55, tip[2] / 2 + 0.02)]
        F(name, G.poly(v, [(0, 1, 4), (1, 3, 4), (4, 3, 0), (1, 2, 3), (2, 0, 3)]), P,
          lambda i, f: (K.CREAM, K.CREAM_W, K.MINT_L, K.CREAM, K.MINT)[i % 5], var=0.05, crease=0.004, crease_angle=10, parent=piv)
        return piv
    ear_r = flap("Tiko_EarBig", (-0.24, 0.02, 0.48), (-0.42, 0.04, 0.24), 0.1)        # his right (-X)
    ear_l = flap("Tiko_EarSmall", (0.25, 0.02, 0.46), (0.27, 0.06, 0.2), 0.08)         # his left (+X)
    ear_r.name, ear_l.name = "Tiko_EarR", "Tiko_EarL"
    G.spiral("Tiko_EarSun", ear_r, (-0.18, -0.08, 0.12), (math.radians(80), 0, math.radians(-20)), 0.035, 1.3, mat=M["gold"], coll=coll)
    horn = F("Tiko_Horn", G.frustum(4, 0.05, 0.035, 0.16, 0, 0.4), P, lambda i, f: (K.MINT_L, K.CREAM)[i % 2], var=0.05,
             crease=0.003, parent=head)
    horn.location = (0.08, 0.05, 0.5); horn.rotation_euler = (math.radians(-10), math.radians(15), 0)
    h2 = F("Tiko_HornTip", G.frustum(4, 0.035, 0, 0.17, 0, 0.4), P, K.CREAM_W, var=0.05, parent=horn)
    h2.location = (0, 0, 0.15); h2.rotation_euler = (0, math.radians(70), 0)

    for side, nm in ((1, "L"), (-1, "R")):
        eg = E(f"Tiko_Eye{nm}", (side * 0.15, -0.2, 0.27), head)
        eg.rotation_euler = (0, 0, side * math.radians(7))
        F(f"Tiko_EyeWhite{nm}", G.uvsphere(0.108, 32, 16), M["eye_white"], parent=eg, smooth=True)
        look = E(f"Tiko_Look{nm}", (0, 0, 0), eg)
        F(f"Tiko_Iris{nm}", G.uvsphere(0.088, 32, 16, (1, 0.3, 1), (0, -0.084, 0)), M["iris"], parent=look, smooth=True)
        pup = F(f"Tiko_Pupil{nm}", G.uvsphere(0.052, 24, 12, (1, 0.3, 1.08)), M["pupil"], parent=look, smooth=True)
        pup.location = (0, -0.1, 0)
        hl = E(f"Tiko_Sparkle{nm}", (0, 0, 0), look)
        F(f"Tiko_Hilite{nm}", G.uvsphere(0.021, 12, 8, (1, 0.5, 1), (side * -0.022, -0.115, 0.032)), M["hilite"], parent=hl, smooth=True)
        F(f"Tiko_Hilite2{nm}", G.uvsphere(0.01, 10, 6, (1, 0.5, 1), (side * 0.025, -0.113, -0.03)), M["hilite"], parent=hl, smooth=True)
        F(f"Tiko_LidUp{nm}", G.uvsphere(0.116, 32, 16, keep=lambda c: c.y <= 0.001), P, K.MINT_L, var=0.0, parent=eg, smooth=True)
        F(f"Tiko_LidLow{nm}", G.uvsphere(0.114, 32, 16, keep=lambda c: c.y <= 0.001), P, K.MINT, var=0.0, parent=eg, smooth=True)
        brow = F(f"Tiko_Brow{nm}", G.uvsphere(0.05, 16, 8, (1.0, 0.25, 0.22)), M["brow"], parent=head, smooth=True)
        brow.location = (side * 0.15, -0.27, 0.42)
        bl = F(f"Tiko_Blush{nm}", G.ico(0.05, 2, (1.0, 0.25, 0.6)), M["blush"], parent=head, smooth=True)
        bl.location = (side * 0.24, -0.24, 0.12); bl.rotation_euler = (0, 0, side * math.radians(35))
    mouth = E("Tiko_Mouth", (0, -0.318, 0.085), head)
    _build_mouth("Tiko_MouthMesh", M["mouth"], mouth, coll)

    gl = bpy.data.lights.new("Tiko_GlowLight", "POINT"); gl.color = (1.0, 0.75, 0.35); gl.shadow_soft_size = 0.3; gl.energy = 0
    glo = bpy.data.objects.new("Tiko_GlowLight", gl); coll.objects.link(glo)
    glo.parent = root; glo.location = (0, -0.6, 0.9)
    return get_rig()


def load(filepath=None):
    """Append the saved Tiko asset into the current scene."""
    filepath = filepath or K.CHARACTER_BLEND
    with bpy.data.libraries.load(filepath, link=False) as (src, dst):
        dst.collections = [COLL]
    bpy.context.scene.collection.children.link(bpy.data.collections[COLL])
    return get_rig()


def get_rig():
    o = bpy.data.objects
    r = {"root": o["Tiko_Root"], "body": o["Tiko_Body"], "head": o["Tiko_Head"], "mouth": o["Tiko_MouthMesh"],
         "glow_light": o["Tiko_GlowLight"],
         "wings": {s: o[f"Tiko_Wing{s}"] for s in "LR"},
         "legs": {s: o[f"Tiko_Leg{s}"] for s in ("FL", "FR", "BL", "BR")},
         "tail": [o[f"Tiko_Tail{k}"] for k in range(6)],
         "ears": {s: o[f"Tiko_Ear{s}"] for s in "LR"}}
    for s in "LR":
        for part in ("LidUp", "LidLow", "Look", "Pupil", "Sparkle", "Brow", "Blush"):
            r[f"{part}{s}"] = o[f"Tiko_{part}{s}"]
    M = MAT.character_set()
    r["glow_inputs"] = [MAT.principled(M["gold"]).inputs["Emission Strength"],
                        MAT.principled(M["star"]).inputs["Emission Strength"],
                        MAT.principled(M["iris"]).inputs["Emission Strength"]]
    return r


# ---------------------------------------------------------------- pose -> rig
def _set(ob, path, val, frame):
    setattr(ob, path, val)
    if frame is not None:
        ob.keyframe_insert(path, frame=frame)


def apply_pose(r, p, frame=None):
    R = math.radians
    _set(r["root"], "location", (p["x"], p["y"], p["z"]), frame)
    _set(r["root"], "rotation_euler", (0, 0, R(p["yaw"])), frame)
    sq = p["sq"]
    _set(r["body"], "scale", (1 - sq * 0.5, 1 - sq * 0.5, 1 + sq), frame)
    _set(r["body"], "rotation_euler", (R(p["pitch"]), R(p["roll"]), 0), frame)
    _set(r["head"], "rotation_euler", (R(p["head_pitch"]), R(p["head_roll"]), R(p["head_yaw"])), frame)
    for s, side in (("L", 1), ("R", -1)):
        w = r["wings"][s]
        _set(w, "rotation_euler", (0, R(-side * (p[f"wing_flap_{s}"] + p["wing_spread"] - 10)), R(side * 10)), frame)
        _set(w, "scale", (p["wing_scale"],) * 3, frame)
        _set(r["ears"][s], "rotation_euler", (0, R(-side * p[f"ear_{s}"]), 0), frame)
    for s in ("FL", "FR", "BL", "BR"):
        _set(r["legs"][s], "rotation_euler", (R(p[f"leg_{s}"]), 0, 0), frame)
    for k, piv in enumerate(r["tail"]):
        sway = p["tail_sway"] * (k + 1) / 6
        lift = p["tail_lift"] / 6 if k else 0
        _set(piv, "rotation_euler", (R(TAIL_REST[k] * (p["tail_curl"] if k else 1) - lift), R(sway / 2), 0), frame)
    # ---- face
    for s, side in (("L", 1), ("R", -1)):
        _set(r[f"LidUp{s}"], "rotation_euler", (R(-150 + 145 * p[f"lid_up_{s}"]), 0, 0), frame)
        _set(r[f"LidLow{s}"], "rotation_euler", (R(150 - 48 * p[f"lid_low_{s}"]), 0, 0), frame)
        _set(r[f"Look{s}"], "rotation_euler", (R(-p["look_y"] * 15), 0, R(p["look_x"] * 22)), frame)
        pu = p["pupil"]
        _set(r[f"Pupil{s}"], "scale", (pu, 1, pu), frame)
        _set(r[f"Sparkle{s}"], "scale", (p["eye_sparkle"],) * 3, frame)
        b = p[f"brow_{s}"]
        _set(r[f"Brow{s}"], "location", (side * 0.15, -0.27, 0.42 + 0.035 * b), frame)
        _set(r[f"Brow{s}"], "rotation_euler", (0, R(side * (4 + 22 * p["brow_tilt"] - 6 * b)), 0), frame)
        bl = max(0.0, p["blush"])
        _set(r[f"Blush{s}"], "scale", (bl, bl, bl), frame)
    keys = r["mouth"].data.shape_keys.key_blocks
    op, O, sm, wd = p["mouth_open"], p["mouth_O"], p["mouth_smile"], p["mouth_wide"]
    vals = {"open": op * (1 - O) * (0.3 + 0.7 * max(0, sm)), "O": O * max(op, 0.25),
            "frown": max(0, -sm) * (1 - op), "wide": wd * op * (1 - O)}
    for k, v in vals.items():
        keys[k].value = min(1.0, max(0.0, v))
        if frame is not None:
            keys[k].keyframe_insert("value", frame=frame)
    g = p["glow"]
    for inp, base, gain in zip(r["glow_inputs"], (0.25, 2.5, 0.45), (16, 10, 1.2)):
        inp.default_value = base + gain * g
        if frame is not None:
            inp.keyframe_insert("default_value", frame=frame)
    gl = r["glow_light"].data
    gl.energy = 35 * g
    if frame is not None:
        gl.keyframe_insert("energy", frame=frame)
