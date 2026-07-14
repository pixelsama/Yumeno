export function rehypeBasePath(options = {}) {
  const base = `/${String(options.base ?? '').replace(/^\/+|\/+$/g, '')}`;
  return (tree) => {
    visit(tree, (node) => {
      if (!node.properties) return;
      for (const key of ['src', 'href', 'poster']) {
        const value = node.properties[key];
        if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
          node.properties[key] = `${base}${value}`;
        }
      }
    });
  };
}

function visit(node, callback) {
  callback(node);
  if (Array.isArray(node.children)) node.children.forEach((child) => visit(child, callback));
}
