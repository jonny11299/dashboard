<script>
    // @ts-ignore
    import { themeStore } from "$lib/themeStore.svelte";
    import { onMount } from "svelte";

    onMount(() => {
        themeStore.init();
    });
</script>

<slot />
