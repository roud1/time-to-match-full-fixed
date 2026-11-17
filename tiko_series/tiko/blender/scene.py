"""Episode scene assembly: world, lights, camera, Tiko, set, props, FX; bakes the timeline
into keyframes; render-engine presets (Cycles / Eevee)."""
import bpy, math
from .. import config as K
from . import materials as MAT
from . import meshes as G
from . import character as CH
from . import props as PR
from .sets import SETS

LIGHTING = {   # time-of-day presets
    "sunrise": dict(sky=((1.0, 0.78, 0.62), (1.0, 0.86, 0.8), (0.62, 0.74, 1.0)), sky_str=0.7,
                    key=(4.6, (1.0, 0.86, 0.68), (58, 0, -38)), rim=(4.0, (1.0, 0.66, 0.38), (72, 0, 150))),
    "day":     dict(sky=((0.95, 0.9, 0.85), (0.85, 0.92, 1.0), (0.5, 0.7, 1.0)), sky_str=0.9,
                    key=(5.0, (1.0, 0.96, 0.9), (45, 0, -30)), rim=(2.5, (1.0, 0.9, 0.75), (65, 0, 150))),
    "sunset":  dict(sky=((1.0, 0.62, 0.45), (1.0, 0.75, 0.7), (0.55, 0.55, 0.9)), sky_str=0.6,
                    key=(4.0, (1.0, 0.72, 0.5), (70, 0, -45)), rim=(5.0, (1.0, 0.55, 0.3), (78, 0, 150))),
}


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = K.FPS
    sc.render.resolution_x, sc.render.resolution_y = K.WIDTH, K.HEIGHT
    return sc


def world_and_lights(preset="sunrise"):
    L = LIGHTING[preset]
    sc = bpy.context.scene
    w = bpy.data.worlds.new("Sky"); sc.world = w
    n, l = MAT._nodes(w)
    bg = next(x for x in n if x.type == "BACKGROUND")
    tc = n.new("ShaderNodeTexCoord"); sep = n.new("ShaderNodeSeparateXYZ")
    mr = n.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = -0.05; mr.inputs["From Max"].default_value = 0.6
    ramp = n.new("ShaderNodeValToRGB")
    lo, mid, hi = L["sky"]
    ramp.color_ramp.elements[0].color = (*lo, 1); ramp.color_ramp.elements[1].position = 0.55
    ramp.color_ramp.elements[1].color = (*hi, 1)
    el = ramp.color_ramp.elements.new(0.18); el.color = (*mid, 1)
    l.new(tc.outputs["Generated"], sep.inputs[0]); l.new(sep.outputs["Z"], mr.inputs["Value"])
    l.new(mr.outputs["Result"], ramp.inputs["Fac"]); l.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = L["sky_str"]
    for nm, (e, c, rot) in (("Light_Key", L["key"]), ("Light_Rim", L["rim"])):
        ld = bpy.data.lights.new(nm, "SUN"); ld.energy = e; ld.color = c; ld.angle = math.radians(5)
        ob = bpy.data.objects.new(nm, ld); sc.collection.objects.link(ob)
        ob.rotation_euler = [math.radians(a) for a in rot]


def camera():
    sc = bpy.context.scene
    cd = bpy.data.cameras.new("Cam"); cd.lens = 32; cd.sensor_fit = "VERTICAL"; cd.sensor_height = 36
    cd.dof.use_dof = True; cd.dof.aperture_fstop = 1.2
    cam = bpy.data.objects.new("Camera", cd); sc.collection.objects.link(cam); sc.camera = cam
    tgt = G.empty("Camera_Target")
    tr = cam.constraints.new("TRACK_TO"); tr.target = tgt; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"
    cd.dof.focus_object = tgt
    return cam, tgt


def sparkle_pool(n=90):
    m = MAT.emit("Sparkle", (1.0, 0.7, 0.2), 16.0)
    pool = []
    for k in range(n):
        ob = G.finish(f"FX_Sparkle{k:02d}", G.star3d(0.045, 0.014, 0.012, 4), m)
        ob.scale = (0, 0, 0)
        pool.append(ob)
    return pool


def render_settings(engine="CYCLES", percent=100, samples=12):
    sc = bpy.context.scene
    r = sc.render
    r.engine = engine
    r.resolution_percentage = percent
    r.image_settings.file_format = "PNG"
    r.image_settings.color_depth = "8"
    r.use_persistent_data = True
    if engine == "CYCLES":
        c = sc.cycles
        c.device = "CPU"; c.samples = samples; c.use_adaptive_sampling = True; c.adaptive_threshold = 0.03
        c.use_denoising = True; c.max_bounces = 4; c.diffuse_bounces = 2; c.glossy_bounces = 2
        c.transmission_bounces = 2; c.transparent_max_bounces = 2
        c.caustics_reflective = False; c.caustics_refractive = False; c.blur_glossy = 1.0
    else:
        e = sc.eevee
        e.taa_render_samples = samples
        for attr, val in (("use_shadows", True), ("use_raytracing", True), ("use_gtao", True)):
            if hasattr(e, attr):
                setattr(e, attr, val)
    try:
        sc.view_settings.view_transform = "Khronos PBR Neutral"
        sc.view_settings.look = "None"
    except Exception:
        pass
    sc.view_settings.exposure = -0.3


def build_episode(ep, frames, character_blend=None, key=True):
    """Create the whole episode scene and keyframe the baked timeline `frames`."""
    sc = reset()
    nf = ep["frames"]
    sc.frame_start, sc.frame_end = 0, nf - 1
    world_and_lights(ep.get("lighting", "sunrise"))
    s = SETS[ep.get("set", "meadow")].build(**ep.get("set_params", {}))
    rig = CH.load(character_blend) if character_blend else CH.build()
    props = {}
    for name, spec in ep.get("props", {}).items():
        props[name] = PR.PROPS[spec["type"]](name, **spec.get("build", {}))
    pool = sparkle_pool()
    cam, tgt = camera()
    from . import sets as _s
    for f in range(nf):
        fr = frames[f]
        CH.apply_pose(rig, fr["tiko"], f if key else None)
        for name, (loc, rot) in fr["props"].items():
            props[name].location = loc; props[name].rotation_euler = rot
            if key:
                props[name].keyframe_insert("location", frame=f); props[name].keyframe_insert("rotation_euler", frame=f)
        for k, ob in enumerate(pool):
            if k < len(fr["sparkles"]):
                loc, sc_, spin = fr["sparkles"][k]
                ob.location = loc; ob.scale = (sc_,) * 3; ob.rotation_euler = (0, spin + k, 0)
            else:
                ob.scale = (0, 0, 0)
            if key:
                ob.keyframe_insert("location", frame=f); ob.keyframe_insert("scale", frame=f); ob.keyframe_insert("rotation_euler", frame=f)
        if f % 2 == 0 or f == nf - 1:
            SETS[ep.get("set", "meadow")].animate_motes(s["motes"], f, key)
        c, t, lens = fr["camera"]
        cam.location = c; tgt.location = t; cam.data.lens = lens
        if key:
            cam.keyframe_insert("location", frame=f); tgt.keyframe_insert("location", frame=f)
            cam.data.keyframe_insert("lens", frame=f)
    return rig
