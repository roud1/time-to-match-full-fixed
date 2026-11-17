# Writes Tiko_Shorts_001.srt and styled ASS (burned in) from the dialogue timeline.
import os
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "..")
SUBS = [(0.10, 1.25, "WHOA!"), (3.30, 4.75, "Hey! Wait for me!"), (8.55, 9.95, "I'm flying!"),
        (14.12, 15.45, "Whoa, whoa, whoa!"), (17.38, 18.50, "Hee hee hee!"), (18.58, 20.00, "Again!")]
def ts(t, sep=","):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{int(s):02d}{sep}{int(round((s - int(s)) * 1000)):03d}"
with open(os.path.join(OUT, "Tiko_Shorts_001.srt"), "w") as f:
    for i, (a, b, txt) in enumerate(SUBS, 1):
        f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{txt}\n\n")
ass = """[Script Info]
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
def ats(t):
    return f"{int(t//3600)}:{int(t%3600//60):02d}:{t%60:05.2f}"
for a, b, txt in SUBS:
    pop = r"{\fad(60,120)\fscx70\fscy70\t(0,120,\fscx112\fscy112)\t(120,220,\fscx100\fscy100)}"
    ass += f"Dialogue: 0,{ats(a)},{ats(b)},Tiko,,0,0,0,,{pop}{txt}\n"
open(os.path.join(H, "subs.ass"), "w").write(ass)
print("ok")
