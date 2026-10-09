import { getCollection, type CollectionEntry } from 'astro:content';

const words_per_minute = 200;

export type Post = CollectionEntry<'blog'>;

export async function get_published_posts_newest_first(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function estimate_reading_minutes(post: Post): number {
	const word_count = (post.body ?? '').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(word_count / words_per_minute));
}
