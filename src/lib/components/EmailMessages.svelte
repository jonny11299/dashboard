<script>
	let { messages } = $props();

	// a list of formatted messages
	let formatted = $derived.by(() => {
		const headers = messages?.pa;
	});
</script>

<div class="container">
	{#each messages as m}
		<div class="message">
			<p>date: {m?.internalDate}</p>
			<p>snippet: {m?.snippet}</p>
		</div>
	{:else}
		<p>No messages retrieved yet</p>
	{/each}
</div>

<style>
	.container {
		width: auto;
		height: auto;
		border: 2px solid var(--border);
	}

	.message {
		margin-bottom: 1rem;
		border: 1px dashed var(--data-1);
	}
</style>
