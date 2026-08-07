import { defineConfig, passthroughImageService } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkBreaks from 'remark-breaks';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import theme from './.config/syntax-highlight/shiki-theme.ts';
import langWebidl from './.config/syntax-highlight/lang-webidl.ts';
import { remarkHeading } from './.config/markdown/remark-heading.ts';

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
		processor: unified({
			remarkPlugins: [remarkBreaks, remarkHeading],
		}),
		syntaxHighlight: 'shiki',
		shikiConfig: {
			theme,
			langs: [langWebidl],
		},
	},
});
