<script>
    // @ts-ignore
    import { themeStore } from "$lib/theme.svelte.ts";
    import { onMount } from "svelte";

    onMount(() => {
        themeStore.init();
    });
</script>

<slot />
