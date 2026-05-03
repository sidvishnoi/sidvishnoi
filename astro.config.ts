import { defineConfig, passthroughImageService } from 'astro/config';
import remarkBreaks from 'remark-breaks';
import sitemap from '@astrojs/sitemap';
import theme from './.config/syntax-highlight/shiki-theme.ts';
import langWebidl from './.config/syntax-highlight/lang-webidl.ts';
import { remarkHeading } from './.config/markdown/remark-heading.ts';

export default defineConfig({
	site: 'https://sidvishnoi.com',
	integrations: [sitemap()],
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
		syntaxHighlight: 'shiki',
		shikiConfig: {
			theme,
			langs: [langWebidl],
		},
		remarkPlugins: [remarkBreaks, remarkHeading],
		rehypePlugins: [],
	},
});
