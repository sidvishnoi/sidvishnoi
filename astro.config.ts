import { defineConfig, passthroughImageService } from 'astro/config';
import remarkBreaks from 'remark-breaks';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
	site: 'https://sidvishnoi.com',
	integrations: [sitemap(), expressiveCode()],
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
		remarkPlugins: [remarkBreaks],
	},
});
