<script>
	// @ts-ignore
	import { themeStore, THEMES } from "$lib/themeStore.svelte";
	import { onMount } from "svelte";
</script>

<nav>
	<span class="title"><h1>CPU Dashboard</h1></span>

	<div class="theme-buttons">
		{#each THEMES as t}
			<button class:active={themeStore.theme === t} onclick={() => themeStore.setTheme(t)}>
				{t}
			</button>
		{/each}
	</div>

	<button onclick={() => location.reload()}>Reload</button>
</nav>

<style>
	nav {
		margin-top: 0px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem 1.5rem;
		padding: 0.75rem 1.5rem;
		background: var(--surface);
		border-bottom: 2px solid var(--border-strong);
		border-radius: 0px;
	}

	.title h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--primary);
	}

	.theme-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	button {
		padding: 0.3rem 0.8rem;
		border: var(--border-width) solid var(--border);
		border-radius: var(--border-radius);
		background: transparent;
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.85rem;
		text-transform: capitalize;
		cursor: pointer;
		transition:
			border-color var(--transition-time) ease,
			color var(--transition-time) ease,
			background-color var(--transition-time) ease;
	}

	button:hover {
		border-color: var(--primary-hover);
		color: var(--primary-hover);
	}

	button.active {
		border-color: var(--primary);
		color: var(--bg);
		background: var(--primary);
	}
</style>
