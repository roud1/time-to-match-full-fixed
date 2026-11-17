"""Interpolation and easing helpers shared by motions, cameras and props."""
import math
import numpy as np
from scipy.interpolate import PchipInterpolator


def smooth(a, b, t):
    """Smoothstep 0->1 as t goes a->b."""
    if b == a:
        return 1.0 if t >= b else 0.0
    t = min(1.0, max(0.0, (t - a) / (b - a)))
    return t * t * (3 - 2 * t)


def ease_out_back(u, s=1.7):
    """Overshoot ease (for snappy cartoon poses)."""
    u = min(1.0, max(0.0, u)) - 1
    return 1 + u * u * ((s + 1) * u + s)


def pulse(t, c, w):
    return math.exp(-((t - c) / w) ** 2)


def lerp(a, b, u):
    return a + (b - a) * u


def lerp_t(a, b, u):
    return tuple(x + (y - x) * u for x, y in zip(a, b))


class Track:
    """Monotone cubic (PCHIP) track through (frame, value) keys; holds ends."""

    def __init__(self, keys):
        keys = sorted(keys)
        self.x = np.array([k[0] for k in keys], float)
        self.y = np.array([k[1] for k in keys], float)
        self.f = PchipInterpolator(self.x, self.y) if len(keys) > 1 else None

    def __call__(self, t):
        if self.f is None:
            return float(self.y[0])
        return float(self.f(min(max(t, self.x[0]), self.x[-1])))

    def velocity(self, t, h=0.5):
        return (self(t + h) - self(t - h)) / (2 * h)


class Spring:
    """Critically-damped-ish spring for secondary motion (ears, tail lag)."""

    def __init__(self, stiffness=0.18, damping=0.72):
        self.k, self.d = stiffness, damping
        self.x = 0.0
        self.v = 0.0

    def step(self, target):
        self.v = self.v * self.d + (target - self.x) * self.k
        self.x += self.v
        return self.x
