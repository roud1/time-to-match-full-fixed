"""Small DSP toolkit shared by SFX, mixing and the fallback synth instruments."""
import numpy as np
from scipy.signal import butter, sosfilt
from .. import config as K

SR = K.AUDIO_SR
_rng = np.random.default_rng(11)


def rng():
    return _rng


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def noise(d):
    return _rng.uniform(-1, 1, int(SR * d))


def env_ad(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def stereo(n):
    return np.zeros((n, 2))


def add(dst, sig, t0, gain=1.0, pan=0.0):
    """Mix mono `sig` into stereo `dst` at time t0 (s) with constant-power pan (-1..1)."""
    i0 = int(round(t0 * SR))
    if i0 >= len(dst):
        return
    if i0 < 0:
        sig = sig[-i0:]
        i0 = 0
    n = min(len(sig), len(dst) - i0)
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    dst[i0:i0 + n, 0] += sig[:n] * gain * l * 1.414
    dst[i0:i0 + n, 1] += sig[:n] * gain * r * 1.414
