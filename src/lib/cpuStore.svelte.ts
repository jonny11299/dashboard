import { getSystemStats, type SystemStats } from "$lib/systemStats";

const BUFFER_SIZE = 100;
const INTERVAL_MS = 1000;

function createCpuStore() {
    let stats = $state<SystemStats | null>(null);
    let buffer = $state<SystemStats[]>([]);
    let numQueries = $state(0);
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

    let interval: ReturnType<typeof setInterval> | null = null;

    function updateMinMax(s: SystemStats) {
        if (s.cpu_usage_percent > statsMax.cpu_usage_percent)
            statsMax.cpu_usage_percent = s.cpu_usage_percent;
        if (s.ram_used_mb > statsMax.ram_used_mb)
            statsMax.ram_used_mb = s.ram_used_mb;
        if (s.cpu_temp_celsius != null &&
            (statsMax.cpu_temp_celsius == null || s.cpu_temp_celsius > statsMax.cpu_temp_celsius))
            statsMax.cpu_temp_celsius = s.cpu_temp_celsius;

        if (s.cpu_usage_percent < statsMin.cpu_usage_percent)
            statsMin.cpu_usage_percent = s.cpu_usage_percent;
        if (s.ram_used_mb < statsMin.ram_used_mb)
            statsMin.ram_used_mb = s.ram_used_mb;
        if (s.cpu_temp_celsius != null &&
            (statsMin.cpu_temp_celsius == null || s.cpu_temp_celsius < statsMin.cpu_temp_celsius))
            statsMin.cpu_temp_celsius = s.cpu_temp_celsius;
    }

    async function start() {
        const initial = await getSystemStats();
        stats = initial;
        buffer = Array(BUFFER_SIZE).fill({ ...initial });
        statsMax = { ...initial };
        statsMin = { ...initial };

        interval = setInterval(async () => {
            const s = await getSystemStats();
            stats = s;
            numQueries++;
            buffer[numQueries % BUFFER_SIZE] = { ...s };
            updateMinMax(s);
        }, INTERVAL_MS);
    }

    function stop() {
        if (interval) clearInterval(interval);
    }

    return {
        get stats() { return stats; },
        get buffer() { return buffer; },
        get numQueries() { return numQueries; },
        get statsMin() { return statsMin; },
        get statsMax() { return statsMax; },
        get bufferSize() { return BUFFER_SIZE; },
        start,
        stop,
    };
}

export const cpuStore = createCpuStore();