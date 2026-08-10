import { defineConfig, passthroughImageService } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import { dirname } from 'node:path';
import theme from './.config/syntax-highlight/shiki-theme.ts';
import langWebidl from './.config/syntax-highlight/lang-webidl.ts';
import { relativeContentLinks } from './.config/markdown/relative-content-links/index.ts';
import { satteriBreaks } from './.config/markdown/satteri-breaks.ts';
import { satteriExternalLinks } from './.config/markdown/satteri-external-links.ts';
import { satteriStripH1 } from './.config/markdown/satteri-strip-h1.ts';

// Mirrors the date-prefix-stripping fallback in src/content.config.ts, used
// when a file has no `slug` frontmatter override.
function stripDatePrefix(name: string): string {
	return name.replace(/^\d{4}-\d{2}-\d{2}-|^\d{2}-\d{2}-/, '').toLowerCase();
}

export default defineConfig({
	site: 'https://sidvishnoi.com',
	integrations: [
		sitemap(),
		preact(),
		relativeContentLinks({
			articles: {
				directory: './articles',
				async getUrl(entry, frontmatter, format) {
					const fm = await frontmatter();
					const slug = fm.slug ?? stripDatePrefix(dirname(entry.relativePath));
					return format('articles', slug);
				},
			},
			notes: {
				directory: './notes',
				pattern: ['**/*.md', '!_legacy/**'],
				async getUrl(entry, frontmatter, format) {
					const fm = await frontmatter();
					const slug = fm.slug ?? stripDatePrefix(entry.basename);
					return format('notes', slug);
				},
			},
		}),
	],
	output: 'static',
	compressHTML: import.meta.env.PROD,
	scopedStyleStrategy: 'where',
	build: {
		inlineStylesheets: 'always',
	},
	devToolbar: { enabled: false },
	image: {
		service: passthroughImageService(),
	},
	trailingSlash: 'always',
	markdown: {
		processor: satteri({
			mdastPlugins: [satteriBreaks, satteriStripH1],
			hastPlugins: [
				satteriExternalLinks({
					ownHosts: ['sidvishnoi.com'],
					rewriteUrl(url) {
						if (!url.searchParams.has('ref')) url.searchParams.set('ref', 'sidvishnoi.com');
					},
					attributes: { target: '_blank', rel: ['noopener', 'noreferrer'] },
				}),
			],
		}),
		syntaxHighlight: 'shiki',
		shikiConfig: {
			theme,
			langs: [langWebidl],
		},
	},
});
