/**
 * A diagram is Mermaid flowchart lines revealed step by step. Each step adds lines;
 * `highlight` lists the node ids to outline in orange at that step.
 * @typedef {{ add: string[], highlight?: string[], note: string }} DStep
 * @typedef {{ direction?: 'TD' | 'LR', steps: DStep[] }} Diagram
 * @typedef {{ q: string, options: string[], answer: number, why: string }} Question
 * @typedef {{
 *   slug: string, part: string, title: string, minutes: number,
 *   hook: string[],
 *   terms: { term: string, def: string }[],
 *   diagram: Diagram,
 *   example?: { title: string, repo: string, url: string, lang: string, code: string, notes: string[] },
 *   tradeoff: { gain: string[], cost: string[] },
 *   task: { prompt: string, hint?: string, answer: string[] },
 *   quiz: Question[],
 *   takeaway: string,
 *   sources: { title: string, url: string }[]
 * }} Chapter
 */

/**
 * Authors tend to put the right answer in the same place, so options are reordered here.
 * The order is seeded by the card id, so it stays the same across visits.
 * @param {string} seed @param {Question} q
 */
function shuffled(seed, q) {
	let h = [...seed].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261);
	const order = q.options.map((_, i) => i);
	for (let j = order.length - 1; j > 0; j--) {
		h = Math.imul(h ^ (h >>> 15), 2246822507);
		const k = (h >>> 0) % (j + 1);
		[order[j], order[k]] = [order[k], order[j]];
	}
	return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

/** @type {Record<string, { default: Chapter }>} */
const modules = import.meta.glob('./[0-9]*.js', { eager: true });

/** @type {Chapter[]} */
export const chapters = Object.keys(modules)
	.sort()
	.map((k) => modules[k].default)
	.map((c) => ({ ...c, quiz: c.quiz.map((q, i) => shuffled(`${c.slug}#${i}`, q)) }));

/** @param {string} slug */
export const chapterBySlug = (slug) => chapters.find((c) => c.slug === slug);

/** Cards are addressed as `<slug>#<question index>`. @param {string} id */
export function questionById(id) {
	const [slug, i] = id.split('#');
	const chapter = chapterBySlug(slug);
	const question = chapter?.quiz[Number(i)];
	return chapter && question ? { chapter, question } : undefined;
}
