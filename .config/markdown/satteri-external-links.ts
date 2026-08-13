import { defineHastPlugin } from 'satteri';

export default defineHastPlugin({
	name: 'satteri-external-links',
	element: {
		filter: ['a'],
		visit(node, ctx) {
			const href = node.properties?.href;
			if (typeof href !== 'string' || !isExternalHref(href)) return;

			const url = new URL(href);
			url.searchParams.set('ref', 'sidvishnoi.com');
			ctx.setProperty(node, 'href', url.toString());

			ctx.setProperty(node, 'target', '_blank');
			ctx.setProperty(node, 'rel', 'noopener');
		},
	},
});

function isExternalHref(href: string): boolean {
	const url = URL.parse(href);
	if (!url) return false;
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
	return true;
}
