<script>
	import { resolve } from '$app/paths';
	import { fmt, matcher } from '#lib/text.js';
	import { chapters } from '#lib/chapters/index.js';

	const entries = chapters
		.flatMap((chapter) => chapter.terms.map((t) => ({ ...t, chapter })))
		.sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));

	let query = $state('');
	let shown = $derived.by(() => {
		const matches = matcher(query);
		return entries.filter((e) => matches([e.term, e.def]));
	});
</script>

<svelte:head><title>Glossary · Architect Dojo</title></svelte:head>

<div class="mx-auto max-w-3xl space-y-6 pt-6">
	<h1 class="text-3xl font-bold tracking-tight">Glossary</h1>
	<input
		type="search"
		bind:value={query}
		placeholder="Filter {entries.length} terms"
		aria-label="Filter terms"
		class="bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
	/>
	{#if shown.length === 0}
		<p class="text-muted-foreground">No term matches “{query.trim()}”.</p>
	{/if}
	<dl class="space-y-3">
		{#each shown as e (e.chapter.slug + e.term)}
			<div class="bg-card rounded-2xl p-4">
				<dt class="text-brand-ink mb-1 font-mono text-sm font-semibold">{e.term}</dt>
				<dd class="leading-relaxed">{@html fmt(e.def)}</dd>
				<dd class="text-muted-foreground mt-2 text-sm">
					<a class="hover:underline" href={resolve('/c/[slug]', { slug: e.chapter.slug })}>{e.chapter.title}</a>
				</dd>
			</div>
		{/each}
	</dl>
</div>
