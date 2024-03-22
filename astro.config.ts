import { defineConfig, passthroughImageService } from 'astro/config';
import remarkBreaks from 'remark-breaks';
import sitemap from '@astrojs/sitemap';

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
		remarkPlugins: [remarkBreaks],
	},
});
