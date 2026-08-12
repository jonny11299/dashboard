<script>
	import Collapsable from "$lib/components/Collapsable.svelte";
</script>

<Collapsable title="Follow Up">
	<p>Maybe list some todos or something</p>
	<p>date added</p>
	<p>job title</p>
	<p>action</p>
	<p>done</p>
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
</style>
