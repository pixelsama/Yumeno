export function rehypeMermaidBlock() {
  return (tree) => {
    visit(tree, (node, parent, index) => {
      if (
        node.tagName === 'code' &&
        Array.isArray(node.properties?.className) &&
        node.properties.className.includes('language-mermaid') &&
        parent?.tagName === 'pre'
      ) {
        parent.tagName = 'div';
        parent.properties = { className: ['mermaid'] };
        parent.children = [{ type: 'text', value: node.children?.[0]?.value ?? '' }];
      }
    });
  };
}

function visit(node, callback, parent, index) {
  callback(node, parent, index);
  if (Array.isArray(node.children)) {
    node.children.forEach((child, childIndex) => visit(child, callback, node, childIndex));
  }
}
