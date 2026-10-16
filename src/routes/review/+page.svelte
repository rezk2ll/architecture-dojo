<script>
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { fmt } from '#lib/text.js';
	import { answer, dayKey, dueCardIds, exportProgress, parseProgress, progress, replaceProgress, restore, INTERVAL_DAYS } from '#lib/progress.svelte.js';
	import { questionById } from '#lib/chapters/index.js';
	import Cubes from '#lib/components/cubes.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';

	/** @type {{ id: string, item: NonNullable<ReturnType<typeof questionById>> }[]} */
	let queue = $state([]);
	let loaded = $state(false);
	let i = $state(0);
	/** @type {number | undefined} */
	let picked = $state();

	let current = $derived(queue[i]);
	let q = $derived(current?.item.question);

	// One tower per box, left to right; it grows with the questions in it.
	let boxes = $derived(
		INTERVAL_DAYS.map((days, box) => {
			const n = Object.values(progress.cards).filter((c) => c.box === box).length;
			const label = `Every ${days} day${days === 1 ? '' : 's'}: ${n} question${n === 1 ? '' : 's'}`;
			return { x: box * 0.8, y: -box * 0.8, h: 12 + Math.min(n, 12) * 12, fill: n ? 1 : 0, label, days, n };
		})
	);

	// Snapshot once: answering a card reschedules it, it should not vanish mid-session.
	// Shuffled so questions from different chapters mix, which helps telling patterns apart.
	onMount(() => {
		restore(); // this page's onMount runs before the layout's, so restore here too
		load();
	});

	function load() {
		i = 0;
		picked = undefined;
		queue = dueCardIds().flatMap((id) => {
			const item = questionById(id);
			return item ? [{ id, item }] : [];
		});
		// Fisher-Yates: a random sort comparator does not give every order the same chance.
		for (let j = queue.length - 1; j > 0; j--) {
			const k = Math.floor(Math.random() * (j + 1));
			[queue[j], queue[k]] = [queue[k], queue[j]];
		}
		loaded = true;
	}

	/** @type {HTMLInputElement} */
	let fileInput;
	/** @type {{ ok: boolean, text: string } | undefined} */
	let backup = $state();

	function download() {
		// A data URL, unlike a blob URL, has nothing to revoke before the browser has read it.
		const a = document.createElement('a');
		a.href = `data:application/json,${encodeURIComponent(exportProgress())}`;
		a.download = `architect-dojo-progress-${dayKey(new Date())}.json`;
		a.click();
	}

	const chaptersIn = (/** @type {{ done: object }} */ s) => {
		const n = Object.keys(s.done).length;
		return `${n} chapter${n === 1 ? '' : 's'} done`;
	};

	async function upload(/** @type {Event & { currentTarget: HTMLInputElement }} */ e) {
		const file = e.currentTarget.files?.[0];
		e.currentTarget.value = '';
		if (!file) return;
		let saved;
		try {
			saved = parseProgress(await file.text());
		} catch {
			backup = { ok: false, text: 'That file is not an Architect Dojo progress file. Nothing changed.' };
			return;
		}
		if (!confirm(`Replace your progress here (${chaptersIn(progress)}) with the file's (${chaptersIn(saved)})?`)) return;
		replaceProgress(saved);
		load();
		backup = { ok: true, text: 'Progress loaded.' };
	}

	function pick(/** @type {number} */ option) {
		if (picked !== undefined || !q) return;
		picked = option;
		answer(current.id, option === q.answer);
	}

	function next() {
		i += 1;
		picked = undefined;
	}
</script>

<svelte:head><title>Review · Architect Dojo</title></svelte:head>
<svelte:window
	onkeydown={(e) => {
		if (e.altKey || e.ctrlKey || e.metaKey || !q) return;
		if (/^[1-9]$/.test(e.key) && Number(e.key) <= q.options.length) pick(Number(e.key) - 1);
		else if (e.key === 'ArrowRight' && picked !== undefined && i + 1 < queue.length) next();
	}}
/>

<div class="mx-auto max-w-3xl space-y-6 pt-6">
	<h1 class="text-3xl font-bold tracking-tight">Review</h1>

	{#if loaded && !q}
		<p>Nothing to review right now. Questions come back 1, 3, 7, 21 and 45 days after you get them right.</p>
		<Button variant="outline" href={resolve('/')}>← Back to today's chapter</Button>
	{:else if q}
		<Card.Root>
			<Card.Header>
				<Card.Description>{i + 1} / {queue.length} · from “{current.item.chapter.title}”</Card.Description>
				<Card.Title class="leading-snug">{@html fmt(q.q)}</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				{#each q.options as option, n (n)}
					{@const done = picked !== undefined}
					<Button
						variant={done && n === q.answer ? 'default' : done && n === picked ? 'destructive' : 'outline'}
						class="h-auto w-full justify-start py-2 text-left whitespace-normal"
						disabled={done && n !== q.answer && n !== picked}
						onclick={() => pick(n)}><span>{@html fmt(option)}</span></Button
					>
				{/each}
				{#if picked !== undefined}
					<Alert.Root variant={picked === q.answer ? 'default' : 'destructive'}>
						<Alert.Title>{picked === q.answer ? 'Yes.' : 'Not quite.'}</Alert.Title>
						<Alert.Description>{@html fmt(q.why)}</Alert.Description>
					</Alert.Root>
				{/if}
			</Card.Content>
			{#if picked !== undefined}
				<Card.Footer>
					{#if i + 1 < queue.length}
						<Button onclick={next}>Next →</Button>
					{:else}
						<Button href={resolve('/')}>Done. On to today's chapter →</Button>
					{/if}
				</Card.Footer>
			{/if}
		</Card.Root>
	{/if}

	{#if loaded && Object.keys(progress.cards).length}
		<figure class="bg-card space-y-3 rounded-2xl p-5">
			<div class="mx-auto w-fit max-w-full space-y-2">
				<Cubes pillars={boxes} size={44} class="h-40 w-auto max-w-full" />
				<div class="text-muted-foreground grid grid-cols-5 text-center font-mono text-xs">
					{#each boxes as b (b.days)}<span><span class="text-foreground font-semibold">{b.n}</span><br />{b.days}d</span>{/each}
				</div>
			</div>
			<figcaption class="text-muted-foreground text-center text-sm">Each right answer moves a question one tower to the right, so it comes back later.</figcaption>
		</figure>
	{/if}

	<section class="space-y-3 border-t pt-6">
		<h2 class="font-semibold">Your progress</h2>
		<p class="text-muted-foreground text-sm">It lives in this browser only. Save it to a file to move it or keep it safe.</p>
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" size="sm" onclick={download}>Download progress</Button>
			<Button variant="outline" size="sm" onclick={() => fileInput.click()}>Load from file</Button>
			<input bind:this={fileInput} type="file" accept="application/json,.json" class="hidden" onchange={upload} />
		</div>
		{#if backup}
			<Alert.Root variant={backup.ok ? 'default' : 'destructive'}>
				<Alert.Description>{backup.text}</Alert.Description>
			</Alert.Root>
		{/if}
	</section>
</div>
