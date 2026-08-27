<script lang="ts">
	import "../app.css";
	import { invoke } from "@tauri-apps/api/core";
	import Nav from "$lib/components/Nav.svelte";
	import Sys from "$lib/components/Sys.svelte";
	import Footer from "$lib/components/Footer.svelte";

	let name = $state("");
	let greetMsg = $state("");

	// @ts-ignore
	async function greet(event) {
		event.preventDefault();
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		greetMsg = await invoke("greet", { name });
	}
</script>

<main class="container">
	<Nav />
	<Sys />
	<Footer />

	<!--
	removed, exist in the branch "widgets"
	<Email />
	<FollowUp />
	<Links />
	-->
</main>

<style>
	.container {
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.5rem 1.5rem 3rem;
		text-align: left;
		box-sizing: border-box;
	}

	/* Nav is a full-bleed bar — pull it out of the container padding. */
	.container :global(nav) {
		margin: -1.5rem -1.5rem 0;
	}
</style>
