import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { get_published_posts_newest_first } from '../lib/blog';

export async function GET(context: APIContext) {
	const posts = await get_published_posts_newest_first();
	return rss({
		title: 'Mehmet Güzel',
		description: 'Posts by Mehmet Güzel',
		site: context.site!,
		items: posts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			description: post.data.summary,
			link: `/${post.data.lang}/blog/${post.id}/`,
			categories: post.data.tags,
		})),
	});
}
