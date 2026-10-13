import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { languages } from './i18n';

const series = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/series' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		total_posts: z.number().int().positive(),
		lang: z.enum(languages),
	}),
});

const blog = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
	schema: z
		.object({
			title: z.string(),
			date: z.coerce.date(),
			tags: z.array(z.string().transform((tag) => tag.toLowerCase())),
			lang: z.enum(languages),
			summary: z.string(),
			draft: z.boolean().default(false),
			series: reference('series').optional(),
			order: z.number().int().positive().optional(),
		})
		.refine((post) => !post.series || post.order !== undefined, { message: 'A post in a series needs an `order`.', path: ['order'] }),
});

export const collections = { blog, series };
