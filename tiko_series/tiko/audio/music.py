"""Original score arranger -> MIDI -> audio with licensed instrument samples.

The composition (themes, chords, arrangement rules) is original to the series. Audio is
rendered by FluidSynth with the FluidR3 GM soundfont (MIT licence), so the instruments are
real sampled pizzicato strings, glockenspiel, celesta, harp, bassoon, clarinet, strings,
timpani and percussion — no third-party music.

Score spec (in beats; 120 BPM => 1 beat = 0.5 s = 15 frames):
  {"bpm": 120, "end": 40,
   "chords": [(beat, "C"), (beat, "Am"), ...],
   "sections": [{"start": 0, "end": 4, "mood": "hook"}, ...],   moods: see ARRANGE
   "theme": "tiko_main" | [(beat, midi, dur_beats), ...],
   "hits": [{"beat": 14, "type": "harp_gliss"}, {"beat": 2.4, "type": "pickup"}],
   "sting": 38.8}
"""
import os, subprocess
import mido
from .. import config as K

# General MIDI programs (0-based)
GM = {"pizz": 45, "strings": 48, "harp": 46, "glock": 9, "celesta": 8, "xylo": 13, "bassoon": 70,
      "clarinet": 71, "flute": 73, "timpani": 47, "musicbox": 10, "marimba": 12, "tuba": 58}
CH = {"mel": 0, "bass": 1, "chord": 2, "glock": 3, "celesta": 4, "harp": 5, "pad": 6, "bassoon": 7,
      "clarinet": 8, "drums": 9, "timp": 10, "xylo": 11, "flute": 12}
PROG = {"mel": "pizz", "bass": "pizz", "chord": "pizz", "glock": "glock", "celesta": "celesta", "harp": "harp",
        "pad": "strings", "bassoon": "bassoon", "clarinet": "clarinet", "timp": "timpani", "xylo": "xylo", "flute": "flute"}
MIX = {  # channel: (volume, pan 0-127, reverb send)
    "mel": (100, 70, 50), "bass": (95, 50, 30), "chord": (60, 85, 45), "glock": (80, 80, 70), "celesta": (85, 60, 70),
    "harp": (85, 45, 70), "pad": (55, 64, 80), "bassoon": (100, 55, 30), "clarinet": (85, 75, 45), "drums": (70, 64, 35),
    "timp": (95, 64, 50), "xylo": (70, 90, 40), "flute": (80, 70, 60)}
DR = {"kick": 35, "shaker": 82, "wood_hi": 76, "wood_lo": 77, "triangle": 81, "crash": 49, "tamb": 54}

CHORDS = {"C": (48, [0, 4, 7]), "G": (43, [0, 4, 7]), "Am": (45, [0, 3, 7]), "F": (41, [0, 4, 7]),
          "Dm": (50, [0, 3, 7]), "Em": (40, [0, 3, 7]), "D": (50, [0, 4, 7]), "E": (40, [0, 4, 7]), "Bb": (46, [0, 4, 7])}

# Tiko's main theme (introduced in episode 1, "The Flying Apple"). Reuse/quote it in every episode.
THEMES = {
    "tiko_main": [(4, 76, .5), (4.5, 79, .5), (5, 84, .5), (5.5, 79, .5), (6, 81, .5), (6.5, 79, .5), (7, 76, 1),
                  (8, 72, .5), (8.5, 76, .5), (9, 81, .5), (9.5, 76, .5), (10, 77, .5), (10.5, 81, .5), (11, 84, .5), (11.5, 81, .5),
                  (12, 79, .5), (12.5, 83, .5), (13, 86, .5), (13.5, 83, .5),
                  (14, 79, .25), (14.25, 81, .25), (14.5, 83, .25), (14.75, 84, .25), (15, 86, 1),
                  (16, 84, 1), (17, 88, 1), (18, 91, 1.5), (19.5, 89, .5), (20, 88, 1), (21, 86, 1), (22, 83, 1), (23, 79, 1),
                  (24, 72, .5), (24.5, 79, .25), (25, 76, .5), (26, 74, .5), (26.5, 77, .25), (27, 81, .5),
                  (28, 79, .5), (28.5, 78, .5), (29, 77, .5), (29.5, 76, .5), (30, 75, .5), (30.5, 74, .5), (31, 72, 1),
                  (32, 76, 1), (33, 79, 1), (34, 84, 1), (35, 83, 1), (36, 72, .5), (36.5, 76, .5), (37.5, 79, .5)],
}

# which melody instrument and accompaniment layers each mood uses
ARRANGE = {
    "hook":   dict(mel=["mel"], layers=["bass_oompah", "offbeats"]),
    "chase":  dict(mel=["mel", "xylo"], layers=["bass_oompah", "offbeats", "shaker", "kick4"]),
    "build":  dict(mel=["mel", "xylo"], layers=["bass_oompah", "offbeats", "shaker", "timp_roll"]),
    "magic":  dict(mel=["glock", "flute"], layers=["pad", "harp_arp", "bass_half", "triangle"]),
    "comic":  dict(mel=["clarinet"], layers=["bassoon_oompah", "offbeats", "woodblocks"]),
    "gentle": dict(mel=["celesta"], layers=["pad", "harp_arp", "bass_one"]),
    "calm":   dict(mel=["flute"], layers=["pad", "bass_one", "harp_arp"]),
}


class Score:
    def __init__(self):
        self.ev = []  # (beat, dur, ch_name, note, vel)

    def note(self, beat, dur, ch, note, vel=90):
        if beat >= 0:
            self.ev.append((beat, dur, ch, int(note), int(max(1, min(127, vel)))))


def _chord_at(chords, b):
    cur = chords[0][1]
    for cb, name in chords:
        if cb <= b + 1e-6:
            cur = name
    return CHORDS[cur]


def _section_at(sections, b):
    for s in sections:
        if s["start"] <= b < s["end"]:
            return s
    return None


def arrange(spec):
    S = Score()
    chords, sections = spec["chords"], spec["sections"]
    theme = THEMES[spec["theme"]] if isinstance(spec.get("theme"), str) else spec.get("theme", [])
    for s in sections:
        a = ARRANGE[s["mood"]]
        for k in range(int(s["start"]), int(s["end"])):
            root, tri = _chord_at(chords, k)
            for layer in a["layers"]:
                if layer == "bass_oompah":
                    S.note(k, 0.45, "bass", root - 12 + (7 if k % 2 else 0), 95)
                elif layer == "bassoon_oompah":
                    S.note(k, 0.3, "bassoon", root - 12 + (7 if k % 2 else 0), 100)
                elif layer == "bass_half" and k % 2 == 0:
                    S.note(k, 1.8, "bass", root - 12, 80)
                elif layer == "bass_one" and k % 4 == 0:
                    S.note(k, 3.5, "bass", root - 12, 70)
                elif layer == "offbeats":
                    for iv in tri:
                        S.note(k + 0.5, 0.25, "chord", root + 12 + iv, 70)
                elif layer == "shaker":
                    S.note(k, 0.1, "drums", DR["shaker"], 55)
                    S.note(k + 0.5, 0.1, "drums", DR["shaker"], 80)
                elif layer == "kick4" and k % 4 == 0:
                    S.note(k, 0.2, "drums", DR["kick"], 70)
                elif layer == "woodblocks" and k % 2:
                    S.note(k, 0.1, "drums", DR["wood_hi"] if k % 4 == 1 else DR["wood_lo"], 90)
                elif layer == "triangle" and k % 4 == 0:
                    S.note(k, 0.5, "drums", DR["triangle"], 60)
                elif layer == "timp_roll":
                    for q in range(4):
                        S.note(k + q * 0.25, 0.2, "timp", root - 12, 50 + 10 * q)
                elif layer == "pad" and k % 2 == 0:
                    for iv in tri:
                        S.note(k, 2.0, "pad", root + 12 + iv, 60)
                elif layer == "harp_arp":
                    for q, iv in enumerate(tri):
                        S.note(k + q / 3, 0.9, "harp", root + 24 + iv, 70)
    for b, m, d in theme:
        s = _section_at(sections, b)
        if not s:
            continue
        for i, ch in enumerate(ARRANGE[s["mood"]]["mel"]):
            S.note(b, d * 0.85, ch, m + (12 if ch in ("glock", "celesta", "xylo") and m < 84 else 0), 100 - 25 * i)
    for h in spec.get("hits", []):
        b = h["beat"]
        if h["type"] == "tutti":
            root, tri = _chord_at(chords, b)
            for iv in [0] + tri + [12]:
                S.note(b, 1.0, "pad", root + 12 + iv, 100); S.note(b, 0.5, "chord", root + 24 + iv, 100)
            S.note(b, 1.2, "glock", 96, 100); S.note(b, 1.0, "timp", root - 12, 120); S.note(b, 1.5, "drums", DR["crash"], 60)
        elif h["type"] == "pickup":
            for i, m in enumerate([72, 74, 76, 79, 81, 84]):
                S.note(b + i * 0.24, 0.2, "mel", m, 85)
        elif h["type"] == "harp_gliss":
            for i, m in enumerate([60, 64, 67, 72, 76, 79, 84, 88, 91, 96]):
                S.note(b + i * 0.09, 1.2, "harp", m, 90)
        elif h["type"] == "slide_comic":
            for i, m in enumerate(range(79, 70, -1)):
                S.note(b + i * 0.25, 0.25, "bassoon", m - 24, 95)
    if spec.get("sting") is not None:
        b = spec["sting"]
        S.note(b - 0.5, 0.2, "mel", 79, 90); S.note(b - 0.25, 0.2, "mel", 83, 95)
        for m in (48, 55, 60, 64, 67, 72, 76):
            S.note(b, 1.5, "pad", m, 105); S.note(b, 0.6, "chord", m + 12, 110)
        for i, m in enumerate([84, 88, 91, 96]):
            S.note(b + i * 0.08, 1.5, "glock", m, 110)
        S.note(b, 1.0, "timp", 36, 120); S.note(b, 2.0, "drums", DR["crash"], 70)
    return S


def to_midi(score, bpm, path):
    tpb = 480
    mf = mido.MidiFile(type=1, ticks_per_beat=tpb)
    meta = mido.MidiTrack(); mf.tracks.append(meta)
    meta.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(bpm), time=0))
    by_ch = {}
    for b, d, ch, n, v in score.ev:
        by_ch.setdefault(ch, []).append((b, d, n, v))
    for ch, notes in by_ch.items():
        c = CH[ch]
        tr = mido.MidiTrack(); mf.tracks.append(tr)
        msgs = []
        vol, pan, rev = MIX[ch]
        msgs += [(0, mido.Message("control_change", channel=c, control=7, value=vol)),
                 (0, mido.Message("control_change", channel=c, control=10, value=pan)),
                 (0, mido.Message("control_change", channel=c, control=91, value=rev))]
        if ch != "drums":
            msgs.append((0, mido.Message("program_change", channel=c, program=GM[PROG[ch]])))
        for b, d, n, v in notes:
            t0 = int(round(b * tpb)); t1 = int(round((b + d) * tpb))
            msgs.append((t0, mido.Message("note_on", channel=c, note=n, velocity=v)))
            msgs.append((t1, mido.Message("note_off", channel=c, note=n, velocity=0)))
        msgs.sort(key=lambda x: (x[0], 0 if x[1].type in ("control_change", "program_change") else (1 if x[1].type == "note_off" else 2)))
        last = 0
        for t, m in msgs:
            tr.append(m.copy(time=t - last)); last = t
    mf.save(path)
    return path


def render(spec, out_wav, soundfont=None, gain=0.55):
    """Arrange + render. Returns path to a 48 kHz stereo wav."""
    soundfont = soundfont or K.SOUNDFONT
    mid = out_wav.replace(".wav", ".mid")
    to_midi(arrange(spec), spec.get("bpm", 120), mid)
    subprocess.run(["fluidsynth", "-ni", "-q", "-g", str(gain), "-r", str(K.AUDIO_SR), "-F", out_wav, soundfont, mid],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return out_wav
