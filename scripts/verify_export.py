#!/usr/bin/env python3
"""Offline assertions for the deliberately small production website export."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib
import json
import re
import xml.etree.ElementTree as ET

ROUTES = ('', 'services', 'consulting', 'automation', 'engineering', 'enablement',
          'implementation', 'about', 'manifesto', 'get-started', 'contact',
          'events', 'education', 'privacy')
PAGES = {r + '/index.html' if r else 'index.html' for r in ROUTES} | {'404.html'}
FORBIDDEN = ('Local preview:', 'mock inquiry', 'mock-confirmation',
             'Private design study', 'preview-banner', 'preview-note',
             '/alternatives/', '/assets/provisional/', '/assets/brand/',
             '[simulate error]', '[simulate delay]')
ECU = ('Shafan Khan and Danial Hasan led a Codex workshop for computer science '
       'faculty and graduate students at East Carolina University.')


def hashes(root):
    return {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(root.rglob('*')) if p.is_file()}


class HTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
        self.form = None
        self.fields = {}
        self.h1 = 0
        self.main = 0
        self.script_sources = []
        self.style_sources = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, f'duplicate id: {a["id"]}'
            self.ids.add(a['id'])
        self.h1 += tag == 'h1'
        self.main += tag == 'main'
        for key in ('href', 'src'):
            if key in a:
                self.links.append((tag, a[key]))
        if tag == 'form':
            assert self.form is None, 'more than one form'
            self.form = a
        if tag in ('input', 'textarea', 'select') and 'name' in a:
            self.fields[a['name']] = a
        if tag == 'script':
            assert a.get('src', '').startswith('/assets/'), 'inline or remote script'
            self.script_sources.append(a['src'])
        if tag == 'link' and a.get('rel') == 'stylesheet':
            assert a.get('href', '').startswith('/assets/'), 'remote stylesheet'
            self.style_sources.append(a['href'])
        assert not any(k.startswith('on') for k in a), 'inline event handler'
        if 'style' in a:
            raise AssertionError('inline style conflicts with production CSP')


def local_path(root, page, url):
    parsed = urlsplit(url)
    if parsed.scheme and (parsed.scheme not in ('http', 'https') or
                          parsed.hostname not in ('remedys.ai', 'www.remedys.ai')):
        return None, None
    path = unquote(parsed.path)
    target = (root / path.lstrip('/')) if path.startswith('/') else (page.parent / path)
    if not path:
        target = page
    elif not target.suffix:
        target = target / 'index.html'
    assert target.resolve().is_relative_to(root.resolve()), f'path escapes export: {url}'
    return target, parsed.fragment


def verify(root):
    root = Path(root)
    actual = {str(p.relative_to(root)) for p in root.rglob('*.html')}
    assert actual == PAGES, f'HTML allowlist mismatch: {actual ^ PAGES}'
    parsed = {}
    for rel in sorted(PAGES):
        page = root / rel
        source = page.read_text()
        for marker in FORBIDDEN:
            assert marker.lower() not in source.lower(), f'{rel}: private marker {marker}'
        item = HTML(); item.feed(source)
        assert item.h1 == item.main == 1, f'{rel}: main/H1 count'
        if rel != '404.html':
            assert 'content="noindex' not in source, f'{rel}: private robots directive'
        else:
            assert 'We couldn’t find that page.' in source, '404: missing-page explanation missing'
            assert 'href="/">Back to home' in source, '404: recovery link missing'
            assert 'class="growth-hero"' not in source, '404: homepage substituted for error content'
            assert 'content="noindex, follow"' in source, '404: indexing boundary missing'
        parsed[page] = item
    for page, item in parsed.items():
        for tag, link in item.links:
            target, fragment = local_path(root, page, link)
            if target is None:
                continue
            assert target.is_file(), f'{page.name}: missing {link}'
            if fragment:
                assert target in parsed and fragment in parsed[target].ids, f'missing anchor {link}'
    inquiry = parsed[root / 'get-started/index.html']
    assert inquiry.form['action'] == '/api/intake' and inquiry.form['method'] == 'post'
    assert set(inquiry.fields) == {'full_name', 'email', 'company', 'service', 'description', 'website'}
    for name in ('full_name', 'email', 'company', 'description'):
        assert 'required' in inquiry.fields[name], f'{name}: required boundary lost'
    js = (root / 'assets/site.js').read_text()
    assert "'Content-Type': 'application/json'" in js
    assert "fetch('/api/intake'" in js
    assert 'Local preview:' not in js
    assert 'Your inquiry has been received.' in js
    assert "status.focus()" in js
    assert 'data-submit-label' in js, 'enhanced button label/icon behavior lost'
    css = (root / 'assets/release.css').read_text()
    assert 'html:not([data-js]) #inquiry-form > :not(noscript)' in css
    assert 'display:none' in css
    assert '<noscript>' in (root / 'get-started/index.html').read_text()
    assert 'mailto:hello@remedys.ai' in (root / 'get-started/index.html').read_text()
    for rel in ('about/index.html', 'index.html'):
        assert f'<p>{ECU}</p>' in (root / rel).read_text(), 'workshop account must be factual prose'
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    locations = {e.text for e in ET.fromstring((root / 'sitemap.xml').read_text()).findall('s:url/s:loc', ns)}
    expected = {'https://remedys.ai/' + (r + '/' if r else '') for r in ROUTES}
    assert locations == expected, 'sitemap route mismatch'
    for asset in root.rglob('*'):
        assert not asset.is_symlink(), 'symlink in export'
        if asset.is_file() and asset.suffix in ('.js', '.css', '.html', '.txt', '.xml'):
            text = asset.read_text()
            for marker in FORBIDDEN:
                assert marker.lower() not in text.lower(), f'{asset.name}: private marker {marker}'
    return {'html_pages': len(PAGES), 'public_routes': len(ROUTES),
            'links_and_anchors': 'pass', 'private_markers': 'absent',
            'inquiry': 'JSON native endpoint; production success; no-JS email fallback',
            'workshop_account': 'editorial prose', 'files': hashes(root)}


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('dist', type=Path)
    args = parser.parse_args()
    print(json.dumps(verify(args.dist), indent=2))
