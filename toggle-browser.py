#!/usr/bin/env python3
import json
import shutil
import sys
from pathlib import Path

DIR = Path(__file__).parent
MANIFEST = DIR / "manifest.json"
BRAVE_MANIFEST = DIR / "manifest-brave.json"
FIREFOX_MANIFEST = DIR / "manifest-firefox.json"

def detect_browser(manifest: dict) -> str:
    bg = manifest.get("background", {})
    if "service_worker" in bg:
        return "brave"
    if "scripts" in bg:
        return "firefox"
    return "unknown"

def main():
    data = json.loads(MANIFEST.read_text())
    current = detect_browser(data)

    if current == "brave":
        shutil.copy(FIREFOX_MANIFEST, MANIFEST)
        print("Switched manifest.json → Firefox (MV2)")
    elif current == "firefox":
        shutil.copy(BRAVE_MANIFEST, MANIFEST)
        print("Switched manifest.json → Brave/Chrome (MV3)")
    else:
        print(f"Unknown manifest type. background field: {data.get('background')}")
        sys.exit(1)

if __name__ == "__main__":
    main()
