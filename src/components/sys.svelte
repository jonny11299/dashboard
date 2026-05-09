<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { cpuStore } from "$lib/cpuStore.svelte";
    import { type SystemStats } from "$lib/systemStats";
    import CPUGraph from "./CPUGraph.svelte";

    let expanded = $state(true);
    let graphVisible = $state(false);

    onMount(() => cpuStore.start());
    onDestroy(() => cpuStore.stop());

    const avg = (key: keyof SystemStats) =>
        cpuStore.buffer.reduce((sum, s) => sum + (s[key] as number), 0) /
        cpuStore.buffer.length;
</script>

<div class="panel">
    <button class="banner" onclick={() => (expanded = !expanded)}>
        <span>System Stats</span>
        <span class="arrow">{expanded ? "▲" : "▼"}</span>
    </button>

    <div class="panel-content" class:hidden={!expanded}>
        {#if cpuStore.stats}
            <button onclick={() => (graphVisible = !graphVisible)}>
                {graphVisible ? "Hide Graph" : "Show Graph"}
            </button>

            {#if graphVisible}
                <CPUGraph />
            {/if}

            <p>
                {cpuStore.numQueries}
                {cpuStore.numQueries === 1 ? "sample" : "samples"} / {cpuStore.bufferSize}
                buffer.
            </p>

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
                        <td>{cpuStore.stats.cpu_usage_percent.toFixed(1)}%</td>
                        <td>{avg("cpu_usage_percent").toFixed(1)}%</td>
                        <td
                            >{cpuStore.statsMin.cpu_usage_percent.toFixed(
                                1,
                            )}%</td
                        >
                        <td
                            >{cpuStore.statsMax.cpu_usage_percent.toFixed(
                                1,
                            )}%</td
                        >
                        <td>
                            <span class="tooltip"
                                >📊
                                <span class="popup">
                                    {#each cpuStore.buffer as s, idx}
                                        <span
                                            class:current={idx ===
                                                cpuStore.numQueries %
                                                    cpuStore.bufferSize}
                                        >
                                            {s.cpu_usage_percent.toFixed(1)}%
                                        </span>{#if idx < cpuStore.buffer.length - 1}{" | "}{/if}
                                    {/each}
                                </span>
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>RAM (MB)</td>
                        <td
                            >{cpuStore.stats.ram_used_mb} / {cpuStore.stats
                                .ram_total_mb}</td
                        >
                        <td>{avg("ram_used_mb").toFixed(0)}</td>
                        <td>{cpuStore.statsMin.ram_used_mb}</td>
                        <td>{cpuStore.statsMax.ram_used_mb}</td>
                        <td>
                            <span class="tooltip"
                                >📊
                                <span class="popup">
                                    {#each cpuStore.buffer as s, idx}
                                        <span
                                            class:current={idx ===
                                                cpuStore.numQueries %
                                                    cpuStore.bufferSize}
                                        >
                                            {s.ram_used_mb.toFixed(1)}MB
                                        </span>{#if idx < cpuStore.buffer.length - 1}{" | "}{/if}
                                    {/each}
                                </span>
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>Temp °C</td>
                        <td
                            >{cpuStore.stats.cpu_temp_celsius?.toFixed(1) ??
                                "N/A"}</td
                        >
                        <td>
                            {cpuStore.buffer.some(
                                (s) => s.cpu_temp_celsius != null,
                            )
                                ? avg("cpu_temp_celsius").toFixed(1)
                                : "N/A"}
                        </td>
                        <td
                            >{cpuStore.statsMin.cpu_temp_celsius?.toFixed(1) ??
                                "N/A"}</td
                        >
                        <td
                            >{cpuStore.statsMax.cpu_temp_celsius?.toFixed(1) ??
                                "N/A"}</td
                        >
                        <td>
                            <span class="tooltip"
                                >📊
                                <span class="popup">
                                    {#each cpuStore.buffer as s, idx}
                                        <span
                                            class:current={idx ===
                                                cpuStore.numQueries %
                                                    cpuStore.bufferSize}
                                        >
                                            {s.cpu_temp_celsius?.toFixed(1) ??
                                                "N/A"}
                                        </span>{#if idx < cpuStore.buffer.length - 1}{" | "}{/if}
                                    {/each}
                                </span>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        {:else}
            <p>Loading CPU Stats...</p>
        {/if}
    </div>
</div>

<style>
    table {
        width: 100%;
        text-align: left;
    }
    .panel {
        width: 100%;
        border: 2px solid black;
        border-radius: 5px;
        box-sizing: border-box;
    }
    .banner {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5em 1em;
        background: #333;
        color: #fff;
        border: none;
        cursor: pointer;
        font-size: 1em;
    }
    .banner:hover {
        background: #444;
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
    .tooltip {
        position: relative;
        cursor: default;
    }
    .tooltip .popup {
        display: none;
        position: absolute;
        right: 0;
        top: 1.5em;
        background: #222;
        color: #fff;
        padding: 0.5em 0.75em;
        border-radius: 6px;
        white-space: normal;
        max-width: 500px;
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
</style>
