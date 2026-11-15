import json, sys
import av
_av_open = av.open
av.open = lambda *a, **k: _av_open(*a, **{x: y for x, y in k.items() if x != "metadata_errors"})
from faster_whisper import WhisperModel

model = WhisperModel("small", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    sys.argv[1] if len(sys.argv) > 1 else "src.mp4",
    language="zh",
    word_timestamps=True,
    vad_filter=True,
    vad_parameters=dict(min_silence_duration_ms=300),
)
out = []
for seg in segments:
    out.append({
        "start": round(seg.start, 3),
        "end": round(seg.end, 3),
        "text": seg.text,
        "words": [{"w": w.word, "s": round(w.start, 3), "e": round(w.end, 3)} for w in (seg.words or [])],
    })
json.dump({"lang": info.language, "segs": out}, open(sys.argv[2] if len(sys.argv) > 2 else "transcript.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"segments={len(out)} lang={info.language}")
