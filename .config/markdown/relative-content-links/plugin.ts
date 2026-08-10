import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineMdastPlugin } from 'satteri';
import { ensureContentLinkMap, getContentLinks } from './map.ts';

function isWithin(parentDir: string, targetPath: string): boolean {
	const rel = relative(parentDir, targetPath);
	return rel === '' || (rel.split(sep)[0] !== '..' && !isAbsolute(rel));
}

/**
 * Rewrites markdown links that point at other content-collection source
 * files (e.g. `../2025-12-10-.../README.md`, or `../2025-12-10-.../` with
 * the `README.md` left out) into their final published URL, so
 * articles/notes can cross-link by relative file path instead of guessing
 * the eventual slug.
 *
 * Only links starting with `./` or `../` are treated as content links -
 * everything else (absolute paths, external URLs, bare filenames) is left
 * untouched.
 */
export const satteriContentLinks = defineMdastPlugin({
	name: 'satteri-content-links',
  async link(node, ctx) {
		const url = node.url;
		if (!url || !(url.startsWith('./') || url.startsWith('../'))) return;

		if (!ctx.fileURL) return;
		const currentFilePath = fileURLToPath(ctx.fileURL);

		const hashIndex = url.indexOf('#');
		const path = hashIndex === -1 ? url : url.slice(0, hashIndex);
		const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
		const targetPath = resolve(dirname(currentFilePath), decodeURI(path));

		const { map, root, collectionDirectories } =
			getContentLinks() ?? (await ensureContentLinkMap());

		const warn = (reason: string) => {
			const message = `satteri-content-links: could not resolve content link "${url}" in ${currentFilePath} (${reason})`;
			// @astrojs/markdown-satteri never reads/prints ctx.report diagnostics,
			// so this is the only way this failure is guaranteed to be visible.
			console.warn(message);
			ctx.report({ message, node, severity: 'warning' });
		};

		if (!isWithin(root, targetPath)) {
			warn('escapes the project root');
			return;
		}
		if (!collectionDirectories.some((dir) => isWithin(dir, targetPath))) {
			warn('is outside any configured collection directory');
			return;
		}

		// A path ending in .md/.mdx is an explicit file reference; anything
		// else is treated as a directory reference, with README.md/README.mdx
		// resolved implicitly (so the extension is only ever optional there).
		const targetUrl = /\.mdx?$/.test(targetPath)
			? map.get(targetPath)
			: (map.get(join(targetPath, 'README.md')) ??
				map.get(join(targetPath, 'README.mdx')));

		if (!targetUrl) {
			warn('no matching article/note found');
			return;
		}

		ctx.setProperty(node, 'url', targetUrl + hash);
	},
});
