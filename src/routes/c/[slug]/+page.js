import { error } from '@sveltejs/kit';
import { chapters, chapterBySlug } from '#lib/chapters/index.js';

export const entries = () => chapters.map((c) => ({ slug: c.slug }));

export function load({ params }) {
	const chapter = chapterBySlug(params.slug);
	if (!chapter) error(404, 'No such chapter');
	const i = chapters.indexOf(chapter);
	return { chapter, number: i + 1, prev: chapters[i - 1], next: chapters[i + 1] };
}
