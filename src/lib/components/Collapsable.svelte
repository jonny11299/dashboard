<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { cpuStore } from "$lib/cpuStore.svelte";
	import { type SystemStats } from "$lib/systemStats";

	let expanded = $state(true);
	let { title, children } = $props();

	onMount(() => cpuStore.start());
	onDestroy(() => cpuStore.stop());

	const avg = (key: keyof SystemStats) =>
		cpuStore.buffer.reduce((sum, s) => sum + (s[key] as number), 0) / cpuStore.buffer.length;
</script>

<div class="panel">
	<button class="banner" onclick={() => (expanded = !expanded)}>
		<span>{title}</span>
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
		padding: 0.5em 1em;
		background: var(--primary-hover);
		color: var(--text);
		border: none;
		cursor: pointer;
		font-size: 1em;
	}
	.banner:hover {
		background: var(--primary-hover);
		filter: brightness(1.15);
	}
	.arrow {
		font-size: 0.8em;
	}
	.panel-content {
		padding: 1em;
	}
	.hidden {
		display: none;
	}
</style>
