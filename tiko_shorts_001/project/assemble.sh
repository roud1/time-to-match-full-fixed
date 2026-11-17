#!/usr/bin/env bash
# Final edit: frames -> 1080x1920 (Lanczos) + soft magical bloom + burned subtitles + mixed audio.
# usage: assemble.sh <frames_dir> <out.mp4>
set -euo pipefail
H="$(cd "$(dirname "$0")" && pwd)"
FR="$1"; OUT="$2"
ffmpeg -y -hide_banner -loglevel error \
  -framerate 30 -start_number 0 -i "$FR/f%04d.png" \
  -i "$H/mix.wav" \
  -filter_complex "[0:v]scale=1080:1920:flags=lanczos,unsharp=5:5:0.45,format=gbrp,split[a][b];\
[b]curves=all='0/0 0.78/0 1/1',gblur=sigma=20[g];\
[a][g]blend=all_mode=screen:all_opacity=0.35,format=yuv420p,\
ass=$H/subs.ass:fontsdir=$H/../assets/fonts[v];\
[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[au]" \
  -map "[v]" -map "[au]" -frames:v 600 -t 20 \
  -c:v libx264 -profile:v high -preset slow -crf 16 -pix_fmt yuv420p -r 30 -g 30 -movflags +faststart \
  -c:a aac -b:a 192k -ar 48000 -ac 2 "$OUT"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,nb_frames -of compact "$OUT"
