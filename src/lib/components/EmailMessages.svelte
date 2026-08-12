<script>
	import { SvelteSet } from "svelte/reactivity";

	let { messages = [], unreadOnly = false } = $props();

	const dtf = new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	});

	let open = new SvelteSet();

	function toggle(id) {
		if (open.has(id)) open.delete(id);
		else open.add(id);
	}

	// payload.headers is an unordered array of { name, value } and casing is not
	// guaranteed, so index it case-insensitively.
	function headerMap(m) {
		const map = new Map();
		for (const h of m?.payload?.headers ?? []) {
			if (h?.name) map.set(h.name.toLowerCase(), h.value ?? "");
		}
		return map;
	}

	// body.data is base64url of raw bytes — decode through TextDecoder so
	// multi-byte UTF-8 survives.
	function decodeBody(data) {
		if (!data) return "";
		const b64 = data.replaceAll("-", "+").replaceAll("_", "/");
		try {
			const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
			return new TextDecoder("utf-8").decode(bytes);
		} catch {
			return "";
		}
	}

	// Walk the MIME tree for the first text/plain and text/html part,
	// ignoring anything that looks like an attachment.
	function findBodies(part, found = { text: "", html: "" }) {
		if (!part) return found;
		const mime = part.mimeType ?? "";
		const isAttachment = !!part.filename;

		if (!isAttachment && part.body?.data) {
			if (mime === "text/plain" && !found.text) found.text = decodeBody(part.body.data);
			if (mime === "text/html" && !found.html) found.html = decodeBody(part.body.data);
		}
		for (const child of part.parts ?? []) findBodies(child, found);
		return found;
	}

	// One flat object per message. Each key here has exactly one matching block
	// in the markup below, so searching for a field name finds both.
	let formatted = $derived.by(() =>
		[...(messages ?? [])]
			// internalDate is a string of ms since epoch — coerce before comparing
			.sort((a, b) => Number(b?.internalDate ?? 0) - Number(a?.internalDate ?? 0))
			.map((m, i) => {
				const h = headerMap(m);
				const ms = Number(m?.internalDate);
				const date = Number.isFinite(ms) && ms > 0 ? new Date(ms) : null;
				const bodies = findBodies(m?.payload);

				return {
					id: m?.id ?? `msg-${i}`,

					from: h.get("from") ?? "",
					returnPath: h.get("return-path") ?? "",
					subject: h.get("subject") ?? "",
					to: h.get("to") ?? "",
					cc: h.get("cc") ?? "",
					replyTo: h.get("reply-to") ?? "",

					snippet: m?.snippet ?? "",
					text: bodies.text,
					html: bodies.html,
					received: date ? dtf.format(date) : "",
					iso: date ? date.toISOString() : undefined,
					unread: m?.labelIds.includes("UNREAD"),
				};
			}),
	);
</script>

<div class="container">
	{#each formatted as m (m.id)}
		{@const expanded = open.has(m.id)}
		<article class="message" class:expanded class:hide={unreadOnly && !m?.unread}>
			<button
				type="button"
				class="summary"
				aria-expanded={expanded}
				aria-controls="body-{m.id}"
				onclick={() => toggle(m.id)}
			>
				<span class="headers">
					<!-- From -->
					{#if m.from}
						<span class="field from">
							<span class="label" class:highlight1={m?.unread}>From</span>
							<span class="value" class:highlight1={m?.unread}>{m.from}</span>
							<span class="value" class:muted={true}>{m.returnPath}</span>
						</span>
					{/if}

					<!-- Subject -->
					{#if m.subject}
						<span class="field subject">
							<span class="label" class:highlight2={m?.unread}>Subject</span>
							<span class="value" class:highlight2={m?.unread} class:muted={!m?.unread}
								>{m.subject}</span
							>
							<!-- Date received -->
							{#if m.received}
								<time class="received" datetime={m.iso}>| {m.received}</time>
							{/if}
						</span>
					{/if}

					{#if expanded}
						<!-- To -->
						{#if m.to}
							<span class="field to">
								<span class="label">To</span>
								<span class="value">{m.to}</span>
							</span>
						{/if}

						<!-- Cc -->
						{#if m.cc}
							<span class="field cc">
								<span class="label">Cc</span>
								<span class="value">{m.cc}</span>
							</span>
						{/if}

						<!-- Reply To -->
						{#if m.replyTo}
							<span class="field reply-to">
								<span class="label">Reply To</span>
								<span class="value">{m.replyTo}</span>
							</span>
						{/if}
					{/if}
				</span>

				<span class="chevron" aria-hidden="true">{expanded ? "\u2212" : "+"}</span>
			</button>

			<!-- Snippet (collapsed view only)
			{#if !expanded && m.snippet}
				<p class="snippet">{m.snippet}</p>
			{/if}
			 -->

			<!-- Body (expanded view only) -->
			<div id="body-{m.id}" class="body" hidden={!expanded}>
				{#if expanded}
					{#if m.text}
						<pre class="plain">{m.text}</pre>
					{:else if m.html}
						<!-- Sandboxed: no allow-scripts, no allow-same-origin. Remote mail HTML
						     must never run in your origin. -->
						<iframe
							class="rendered"
							title="Message body"
							sandbox=""
							referrerpolicy="no-referrer"
							srcdoc={m.html}
						></iframe>
					{:else}
						<p class="no-body">
							No body available — fetch this message with <code>format=full</code>.
						</p>
					{/if}
				{/if}
			</div>
		</article>
	{:else}
		<p>No messages retrieved yet</p>
	{/each}
</div>

<style>
	.container {
		width: auto;
		height: auto;
		border: 2px solid var(--border-strong);
	}
	.message {
		display: flex;
		flex-direction: column;
		gap: 0rem;
		padding: 0.75rem;
		border-bottom: 2px solid var(--border-strong);
	}
	.message:hover {
		background-color: var(--surface);
	}
	.hide {
		display: none;
	}
	.summary {
		display: flex;
		align-items: flex-start;
		margin-top: 0rem;
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
	.summary:focus-visible {
		outline: 2px solid var(--data-1);
		outline-offset: 2px;
	}
	.headers {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		flex: 1;
		min-width: 0;
	}

	/* shared row layout — every .field below inherits this */
	.field {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		min-width: 0;
	}
	.label {
		flex: 0 0 6.5rem;
		font-weight: 600;
	}
	.value {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	/* From */
	.field.from .value {
		font-weight: 600;
	}

	/* Return Path */
	.field.return-path {
		color: var(--text-muted, #6b7280);
		font-size: 0.875em;
	}
	.muted {
		color: var(--text-muted);
		font-size: 0.875em;
	}

	/* Subject */
	.field.subject .value {
		font-weight: 600;
	}

	/* To */
	.field.to {
		font-size: 0.9375em;
	}

	/* Cc */
	.field.cc {
		font-size: 0.9375em;
	}

	/* Reply To */
	.field.reply-to {
		color: var(--text-muted, #6b7280);
		font-size: 0.875em;
	}

	.chevron {
		flex: 0 0 auto;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted, #6b7280);
	}

	/* Snippet */
	.snippet {
		margin: 0rem;
		margin-inline: 1rem;
		padding-inline: 1rem;
		border: 2px solid var(--border);
		color: var(--text-muted, #6b7280);
		/* clamp long snippets to two lines */
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-align: left;
	}

	/* Body */
	.body {
		border-top: 1px solid var(--border);
		padding-top: 0.5rem;
	}
	.plain {
		margin: 0;
		max-height: 60vh;
		overflow: auto;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font: inherit;
		text-align: left;
	}
	.rendered {
		display: block;
		width: 100%;
		height: 60vh;
		border: 0;
		background: #fff;
		text-align: left;
	}
	.no-body {
		margin: 0;
		color: var(--text-muted, #6b7280);
		font-size: 0.875em;
	}

	/* Date received */
	.received {
		align-self: flex-end;
		font-variant-numeric: tabular-nums;
		font-size: 0.8125em;
		color: var(--text-muted, #6b7280);
	}

	.highlight1 {
		color: var(--data-1);
	}
	.highlight2 {
		color: var(--data-2);
	}
</style>
