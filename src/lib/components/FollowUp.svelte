<script>
	import Collapsable from "$lib/components/Collapsable.svelte";
	import { onMount } from "svelte";

	const fields = ["Job Title", "Date Added", "Deadline", "Action", "Link", "Status", "Contact"];
	const ENTRIES_STORAGE = "dashboard_entries_apsofidgnp9283h";
	const DELETED_ENTRIES_STORAGE = "dashboard_deleted_entries_apsofidgnp9283h";
	let curEntry = $state([]);
	let entries = $state([]);
	let deletedEntries = $state([]);
	let showDeletedEntries = $state(false);

	function getEntries() {
		entries = JSON.parse(localStorage.getItem(ENTRIES_STORAGE) ?? "null");
		if (!entries) entries = [];

		deletedEntries = JSON.parse(localStorage.getItem(DELETED_ENTRIES_STORAGE) ?? "null");
		if (!deletedEntries) deletedEntries = [];
	}

	function saveEntries() {
		localStorage.setItem(ENTRIES_STORAGE, JSON.stringify(entries));
		localStorage.setItem(DELETED_ENTRIES_STORAGE, JSON.stringify(deletedEntries));
	}

	function initEntry() {
		curEntry = [];
		for (let f of fields) {
			curEntry.push("");
		}
	}

	function submitTodo() {
		const newEntry = { id: Date.now() };
		for (let f of fields) {
			const ta = document.getElementById(`entry_${f}`);
			const t = ta.value;
			// console.log(t);
			ta.value = "";
			newEntry[f] = t;
		}
		console.log(newEntry);
		entries.push(newEntry);

		saveEntries();
	}

	function deleteEntry(id) {
		const newEntries = [];
		for (let e of entries) {
			if (e.id === id) {
				console.log("removing entry: ");
				console.log(e);
				deletedEntries.push(e);
			} else {
				newEntries.push(e);
			}
		}

		entries = newEntries;
		saveEntries();
	}

	onMount(() => {
		getEntries();
		initEntry();

		window.addEventListener("keypress", (e) => {
			// console.log("Pressed:");
			// console.log(e);
			if (e.key === "Enter") {
				submitTodo();
			}
		});
	});
</script>

<Collapsable title="Follow Up">
	<div class="chart">
		{#each fields as f}
			<h3 class="chartTitle">{f}</h3>
		{/each}
		<h3 class="chartTitle">*</h3>
		<!-- Do it yourself:  -->
		{#each fields as f}
			<textarea type="text" id={`entry_${f}`}></textarea>
		{/each}
		<button onclick={() => submitTodo()}>+</button>
	</div>
	<div class="chart">
		{#each entries as e (e.id)}
			{#each fields as f}
				<p class="entry">
					{e[f]}
				</p>
			{/each}
			<button class="delete" onclick={() => deleteEntry(e.id)}>x</button>
		{:else}
			<p>No entries yet</p>
		{/each}
	</div>
	<button style="align-self: center" onclick={() => (showDeletedEntries = !showDeletedEntries)}
		>{showDeletedEntries ? "hide deleted entries" : "show deleted entries"}</button
	>
	{#if showDeletedEntries}
		<div class="chart">
			{#each fields as f}
				<h3 class="chartTitle">{f}</h3>
			{/each}
			<h3 class="chartTitle">*</h3>
			{#each deletedEntries as e (e.id)}
				{#each fields as f}
					<p class="entry">
						{e[f]}
					</p>
				{/each}
				<p>-</p>
			{:else}
				<p>No deleted entries yet</p>
			{/each}
		</div>
	{/if}
</Collapsable>

<style>
	button {
		margin: 0.4rem;
		border-radius: var(--border-radius);
		border: 1px solid var(--accent);
		padding: 0.2rem 0.6rem;
		background-color: transparent;
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 1rem;
		cursor: pointer;
		transition:
			border-color var(--transition-time) ease,
			color var(--transition-time) ease,
			scale 0.1s ease;
	}
	button:hover {
		border-color: var(--data-2);
	}
	button:active {
		scale: 0.85;
	}
	.delete:hover {
		border-color: transparent;
		color: var(--danger);
	}

	textarea {
		height: auto;
		resize: none;
		overflow: auto;
		min-height: 2.5em;
		margin: 0;
		padding: 0.4rem 0.5rem;
		border: 1px solid var(--border);
		border-radius: 0;
		background-color: var(--surface);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.95rem;
	}

	.chart {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr 3fr 1fr 0.5fr;
		align-items: stretch;
	}
	.chartTitle {
		border: 1px solid var(--border);
		border-bottom: var(--border-width) solid var(--border-strong);
		margin: 0;
		padding: 0.4rem 0.5rem;
		font-size: 0.9rem;
		color: var(--text);
	}

	.entry {
		border-bottom: 1px solid var(--border);
		border-inline: 1px solid var(--border);
		margin: 0;
		padding: 0.4rem 0.5rem;
		color: var(--text);
	}
</style>
