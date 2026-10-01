"""Run from a LinePulse checkout with its Python dependencies installed.

python /path/to/reproduce-linepulse-evidence.py
Uses the existing test fixture, never the public demo or production data.
"""
import json
from pathlib import Path
import runpy
import sys

sys.path.insert(0, str(Path.cwd()))
from app.analytics import calculate_kpis, detect_alerts  # noqa: E402

event = runpy.run_path("tests/test_analytics.py")["event"]
events = [event(cutting_pressure_bar=7.6, good_units=8, reject_units=2,
                defect_type="Edge chip", scenario="pressure_drift") for _ in range(24)]
kpis = calculate_kpis(events)
alert = next(a for a in detect_alerts(events) if a.code == "PRESSURE_DRIFT")
assert kpis["good_units"] == 192
assert kpis["reject_units"] == 48
assert kpis["scrap_rate"] == 20.0
assert alert.severity == "critical"
print(json.dumps({
    "reference_commit": "643350db705fd21ba02123e3877678e1073358ac",
    "dataset": "24 identical synthetic events from the analytics test fixture",
    "input": {"events": 24, "pressure_bar": 7.6, "good_units_per_event": 8, "reject_units_per_event": 2},
    "result": {"good_units": kpis["good_units"], "reject_units": kpis["reject_units"], "scrap_rate_percent": kpis["scrap_rate"]},
    "pressure_alert": alert.__dict__,
}, indent=2))
