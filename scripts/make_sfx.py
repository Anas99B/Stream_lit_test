"""Generate the brand's motion-graphics sound kit procedurally (original, licence-free).

    python3 -I scripts/make_sfx.py      -> public/sfx/*.wav (48 kHz, stereo, 24-bit)

v2 kit, modelled on the reference showreel's sound design (measured from its
spectrogram: airy noise risers into section changes, a deep impact on the
big moment, crisp high ticks on UI beats, short whooshes on moves):

  riser.wav   1.4 s  band-passed noise sweeping 400 Hz -> 9 kHz, swelling, hard stop
  whoosh.wav  0.6 s  noise swept up then down with a stereo pan, soft attack
  impact.wav  0.9 s  sub drop 110 -> 42 Hz + soft noise transient, short tail
  tick.wav    0.06 s crisp high click (filtered transient + 3.4 kHz ping)
  pop.wav     0.16 s soft rounded blip for small reveals
  connect.wav 0.25 s two soft glassy tones for a link being made

Everything is band-limited away from 1-4 kHz where possible so the voice stays
clear, faded in/out (no clicks) and normalised to -6 dBFS peak. Episodes set
the per-sound gain in cues.json -> sfx.
"""

import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sfx")
rng = np.random.default_rng(20261009)


def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def onepole_lp(x, fc):
    """Time-varying one-pole low-pass; fc may be an array (Hz)."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def bandpass(x, fc, q=1.2, block=32):
    """Time-varying RBJ biquad band-pass (0 dB peak); coefficients updated every `block` samples."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    y = np.empty_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for start in range(0, len(x), block):
        w0 = 2 * np.pi * min(fc[start], SR * 0.45) / SR
        alpha = np.sin(w0) / (2 * q)
        a0 = 1 + alpha
        b0, b2 = alpha / a0, -alpha / a0
        a1, a2 = -2 * np.cos(w0) / a0, (1 - alpha) / a0
        for i in range(start, min(start + block, len(x))):
            xi = x[i]
            yi = b0 * xi + b2 * x2 - a1 * y1 - a2 * y2
            x2, x1, y2, y1 = x1, xi, y1, yi
            y[i] = yi
    return y


def highpass(x, fc):
    return x - onepole_lp(x, fc)


def fade(x, a=0.004, r=0.02):
    n = len(x)
    na, nr = int(SR * a), int(SR * r)
    env = np.ones(n)
    if na:
        env[:na] = np.linspace(0, 1, na) ** 2
    if nr:
        env[-nr:] *= np.linspace(1, 0, nr) ** 2
    return x * env


def stereo(left, right=None):
    return np.stack([left, left if right is None else right], axis=1)


def norm(x, peak_db=-6.0):
    return x / (np.abs(x).max() + 1e-12) * (10 ** (peak_db / 20))


def write(name, x):
    x = np.clip(x, -1, 1)
    pcm = (x * (2**23 - 1)).astype(np.int32)
    b = np.zeros((pcm.shape[0], pcm.shape[1], 3), dtype=np.uint8)
    for k in range(3):
        b[..., k] = (pcm >> (8 * k)) & 0xFF
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(b.tobytes())


def riser(dur=1.4):
    t = t_axis(dur)
    p = t / dur
    fc = 400 * (9000 / 400) ** (p**1.6)
    l = highpass(bandpass(rng.standard_normal(len(t)), fc, q=2.2), 300)
    r = highpass(bandpass(rng.standard_normal(len(t)), fc * 1.04, q=2.2), 300)
    swell = p**2.2
    shimmer = 0.15 * np.sin(2 * np.pi * (300 + 2200 * p**2) * t) * swell  # faint tonal glide
    l, r = (l + shimmer) * swell, (r + shimmer) * swell
    return norm(stereo(fade(l, 0.05, 0.012), fade(r, 0.05, 0.012)))


def whoosh(dur=0.6):
    t = t_axis(dur)
    p = t / dur
    shape = np.sin(np.pi * p) ** 1.6  # swell then decay
    fc = 500 + 3800 * np.sin(np.pi * np.clip(p * 1.05, 0, 1)) ** 2
    n = highpass(bandpass(rng.standard_normal(len(t)), fc, q=1.6), 250) * shape
    pan = np.linspace(-0.7, 0.7, len(t))  # moves across the field
    l, r = n * np.sqrt((1 - pan) / 2), n * np.sqrt((1 + pan) / 2)
    return norm(stereo(fade(l, 0.01, 0.05), fade(r, 0.01, 0.05)))


def impact(dur=0.9):
    t = t_axis(dur)
    f = 42 + (110 - 42) * np.exp(-t / 0.07)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28)
    knock = onepole_lp(rng.standard_normal(len(t)), 1800) * np.exp(-t / 0.018) * 0.6
    air = bandpass(rng.standard_normal(len(t)), 6000, q=0.8) * np.exp(-t / 0.05) * 0.08
    x = fade(body + knock + air, 0.001, 0.15)
    return norm(stereo(x))


def tick(dur=0.06):
    t = t_axis(dur)
    ping = np.sin(2 * np.pi * 3400 * t) * np.exp(-t / 0.008)
    snap = bandpass(rng.standard_normal(len(t)), 7000, q=1.0) * np.exp(-t / 0.003)
    x = fade(0.8 * ping + 0.6 * snap, 0.0005, 0.01)
    return norm(stereo(x))


def pop(dur=0.16):
    t = t_axis(dur)
    f = 380 + 520 * (1 - np.exp(-t / 0.03))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045)
    x += 0.2 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR) * np.exp(-t / 0.03)
    return norm(stereo(fade(x, 0.002, 0.03)))


def connect(dur=0.25):
    t = t_axis(dur)
    a = np.sin(2 * np.pi * 1320 * t) * np.exp(-t / 0.05)
    b = np.zeros_like(t)
    off = int(0.06 * SR)
    b[off:] = np.sin(2 * np.pi * 1980 * t[: len(t) - off]) * np.exp(-t[: len(t) - off] / 0.06)
    x = onepole_lp(a + 0.8 * b, 6000)
    return norm(stereo(fade(x, 0.002, 0.04)))


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [("riser", riser), ("whoosh", whoosh), ("impact", impact), ("tick", tick), ("pop", pop), ("connect", connect)]:
        write(f"{name}.wav", fn())
        print("wrote", name)


if __name__ == "__main__":
    main()
