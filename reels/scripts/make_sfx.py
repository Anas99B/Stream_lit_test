"""Generate the brand's tiny UI sound set procedurally (original, licence-free).

    python3 -I scripts/make_sfx.py      -> public/sfx/{tick,pop,connect}.wav

Deliberately soft and short: speech must stay clearly dominant. Episodes
place them sparsely via the "sfx" list in episodes/<topic>/cues.json.
"""

import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sfx")


def env(n, decay):
    t = np.arange(n) / SR
    attack = np.minimum(1.0, t / 0.002)
    return attack * np.exp(-t / decay)


def tone(freq, dur, decay, f_end=None):
    n = int(SR * dur)
    f = np.linspace(freq, f_end or freq, n)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * env(n, decay)


def write(name, x, peak_db=-6.0):
    x = x / (np.abs(x).max() + 1e-9) * (10 ** (peak_db / 20))
    fade = min(len(x), int(0.004 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)
    pcm = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    os.makedirs(OUT, exist_ok=True)
    rng = np.random.default_rng(7)
    # tick: soft UI click
    n = int(SR * 0.05)
    click = tone(1900, 0.05, 0.010) + 0.15 * rng.standard_normal(n) * env(n, 0.003)
    write("tick.wav", click)
    # pop: an object appears (gentle upward sweep)
    write("pop.wav", tone(520, 0.09, 0.028, f_end=820) + 0.25 * tone(1040, 0.09, 0.018, f_end=1640))
    # connect: a link is made (two quick soft tones)
    a = tone(880, 0.11, 0.030)
    b = np.zeros_like(a)
    off = int(SR * 0.045)
    b[off:] = tone(1320, 0.11, 0.030)[: len(a) - off]
    write("connect.wav", a + 0.8 * b)


if __name__ == "__main__":
    main()
