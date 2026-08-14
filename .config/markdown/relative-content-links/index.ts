import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration, AstroIntegrationLogger } from 'astro';
import { isSatteriProcessor } from '@astrojs/markdown-satteri';
import { ContentLinkRegistry, type ContentLinkMapResult } from './map.ts';
import { createSatteriRelativeContentLinks } from './satteri.ts';
import type { CollectionLinkConfig } from './types.ts';
import { debounce, isWithin } from './utils.ts';

/**
 * Astro integration that lets markdown link to other content by relative file
 * path (`[Part 1](../2025-12-03-.../README.md)`) instead of by its eventual
 * URL, so links still work when read outside the built site (in your editor,
 * GitHub, Obsidian etc.). At build time, links starting with `./` or `../` are
 * rewritten to the real published URL; anything else (absolute paths, external
 * URLs, bare filenames) is left untouched.
 *
 * Add one entry per content collection you want this to apply to. `getUrl`
 * decides the final URL for a file.
 *
 * @example
 * ```ts
 * relativeContentLinks({
 *   articles: {
 *     directory: './articles',
 *     async getUrl(entry, frontmatter, format) {
 *       const slug = (await frontmatter()).slug ?? entry.basename;
 *       return format('articles', slug);
 *     },
 *   },
 * })
 * ```
 *
 * A link to a directory (e.g. `../2025-12-03-.../`) resolves against a
 * `README.md` or `README.mdx` inside it, so the filename is optional there; a
 * link ending in `.md`/`.mdx` is resolved as that exact file. Links may cross
 * collections (an article can link to a note, etc.) as long as the target stays
 * within one of the configured `directory`s.
 */
export function relativeContentLinks(
	collections: Record<string, CollectionLinkConfig>,
): AstroIntegration {
	let registry: ContentLinkRegistry;
	let dataStoreFile: URL;

	return {
		name: 'relative-content-links',
		hooks: {
			'astro:config:setup': async ({ config, logger }) => {
				dataStoreFile = new URL('data-store.json', config.cacheDir);

				registry = new ContentLinkRegistry(
					collections,
					fileURLToPath(config.root),
				);

				const buildRes = await registry.buildMap();
				logResult(buildRes, 'ready', logger);

				const processor = config.markdown.processor;
				if (!isSatteriProcessor(processor)) {
					logger.error('markdown.processor is not a satteri processor');
					return;
				}
				processor.options.mdastPlugins.push(
					createSatteriRelativeContentLinks(registry, logger),
				);
			},

			'astro:server:setup': ({ server, logger }) => {
				const dirs = registry.get()?.collectionDirectories ?? [];
				const isRelevant = (file: string) =>
					/\.mdx?$/.test(file) && dirs.some((dir) => isWithin(dir, file));

				const rebuildAndLog = debounce(async () => {
					logResult(await registry.rebuild(), 'rebuilt', logger);
				}, 400);

				for (const event of ['add', 'unlink', 'change'] as const) {
					server.watcher.on(event, (file) => {
						if (isRelevant(file)) rebuildAndLog();
					});
				}
			},

			'astro:build:done': async () => {
				const failures = registry.getLinkFailures();
				if (failures.length > 0) {
					await rm(dataStoreFile, { force: true });
					throw new Error(
						`relative-content-links: ${failures.length} broken content link(s) found (see errors above)`,
					);
				}
			},
		},
	};
}

export type {
	CollectionLinkConfig,
	EntryInfo,
	Frontmatter,
	FrontmatterLoader,
} from './types.ts';

function logResult(
	result: ContentLinkMapResult,
	label: string,
	logger: AstroIntegrationLogger,
): void {
	const summary = Object.entries(result.counts)
		.map(([name, count]) => `${name}:${count}`)
		.join(', ');
	logger.info(`content link map ${label}: {${summary}}`);
	for (const failure of result.failures) logger.error(failure);
}
