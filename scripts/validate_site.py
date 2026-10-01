"""Check static HTML structure, metadata and local links with the standard library."""
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())


class Document(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.stack, self.ids, self.links = path, [], [], []
        self.errors, self.tags, self.meta, self.canonical = [], Counter(), {}, []
        self.ld, self.in_ld, self.lang = [], False, None
        self.feed(path.read_text(encoding='utf-8'))
        self.close()
        if self.stack:
            self.errors.append(f'Unclosed elements: {self.stack}')

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        self.tags[tag] += 1
        if tag == 'html': self.lang = attr.get('lang')
        if attr.get('id'): self.ids.append(attr['id'])
        if len(attrs) != len(attr): self.errors.append(f'Duplicate attribute on {tag}')
        if tag == 'meta': self.meta[attr.get('name', attr.get('property'))] = attr.get('content')
        if tag == 'link' and attr.get('rel') == 'canonical': self.canonical.append(attr.get('href'))
        for name in ('href', 'src', 'poster'):
            if name in attr: self.links.append(attr[name])
        if tag == 'img' and 'alt' not in attr: self.errors.append('Image missing alt')
        if tag == 'button' and attr.get('type') != 'button': self.errors.append('Button missing explicit type')
        if tag == 'script' and attr.get('type') == 'application/ld+json': self.in_ld = True
        if tag not in VOID: self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag == 'script': self.in_ld = False
        if not self.stack or self.stack[-1] != tag:
            self.errors.append(f'Mismatched closing tag: {tag}; stack: {self.stack[-4:]}')
        else:
            self.stack.pop()

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_data(self, data):
        if self.in_ld: self.ld.append(data)


def validate():
    documents = {p.name: Document(p) for p in ROOT.glob('*.html')}
    errors, external = [], set()
    for name, doc in documents.items():
        errors.extend(f'{name}: {e}' for e in doc.errors)
        for tag in ('html', 'head', 'body', 'h1', 'main', 'title'):
            if doc.tags[tag] != 1: errors.append(f'{name}: expected one {tag}')
        if doc.lang not in ('en', 'sv'): errors.append(f'{name}: language missing')
        if len(doc.ids) != len(set(doc.ids)): errors.append(f'{name}: duplicate IDs')
        if len(doc.canonical) != 1: errors.append(f'{name}: canonical missing')
        for meta in ('description','viewport','og:title','og:description','og:url','og:image','twitter:card'):
            if not doc.meta.get(meta): errors.append(f'{name}: {meta} missing')
        try: json.loads(''.join(doc.ld))
        except (ValueError, TypeError): errors.append(f'{name}: invalid JSON-LD')
        for href in doc.links:
            url = urlsplit(href)
            if url.scheme in ('https','http'):
                external.add(href)
                continue
            if url.scheme == 'mailto': continue
            target_name = unquote(url.path).lstrip('/') or name
            if url.path == '/': target_name = 'index.html'
            target = ROOT / target_name
            if not target.is_file(): errors.append(f'{name}: missing local target {href}')
            if url.fragment and target_name in documents and unquote(url.fragment) not in documents[target_name].ids:
                errors.append(f'{name}: missing fragment {href}')
    sitemap = ET.parse(ROOT / 'sitemap.xml')
    for loc in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
        filename = urlsplit(loc.text).path.lstrip('/') or 'index.html'
        if filename not in documents: errors.append(f'Sitemap target missing: {filename}')
    if errors: raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(documents)} HTML pages; balanced markup, metadata, JSON-LD, IDs, local links and sitemap.')
    print(f'External references: {len(external)} unique URLs (network checks are separate).')


if __name__ == '__main__': validate()
