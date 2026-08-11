<script>
	import Collapsable from "$lib/components/Collapsable.svelte";
	import EmailMessages from "$lib/components/EmailMessages.svelte";
	import { login } from "$lib/utils/gmail_auth";
	import { write, read, write_from_ls } from "$lib/utils/auth_saver.js";
	import { onMount } from "svelte";

	let loggedIn = $state(false);
	let messages = $state([]);

	onMount(() => {
		log_me_in();
	});

	async function log_me_in() {
		// attempt a read

		const readAttempt = read();
		if (readAttempt?.logged_in) {
			// already logged in, skipping auth
			loggedIn = true;
			console.log("Already logged in, skipping auth");
		} else if (readAttempt?.ls_available) {
			loggedIn = write_from_ls();
			console.log("Logged in from ls_available.");
		} else {
			const res = await login();
			console.log("Logged in, here's info:");
			console.log(res);
			const write_success = write(res);
			if (write_success) {
				console.log("Successfully saved token data");
				loggedIn = true;
			} else {
				loggedIn = false;
			}
		}
	}

	// the one I've written, piggybacks off claude but with some more checks
	async function getInboxSummary() {
		let data = read();
		if (data?.expired) {
			const re_log = await log_me_in();
			data = read();
		}

		if (data?.logged_in) {
			const res = await listInbox(data.access_token);
			console.log("Gotchur inbox!!");
			console.log(res);
			const msgs = [];
			for (let o of res) {
				const m = await gmailFetch(`messages/${o.id}`, data.access_token);
				console.log(m);
				msgs.push(m);
			}
			messages = msgs;
		} else {
			console.log("auth_saver doesn't think we're logged in. Bailing inbox summary.");
		}
	}

	async function gmailFetch(path, token, params = {}) {
		const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`);
		url.search = new URLSearchParams(params).toString();
		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) throw new Error(`Gmail ${res.status}: ${await res.text()}`);
		return res.json();
	}

	// IDs of recent inbox messages
	export async function listInbox(token, max = 7) {
		const { messages = [] } = await gmailFetch("messages", token, {
			maxResults: max,
			q: "in:inbox", // full Gmail search syntax works here
		});
		return messages;
	}

	async function getHeaders(token, id) {
		const msg = await gmailFetch(`messages/${id}`, token, {
			format: "metadata",
			metadataHeaders: ["From", "Subject", "Date"],
		});
		const h = Object.fromEntries(msg.payload.headers.map((x) => [x.name, x.value]));
		return {
			id,
			from: h.From,
			subject: h.Subject,
			date: h.Date,
			snippet: msg.snippet, // ~100 chars, free, often enough
			unread: msg.labelIds?.includes("UNREAD"),
		};
	}
</script>

<Collapsable title="Email">
	<button onclick={() => log_me_in()}>Attempt Login</button>
	{#if loggedIn}
		<button onclick={() => getInboxSummary()}>Get inbox</button>
	{/if}
	<EmailMessages {messages}></EmailMessages>
</Collapsable>

<style>
</style>
