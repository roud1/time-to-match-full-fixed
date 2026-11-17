"""Low-level mesh builders (bmesh) + the origami 'finish': per-face paper tones and
light paper-core highlights on folded creases (thin bevel faces on sharp edges)."""
import bpy, bmesh, math, random
from mathutils import Vector, Matrix
from .. import config as K


def link(ob, coll=None):
    (coll or bpy.context.scene.collection).objects.link(ob)
    return ob


def empty(name, loc=(0, 0, 0), parent=None, coll=None, size=0.05):
    e = bpy.data.objects.new(name, None)
    link(e, coll)
    e.location = loc
    e.empty_display_size = size
    if parent:
        e.parent = parent
    return e


def ico(r=1, sub=1, scale=(1, 1, 1), jitter=0.0, seed=0, offset=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    rr = random.Random(seed)
    for v in bm.verts:
        v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2]))
        if jitter:
            v.co += Vector((rr.uniform(-1, 1), rr.uniform(-1, 1), rr.uniform(-1, 1))) * jitter
        v.co += Vector(offset)
    return bm


def uvsphere(r=1, seg=32, ring=16, scale=(1, 1, 1), offset=(0, 0, 0), keep=None):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=r)
    if keep:
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not keep(v.co)], context="VERTS")
    for v in bm.verts:
        v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2])) + Vector(offset)
    return bm


def poly(verts, faces):
    bm = bmesh.new()
    vs = [bm.verts.new(v) for v in verts]
    for f in faces:
        try:
            bm.faces.new([vs[i] for i in f])
        except ValueError:
            pass
    return bm


def frustum(n, r1, r2, h, z0=0, rot=0.0, scale=(1, 1, 1)):
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
        faces.append(tuple(range(n - 1, -1, -1)))
        faces.append(tuple(range(n, 2 * n)))
    else:
        verts.append((0, 0, z0 + h))
        for i in range(n):
            faces.append((i, (i + 1) % n, n))
        faces.append(tuple(range(n - 1, -1, -1)))
    return poly(verts, faces)


def star3d(r_out, r_in, depth, points=5):
    verts = []
    for i in range(points * 2):
        a = math.pi / 2 + math.pi * i / points
        r = r_out if i % 2 == 0 else r_in
        verts.append((math.cos(a) * r, 0, math.sin(a) * r))
    verts += [(0, -depth, 0), (0, depth, 0)]
    nr = points * 2
    faces = [(i, (i + 1) % nr, nr) for i in range(nr)] + [((i + 1) % nr, i, nr + 1) for i in range(nr)]
    return poly(verts, faces)


def merge(dst, src):
    me = bpy.data.meshes.new("_tmp")
    src.to_mesh(me)
    src.free()
    dst.from_mesh(me)
    bpy.data.meshes.remove(me)
    return dst


def finish(name, bm, mat, cols=None, var=0.06, crease=0.0, crease_angle=22, parent=None, loc=(0, 0, 0),
           smooth=False, seed=None, coll=None):
    """Turn a bmesh into an object with origami paper colouring.

    cols    colour tuple or callable(i, face) -> (r,g,b)
    crease  bevel width on fold edges sharper than crease_angle (0 = off); the new thin faces get
            the light 'paper core' tint so folds catch light like real folded cardstock.
    """
    if cols is not None:
        lay = bm.faces.layers.float_color.new("col")
        r = random.Random(seed if seed is not None else (hash(name) & 0xffff))
        for i, f in enumerate(bm.faces):
            c = cols(i, f) if callable(cols) else cols
            k = 1 + r.uniform(-var, var)
            f[lay] = (min(1, c[0] * k), min(1, c[1] * k), min(1, c[2] * k), 1.0)
        if crease > 0:
            edges = [e for e in bm.edges if not e.is_boundary and len(e.link_faces) == 2
                     and e.calc_face_angle(0) > math.radians(crease_angle)]
            if edges:
                res = bmesh.ops.bevel(bm, geom=edges, offset=crease, offset_type="OFFSET", segments=1,
                                      profile=0.5, affect="EDGES", clamp_overlap=True)
                e = K.PAPER_EDGE
                for f in res["faces"]:
                    c = f[lay]
                    f[lay] = (c[0] * 0.45 + e[0] * 0.55, c[1] * 0.45 + e[1] * 0.55, c[2] * 0.45 + e[2] * 0.55, 1.0)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    link(ob, coll)
    ob.location = loc
    if parent:
        ob.parent = parent
    return ob


def spiral(name, parent, loc, rot, size=0.06, turns=2.2, mat=None, coll=None):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = size * 0.09
    cu.bevel_resolution = 1
    sp = cu.splines.new("POLY")
    n = 40
    sp.points.add(n - 1)
    for i in range(n):
        t = i / (n - 1)
        a = t * turns * 2 * math.pi
        r = size * (0.12 + 0.88 * t)
        sp.points[i].co = (math.cos(a) * r, math.sin(a) * r, 0, 1)
    ob = bpy.data.objects.new(name, cu)
    link(ob, coll)
    if mat:
        cu.materials.append(mat)
    ob.parent = parent
    ob.location = loc
    ob.rotation_euler = rot
    return ob
