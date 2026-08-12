<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { cpuStore } from "$lib/cpuStore.svelte";
	import { type SystemStats } from "$lib/systemStats";
	import CPUGraph from "$lib/components/CPUGraph.svelte";

	let expanded = $state(false);
	let graphVisible = $state(false);

	onMount(() => cpuStore.start());
	onDestroy(() => cpuStore.stop());

	const avg = (key: keyof SystemStats) =>
		cpuStore.buffer.reduce((sum, s) => sum + (s[key] as number), 0) / cpuStore.buffer.length;
</script>

<div class="panel">
	<button class="banner" onclick={() => (expanded = !expanded)}>
		<span>System Stats</span>
		<span class="arrow">{expanded ? "▲" : "▼"}</span>
	</button>

	<div class="panel-content" class:hidden={!expanded}>
		{#if cpuStore.stats}
			<!--
            <button onclick={() => (graphVisible = !graphVisible)}>
                {graphVisible ? "Hide Graph" : "Show Graph"}
            </button>

            {#if graphVisible}{/if}

            -->

			<CPUGraph />

			<table>
				<thead>
					<tr>
						<th>Stat</th>
						<th>Current</th>
						<th>Avg</th>
						<th>Min</th>
						<th>Max</th>
						<th>Full?</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>CPU %</td>

						<!--<td>{cpuStore.stats.cpu_usage_percent.toFixed(1)}%</td>-->
						<td>
							<div class="bar-wrap">
								<div
									class="bar-cpu"
									style="width: {cpuStore.stats.cpu_usage_percent.toFixed(0)}%"
									class:warn={cpuStore.stats.cpu_usage_percent > 70}
									class:danger={cpuStore.stats.cpu_usage_percent > 90}
								></div>
								<span
									class:warn={cpuStore.stats.cpu_usage_percent > 70}
									class:danger={cpuStore.stats.cpu_usage_percent > 90}
								>
									{cpuStore.stats.cpu_usage_percent.toFixed(1)}%
								</span>
							</div>
						</td>
						<td>{avg("cpu_usage_percent").toFixed(1)}%</td>
						<td>{cpuStore.statsMin.cpu_usage_percent.toFixed(1)}%</td>
						<td>{cpuStore.statsMax.cpu_usage_percent.toFixed(1)}%</td>
						<td>
							<span class="tooltip"
								>📊
								<span class="popup">
									{#each cpuStore.buffer as s, idx}
										<span class:current={idx === cpuStore.numQueries % cpuStore.bufferSize}>
											{s.cpu_usage_percent.toFixed(1)}%
										</span>{#if idx < cpuStore.buffer.length - 1}{" | "}{/if}
									{/each}
								</span>
							</span>
						</td>
					</tr>
					<tr>
						<td>RAM (MB)</td>
						<!--<td
                            >{cpuStore.stats.ram_used_mb} / {cpuStore.stats
                                .ram_total_mb}</td
                        >-->
						<td>
							<div class="bar-wrap">
								<div
									class="bar-ram"
									style="width: {(
										(cpuStore.stats.ram_used_mb / cpuStore.stats.ram_total_mb) *
										100
									).toFixed(0)}%"
								></div>
								<span>{cpuStore.stats.ram_used_mb} / {cpuStore.stats.ram_total_mb}</span>
							</div>
						</td>
						<td>{avg("ram_used_mb").toFixed(0)}</td>
						<td>{cpuStore.statsMin.ram_used_mb}</td>
						<td>{cpuStore.statsMax.ram_used_mb}</td>
						<td>
							<span class="tooltip"
								>📊
								<span class="popup">
									{#each cpuStore.buffer as s, idx}
										<span class:current={idx === cpuStore.numQueries % cpuStore.bufferSize}>
											{s.ram_used_mb.toFixed(1)}MB
										</span>{#if idx < cpuStore.buffer.length - 1}{" | "}{/if}
									{/each}
								</span>
							</span>
						</td>
					</tr>
					<tr>
						<td>Temp °C</td>
						<!--
                        <td
                            >{cpuStore.stats.cpu_temp_celsius?.toFixed(1) ??
                                "N/A"}</td
                        >-->
						<td>
							{#if cpuStore.stats.cpu_temp_celsius != null}
								<div class="bar-wrap">
									<div
										class="bar-temp"
										style="width: {Math.min(cpuStore.stats.cpu_temp_celsius, 100)}%"
										class:warn={cpuStore.stats.cpu_temp_celsius > 85}
										class:danger={cpuStore.stats.cpu_temp_celsius > 95}
									></div>
									<span
										class:warn={cpuStore.stats.cpu_temp_celsius > 85}
										class:danger={cpuStore.stats.cpu_temp_celsius > 95}
									>
										{cpuStore.stats.cpu_temp_celsius.toFixed(1)}
									</span>
								</div>
							{:else}
								N/A
							{/if}
						</td>
						<td>
							{cpuStore.buffer.some((s) => s.cpu_temp_celsius != null)
								? avg("cpu_temp_celsius").toFixed(1)
								: "N/A"}
						</td>
						<td>{cpuStore.statsMin.cpu_temp_celsius?.toFixed(1) ?? "N/A"}</td>
						<td>{cpuStore.statsMax.cpu_temp_celsius?.toFixed(1) ?? "N/A"}</td>
						<td>
							<span class="tooltip"
								>📊
								<span class="popup">
									{#each cpuStore.buffer as s, idx}
										<span class:current={idx === cpuStore.numQueries % cpuStore.bufferSize}>
											{s.cpu_temp_celsius?.toFixed(1) ?? "N/A"}
										</span>{#if idx < cpuStore.buffer.length - 1}{" | "}{/if}
									{/each}
								</span>
							</span>
						</td>
					</tr>
				</tbody>
			</table>

			<!--
            <span class="buffer-info">
                {cpuStore.numQueries}
                {cpuStore.numQueries === 1 ? "sample" : "samples"} / {cpuStore.bufferSize}
                buffer
            </span>
            -->
		{:else}
			<p>Loading CPU Stats...</p>
		{/if}
	</div>
</div>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9em;
	}
	thead th {
		color: var(--text-muted, var(--text));
		font-weight: 600;
		text-transform: uppercase;
		font-size: 0.75em;
		letter-spacing: 0.05em;
		padding: 0.6em 0.8em;
		border-bottom: 2px solid var(--border);
		opacity: 0.7;
	}
	tbody tr {
		border-bottom: 1px solid var(--border);
		transition: background 0.15s;
	}
	tbody tr:hover {
		background: var(--primary-hover);
	}
	tbody td {
		padding: 0.55em 0.8em;
		font-family: "JetBrains Mono", "Fira Code", monospace;
		color: var(--text);
	}
	tbody td:first-child {
		color: var(--text);
		font-family: inherit;
		font-size: 0.85em;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.6;
	}

	/* Color states */
	.warn {
		color: var(--warning, #f5a623);
	}
	.danger {
		color: var(--danger, #e05252);
		font-weight: bold;
	}

	/* Mini progress bar */
	.bar-wrap {
		position: relative;
		background: var(--surface);
		border: 2px solid var(--border);
		border-radius: 4px;
		height: 1.4em;
		min-width: 120px;
		display: flex;
		align-items: center;
	}
	.bar {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: var(--primary-hover);
		border-radius: 2px 0 0 2px;
		transition: width 0.3s ease;
	}
	.bar-cpu {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		/* applies transparency to the var color: */
		background: color-mix(in srgb, var(--data-1) 50%, transparent);
		border-radius: 2px 0 0 2px;
		transition: width 0.3s ease;
	}
	.bar-ram {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: color-mix(in srgb, var(--data-2) 50%, transparent);
		border-radius: 2px 0 0 2px;
		transition: width 0.3s ease;
	}
	.bar-temp {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: color-mix(in srgb, var(--data-3) 50%, transparent);
		border-radius: 2px 0 0 2px;
		transition: width 0.3s ease;
	}
	.bar.warn {
		background: color-mix(in srgb, var(--warning, #f5a623) 25%, transparent);
		border-right-color: var(--warning, #f5a623);
	}
	.bar.danger {
		background: color-mix(in srgb, var(--danger, #e05252) 25%, transparent);
		border-right-color: var(--danger, #e05252);
	}
	.bar-wrap span {
		position: relative;
		z-index: 1;
		padding: 0 0.5em;
		font-size: 0.85em;
		color: var(--text);
	}

	/* Panel is stored in global — no overflow:hidden so tooltips can escape */
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

	/* Tooltip — z-index keeps it above everything */
	.tooltip {
		position: relative;
		cursor: default;
	}
	.tooltip .popup {
		display: none;
		position: absolute;
		right: 0;
		bottom: 1.5em;
		background: #222;
		color: #fff;
		padding: 0.5em 0.75em;
		border-radius: 6px;
		white-space: normal;
		max-width: 800px;
		min-width: 300px;
		word-wrap: break-word;
		overflow-wrap: break-word;
		z-index: 10;
		font-size: 0.85em;
	}
	.tooltip:hover .popup {
		display: block;
	}
	.current {
		font-weight: bold;
		color: yellow;
	}

	button {
		padding: 0.25rem 0.75rem;
		border: 2px solid var(--border);
		border-radius: 4px;
		background: transparent;
		color: var(--text);
		cursor: pointer;
	}
	button:hover {
		background: var(--primary-hover);
	}

	.banner-meta {
		font-family: "JetBrains Mono", "Fira Code", monospace;
		font-size: 0.75em;
		opacity: 0.5;
	}
	.buffer-info {
		display: block;
		text-align: center;
		font-family: "JetBrains Mono", "Fira Code", monospace;
		font-size: 0.75em;
		opacity: 0.5;
		margin-top: 1em;
		margin-left: 3rem;
	}
</style>
