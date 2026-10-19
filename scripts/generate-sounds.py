#!/usr/bin/env python3
"""
Generates the app's notification sounds (original, license-free) into assets/sounds/.

    python3 scripts/generate-sounds.py

Pure standard library: additive synthesis, Karplus–Strong plucked strings and a small
Schroeder reverb. Output is 16-bit mono 44.1 kHz WAV, peak-normalised, < 30 s (iOS limit).
"""
import math
import os
import random
import struct
import wave

RATE = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')

# Note frequencies (Hz). Eb4 is the Hijaz "half-flat-feeling" second against D.
D4, Eb4, Fs4, G4, A4 = 293.66, 311.13, 369.99, 392.00, 440.00
D5, E5, Fs5, Gs5, A5, B5, C5 = 587.33, 659.25, 739.99, 830.61, 880.00, 987.77, 523.25
A3, G4b = 220.00, 392.00


def silence(seconds):
    return [0.0] * int(seconds * RATE)


def mix_into(buf, sound, at_seconds, gain=1.0):
    start = int(at_seconds * RATE)
    need = start + len(sound)
    if need > len(buf):
        buf.extend([0.0] * (need - len(buf)))
    for i, s in enumerate(sound):
        buf[start + i] += s * gain


def envelope(n, attack, decay_tau):
    """Linear attack, then exponential decay with time constant decay_tau (seconds)."""
    a = max(1, int(attack * RATE))
    return [i / a if i < a else math.exp(-(i - a) / (decay_tau * RATE)) for i in range(n)]


def additive(freq, seconds, partials, attack=0.005):
    """partials: list of (ratio, amplitude, decay_tau)."""
    n = int(seconds * RATE)
    out = [0.0] * n
    for ratio, amp, tau in partials:
        f = freq * ratio
        if f > RATE / 2.2:
            continue
        env = envelope(n, attack, tau)
        w = 2 * math.pi * f / RATE
        for i in range(n):
            out[i] += amp * env[i] * math.sin(w * i)
    return out


def pluck(freq, seconds, damping=0.996, brightness=0.5, seed=1):
    """Karplus–Strong string (oud-like when slightly damped and filtered)."""
    rng = random.Random(seed)
    period = max(2, int(RATE / freq))
    # Softer excitation: low-passed noise burst for a warmer, nylon/gut-string attack.
    buf = [rng.uniform(-1, 1) for _ in range(period)]
    for _ in range(2):
        buf = [(buf[i] + buf[i - 1]) * 0.5 for i in range(period)]
    n = int(seconds * RATE)
    out = [0.0] * n
    idx = 0
    prev = 0.0
    for i in range(n):
        cur = buf[idx]
        nxt = buf[(idx + 1) % period]
        # Classic two-point average, then a one-pole low-pass: lower brightness = darker tone.
        lp = brightness * 0.5 * (cur + nxt) + (1 - brightness) * prev
        prev = lp
        buf[idx] = damping * lp
        out[i] = cur
        idx = (idx + 1) % period
    # Gentle attack to remove the click of the noise burst.
    for i in range(min(n, 120)):
        out[i] *= i / 120
    return out


def reverb(x, wet=0.25, room=0.82):
    """Small Schroeder reverb: 4 parallel combs + 2 series allpasses."""
    combs = [1557, 1617, 1491, 1422]
    allpasses = [225, 556]
    n = len(x) + int(1.6 * RATE)
    dry = x + [0.0] * (n - len(x))
    acc = [0.0] * n
    for d in combs:
        line = [0.0] * d
        j = 0
        for i in range(n):
            y = line[j]
            line[j] = dry[i] + y * room
            acc[i] += y
            j = (j + 1) % d
    acc = [a / len(combs) for a in acc]
    for d in allpasses:
        line = [0.0] * d
        j = 0
        out = [0.0] * n
        for i in range(n):
            b = line[j]
            y = -acc[i] + b
            line[j] = acc[i] + b * 0.5
            out[i] = y
            j = (j + 1) % d
        acc = out
    return [dry[i] * (1 - wet) + acc[i] * wet for i in range(n)]


def finish(x, name, peak=0.89, tail_fade=0.4):
    # Trim trailing near-silence, fade out, normalise.
    m = max(abs(s) for s in x) or 1.0
    thresh = m * 0.002
    end = len(x)
    while end > 0 and abs(x[end - 1]) < thresh:
        end -= 1
    x = x[: min(len(x), end + int(0.05 * RATE))]
    f = int(tail_fade * RATE)
    for i in range(min(f, len(x))):
        x[len(x) - 1 - i] *= i / f
    m = max(abs(s) for s in x) or 1.0
    x = [s / m * peak for s in x]
    assert len(x) / RATE < 30, f'{name} is too long for iOS'
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, s)) * 32767)) for s in x))
    print(f'{name}: {len(x) / RATE:.1f}s')


def oud():
    """Calm phrase in maqam Hijaz on D, plucked like an oud, with a soft drone."""
    phrase = [  # (freq, start, length)
        (D4, 0.00, 1.6), (Fs4, 0.42, 1.6), (G4, 0.84, 1.6), (A4, 1.26, 2.6),
        (G4, 2.30, 1.6), (Fs4, 2.72, 1.6), (Eb4, 3.14, 1.8), (D4, 3.62, 3.4),
    ]
    buf = silence(7.5)
    for k, (f, t, length) in enumerate(phrase):
        mix_into(buf, pluck(f, length, damping=0.9965, brightness=0.55, seed=k + 3), t, 0.9)
        # Octave-down pluck an instant later adds body, like a doubled course of strings.
        mix_into(buf, pluck(f / 2, length, damping=0.997, brightness=0.45, seed=k + 40), t + 0.012, 0.35)
    drone = additive(D4 / 2, 7.0, [(1, 0.10, 6.0), (2, 0.05, 4.0), (3, 0.02, 3.0)], attack=0.8)
    mix_into(buf, drone, 0.0, 1.0)
    return reverb(buf, wet=0.28, room=0.84)


def bell():
    """Two soft temple-bell strikes (inharmonic partials)."""
    partials = [(0.5, 0.35, 3.5), (1.0, 1.0, 2.8), (1.19, 0.4, 2.0), (1.56, 0.3, 1.6), (2.0, 0.5, 1.4), (2.74, 0.25, 0.9), (3.76, 0.15, 0.6)]
    buf = silence(6.0)
    mix_into(buf, additive(C5, 5.0, partials), 0.0, 1.0)
    mix_into(buf, additive(G4b, 4.5, partials), 1.4, 0.8)
    return reverb(buf, wet=0.22, room=0.8)


def chime():
    """Bright, short major-triad chime."""
    partials = [(1, 1.0, 0.9), (2, 0.25, 0.5), (3, 0.08, 0.3), (4.2, 0.05, 0.2)]
    buf = silence(3.0)
    for k, f in enumerate([E5, Gs5, B5]):
        mix_into(buf, additive(f, 2.2, partials, attack=0.004), k * 0.16, 0.8)
    return reverb(buf, wet=0.2, room=0.78)


def dawn():
    """Slow rising arpeggio with soft pads — gentle for Fajr."""
    buf = silence(7.0)
    for k, f in enumerate([D4, A4, D5, Fs5]):
        pad = additive(f, 5.0, [(1, 0.8, 2.5), (1.003, 0.5, 2.5), (2, 0.15, 1.5)], attack=0.35)
        mix_into(buf, pad, k * 0.55, 0.6)
    return reverb(buf, wet=0.3, room=0.85)


def reminder():
    """Two soft marimba knocks, falling — a nudge, not an alarm."""
    partials = [(1, 1.0, 0.25), (4, 0.2, 0.06), (10, 0.05, 0.02)]
    buf = silence(1.4)
    mix_into(buf, additive(A5, 0.8, partials, attack=0.002), 0.0, 0.9)
    mix_into(buf, additive(E5, 0.9, partials, attack=0.002), 0.22, 0.8)
    return reverb(buf, wet=0.15, room=0.7)


if __name__ == '__main__':
    finish(oud(), 'oud.wav')
    finish(bell(), 'bell.wav')
    finish(chime(), 'chime.wav')
    finish(dawn(), 'dawn.wav')
    finish(reminder(), 'reminder.wav', tail_fade=0.15)
