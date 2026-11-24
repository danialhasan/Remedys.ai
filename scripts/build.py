#!/usr/bin/env python3
"""Rebuild this exported package from its included immutable public source."""
from pathlib import Path
import hashlib
import json
import shutil
from verify_export import verify

root = Path(__file__).resolve().parents[1]
source = root / 'site-source'
dist = root / 'dist'
report = verify(source)
manifest = json.loads((root / 'release-manifest.json').read_text())
intake_sources = manifest.get('native_intake')
if isinstance(intake_sources, dict):
    for filename, expected in intake_sources.items():
        if hashlib.sha256((root / filename).read_bytes()).hexdigest() != expected:
            raise SystemExit('Inquiry source differs from the reviewed export: ' + filename)
digest = hashlib.sha256(json.dumps(report['files'], sort_keys=True, separators=(',', ':')).encode()).hexdigest()
if digest != manifest['build_hash']:
    raise SystemExit('Public source differs from the reviewed export. Assemble a new candidate.')
if dist.exists():
    if dist.is_symlink():
        raise SystemExit('Refusing to replace a symlinked dist')
    shutil.rmtree(dist)
shutil.copytree(source, dist)
verify(dist)
print('Rebuilt 14 public routes + 404; build hash ' + digest)
