"""Shared materials. Materials are created once and looked up by name, so the
character asset and every set use identical paper / gold / eye shaders."""
import bpy
from .. import config as K


def _nodes(mat):
    try:
        mat.use_nodes = True
    except Exception:
        pass
    return mat.node_tree.nodes, mat.node_tree.links


def principled(mat):
    n, _ = _nodes(mat)
    return next(x for x in n if x.type == "BSDF_PRINCIPLED")


def get(name):
    return bpy.data.materials.get(name)


def paper(name="Paper", rough=0.78, bump=0.05, haze=0.4, translucent=0.0):
    """Matte cardstock. Base colour = per-face 'col' attribute (origami facets).
    Fibre/grain bump, soft sheen at grazing angles, distance haze toward warm sky,
    optional subsurface translucency for thin parts (wings glow when back-lit)."""
    if get(name):
        return get(name)
    m = bpy.data.materials.new(name)
    n, l = _nodes(m)
    p = principled(m)
    at = n.new("ShaderNodeAttribute"); at.attribute_name = "col"; at.attribute_type = "GEOMETRY"
    cd = n.new("ShaderNodeCameraData")
    mr = n.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 7; mr.inputs["From Max"].default_value = 30
    mr.inputs["To Max"].default_value = haze
    l.new(cd.outputs["View Distance"], mr.inputs["Value"])
    mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"
    l.new(mr.outputs["Result"], mix.inputs[0]); l.new(at.outputs["Color"], mix.inputs[6])
    mix.inputs[7].default_value = (1.0, 0.86, 0.78, 1)
    l.new(mix.outputs[2], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = rough
    p.inputs["Sheen Weight"].default_value = 0.35
    p.inputs["Sheen Tint"].default_value = (1, 0.97, 0.9, 1)
    if translucent:
        p.inputs["Subsurface Weight"].default_value = translucent
        p.inputs["Subsurface Radius"].default_value = (0.02, 0.02, 0.015)
    tc = n.new("ShaderNodeTexCoord")
    nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 260; nz.inputs["Detail"].default_value = 3
    w = n.new("ShaderNodeTexWave"); w.inputs["Scale"].default_value = 90; w.inputs["Distortion"].default_value = 18
    vo = n.new("ShaderNodeTexVoronoi"); vo.inputs["Scale"].default_value = 14  # faint crumple
    for t in (nz, w, vo):
        l.new(tc.outputs["Object"], t.inputs["Vector"])
    a1 = n.new("ShaderNodeMath"); a1.operation = "ADD"
    l.new(nz.outputs["Fac"], a1.inputs[0]); l.new(w.outputs["Fac"], a1.inputs[1])
    a2 = n.new("ShaderNodeMath"); a2.operation = "MULTIPLY_ADD"
    l.new(vo.outputs["Distance"], a2.inputs[0]); a2.inputs[1].default_value = 0.6; l.new(a1.outputs[0], a2.inputs[2])
    b = n.new("ShaderNodeBump"); b.inputs["Strength"].default_value = bump; b.inputs["Distance"].default_value = 0.002
    l.new(a2.outputs[0], b.inputs["Height"]); l.new(b.outputs["Normal"], p.inputs["Normal"])
    return m


def basic(name, col, rough=0.5, metal=0.0, emit=None, estr=0.0, coat=0.0):
    if get(name):
        return get(name)
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


def emit(name, col, strength):
    if get(name):
        return get(name)
    m = bpy.data.materials.new(name)
    n, l = _nodes(m)
    for x in list(n):
        if x.type == "BSDF_PRINCIPLED":
            n.remove(x)
    out = next(x for x in n if x.type == "OUTPUT_MATERIAL")
    e = n.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (*col, 1); e.inputs["Strength"].default_value = strength
    l.new(e.outputs[0], out.inputs["Surface"])
    return m


def attr_glossy(name, rough=0.45):
    """Glossy material reading the 'col' attribute (mouth interior + tongue)."""
    if get(name):
        return get(name)
    m = bpy.data.materials.new(name)
    n, l = _nodes(m)
    p = principled(m)
    at = n.new("ShaderNodeAttribute"); at.attribute_name = "col"; at.attribute_type = "GEOMETRY"
    l.new(at.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = rough
    return m


def character_set():
    """All materials used by Tiko."""
    return dict(
        paper=paper("TikoPaper"),
        wing=paper("TikoWingPaper", translucent=0.25),
        gold=basic("TikoGold", K.GOLD, rough=0.3, metal=0.85, emit=K.GOLD_EMIT, estr=0.25),
        star=basic("TikoTailStar", (1.0, 0.8, 0.3), rough=0.25, metal=0.5, emit=(1.0, 0.6, 0.12), estr=2.5),
        eye_white=basic("TikoEyeWhite", (0.95, 0.94, 0.92), rough=0.15, coat=0.6),
        iris=basic("TikoIris", K.AMBER, rough=0.12, emit=(1.0, 0.55, 0.1), estr=0.45, coat=1.0),
        pupil=basic("TikoPupil", (0.03, 0.015, 0.01), rough=0.1, coat=1.0),
        hilite=emit("TikoEyeHighlight", (1, 1, 1), 6.0),
        mouth=attr_glossy("TikoMouth"),
        brow=basic("TikoBrow", (0.12, 0.09, 0.07), rough=0.7),
        blush=basic("TikoBlush", K.BLUSH, rough=0.8, emit=K.BLUSH, estr=0.15),
    )
