<script>
	import './layout.css';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { restore } from '#lib/progress.svelte.js';
	import { theme, initTheme, toggleTheme } from '#lib/theme.svelte.js';
	import { focus, initFocus } from '#lib/focus.svelte.js';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import Cube from '#lib/components/cube.svelte';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	onMount(() => {
		restore();
		initTheme();
		initFocus();
	});
</script>

<svelte:head>
	<title>Architect Dojo</title>
	<meta name="description" content="Software architecture, one 10-minute chapter a day, taught on real open-source code." />
</svelte:head>

<header class="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 sm:px-8" hidden={focus.on && page.route.id === '/c/[slug]'}>
	<a href={resolve('/')} class="flex items-center gap-2 font-mono font-bold">
		<Cube state="done" class="size-6" /><span>architect<span class="text-brand">/</span>dojo</span>
	</a>
	<div class="flex items-center gap-1">
		<Button variant="ghost" size="sm" href={resolve('/review')}>Review</Button>
		<Button variant="ghost" size="sm" href={resolve('/glossary')}>Glossary</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			aria-label={theme.dark ? 'Switch to light mode' : 'Switch to dark mode'}
			onclick={toggleTheme}
		>
			{#if theme.dark}<Sun />{:else}<Moon />{/if}
		</Button>
	</div>
</header>

<main class="mx-auto max-w-screen-2xl px-4 pb-10 sm:px-8">
	{@render children()}
</main>
