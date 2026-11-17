"""'Paper Meadow' — the pastel papercraft forest clearing from episode 1, parameterised.

params:
  seed           layout seed (different but consistent look per episode)
  x_range        (x0, x1) extent of the action lane to dress
  flower_beds    [(x, y, radius), ...] dense soft flower patches
  lane_half      half-width of the clear action lane around y=0
  density        0.5 .. 1.5 overall dressing density
"""
import bpy, math, random
from ... import config as K
from .. import meshes as G
from .. import materials as MAT


def height(x, y, lane_half=1.4):
    lane = 0.0
    if y > lane_half + 0.2:
        lane = (y - lane_half - 0.2) ** 1.35 * 0.22
    if y < -2.8:
        lane = (-2.8 - y) * 0.15
    w = 0.12 * math.sin(x * 0.7 + y * 0.4) + 0.08 * math.sin(x * 1.7 - y * 1.1)
    return lane + w * min(1, max(0, (abs(y) - lane_half) / 1.5))


def _protos(coll, rng):
    P = {}
    paper = MAT.paper("PaperSet", rough=0.85, bump=0.04)
    F = lambda *a, **k: G.finish(*a, coll=coll, **k)
    for ci, col in enumerate([(0.30, 0.62, 0.55), (0.42, 0.72, 0.58), (0.36, 0.58, 0.62), (0.55, 0.75, 0.55)]):
        bm = G.frustum(6, 0.12, 0.1, 0.6, 0, 0)
        for k, (z, r) in enumerate([(0.5, 0.9), (1.2, 0.72), (1.85, 0.52)]):
            G.merge(bm, G.frustum(7, r, 0, 1.2 - k * 0.15, z, k * 0.4))
        P.setdefault("tree", []).append(F(f"Proto_Tree{ci}", bm, paper, lambda i, p, c=col: c if i > 7 else (0.55, 0.38, 0.3), var=0.08, crease=0.012))
    for ci, col in enumerate([(1.0, 0.68, 0.78), (0.95, 0.75, 0.9), (1.0, 0.8, 0.62), (0.8, 0.7, 0.98)]):
        bm = G.frustum(5, 0.1, 0.07, 1.3, 0, 0)
        for k, (o, r) in enumerate([((0, 0, 1.8), 0.75), ((0.45, 0.1, 1.45), 0.5), ((-0.4, -0.1, 1.5), 0.52)]):
            G.merge(bm, G.ico(r, 1, (1, 1, 0.9), 0.04, ci * 10 + k, o))
        P.setdefault("blossom", []).append(F(f"Proto_Blossom{ci}", bm, paper, lambda i, p, c=col: c if i > 6 else (0.55, 0.38, 0.3), var=0.08))
    for ci, col in enumerate([(0.38, 0.68, 0.45), (0.5, 0.76, 0.5), (0.42, 0.7, 0.6)]):
        P.setdefault("bush", []).append(F(f"Proto_Bush{ci}", G.ico(0.5, 1, (1.3, 1, 0.75), 0.05, ci, (0, 0, 0.25)), paper, col, var=0.1))
    for ci, col in enumerate([(1.0, 0.55, 0.72), (0.8, 0.6, 1.0), (1.0, 0.85, 0.4), (1.0, 0.75, 0.65), (0.98, 0.95, 0.9)]):
        bm = G.frustum(4, 0.012, 0.01, 0.32, 0, 0)
        for k in range(5):
            a = 2 * math.pi * k / 5
            c, s = math.cos(a), math.sin(a)
            pv = [(0, 0, 0.32), (c * 0.13 - s * 0.05, s * 0.13 + c * 0.05, 0.36), (c * 0.2, s * 0.2, 0.34),
                  (c * 0.13 + s * 0.05, s * 0.13 - c * 0.05, 0.36), (c * 0.1, s * 0.1, 0.31)]
            G.merge(bm, G.poly(pv, [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)]))
        G.merge(bm, G.ico(0.045, 1, (1, 1, 0.6), 0, 1, (0, 0, 0.36)))

        def fc(i, p, c=col):
            if i < 6:
                return (0.35, 0.62, 0.3)
            if i >= 26:
                return (1.0, 0.8, 0.25)
            return c
        P.setdefault("flower", []).append(F(f"Proto_Flower{ci}", bm, paper, fc, var=0.06))
    for ci, col in enumerate([(0.45, 0.75, 0.38), (0.58, 0.82, 0.42)]):
        v, f = [], []
        for k in range(4):
            a = k * 1.7
            c, s = math.cos(a), math.sin(a)
            b = len(v)
            v += [(c * 0.03 - s * 0.02, s * 0.03 + c * 0.02, 0), (c * 0.03 + s * 0.02, s * 0.03 - c * 0.02, 0), (c * 0.1, s * 0.1, 0.16 + 0.04 * k)]
            f.append((b, b + 1, b + 2))
        P.setdefault("grass", []).append(F(f"Proto_Grass{ci}", G.poly(v, f), paper, col, var=0.1))
    bm = G.frustum(6, 0.05, 0.04, 0.16, 0, 0)
    G.merge(bm, G.frustum(8, 0.16, 0, 0.12, 0.14, 0))
    P["mush"] = [F("Proto_Mushroom", bm, paper, lambda i, p: (0.98, 0.92, 0.85) if i < 8 else (1.0, 0.5, 0.45), var=0.05)]
    P["rock"] = [F("Proto_Rock", G.ico(0.3, 1, (1.3, 1, 0.6), 0.06, 9, (0, 0, 0.08)), paper, (0.72, 0.68, 0.78), var=0.08, crease=0.006)]
    for lst in P.values():
        for o in lst:
            o.hide_render = True
            o.hide_viewport = True
            o.location = (0, -50, -50)
    return P


def build(seed=7, x_range=(-8, 22), flower_beds=(), lane_half=1.4, density=1.0, fireflies=55):
    rng = random.Random(seed)
    coll = bpy.data.collections.new("Set_Meadow")
    bpy.context.scene.collection.children.link(coll)
    x0, x1 = x_range
    # ground
    import bmesh
    bm = bmesh.new()
    nx, ny = int((x1 - x0 + 22) * 2.5), 60
    gx0, gx1, gy0, gy1 = x0 - 6, x1 + 8, -9, 34
    vs = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            x = gx0 + (gx1 - gx0) * i / nx + (rng.uniform(-0.12, 0.12) if 0 < i < nx else 0)
            y = gy0 + (gy1 - gy0) * (j / ny) ** 1.25
            row.append(bm.verts.new((x, y, height(x, y, lane_half))))
        vs.append(row)
    for j in range(ny):
        for i in range(nx):
            a, b, c, d = vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]
            if (i + j) % 2:
                bm.faces.new((a, b, c)); bm.faces.new((a, c, d))
            else:
                bm.faces.new((a, b, d)); bm.faces.new((b, c, d))
    greens = [(0.40, 0.72, 0.28), (0.50, 0.78, 0.30), (0.36, 0.68, 0.32), (0.58, 0.80, 0.34), (0.46, 0.74, 0.40)]
    gr = random.Random(seed + 1)
    G.finish("Set_Ground", bm, MAT.paper("PaperGround", rough=0.9, bump=0.03), lambda i, p: gr.choice(greens), var=0.05, coll=coll)

    P = _protos(coll, rng)
    n = [0]

    def put(kind, x, y, s):
        n[0] += 1
        proto = rng.choice(P[kind])
        ob = bpy.data.objects.new(f"Set_{kind}_{n[0]:04d}", proto.data)
        coll.objects.link(ob)
        ob.location = (x, y, height(x, y, lane_half))
        ob.scale = (s, s, s)
        ob.rotation_euler = (0, 0, rng.uniform(0, 6.28))
        return ob
    span = (x1 - x0) / 30.0
    for _ in range(int(120 * span * density)):
        x = rng.uniform(x0 - 4, x1 + 6); y = rng.uniform(6, 30)
        k = rng.choice(["tree", "tree", "blossom"])
        put(k, x, y, rng.uniform(1.0, 2.2) * (0.75 if k == "blossom" else 1) * (1 + (y - 4) / 30))
    for _ in range(int(40 * span * density)):
        put("bush", rng.uniform(x0 - 4, x1 + 6), rng.uniform(lane_half + 0.8, 5), rng.uniform(0.6, 1.2))
    for _ in range(int(420 * span * density)):
        y = rng.choice([rng.uniform(lane_half - 0.25, 3.5), rng.uniform(lane_half - 0.25, 3.5), rng.uniform(-2.0, -lane_half + 0.1)])
        put("flower", rng.uniform(x0, x1), y, rng.uniform(0.7, 1.4))
    for _ in range(int(900 * span * density)):
        x = rng.uniform(x0, x1); y = rng.uniform(-3.5, 4)
        if abs(y) < lane_half - 0.4 and rng.random() < 0.75:
            continue
        put("grass", x, y, rng.uniform(0.8, 1.5))
    for _ in range(int(5 * span)):
        put("mush", rng.uniform(x0, x1), rng.choice([-1, 1]) * rng.uniform(lane_half + 0.1, lane_half + 0.4), rng.uniform(1.4, 2.0))
    for _ in range(int(4 * span)):
        put("rock", rng.uniform(x0, x1), rng.choice([-1, 1.2]) * rng.uniform(lane_half + 0.3, lane_half + 0.8), rng.uniform(0.8, 1.4))
    for bx, by, br in flower_beds:
        for _ in range(int(110 * (br / 1.45) ** 2)):
            a = rng.uniform(0, 6.28); r = br * math.sqrt(rng.random())
            put("flower", bx + math.cos(a) * r * 1.2, by + math.sin(a) * r * 0.9, rng.uniform(1.4, 2.1))
    # floating motes
    motes = []
    mm = MAT.emit("Firefly", (1.0, 0.9, 0.6), 6.0)
    for k in range(fireflies):
        ob = G.finish(f"FX_Mote{k:02d}", G.ico(0.012, 1), mm, coll=coll)
        motes.append((ob, (rng.uniform(x0, x1), rng.uniform(-0.8, 3.5), rng.uniform(0.3, 3.4)), rng.uniform(0, 6.28), rng.uniform(0.5, 1.3)))
    return {"collection": coll, "motes": motes, "height": lambda x, y: height(x, y, lane_half)}


def animate_motes(motes, f, key=True):
    for ob, (x0, y0, z0), ph, spd in motes:
        ob.location = (x0 + 0.15 * math.sin(f * 0.02 * spd + ph), y0 + 0.1 * math.cos(f * 0.017 + ph), z0 + 0.2 * math.sin(f * 0.025 * spd + ph * 2))
        if key:
            ob.keyframe_insert("location", frame=f)
