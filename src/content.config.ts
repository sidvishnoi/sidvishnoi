import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './blog', pattern: '**/*.{md,mdx}' }),
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
			tags: z.array(z.string()).optional(),
			canonical: z.url().optional(),
		})
		.transform((data) => {
			if (data.heading) return data;
			return {
				...data,
				heading: data.heading as string,
			};
		}),
});

export const collections = { blog };
