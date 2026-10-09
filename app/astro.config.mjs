// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL ?? 'https://mehmettguzell.github.io',
	integrations: [mdx()],
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
		},
	},
});
