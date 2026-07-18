// Build-time Mermaid rendering: mermaid needs a DOM, so we boot jsdom once
// and shim the SVG measurement APIs jsdom lacks. Text metrics are estimated
// (CJK glyphs count double); container boxes are the union of child boxes.
// Output is static SVG - no client-side mermaid runtime.
// This module executes inside Astro's Vite SSR runner, which may be closed by
// the time a lazy dynamic import resolves. Resolve mermaid through Node's own
// module system instead so build-time rendering always works.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});

const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, 'navigator', {
  value: window.navigator,
  configurable: true,
});
globalThis.DOMParser = window.DOMParser;
globalThis.XMLSerializer = window.XMLSerializer;
globalThis.Element = window.Element;
globalThis.HTMLElement = window.HTMLElement;
globalThis.SVGElement = window.SVGElement;
globalThis.SVGSVGElement = window.SVGSVGElement;
globalThis.Node = window.Node;
globalThis.CustomEvent = window.CustomEvent;
globalThis.Event = window.Event;
globalThis.CSSStyleSheet = window.CSSStyleSheet;
globalThis.getComputedStyle = window.getComputedStyle.bind(window);

const measureText = (text, fontSize = 16) => {
  let units = 0;
  for (const ch of String(text ?? '')) {
    units += ch.codePointAt(0) > 0xff ? 1.85 : ch === ' ' ? 0.5 : 1;
  }
  return { width: units * fontSize * 0.62 + 8, height: fontSize * 1.45 };
};

const fontSizeOf = (el) => parseFloat(window.getComputedStyle(el).fontSize) || 16;
const num = (value, fallback = 0) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function leafBBox(el) {
  const tag = el.tagName.toLowerCase();
  if (tag === 'style' || tag === 'defs') return null;
  const attr = (name) => el.getAttribute(name);
  switch (tag) {
    case 'rect': {
      const x = num(attr('x'));
      const y = num(attr('y'));
      return {
        x,
        y,
        width: num(attr('width')),
        height: num(attr('height')),
      };
    }
    case 'circle': {
      const r = num(attr('r'));
      return { x: num(attr('cx')) - r, y: num(attr('cy')) - r, width: 2 * r, height: 2 * r };
    }
    case 'ellipse': {
      const rx = num(attr('rx'));
      const ry = num(attr('ry'));
      return { x: num(attr('cx')) - rx, y: num(attr('cy')) - ry, width: 2 * rx, height: 2 * ry };
    }
    case 'line': {
      const x1 = num(attr('x1'));
      const x2 = num(attr('x2'));
      const y1 = num(attr('y1'));
      const y2 = num(attr('y2'));
      return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      };
    }
    case 'polygon':
    case 'polyline': {
      const values = (attr('points') ?? '').match(/-?\d+\.?\d*(?:e-?\d+)?/gi) ?? [];
      const xs = values.filter((_, i) => i % 2 === 0).map(Number);
      const ys = values.filter((_, i) => i % 2 === 1).map(Number);
      if (!xs.length) return null;
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
    }
    case 'path': {
      const values = (attr('d') ?? '').match(/-?\d+\.?\d*(?:e-?\d+)?/gi) ?? [];
      const xs = values.filter((_, i) => i % 2 === 0).map(Number);
      const ys = values.filter((_, i) => i % 2 === 1).map(Number);
      if (!xs.length) return null;
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
    }
    case 'foreignObject': {
      const width = num(attr('width'), NaN);
      const height = num(attr('height'), NaN);
      const text = measureText(el.textContent, fontSizeOf(el));
      return {
        x: num(attr('x')),
        y: num(attr('y')),
        width: Number.isFinite(width) && width > 0 ? width : text.width,
        height: Number.isFinite(height) && height > 0 ? height : text.height,
      };
    }
    case 'text':
    case 'tspan':
    case 'textPath': {
      const text = measureText(el.textContent, fontSizeOf(el));
      return {
        x: num(attr('x')),
        y: num(attr('y')) - text.height * 0.8,
        width: text.width,
        height: text.height,
      };
    }
    default: {
      if (!el.children?.length && !(el.textContent ?? '').trim()) return null;
      const text = measureText(el.textContent, fontSizeOf(el));
      return { x: 0, y: 0, width: text.width, height: text.height };
    }
  }
}

const TRANSLATE = /translate\(\s*(-?[\d.e]+)[,\s]+(-?[\d.e]+)?\s*\)/;

function unionBBox(el) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const visit = (node, offsetX, offsetY) => {
    let ox = offsetX;
    let oy = offsetY;
    const transform = node.getAttribute?.('transform');
    if (transform) {
      const match = TRANSLATE.exec(transform);
      if (match) {
        ox += num(match[1]);
        oy += num(match[2]);
      }
    }
    const tag = node.tagName.toLowerCase();
    if (
      tag === 'style' ||
      tag === 'defs' ||
      tag === 'metadata' ||
      tag === 'title' ||
      tag === 'desc'
    )
      return;
    if ((tag === 'g' || tag === 'svg') && node.children.length) {
      for (const child of node.children) visit(child, ox, oy);
      return;
    }
    const box = leafBBox(node);
    if (!box) return;
    minX = Math.min(minX, box.x + ox);
    minY = Math.min(minY, box.y + oy);
    maxX = Math.max(maxX, box.x + ox + box.width);
    maxY = Math.max(maxY, box.y + oy + box.height);
  };
  for (const child of el.children ?? []) visit(child, 0, 0);
  if (minX === Infinity) return { x: 0, y: 0, width: 8, height: 8 };
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

const shimBBox = (proto) => {
  if (!proto) return;
  proto.getBBox = function getBBox() {
    const tag = this.tagName.toLowerCase();
    if ((tag === 'svg' || tag === 'g') && this.children?.length) {
      const box = unionBBox(this);
      return box;
    }
    return leafBBox(this) ?? { x: 0, y: 0, width: 0, height: 0 };
  };
  proto.getComputedTextLength = function getComputedTextLength() {
    return measureText(this.textContent, fontSizeOf(this)).width;
  };
};
shimBBox(window.SVGElement?.prototype);
shimBBox(window.SVGGraphicsElement?.prototype);

// Mermaid sizes HTML labels (inside foreignObject) via offset*/getBoundingClientRect,
// which jsdom leaves at 0. Estimate them from text content instead.
const rectFromText = (el) => {
  const { width, height } = measureText(el.textContent, fontSizeOf(el));
  return {
    width,
    height,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    toJSON: () => ({}),
  };
};
window.HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return rectFromText(this);
};
for (const prop of ['offsetWidth', 'offsetHeight']) {
  Object.defineProperty(window.HTMLElement.prototype, prop, {
    configurable: true,
    get() {
      const rect = rectFromText(this);
      return prop === 'offsetWidth' ? rect.width : rect.height;
    },
  });
}

let mermaidPromise;
let counter = 0;

// This module executes inside Astro's Vite SSR runner, which may be closed by
// the time a lazy dynamic import resolves. Resolve mermaid through Node's own
// module system instead so build-time rendering always works.
const nativeImport = new Function('specifier', 'return import(specifier)');

async function engine() {
  if (!mermaidPromise) {
    mermaidPromise = (async () => {
      const require = createRequire(import.meta.url);
      const entry = require.resolve('mermaid');
      const mod = await nativeImport(pathToFileURL(entry).href);
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        fontFamily: 'inherit',
        // Static output should be self-contained SVG text, not foreignObject HTML.
        flowchart: { htmlLabels: false },
      });
      return mermaid;
    })();
  }
  return mermaidPromise;
}

export async function renderMermaidToSvg(code, theme) {
  const mermaid = await engine();
  const id = `mermaid-build-${theme}-${(counter += 1)}`;
  const { svg } = await mermaid.render(id, code, undefined, { theme });
  return svg
    .replace(/<br\s*\/?>/gi, '<br/>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}
