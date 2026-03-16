---
name: audio-tools
description: Audio file processing utilities including format conversion using ffmpeg. Use when converting audio formats or extracting audio from video files.
---

# Audio Tools

Convert audio files using ffmpeg.

## Conversions

- OGG to MP3: `ffmpeg -i input.ogg output.mp3`
- OGG to WAV: `ffmpeg -i input.ogg output.wav`
- MP3 to WAV: `ffmpeg -i input.mp3 output.wav`

## Extract audio from video

`ffmpeg -i video.mp4 -vn -acodec copy output.aac`
