<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { cpuStore } from "$lib/cpuStore.svelte";
	import { type SystemStats } from "$lib/systemStats";

	let expanded = $state(false);
	let { title, children } = $props();

	onMount(() => cpuStore.start());
	onDestroy(() => cpuStore.stop());

	const avg = (key: keyof SystemStats) =>
		cpuStore.buffer.reduce((sum, s) => sum + (s[key] as number), 0) / cpuStore.buffer.length;
</script>

<div class="panel">
	<button class="banner" onclick={() => (expanded = !expanded)}>
		<span class="title">{title}</span>
		<span class="arrow">{expanded ? "▲" : "▼"}</span>
	</button>

	<div class="panel-content" class:hidden={!expanded}>
		{@render children()}
	</div>
</div>

<style>
	/* Panel is stored in global */
	.banner {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
		background: var(--surface);
		color: var(--text);
		border: none;
		border-bottom: var(--border-width) solid var(--border-strong);
		cursor: pointer;
		font-family: var(--font-sans);
		font-size: 1.05rem;
		font-weight: 600;
		text-align: left;
		transition: background-color var(--transition-time) ease;
	}
	.banner:hover {
		background: color-mix(in srgb, var(--primary) 12%, var(--surface));
	}
	.arrow {
		font-size: 0.75em;
		color: var(--primary);
	}
	.panel-content {
		padding: 1.25rem;
	}
	.hidden {
		display: none;
	}

	.title {
		font-weight: 800;
	}
</style>
