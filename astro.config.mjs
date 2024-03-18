// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
	site: 'https://www.sidvishnoi.com',
	integrations: [sitemap()],
	output: 'static',
	adapter: cloudflare({
		runtime: {
			mode: 'local',
			type: 'pages',
			bindings: {},
		},
	}),
	build: {
		inlineStylesheets: 'always',
	},
	image: {
		service: passthroughImageService(),
	},
});
