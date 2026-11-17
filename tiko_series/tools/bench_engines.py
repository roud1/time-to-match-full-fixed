#!/usr/bin/env python3
"""Eevee vs Cycles on identical frames of a scene.

usage: python3 tools/bench_engines.py <scene.blend> --frames 5,150,270,530 --out docs/bench
Renders every configuration below on the same frames, measures wall time per frame (Eevee's first
frame includes shader compilation and is reported separately), and compares each image to a
high-quality Cycles reference (100 %, 128 spp) with PSNR and SSIM. Writes a markdown report and
side-by-side crops.
"""
import os, sys, time, json, argparse
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import bpy  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402
from scipy.ndimage import gaussian_filter  # noqa: E402
from tiko import config as K  # noqa: E402
from tiko.blender import scene  # noqa: E402

CONFIGS = [  # name, engine, percent, samples
    ("reference_cycles_100pct_128spp", "CYCLES", 100, 128),
    ("cycles_67pct_12spp (ep1 final)", "CYCLES", 67, 12),
    ("cycles_100pct_32spp", "CYCLES", 100, 32),
    ("eevee_67pct_16", "BLENDER_EEVEE", 67, 16),
    ("eevee_100pct_32", "BLENDER_EEVEE", 100, 32),
]


def ssim(a, b):
    a = a.mean(2); b = b.mean(2)
    C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    mu_a, mu_b = gaussian_filter(a, 1.5), gaussian_filter(b, 1.5)
    va = gaussian_filter(a * a, 1.5) - mu_a ** 2
    vb = gaussian_filter(b * b, 1.5) - mu_b ** 2
    cov = gaussian_filter(a * b, 1.5) - mu_a * mu_b
    return float((((2 * mu_a * mu_b + C1) * (2 * cov + C2)) / ((mu_a ** 2 + mu_b ** 2 + C1) * (va + vb + C2))).mean())


def psnr(a, b):
    mse = ((a - b) ** 2).mean()
    return float(10 * np.log10(255 ** 2 / max(mse, 1e-9)))


ap = argparse.ArgumentParser()
ap.add_argument("blend"); ap.add_argument("--frames", default="5,150,270,530"); ap.add_argument("--out", default=os.path.join(ROOT, "docs", "bench"))
a = ap.parse_args()
frames = [int(x) for x in a.frames.split(",")]
os.makedirs(a.out, exist_ok=True)
res = {}
for name, eng, pct, spp in CONFIGS:
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.blend))
    scene.render_settings(eng, pct, spp)
    sc = bpy.context.scene
    times = []
    for f in frames:
        sc.frame_set(f)
        sc.render.filepath = os.path.join(a.out, f"{name.split(' ')[0]}_f{f:04d}.png")
        t = time.time(); bpy.ops.render.render(write_still=True); times.append(time.time() - t)
        print(name, f, f"{times[-1]:.1f}s", flush=True)
    res[name] = {"engine": eng, "percent": pct, "samples": spp, "times": times}
ref = CONFIGS[0][0]
for name in res:
    q = []
    for f in frames:
        A = np.asarray(Image.open(os.path.join(a.out, f"{ref.split(' ')[0]}_f{f:04d}.png")).convert("RGB"), float)
        Bi = Image.open(os.path.join(a.out, f"{name.split(' ')[0]}_f{f:04d}.png")).convert("RGB").resize((A.shape[1], A.shape[0]), Image.LANCZOS)
        B = np.asarray(Bi, float)
        q.append((psnr(A, B), ssim(A, B)))
    res[name]["psnr"] = float(np.mean([x[0] for x in q])); res[name]["ssim"] = float(np.mean([x[1] for x in q]))
json.dump(res, open(os.path.join(a.out, "results.json"), "w"), indent=1)

# side-by-side comparison crops (centre of each frame)
font = ImageFont.truetype(os.path.join(K.FONTS, "Fredoka_700Bold.ttf"), 28)
for f in frames:
    tiles = []
    for name in res:
        im = Image.open(os.path.join(a.out, f"{name.split(' ')[0]}_f{f:04d}.png")).convert("RGB").resize((1080, 1920), Image.LANCZOS)
        tiles.append((name, im.crop((240, 560, 840, 1360))))
    S = Image.new("RGB", (600 * len(tiles), 860), (30, 30, 30))
    d = ImageDraw.Draw(S)
    for i, (n, t) in enumerate(tiles):
        S.paste(t, (i * 600, 60)); d.text((i * 600 + 300, 30), n.split(" ")[0], font=font, fill=(255, 255, 255), anchor="mm")
    S.save(os.path.join(a.out, f"compare_f{f:04d}.jpg"), quality=90)

with open(os.path.join(a.out, "REPORT.md"), "w") as fh:
    fh.write(f"# Eevee vs Cycles — {os.path.basename(a.blend)}, frames {frames}\n\nCPU only (4 cores, no GPU; Eevee via Mesa llvmpipe software OpenGL).\n\n")
    fh.write("| Config | Engine | Res % | Samples | s/frame (mean) | first frame | est. 600 frames | PSNR vs ref | SSIM vs ref |\n|---|---|---|---|---|---|---|---|---|\n")
    for n, r in res.items():
        t = r["times"]; mean = float(np.mean(t[1:] if len(t) > 1 else t))
        fh.write(f"| {n} | {r['engine']} | {r['percent']} | {r['samples']} | {mean:.1f} | {t[0]:.1f} | {mean * 600 / 3600:.1f} h | "
                 f"{'ref' if n == ref else f'{r['psnr']:.1f} dB'} | {'ref' if n == ref else f'{r['ssim']:.3f}'} |\n")
print(open(os.path.join(a.out, "REPORT.md")).read())
