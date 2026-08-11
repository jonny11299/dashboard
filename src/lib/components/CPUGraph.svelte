<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import uPlot from "uplot";
    import chroma from "chroma-js";
    import "uplot/dist/uPlot.min.css";
    import { cpuStore } from "$lib/cpuStore.svelte";
    import { themeStore } from "$lib/themeStore.svelte";

    let container: HTMLDivElement;
    let chart: uPlot;

    const height = 300;
    const MAX_RAM_ON_THIS_COMPUTER = 16384; // look man... it's from systemStats.ts, this is a lazy solution but it works for me.
    // just reset this for your own ram if you get an upgrade...
    function mbToPercent(mb: number): number {
        return Number(((100 * mb) / MAX_RAM_ON_THIS_COMPUTER).toFixed(1));
    }
    // percent ranges [0, 100]
    function percentToMb(percent: number): number {
        return Math.round((MAX_RAM_ON_THIS_COMPUTER * percent) / 100);
    }

    // x-axis (time) actually stores the number of seconds since the graph was opened,
    // because the graph is created and destroyed on mount / dismount.
    // we then format the time based on a time snapshot taken on mount
    const times: number[] = [];
    const cpuValues: number[] = [];
    const memoryValues: number[] = [];
    const heatValues: number[] = [];
    let elapsedSeconds = 0;
    let numSamplesAtStart = 0;
    let timeStart = Date.now();

    // Subscribe to theme changes:
    $effect(() => {
        const _ = themeStore.theme; // subscribe to changes
        if (!chart || !container) return; // prevent rebuilding unnecessarily, or when components don't exist
        rebuildChart();
    });

    // get now in the right format
    function getNow() {
        return formatTime(Date.now());
    }

    // Use slice to chunk out the minutes / hours / etc.
    function formatTime(ms: number): string {
        return new Date(ms).toTimeString().slice(4, 8); // expects ms
    }

    // used for passing in theme changes to the graph
    function getCssVar(name: string) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim();
    }

    function rebuildChart() {
        chart?.destroy();
        chart = new uPlot(
            buildChartOptions(),
            [times, cpuValues, memoryValues, heatValues],
            container,
        );
    }

    function buildChartOptions(): uPlot.Options {
        const text = getCssVar("--text");
        const muted = getCssVar("--text-muted");
        // @ts-ignore - chroma .alpha() exists at runtime but types are incomplete
        const border = chroma(getCssVar("--text-muted")).alpha(0.3);
        const surface = getCssVar("--surface");
        const cpuColor = getCssVar("--data-1");
        const memoryColor = getCssVar("--data-2");
        const heatColor = getCssVar("--data-3");

        return {
            title: "CPUsage",
            id: "cpuchart1",
            class: "chartClass",
            width: container.clientWidth,
            height: height,
            scales: {
                x: { time: true },
                y: { range: [0, 110] },
            },
            axes: [
                {
                    label: `Time`,
                    stroke: muted,
                    grid: { stroke: border, width: 1 },
                    values: (_, ticks) =>
                        ticks.map((t) => formatTime(timeStart + t * 1000)),
                },
                {
                    label: "CPU (%)",
                    stroke: cpuColor,
                    grid: { stroke: border, width: 1 },
                    values: (_, ticks) => ticks.map((v) => `${v}%`),
                },
                {
                    label: "Memory (%)",
                    stroke: memoryColor,
                    values: (_, ticks) => ticks.map((v) => `${v}%`),
                },
                {
                    label: "Heat (°C)",
                    stroke: heatColor,
                    side: 1,
                    values: (_, ticks) => ticks.map((v) => `${v}°`),
                },
            ],
            series: [
                {
                    // formats the x value in the legend
                    value: (_, t) => getNow(),
                    label: "Time",
                },
                {
                    label: "CPU",
                    stroke: cpuColor,
                    width: 2,
                    // @ts-ignore - chroma .alpha() exists at runtime but types are incomplete
                    fill: `${chroma(cpuColor).alpha(0.2)}`,
                    // this elaborate null dance simply says:
                    // hey, are you fetching data from the list? Okay, display that data on the bottom chart.
                    // Else, just grab the latest data in the series.
                    // If that doesn't exist, settle for n/a
                    value: (self, cpu) => {
                        const v =
                            cpu === null
                                ? cpuValues[cpuValues.length - 1].toFixed(1)
                                : cpu.toFixed(1);
                        return v === null ? "n/a" : `${v}%`;
                    },
                },
                {
                    label: "Memory",
                    stroke: memoryColor,
                    width: 2,
                    // @ts-ignore - chroma .alpha() exists at runtime but types are incomplete
                    // fill: `${chroma(memoryColor).alpha(0.2)}`,
                    value: (self, memory) => {
                        const v =
                            memory === null
                                ? percentToMb(
                                      memoryValues[memoryValues.length - 1],
                                  )
                                : percentToMb(memory);
                        return v === null ? "n/a" : `${v}mb`;
                    },
                },
                {
                    label: "Heat",
                    stroke: heatColor,
                    width: 2,
                    // @ts-ignore - chroma .alpha() exists at runtime but types are incomplete
                    // fill: `${chroma(heatColor).alpha(0.2)}`,
                    value: (self, heat) => {
                        const v =
                            heat === null
                                ? heatValues[heatValues.length - 1].toFixed(1)
                                : heat.toFixed(1);
                        return v === null ? "n/a" : `${v}°C`;
                    },
                },
            ],
        };
    }

    onMount(() => {
        // update times and cpuValues with the buffer

        elapsedSeconds = 0;
        numSamplesAtStart = Math.min(cpuStore.numQueries, cpuStore.bufferSize);
        timeStart = Date.now();

        const b = cpuStore.buffer.slice(0, cpuStore.numQueries);

        b.forEach((s, i) => {
            times.push(elapsedSeconds++ - numSamplesAtStart);
            cpuValues.push(s.cpu_usage_percent);
            memoryValues.push(mbToPercent(s.ram_used_mb));
            heatValues.push(s.cpu_temp_celsius ?? 0);
        });

        // console.log(getNow());
        console.log(getNow());
        console.log(formatTime(Date.now()));

        chart = new uPlot(
            buildChartOptions(),
            [times, cpuValues, memoryValues, heatValues],
            container,
        );

        let rafId: number;
        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                chart.setSize({ width: container.clientWidth, height: height });
            });
        });
        ro.observe(container);

        return () => {
            ro.disconnect();
            cancelAnimationFrame(rafId);
        };
    });

    onDestroy(() => chart?.destroy());

    // Reactively push new points whenever store updates
    $effect(() => {
        const s = cpuStore.stats;
        if (!chart || !s) return;

        // store time in seconds
        times.push(elapsedSeconds++ - numSamplesAtStart);
        cpuValues.push(s.cpu_usage_percent);
        memoryValues.push(mbToPercent(s.ram_used_mb));
        heatValues.push(s.cpu_temp_celsius ?? 0);

        if (times.length > cpuStore.bufferSize) {
            times.shift();
            cpuValues.shift();
            memoryValues.shift();
            heatValues.shift();
        }

        chart.setData([times, cpuValues, memoryValues, heatValues]);
    });
</script>

<div bind:this={container} class="chartclass"></div>

<style>
    .chartclass {
        width: 95%;
        margin: 0 auto;
    }
</style>
