import { isSatteriProcessor } from '@astrojs/markdown-satteri';
import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import type { CollectionLinkConfig } from './map.ts';
import { configureContentLinks, ensureContentLinkMap } from './map.ts';
import { satteriContentLinks } from './plugin.ts';

/**
 * Builds a file->URL map for the given collections up front (async, off the
 * main markdown-compile path) and registers `satteriContentLinks` on the
 * existing satteri processor itself, so wiring up this feature is just
 * adding this integration - no manual edit to `markdown.processor.mdastPlugins`.
 */
export function relativeContentLinks(
	collections: Record<string, CollectionLinkConfig>,
): AstroIntegration {
	return {
		name: 'relative-content-links',
		hooks: {
			'astro:config:setup': async ({ config, addWatchFile, logger }) => {
				configureContentLinks(collections, fileURLToPath(config.root));

				const start = performance.now();
				const { map, counts, failures } = await ensureContentLinkMap();
				const elapsedMs = (performance.now() - start).toFixed(0);

				for (const filePath of map.keys()) addWatchFile(filePath);

				const summary = Object.entries(counts)
					.map(([name, count]) => `${name}: ${count}`)
					.join(', ');
				logger.info(`content link map ready — ${summary} (${elapsedMs}ms)`);
				for (const failure of failures) logger.error(failure);

				const processor = config.markdown.processor;
				if (!isSatteriProcessor(processor)) {
					logger.error(
						'markdown.processor is not a satteri processor - satteriContentLinks was not registered',
					);
					return;
				}
				processor.options.mdastPlugins.push(satteriContentLinks);
			},
		},
	};
}

export type {
	CollectionLinkConfig,
	EntryInfo,
	Frontmatter,
	FrontmatterLoader,
} from './map.ts';
