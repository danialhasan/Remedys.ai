"""Assert route/link/public-boundary invariants against the actual build output."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import sys

root=Path(__file__).resolve().parents[1]/'dist'
errors=[]
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.links=[];self.ids=set();self.h1=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:
            if a['id'] in self.ids: errors.append('duplicate ID '+a['id'])
            self.ids.add(a['id'])
        if tag=='h1':self.h1+=1
        if tag in ('a','img','script','link'):
            value=a.get('href',a.get('src',''))
            if value:self.links.append(value)
        if tag=='img' and 'alt' not in a: errors.append('image missing alt')
        if tag=='form' and (a.get('method')!='post' or a.get('action')!='/api/intake'):errors.append('unsafe form fallback')

pages={}
for file in root.rglob('*.html'):
    parser=Page();text=file.read_text();parser.feed(text);pages[file]=parser
    if parser.h1!=1: errors.append(str(file)+' must have one h1')
    for dead in ['posthog','gsap','data-diagnostic','fonts.googleapis','api.fontshare','localStorage','<style','application/ld+json']:
        if dead in text:errors.append(str(file)+' retains '+dead)
for file,page in pages.items():
    for link in page.links:
        url=urlsplit(link)
        if url.scheme or url.netloc:continue
        dest=(root/unquote(url.path).lstrip('/')) if url.path else file
        if dest.is_dir():dest=dest/'index.html'
        if not dest.is_file():errors.append(str(file.relative_to(root))+' broken link '+link)
        if url.fragment and dest in pages and unquote(url.fragment) not in pages[dest].ids:errors.append('broken fragment '+link)
for path in root.rglob('*'):
    if path.is_symlink():errors.append('symlink in publish tree')
    if any(part in ['docs','scripts','netlify','supabase','.git','.netlify','output'] for part in path.relative_to(root).parts):errors.append('internal path published: '+str(path))
assert len(pages)==15, len(pages)
if errors:
    print('\n'.join(errors));sys.exit(1)
print('PASS: 14 routes + 404, all internal links/anchors/media, semantic form boundary, no diagnostic/tracking dependencies, no internal files or symlinks.')
