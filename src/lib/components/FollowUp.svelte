<script>
	import Collapsable from "$lib/components/Collapsable.svelte";
	import { onMount } from "svelte";

	const fields = ["Job Title", "Date Added", "Deadline", "Action", "Link", "Status", "Contact"];
	const ENTRIES_STORAGE = "dashboard_entries_apsofidgnp9283h";
	let curEntry = $state([]);
	let entries = $state([]);

	function getEntries() {
		entries = localStorage.getItem(ENTRIES_STORAGE);
		if (!entries) entries = [];
	}

	function initEntry() {
		curEntry = [];
		for (let f of fields) {
			curEntry.push("");
		}
	}

	onMount(() => {
		getEntries();
		initEntry();
	});
</script>

<Collapsable title="Follow Up">
	<p>Maybe list some todos or something</p>
	<div class="chart">
		{#each fields as f}
			<h3 class="chartTitle">{f}</h3>
		{/each}
		{#each fields as f}
			<textarea type="text" id={`entry_${f}`}></textarea>
		{/each}
	</div>
</Collapsable>

<style>
	button {
		margin-bottom: 1rem;
		border: 2px solid var(--data-1);
		border-radius: 2rem;
		padding: 0.5rem;
		background-color: var(--bg);
		color: var(--text);
		font-size: 1rem;
	}
	button:hover {
		border: 2px solid var(--data-2);
		cursor: pointer;
	}
	button:active {
		scale: 0.8;
	}
	textarea {
		height: auto;
		resize: none;
		overflow: scroll;
		min-height: 2.5em;
	}

	.chart {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr 3fr 1fr;
	}
	.chartTitle {
		border: 2px solid var(--border);
		border-inline: 1px solid var(--border);
		border-bottom: 2px solid var(--border-strong);
	}
</style>
