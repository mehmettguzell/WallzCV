import { getCollection, type CollectionEntry } from 'astro:content';

const words_per_minute = 200;

export type Post = CollectionEntry<'blog'>;
export type Series = CollectionEntry<'series'>;

export type BlogFeedItem =
	| { kind: 'post'; post: Post; date: Date; tags: string[] }
	| { kind: 'series'; series: Series; posts: Post[]; date: Date; tags: string[] };

export async function get_published_posts_newest_first(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function estimate_reading_minutes(post: Post): number {
	const word_count = (post.body ?? '').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(word_count / words_per_minute));
}

export function get_series_posts_in_order(posts: Post[], series_id: string): Post[] {
	return posts.filter((post) => post.data.series?.id === series_id).sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

export function get_adjacent_series_posts(posts: Post[], post: Post): { previous?: Post; next?: Post } {
	if (!post.data.series) return {};
	const series_posts = get_series_posts_in_order(posts, post.data.series.id);
	const position = series_posts.findIndex((candidate) => candidate.id === post.id);
	return { previous: series_posts[position - 1], next: series_posts[position + 1] };
}

export async function get_blog_feed_newest_first(): Promise<BlogFeedItem[]> {
	const posts = await get_published_posts_newest_first();
	const all_series = await getCollection('series');

	const standalone_items: BlogFeedItem[] = posts
		.filter((post) => !post.data.series)
		.map((post) => ({ kind: 'post', post, date: post.data.date, tags: post.data.tags }));

	const series_items: BlogFeedItem[] = all_series.flatMap((series) => {
		const series_posts = get_series_posts_in_order(posts, series.id);
		// A series with no published posts yet stays out of the feed until its first post lands.
		if (series_posts.length === 0) return [];
		const newest_date = series_posts.reduce((newest, post) => (post.data.date > newest ? post.data.date : newest), series_posts[0].data.date);
		const tags = [...new Set(series_posts.flatMap((post) => post.data.tags))];
		return [{ kind: 'series' as const, series, posts: series_posts, date: newest_date, tags }];
	});

	return [...series_items, ...standalone_items].sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export function collect_tags_alphabetically(feed: BlogFeedItem[]): string[] {
	return [...new Set(feed.flatMap((item) => item.tags))].sort();
}
