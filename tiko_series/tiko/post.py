"""Subtitles (SRT + styled ASS) and final MP4 assembly (1080x1920, 30 fps, H.264 + AAC)."""
import os, subprocess
from . import config as K

ASS_HEAD = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Tiko,Fredoka,96,&H00FFFFFF,&H00FFFFFF,&H00402A1E,&H90000000,-1,0,0,0,100,100,1,0,1,8,4,2,120,120,440,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def _srt_ts(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def _ass_ts(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def subtitles(timing, duration, srt_path, ass_path, min_dur=0.9):
    subs = []
    for i, ln in enumerate(timing):
        a = max(0.0, ln["start"] / K.FPS - 0.05)
        b = max(a + min_dur, ln["start"] / K.FPS + ln["dur"] + 0.45)
        if i + 1 < len(timing):
            b = min(b, timing[i + 1]["start"] / K.FPS - 0.05)
        subs.append((a, min(b, duration), ln.get("sub", ln["text"])))
    with open(srt_path, "w") as f:
        for i, (a, b, t) in enumerate(subs, 1):
            f.write(f"{i}\n{_srt_ts(a)} --> {_srt_ts(b)}\n{t}\n\n")
    pop = r"{\fad(60,120)\fscx70\fscy70\t(0,120,\fscx112\fscy112)\t(120,220,\fscx100\fscy100)}"
    with open(ass_path, "w") as f:
        f.write(ASS_HEAD)
        for a, b, t in subs:
            f.write(f"Dialogue: 0,{_ass_ts(a)},{_ass_ts(b)},Tiko,,0,0,0,,{pop}{t}\n")
    return subs


def assemble(frames_dir, audio_wav, ass_path, out_mp4, nframes, bloom=0.35):
    dur = nframes / K.FPS
    fc = (f"[0:v]scale={K.WIDTH}:{K.HEIGHT}:flags=lanczos,unsharp=5:5:0.45,format=gbrp,split[a][b];"
          f"[b]curves=all='0/0 0.78/0 1/1',gblur=sigma=20[g];"
          f"[a][g]blend=all_mode=screen:all_opacity={bloom},format=yuv420p,"
          f"ass={ass_path}:fontsdir={K.FONTS}[v];"
          f"[1:a]loudnorm=I={K.LOUDNESS_LUFS}:TP={K.TRUE_PEAK}:LRA=11,aresample={K.AUDIO_SR}[au]")
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-framerate", str(K.FPS), "-start_number", "0",
           "-i", os.path.join(frames_dir, "f%04d.png"), "-i", audio_wav, "-filter_complex", fc,
           "-map", "[v]", "-map", "[au]", "-frames:v", str(nframes), "-t", f"{dur:.3f}",
           "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
           "-r", str(K.FPS), "-g", str(K.FPS), "-movflags", "+faststart",
           "-c:a", "aac", "-b:a", "192k", "-ar", str(K.AUDIO_SR), "-ac", "2", out_mp4]
    subprocess.run(cmd, check=True)
    return out_mp4
