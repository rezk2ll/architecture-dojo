<script>
	import { resolve } from '$app/paths';
	import { chapters } from '#lib/chapters/index.js';
	import { matcher } from '#lib/text.js';
	import { progress, dueCardIds, streak, activeToday, dayKey } from '#lib/progress.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Progress } from '#lib/components/ui/progress/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import Cubes from '#lib/components/cubes.svelte';
	import Cube from '#lib/components/cube.svelte';

	let today = $derived(chapters.find((c) => !progress.done[c.slug]));
	let doneCount = $derived(chapters.filter((c) => progress.done[c.slug]).length);
	let due = $derived(dueCardIds().length);
	let days = $derived(streak());
	let doneToday = $derived(activeToday());
	let parts = [...new Set(chapters.map((c) => c.part))];

	// Back to front, so the path starts at the back of the block and ends at the front.
	const spots = [[0, 0], [1, 0], [0, 1], [2, 0], [1, 1], [0, 2], [2, 2], [2, 1], [1, 2]];

	/** @param {string} part */
	function pillar(part, x = 0, y = 0) {
		const all = chapters.filter((c) => c.part === part);
		const done = all.filter((c) => progress.done[c.slug]).length;
		return { x, y, h: 190, fill: done / all.length, current: today?.part === part, label: `${part}: ${done} of ${all.length}` };
	}

	let block = $derived(parts.map((part, i) => pillar(part, ...spots[i])));

	// The last seven days, oldest first: a solid cube for each day with an answer.
	let week = $derived(
		Array.from({ length: 7 }, (_, i) => {
			const d = new Date();
			d.setDate(d.getDate() - 6 + i);
			const on = progress.days.includes(dayKey(d));
			// Equal steps along both ground axes move a cube straight right on screen.
			return { x: i * 0.7, y: -i * 0.7, h: 26, fill: on ? 1 : 0, current: i === 6, label: `${d.toLocaleDateString(undefined, { weekday: 'long' })}: ${on ? 'answered' : 'no answer'}` };
		})
	);

	let query = $state('');
	let shown = $derived.by(() => {
		const matches = matcher(query);
		return chapters.filter((c) => matches([c.title, c.part, ...c.terms.flatMap((t) => [t.term, t.def]), ...c.hook]));
	});
</script>

<div class="grid gap-10 pt-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
	<div class="space-y-6 lg:sticky lg:top-6 lg:self-start">
		<div class="space-y-3">
			<h1 class="text-4xl font-bold tracking-tight">Become an architect, ten minutes a day.</h1>
			<p class="text-muted-foreground text-lg">One chapter a day, on real open-source code. Questions come back later so they stick.</p>
		</div>

		{#if due > 0}
			<Card.Root>
				<Card.Header>
					<Card.Description>First, warm up</Card.Description>
					<Card.Title>{due} question{due > 1 ? 's' : ''} to review</Card.Title>
				</Card.Header>
				<Card.Footer><Button variant="secondary" href={resolve('/review')}>Start review</Button></Card.Footer>
			</Card.Root>
		{/if}

		<Card.Root class="border-brand/40 bg-brand/5 border-2 shadow-none">
			{#if today}
				<Card.Header>
					<Card.Description>Today · day {chapters.indexOf(today) + 1} · {today.minutes} min</Card.Description>
					<Card.Title class="text-2xl leading-snug">{today.title}</Card.Title>
				</Card.Header>
				<Card.Footer>
					<Button size="lg" href={resolve('/c/[slug]', { slug: today.slug })}>
						{progress.at[today.slug] ? 'Continue where you stopped →' : 'Start reading →'}
					</Button>
				</Card.Footer>
			{:else}
				<Card.Header>
					<Card.Description>All caught up</Card.Description>
					<Card.Title>You finished every chapter. Keep doing your reviews.</Card.Title>
				</Card.Header>
			{/if}
		</Card.Root>

		{#if days > 0}
			<div class="bg-card flex items-center gap-4 rounded-2xl p-4">
				<Cubes pillars={week} size={30} class="h-7 w-auto shrink-0 sm:h-11" />
				<div>
					<p class="font-semibold">{days}-day streak</p>
					<p class="text-muted-foreground text-sm">
						{doneToday ? 'Today counts. See you tomorrow.' : 'Answer one question today to keep it going.'}
					</p>
				</div>
			</div>
		{/if}

		<div class="space-y-2">
			<Progress value={(doneCount / chapters.length) * 100} class="[&_[data-slot=progress-indicator]]:bg-brand" />
			<p class="text-muted-foreground font-mono text-sm">{doneCount} of {chapters.length} chapters done</p>
		</div>

		<figure class="flex flex-col items-center gap-2 pt-4">
			<Cubes pillars={block} class="h-64 w-auto max-w-full" />
			<figcaption class="text-muted-foreground text-sm">One pillar per part. It fills as you finish its chapters.</figcaption>
		</figure>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h2 class="text-xl font-semibold">The path</h2>
			<input
				type="search"
				bind:value={query}
				placeholder="Search chapters"
				aria-label="Search chapters"
				class="bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 sm:w-64"
			/>
		</div>
		{#if shown.length === 0}
			<p class="text-muted-foreground text-sm">No chapter matches "{query.trim()}".</p>
		{/if}
		<div class="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
			{#each parts.filter((p) => shown.some((c) => c.part === p)) as part (part)}
				<div class="bg-card rounded-2xl p-3 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
					<h3 class="text-muted-foreground mb-2 flex items-center gap-2 px-2 pt-1 font-mono text-xs tracking-wide uppercase">
						<Cubes pillars={[pillar(part)]} size={40} class="h-6 w-auto shrink-0" />{part}
					</h3>
					<ol>
						{#each shown.filter((c) => c.part === part) as c (c.slug)}
							{@const n = chapters.indexOf(c) + 1}
							<li>
								<a
									href={resolve('/c/[slug]', { slug: c.slug })}
									class="hover:bg-muted flex items-start gap-3 rounded-lg px-2 py-2 text-[0.95rem] leading-snug
										{c === today ? 'bg-brand/10 font-semibold' : ''}"
								>
									<Cube state={progress.done[c.slug] ? 'done' : c === today ? 'today' : 'todo'} class="-mt-0.5 size-6" />
									<span class="flex-1 {progress.done[c.slug] ? 'text-muted-foreground' : ''}">{c.title}</span>
									<span class="text-muted-foreground/70 pt-0.5 font-mono text-xs tabular-nums">{n}</span>
								</a>
							</li>
						{/each}
					</ol>
				</div>
			{/each}
		</div>
	</div>
</div>
