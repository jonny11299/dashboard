<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { getSystemStats, type SystemStats } from "$lib/systemStats";

    let stats = $state<SystemStats | null>(null);
    let interval: ReturnType<typeof setInterval>;

    const bufferSize = 100;
    let statsBuffer = $state<SystemStats[]>([]);

    let statsMin = $state<SystemStats>({
        cpu_usage_percent: Infinity,
        ram_used_mb: Number.MAX_SAFE_INTEGER,
        ram_total_mb: Number.MAX_SAFE_INTEGER,
        cpu_temp_celsius: null,
    });
    let statsMax = $state<SystemStats>({
        cpu_usage_percent: 0,
        ram_used_mb: 0,
        ram_total_mb: 0,
        cpu_temp_celsius: null,
    });

    let numQueries = $state(0);

    const intervalMs: number = 1000; // poll every 1s

    onMount(() => {
        getSystemStats().then((s: SystemStats) => {
            stats = s;

            // init statsBuffer to be filled with the first sample
            for (let i = 0; i < bufferSize; i++) {
                statsBuffer.push({ ...stats });
            }

            statsMax = { ...stats };
            statsMin = { ...stats };
        });

        interval = setInterval(async () => {
            stats = await getSystemStats();
            numQueries++;
            const i = numQueries % bufferSize;

            // fill in at current index
            statsBuffer[i] = { ...stats };

            // set max states
            if (stats.cpu_usage_percent > statsMax.cpu_usage_percent)
                statsMax.cpu_usage_percent = stats.cpu_usage_percent;
            if (stats.ram_used_mb > statsMax.ram_used_mb)
                statsMax.ram_used_mb = stats.ram_used_mb;
            if (
                stats.cpu_temp_celsius != null &&
                (statsMax.cpu_temp_celsius == null ||
                    stats.cpu_temp_celsius > statsMax.cpu_temp_celsius)
            )
                statsMax.cpu_temp_celsius = stats.cpu_temp_celsius;

            // set min states
            if (stats.cpu_usage_percent < statsMin.cpu_usage_percent)
                statsMin.cpu_usage_percent = stats.cpu_usage_percent;
            if (stats.ram_used_mb < statsMin.ram_used_mb)
                statsMin.ram_used_mb = stats.ram_used_mb;
            if (
                stats.cpu_temp_celsius != null &&
                (statsMin.cpu_temp_celsius == null ||
                    stats.cpu_temp_celsius < statsMin.cpu_temp_celsius)
            )
                statsMin.cpu_temp_celsius = stats.cpu_temp_celsius;

            // console.log(statsBuffer);
        }, intervalMs);
    });

    onDestroy(() => clearInterval(interval));
</script>

{#if stats}
    {@const avg = (key: keyof SystemStats) =>
        statsBuffer.reduce((sum, s) => sum + (s[key] as number), 0) /
        statsBuffer.length}

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
                <td>{stats.cpu_usage_percent.toFixed(1)}%</td>
                <td>{avg("cpu_usage_percent").toFixed(1)}%</td>
                <td>{statsMin.cpu_usage_percent.toFixed(1)}%</td>
                <td>{statsMax.cpu_usage_percent.toFixed(1)}%</td>
                <td>
                    <span class="tooltip"
                        >📊
                        <span class="popup"
                            >{statsBuffer
                                .map(
                                    (s) => s.cpu_usage_percent.toFixed(1) + "%",
                                )
                                .join(", ")}</span
                        >
                    </span>
                </td>
            </tr>
            <tr>
                <td>RAM (MB)</td>
                <td>{stats.ram_used_mb} / {stats.ram_total_mb}</td>
                <td>{avg("ram_used_mb").toFixed(0)}</td>
                <td>{statsMin.ram_used_mb}</td>
                <td>{statsMax.ram_used_mb}</td>
                <td>
                    <span class="tooltip"
                        >📊
                        <span class="popup"
                            >{statsBuffer
                                .map((s) => s.ram_used_mb.toFixed(1) + "MB")
                                .join(", ")}</span
                        >
                    </span>
                </td>
            </tr>
            <tr>
                <td>Temp °C</td>
                <td>{stats.cpu_temp_celsius?.toFixed(1) ?? "N/A"}</td>
                <td
                    >{statsBuffer.some((s) => s.cpu_temp_celsius != null)
                        ? avg("cpu_temp_celsius").toFixed(1)
                        : "N/A"}</td
                >
                <td>{statsMin.cpu_temp_celsius?.toFixed(1) ?? "N/A"}</td>
                <td>{statsMax.cpu_temp_celsius?.toFixed(1) ?? "N/A"}</td>
                <td>
                    <span class="tooltip"
                        >📊
                        <span class="popup"
                            >{statsBuffer
                                .map(
                                    (s) =>
                                        s.cpu_temp_celsius?.toFixed(1) ?? "N/A",
                                )
                                .join(", ")}</span
                        >
                    </span>
                </td>
            </tr>
        </tbody>
    </table>
{:else}
    <p>Loading CPU Stats...</p>
{/if}

<style>
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
        z-index: 10;
        font-size: 0.85em;
    }
    .tooltip:hover .popup {
        display: block;
    }
</style>
