"""Set registry. Add new environments as modules exposing build(**params) and
return {"collection", "motes", "height"}."""
from . import meadow

SETS = {"meadow": meadow}
