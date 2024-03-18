// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://sidvishnoi.com',
	integrations: [sitemap()],
	output: 'static',
	build: {
		inlineStylesheets: 'always',
	},
	image: {
		service: passthroughImageService(),
	},
});
