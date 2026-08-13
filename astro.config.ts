import { defineConfig, passthroughImageService } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import theme from './.config/syntax-highlight/shiki-theme.ts';
import langWebidl from './.config/syntax-highlight/lang-webidl.ts';
import satteriExternalLinks from './.config/markdown/satteri-external-links.ts';
import { satteriStripH1 } from './.config/markdown/satteri-strip-h1.ts';

export default defineConfig({
	site: 'https://sidvishnoi.com',
	integrations: [sitemap(), preact()],
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
			mdastPlugins: [satteriStripH1],
			hastPlugins: [satteriExternalLinks],
		}),
		syntaxHighlight: 'shiki',
		shikiConfig: {
			theme,
			langs: [langWebidl],
		},
	},
});
