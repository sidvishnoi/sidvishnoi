import { toString } from 'mdast-util-to-string';
import type { RemarkPlugins } from 'astro';

/**
 * Extracts out first `<h1>` from content, and sets it as `frontmatter.heading`
 */
export const remarkHeading: RemarkPlugins[number] = () => {
	return (tree, file) => {
		const titleIndex = tree.children.findIndex(
			(node) => node.type === 'heading' && node.depth === 1,
		);
		if (titleIndex === -1) {
			throw new Error(`Missing #h1 in ${file.path}`);
		}
		const heading = toString(tree.children[titleIndex]);
		tree.children[titleIndex] = { type: 'html', value: '' };

		file.data.astro!.frontmatter!.heading = heading;

		file.data.frontmatter ??= {};
		(file.data.frontmatter as Record<string, any>).heading = heading;
	};
};
