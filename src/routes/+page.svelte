<script lang="ts">
	import "../app.css";
	import { invoke } from "@tauri-apps/api/core";
	import Sys from "$lib/components/Sys.svelte";
	import Nav from "$lib/components/Nav.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Email from "$lib/components/Email.svelte";
	import FollowUp from "$lib/components/FollowUp.svelte";

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
	<Email />
	<FollowUp />
	<Sys />
	<!--
	<Footer />
	-->
</main>

<style>
	.logo.vite:hover {
		filter: drop-shadow(0 0 2em #747bff);
	}

	.logo.svelte-kit:hover {
		filter: drop-shadow(0 0 2em #ff3e00);
	}

	:root {
		font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
		font-size: 16px;
		line-height: 24px;
		font-weight: 400;

		color: #0f0f0f;
		background-color: #f6f6f6;

		font-synthesis: none;
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		-webkit-text-size-adjust: 100%;
	}

	.container {
		margin: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
	}

	.logo {
		height: 6em;
		padding: 1.5em;
		will-change: filter;
		transition: 0.75s;
	}

	.logo.tauri:hover {
		filter: drop-shadow(0 0 2em #24c8db);
	}

	.row {
		display: flex;
		justify-content: center;
	}

	a {
		font-weight: 500;
		color: #646cff;
		text-decoration: inherit;
	}

	a:hover {
		color: #535bf2;
	}

	h1 {
		text-align: center;
	}

	input,
	button {
		border-radius: 8px;
		border: 1px solid transparent;
		padding: 0.6em 1.2em;
		font-size: 1em;
		font-weight: 500;
		font-family: inherit;
		color: #0f0f0f;
		background-color: #ffffff;
		transition: border-color 0.25s;
		box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
	}

	button {
		cursor: pointer;
	}

	button:hover {
		border-color: #396cd8;
	}
	button:active {
		border-color: #396cd8;
		background-color: #e8e8e8;
	}

	input,
	button {
		outline: none;
	}

	#greet-input {
		margin-right: 5px;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			color: #f6f6f6;
			background-color: #2f2f2f;
		}

		a:hover {
			color: #24c8db;
		}

		input,
		button {
			color: #ffffff;
			background-color: #0f0f0f98;
		}
		button:active {
			background-color: #0f0f0f69;
		}
	}

	.footer-tag {
		position: fixed;
		bottom: 12px;
		right: 12px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-size: 0.75rem;
		line-height: 1.3;
		color: #888;
		text-decoration: none;
		opacity: 0.7;
		transition: opacity 0.2s;
		z-index: 50;
	}

	.footer-tag:hover {
		opacity: 1;
		color: #535bf2;
	}

	.footer-tag-sub {
		font-weight: 500;
	}

	@media (prefers-color-scheme: dark) {
		.footer-tag {
			color: #aaa;
		}
		.footer-tag:hover {
			color: #24c8db;
		}
	}
</style>
