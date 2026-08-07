import { defineMdastPlugin } from 'satteri';

/**
 * Removes the document's first top-level `<h1>` from the rendered content,
 * since it's already extracted into `frontmatter.heading` by the
 * `patches/@astrojs__internal-helpers.patch` patch.
 */
export const satteriStripH1 = () => {
	let removed = false;
	return defineMdastPlugin({
		name: 'satteri-strip-h1',
		heading(node, ctx) {
			if (removed || node.depth !== 1) return;
			if (ctx.parent(node)?.type !== 'root') return;
			removed = true;
			ctx.removeNode(node);
		},
	});
};
