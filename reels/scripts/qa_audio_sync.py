"""Audio QA for a rendered episode master (no listening required).

    python3 -I scripts/qa_audio_sync.py <master.mp4> <episodeDir>

1. Sync: cross-correlates the master's audio envelope with the processed
   narration (placed with the timeline's lead-in) in an opening, a middle and
   a closing window -> lag in ms (0 = in sync).
2. Pauses: every pause >= 0.25 s in the narration (mapped through the edit
   list) must be quiet in the master too, unless a sound effect plays there.
3. Captions: each caption that starts after a pause must start within one
   timebase frame of a speech onset in the master.
4. Loudness: EBU R128 integrated / true peak via ffmpeg.
"""

import json
import re
import subprocess
import sys

import numpy as np

SR = 16000


def load(path, extra=()):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, *extra, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def env_db(x, hop=0.01):
    h = int(hop * SR)
    n = len(x) // h
    frames = x[: n * h].reshape(n, h)
    return 20 * np.log10(np.sqrt((frames**2).mean(1)) + 1e-9)


def main():
    master, ep = sys.argv[1], sys.argv[2].rstrip("/")
    tl = json.load(open(f"{ep}/timeline.json"))
    caps = json.load(open(f"{ep}/captions.json"))
    words = json.load(open(f"{ep}/narration-words.raw.json"))["words"]
    fps = tl["fps"]
    lead = tl["audio"]["segments"][0]["from"] / fps
    gain = tl["audio"].get("gain", 0.87)

    m = load(master)
    n = load(f"public/{tl['audio']['src']}") * gain
    n = np.concatenate([np.zeros(int(lead * SR), np.float32), n])
    n = np.pad(n, (0, max(0, len(m) - len(n))))[: len(m)]
    em, en = env_db(m), env_db(n)

    print(f"master {len(m)/SR:.2f} s, narration placed at +{lead:.3f} s, gain {gain}")

    # 1. sync windows
    dur = len(m) / SR
    for name, a in [("opening", 0.0), ("middle", dur / 2 - 6), ("closing", dur - 14)]:
        i0, i1 = int(a * 100), int((a + 12) * 100)
        x, y = em[i0:i1], en[i0:i1]
        x = (x - x.mean()) / (x.std() + 1e-9)
        y = (y - y.mean()) / (y.std() + 1e-9)
        lags = range(-30, 31)
        c = [np.sum(x[max(0, l): len(x) + min(0, l)] * y[max(0, -l): len(y) - max(0, l)]) for l in lags]
        print(f"sync {name:8s} {a:6.1f}-{a+12:6.1f} s: lag {list(lags)[int(np.argmax(c))]*10:+d} ms")

    # 2. pauses
    sfx = [(e["frame"] / fps, e["sound"]) for e in tl["sfx"]["events"]]
    sfx_len = {"tick": 0.25, "pop": 0.35, "connect": 0.7, "whoosh": 0.9, "riser": 1.5, "impact": 1.4}
    pauses = [(words[i]["end"] + lead, words[i + 1]["start"] + lead) for i in range(len(words) - 1) if words[i + 1]["start"] - words[i]["end"] >= 0.25]
    quiet = covered = loud = 0
    for a, b in pauses:
        seg = em[int((a + 0.05) * 100): int((b - 0.05) * 100)]
        lvl = seg.max() if len(seg) else -120
        has_sfx = any(s < b and s + sfx_len[k] > a for s, k in sfx)
        if lvl < -38:
            quiet += 1
        elif has_sfx:
            covered += 1
        else:
            loud += 1
            print(f"  pause {a:.2f}-{b:.2f} s not quiet ({lvl:.1f} dB), no SFX")
    print(f"pauses: {len(pauses)} total -> {quiet} quiet in master, {covered} filled by a sound effect, {loud} unexplained")

    # 3. caption starts vs speech onsets (captions that follow a pause)
    worst = 0.0
    checked = 0
    for c in caps:
        t0 = c["startFrame"] / fps
        before = em[int((t0 - 0.30) * 100): int((t0 - 0.08) * 100)]
        if len(before) == 0 or before.max() > -38:
            continue
        seg = em[int((t0 - 0.2) * 100): int((t0 + 0.3) * 100)]
        on = np.argmax(seg > -30)
        onset = t0 - 0.2 + on / 100
        worst = max(worst, abs(onset - t0))
        checked += 1
    print(f"captions after a pause: {checked} checked, worst |caption start - speech onset| = {worst*1000:.0f} ms (1 frame = {1000/fps:.0f} ms)")

    # 4. loudness
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", master, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    summ = r[r.rfind("Summary:"):]
    i = re.search(r"I:\s+(-?[\d.]+) LUFS", summ)
    tp = re.search(r"Peak:\s+(-?[\d.]+) dBFS", summ)
    print(f"loudness: integrated {i.group(1)} LUFS, true peak {tp.group(1)} dBFS")


if __name__ == "__main__":
    main()
