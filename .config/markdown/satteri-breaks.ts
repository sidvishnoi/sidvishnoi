import { defineMdastPlugin, type MdastNode } from 'satteri';

/**
 * Turns single line breaks within a paragraph into hard `<br>` breaks, matching
 * the old `remark-breaks` behavior (soft breaks are otherwise collapsed to a
 * space per CommonMark).
 */
export const satteriBreaks = defineMdastPlugin({
	name: 'satteri-breaks',
	text(node, ctx) {
		if (!node.value.includes('\n')) return;

		const parent = ctx.parent(node);
		const index = ctx.indexOf(node);
		if (!parent || index === undefined) return;

		const replacement: MdastNode[] = [];
		for (const [i, line] of node.value.split('\n').entries()) {
			if (i !== 0) replacement.push({ type: 'break' } as MdastNode);
			if (line) replacement.push({ type: 'text', value: line } as MdastNode);
		}

		const children = parent.children.slice();
		children.splice(index, 1, ...replacement);
		ctx.setProperty(parent, 'children', children);
	},
});
