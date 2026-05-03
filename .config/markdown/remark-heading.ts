import { toMarkdown } from 'mdast-util-to-markdown';
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
		const hTree = tree.children[titleIndex];
		if (hTree.type !== 'heading') {
			throw new Error('Unexpected: type should be heading');
		}
		const heading = toMarkdown({
			type: 'root',
			children: hTree.children,
		}).trim();
		tree.children[titleIndex] = { type: 'html', value: '' };

		file.data.astro!.frontmatter!.heading = heading;

		file.data.frontmatter ??= {};
		(file.data.frontmatter as Record<string, any>).heading = heading;
	};
};
