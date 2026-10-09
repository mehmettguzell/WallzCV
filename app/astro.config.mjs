// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL ?? 'https://mehmettguzell.github.io',
	integrations: [
		mdx(),
		sitemap({
			i18n: { defaultLocale: 'en', locales: { en: 'en', tr: 'tr' } },
		}),
	],
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
		},
	},
});
