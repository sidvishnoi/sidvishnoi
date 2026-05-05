import type { RemarkPlugins } from 'astro';

/**
 * Removes out first `<h1>` from content, as it's already extracted
 * by `@astrojs/markdown-remark` patch and added to frontmatter.
 */
export const remarkHeading: RemarkPlugins[number] = () => {
	return (tree, file) => {
		const titleIndex = tree.children.findIndex(
			(node) => node.type === 'heading' && node.depth === 1,
		);
		if (titleIndex === -1) {
			throw new Error(`Missing #h1 in ${file.path}`);
		}
		tree.children[titleIndex] = { type: 'html', value: '' };
	};
};
