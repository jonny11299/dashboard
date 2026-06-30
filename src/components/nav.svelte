<script>
    // @ts-ignore
    import { themeStore } from "$lib/themeStore.svelte";
</script>

<nav>
    <span class="title"><h1>CPU Dashboard</h1></span>

    <div class="theme-buttons">
        <button onclick={() => themeStore.setTheme("light")}>Light</button>
        <button onclick={() => themeStore.setTheme("dark")}>Dark</button>
        <button onclick={() => themeStore.setTheme("system")}>System</button>
    </div>

    <p>Current: {themeStore.theme}</p>
</nav>

<style>
    nav {
        margin-top: 0px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0rem 2rem;
        background: var(--color-bg);
        border-bottom: 2px solid var(--color-border);
        border-radius: 0px;
    }

    .title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-primary);
    }

    .theme-buttons {
        display: flex;
        gap: 0.5rem;
    }

    button {
        padding: 0.25rem 0.75rem;
        border: 2px solid var(--color-border);
        border-radius: 4px;
        background: transparent;
        color: var(--color-text);
        cursor: pointer;
    }

    button:hover {
        border-color: var(--color-primary-hover);
        color: var(--color-primary-hover);
    }
</style>
