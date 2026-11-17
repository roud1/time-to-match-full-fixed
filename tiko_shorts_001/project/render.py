# usage: python3 render.py <outdir> <frames: e.g. 0-599 or 10,40,90> [percent] [samples]
import bpy, sys, os, time
H = os.path.dirname(os.path.abspath(__file__))
out, spec = sys.argv[1], sys.argv[2]
pct = int(sys.argv[3]) if len(sys.argv) > 3 else 100
spp = int(sys.argv[4]) if len(sys.argv) > 4 else None
bpy.ops.wm.open_mainfile(filepath=os.path.join(H, "tiko_shorts_001.blend"))
sc = bpy.context.scene
sc.render.resolution_percentage = pct
sc.render.threads_mode = "AUTO"
if spp: sc.cycles.samples = spp
frames = []
for part in spec.split(","):
    if "-" in part:
        a, b = map(int, part.split("-")); frames += list(range(a, b + 1))
    else: frames.append(int(part))
os.makedirs(out, exist_ok=True)
for f in frames:
    p = os.path.join(out, f"f{f:04d}.png")
    if os.path.exists(p): continue
    t = time.time(); sc.frame_set(f); sc.render.filepath = p
    bpy.ops.render.render(write_still=True)
    print(f"frame {f} {time.time()-t:.1f}s", flush=True)
