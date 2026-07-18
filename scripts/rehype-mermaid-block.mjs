import { fromHtml } from 'hast-util-from-html';
import { renderMermaidToSvg } from './mermaid-render.mjs';

// Transforms ```mermaid code blocks into build-time rendered SVG pairs
// (light + dark), so pages ship no client-side mermaid runtime.
export function rehypeMermaidBlock() {
  return async (tree) => {
    const blocks = [];
    visit(tree, (node, parent) => {
      // Astro/Shiki shape: <pre data-language="mermaid"><code>...spans</code></pre>
      if (node.tagName === 'pre' && node.properties?.dataLanguage === 'mermaid') {
        blocks.push({ target: node, code: textOf(node) });
        return;
      }
      // Classic shape: <pre><code class="language-mermaid">...</code></pre>
      if (
        node.tagName === 'code' &&
        Array.isArray(node.properties?.className) &&
        node.properties.className.includes('language-mermaid') &&
        parent?.tagName === 'pre'
      ) {
        blocks.push({ target: parent, code: textOf(node) });
      }
    });
    for (const { target, code } of blocks) {
      try {
        const light = await renderMermaidToSvg(code, 'neutral');
        const dark = await renderMermaidToSvg(code, 'dark');
        target.tagName = 'div';
        target.properties = { className: ['mermaid-diagram'] };
        target.children = [svgWrapper(light, 'mermaid-light'), svgWrapper(dark, 'mermaid-dark')];
      } catch (error) {
        console.warn('[mermaid] build-time render failed, keeping code block:', error?.message);
      }
    }
  };
}

function textOf(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(textOf).join('');
}

function svgWrapper(svg, className) {
  const parsed = fromHtml(svg, { fragment: true, space: 'svg' });
  return {
    type: 'element',
    tagName: 'div',
    properties: { className: [className], ariaHidden: className === 'mermaid-dark' },
    children: parsed.children,
  };
}

function visit(node, callback, parent) {
  callback(node, parent);
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => visit(child, callback, node));
  }
}
