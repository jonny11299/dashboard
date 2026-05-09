type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
    let theme = $state<Theme>('system');

    const isDark = $derived(
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    function setTheme(newTheme: Theme) {
        theme = newTheme;
        localStorage.setItem('theme', newTheme);
        console.log("Setting theme to " + newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    }

    function init() {
        const saved = localStorage.getItem('theme') as Theme | null;
        setTheme(saved ?? 'system');
    }

    return {
        get theme() { return theme; },
        get isDark() { return isDark; },
        setTheme,
        init,
    };
}

export const themeStore = createThemeStore();