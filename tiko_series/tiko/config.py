"""Series-wide constants. Changing these changes every future episode."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
FONTS = os.path.join(ASSETS, "fonts")
CHARACTER_BLEND = os.path.join(ASSETS, "character", "tiko_character.blend")

# Delivery format (YouTube Shorts)
FPS = 30
WIDTH, HEIGHT = 1080, 1920
AUDIO_SR = 48000
LOUDNESS_LUFS = -14.0
TRUE_PEAK = -1.5

# Tiko's permanent voice (Kokoro-82M, Apache-2.0). Do not change between episodes.
TTS_MODEL = os.environ.get("TIKO_TTS_MODEL", "/opt/tts/kokoro-v1.0.onnx")
TTS_VOICES = os.environ.get("TIKO_TTS_VOICES", "/opt/tts/voices-v1.0.bin")
TIKO_VOICE = "af_heart"
TIKO_PITCH_RATIO = 1.224          # +3.5 semitones
TIKO_VOICE_FILTER = ("rubberband=pitch={p}:formant=shifted,highpass=f=90,"
                     "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                     "silenceremove=start_periods=1:start_threshold=-45dB,areverse,aresample=48000")

# Licensed instrument samples (FluidR3 GM, MIT licence: /usr/share/doc/fluid-soundfont-gm/copyright)
SOUNDFONT = os.environ.get("TIKO_SOUNDFONT", "/usr/share/sounds/sf2/FluidR3_GM.sf2")

# Tiko's palette (from the reference sheet) — single source of truth
MINT = (0.24, 0.70, 0.64)
MINT_L = (0.40, 0.80, 0.72)
MINT_D = (0.17, 0.55, 0.52)
CREAM = (0.96, 0.86, 0.64)
CREAM_W = (1.0, 0.80, 0.45)
PAPER_EDGE = (0.99, 0.96, 0.88)   # light core of folded paper on creases
GOLD = (1.0, 0.74, 0.25)
GOLD_EMIT = (1.0, 0.55, 0.08)
AMBER = (0.85, 0.42, 0.06)
BLUSH = (1.0, 0.55, 0.55)

# Render quality presets. "final*" presets are locked behind episode approval.
RENDER_PRESETS = {
    "animatic": dict(engine="CYCLES", percent=20, samples=4, step=3),
    "preview":  dict(engine="CYCLES", percent=33, samples=8, step=1),
    "eevee_preview": dict(engine="BLENDER_EEVEE", percent=50, samples=16, step=1),
    "final":    dict(engine="CYCLES", percent=67, samples=12, step=1, locked=True),
    "final_native": dict(engine="CYCLES", percent=100, samples=32, step=1, locked=True),
    "final_eevee": dict(engine="BLENDER_EEVEE", percent=100, samples=32, step=1, locked=True),
}
