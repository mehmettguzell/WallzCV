import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { languages } from './i18n';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()),
		lang: z.enum(languages),
		summary: z.string(),
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog };
