# Generates Tiko's dialogue with Kokoro-82M (Apache-2.0) + childlike pitch shift.
import subprocess, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("/opt/tts/kokoro-v1.0.onnx", "/opt/tts/voices-v1.0.bin")
VOICE = "af_heart"
lines = {
 "01_whoa":   ("Whoaaa!", 1.0),
 "02_wait":   ("Hey! Wait for me!", 1.15),
 "03_flying": ("I'm flying!", 1.05),
 "04_wobble": ("Whoa, whoa, whoa!", 1.25),
 "05_giggle": ("Hee hee hee!", 1.1),
 "06_again":  ("Again!", 1.0),
}
for name, (text, speed) in lines.items():
    a, sr = k.create(text, voice=VOICE, speed=speed, lang="en-us")
    raw = f"assets/voice/{name}_raw.wav"; sf.write(raw, a, sr)
    # +3.5 semitones, formants shifted with pitch -> younger, cuter timbre; same identity for every line
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",raw,"-af",
        "rubberband=pitch=1.224:formant=shifted,highpass=f=90,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,aresample=48000",
        f"assets/voice/{name}.wav"], check=True)
    print(name, sf.info(f"assets/voice/{name}.wav").duration)
