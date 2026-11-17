#!/usr/bin/env python3
"""Tiko episode pipeline.

  python3 tools/make_episode.py episodes/ep002_dancing_star --stage preview
  python3 tools/make_episode.py episodes/ep002_dancing_star --stage final      (needs APPROVED file)

Stages (run in order; 'preview' = voice+blend+audio+subs+animatic):
  voice     synthesize dialogue with Tiko's fixed voice           -> build/voice/*.wav, build/timing.json
  blend     bake timeline and build the Blender scene              -> build/<id>.blend
  audio     music (soundfont) + SFX + dialogue mix                 -> build/mix.wav, build/stems/
  subs      subtitles                                              -> build/<id>.srt, build/subs.ass
  animatic  low-res every-3rd-frame render + video with sound      -> build/<id>_animatic.mp4
  render    frame render with --preset (final presets need APPROVED)
  assemble  final 1080x1920 30fps H.264/AAC MP4                     -> build/<ID>.mp4
  final     render (preset final) + assemble
"""
import argparse, importlib.util, json, os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
from tiko import config as K  # noqa: E402


def load_episode(ep_dir):
    spec = importlib.util.spec_from_file_location("episode", os.path.join(ep_dir, "episode.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.EPISODE


def paths(ep_dir, ep, frames_root):
    b = os.path.join(ep_dir, "build")
    os.makedirs(b, exist_ok=True)
    return {"build": b, "voice": os.path.join(b, "voice"), "timing": os.path.join(b, "timing.json"),
            "blend": os.path.join(b, f"{ep['id']}.blend"), "mix": os.path.join(b, "mix.wav"), "stems": os.path.join(b, "stems"),
            "music": os.path.join(b, "stems", "music_raw.wav"), "srt": os.path.join(b, f"{ep['id']}.srt"),
            "ass": os.path.join(b, "subs.ass"), "frames": os.path.join(frames_root, ep["id"]),
            "animatic": os.path.join(b, f"{ep['id']}_animatic.mp4"), "mp4": os.path.join(b, f"Tiko_{ep['id'].upper()}.mp4")}


def st_voice(ep, P, force=False):
    from tiko.audio import voice
    timing = voice.make_lines(ep["lines"], P["voice"], force=force)
    json.dump(timing, open(P["timing"], "w"), indent=1)
    for t in timing:
        print(f"  {t['id']:12s} f{t['start']:4d}-{t['end']:4d}  {t['dur']:.2f}s  {t['text']}")
        nxt = [u for u in timing if u["start"] > t["start"]]
        if nxt and t["end"] > nxt[0]["start"]:
            print(f"  WARNING: line {t['id']} overlaps {nxt[0]['id']}")
    return timing


def _timing(P):
    return json.load(open(P["timing"]))


def st_blend(ep, P):
    from tiko.audio import voice
    from tiko.anim import timeline
    timing = _timing(P)
    frames, events = timeline.bake(ep, voice.lipsync(timing, ep["frames"]))
    json.dump(events, open(os.path.join(P["build"], "events.json"), "w"))
    import bpy
    from tiko.blender import scene
    asset = K.CHARACTER_BLEND if os.path.exists(K.CHARACTER_BLEND) else None
    scene.build_episode(ep, frames, character_blend=asset)
    scene.render_settings("CYCLES", 67, 12)
    bpy.ops.wm.save_as_mainfile(filepath=P["blend"], compress=True)
    print("  saved", P["blend"], "(character from asset)" if asset else "(character built fresh)")
    return frames, events


def st_audio(ep, P):
    import numpy as np
    from tiko.audio import music, sfx, mix
    from tiko.anim import timeline
    os.makedirs(P["stems"], exist_ok=True)
    timing = _timing(P)
    ev_path = os.path.join(P["build"], "events.json")
    if os.path.exists(ev_path):
        events = [tuple(e) for e in json.load(open(ev_path))]
        frames = None
    else:
        frames, events = timeline.bake(ep, None)
    music.render(ep["music"], P["music"])
    track = sfx.render_events(events, ep["frames"], K.FPS)
    for name, spec in ep.get("props", {}).items():
        if spec.get("rumble"):
            if frames is None:
                frames, _ = timeline.bake(ep, None)
            xs = np.array([fr["props"][name][0] for fr in frames])
            sp = np.linalg.norm(np.gradient(xs, axis=0), axis=1) * K.FPS
            r = sfx.rumble(sp, K.FPS)
            track[:len(r), 0] += r
            track[:len(r), 1] += r
    mix.mix(ep["frames"], timing, P["music"], track, P["mix"], stems_dir=P["stems"])
    print("  mix ->", P["mix"])


def st_subs(ep, P):
    from tiko import post
    post.subtitles(_timing(P), ep["frames"] / K.FPS, P["srt"], P["ass"])
    print("  subs ->", P["srt"])


def render_frames(P, preset, frames_dir, nframes, step=None):
    import bpy
    pr = K.RENDER_PRESETS[preset]
    bpy.ops.wm.open_mainfile(filepath=P["blend"])
    from tiko.blender import scene
    scene.render_settings(pr["engine"], pr["percent"], pr["samples"])
    sc = bpy.context.scene
    os.makedirs(frames_dir, exist_ok=True)
    step = step or pr.get("step", 1)
    t_all = time.time()
    for f in range(0, nframes, step):
        out = os.path.join(frames_dir, f"f{f:04d}.png")
        if os.path.exists(out):
            continue
        t = time.time()
        sc.frame_set(f)
        sc.render.filepath = out
        bpy.ops.render.render(write_still=True)
        print(f"  frame {f} {time.time() - t:.1f}s", flush=True)
    print(f"  rendered in {time.time() - t_all:.0f}s")


def st_animatic(ep, P):
    d = os.path.join(P["frames"], "animatic")
    render_frames(P, "animatic", d, ep["frames"])
    audio = ["-i", P["mix"]] if os.path.exists(P["mix"]) else []
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", "10", "-pattern_type", "glob", "-i", os.path.join(d, "f*.png")] + audio + \
          ["-vf", "scale=540:960:flags=lanczos", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30"] + \
          (["-c:a", "aac", "-shortest"] if audio else []) + [P["animatic"]]
    subprocess.run(cmd, check=True)
    print("  animatic ->", P["animatic"])


def st_render(ep, P, preset, ep_dir, approve=False):
    if K.RENDER_PRESETS[preset].get("locked") and not (os.path.exists(os.path.join(ep_dir, "APPROVED")) or approve):
        sys.exit(f"Preset '{preset}' is a full render. Approve the animatic first: create {ep_dir}/APPROVED")
    render_frames(P, preset, os.path.join(P["frames"], preset), ep["frames"])


def st_assemble(ep, P, preset):
    from tiko import post
    post.assemble(os.path.join(P["frames"], preset), P["mix"], P["ass"], P["mp4"], ep["frames"])
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_name,width,height,r_frame_rate,nb_frames",
                          "-of", "compact", P["mp4"]], capture_output=True, text=True).stdout
    print(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode_dir")
    ap.add_argument("--stage", required=True, choices=["voice", "blend", "audio", "subs", "animatic", "preview", "render", "assemble", "final"])
    ap.add_argument("--preset", default="final", choices=list(K.RENDER_PRESETS))
    ap.add_argument("--frames-root", default=os.environ.get("TIKO_FRAMES", "/tmp/tiko_frames"))
    ap.add_argument("--force", action="store_true", help="re-synthesize voice lines")
    ap.add_argument("--i-approve", action="store_true", help="bypass the APPROVED check (explicit consent)")
    a = ap.parse_args()
    ep = load_episode(a.episode_dir)
    P = paths(a.episode_dir, ep, a.frames_root)
    print(f"== {ep['id']} '{ep['title']}' stage={a.stage}")
    st = a.stage
    if st in ("voice", "preview"):
        st_voice(ep, P, a.force)
    if st in ("blend", "preview"):
        st_blend(ep, P)
    if st in ("audio", "preview"):
        st_audio(ep, P)
    if st in ("subs", "preview"):
        st_subs(ep, P)
    if st in ("animatic", "preview"):
        st_animatic(ep, P)
    if st in ("render", "final"):
        st_render(ep, P, a.preset, a.episode_dir, a.i_approve)
    if st in ("assemble", "final"):
        st_assemble(ep, P, a.preset)


if __name__ == "__main__":
    main()
