import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
	loader: glob({ base: './articles', pattern: '**/*.{md,mdx}' }),
	schema: z
		.object({
			/** For `<title>`, `getCollection()` */
			title: z.string(),
			/** Set from markdown. */
			heading: z.string().optional(),
			date: z.date(),
			modified: z.date().optional(),
			description: z.string(),
			image: z
				.object({
					url: z.string(),
					alt: z.string(),
				})
				.optional(),
			tags: z
				.array(z.string().startsWith('#'))
				.optional()
				.transform((tags) => tags?.map((tag) => tag.replace(/^#/, ''))),
			canonical: z.url().optional(),
		})
		.transform((data) => {
			return {
				...data,
				heading: data.heading!,
			};
		}),
});

const notes = defineCollection({
	loader: glob({
		base: './notes',
		pattern: ['**/*.md', '!_legacy/*'],
		generateId({ entry, data }) {
			if (typeof data.slug === 'string') return data.slug;
			// entry has format: yyyy/mm-dd-slug-part.md. we only want the slug part
			return entry.replace(/^.*\/|\d{2}-\d{2}-|\.md$/g, '').toLowerCase();
		},
	}),
	schema: z
		.object({
			description: z.string(),
			tags: z
				.array(z.string().startsWith('#'))
				.transform((tags) => tags.map((tag) => tag.replace(/^#/, ''))),
			modified: z.date().optional(),
			/** Set from markdown. */
			heading: z.string().optional(),
		})
		.transform((data) => {
			return {
				...data,
				title: data.heading!,
				heading: data.heading!,
			};
		}),
});

export const collections = { articles, notes };
