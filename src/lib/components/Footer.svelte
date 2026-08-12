<script></script>

<a href="https://bischoffportfolio.com/" target="_blank" rel="noopener noreferrer" class="footer-tag">
    © J. Bischoff
    <span class="footer-tag-sub">Portfolio →</span>
</a>

<style>
    .footer-tag {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-family: var(--font-sans);
        font-size: 0.75rem;
        line-height: 1.3;
        color: var(--text-muted);
        text-decoration: none;
        opacity: 0.7;
        transition:
            opacity 0.2s,
            color var(--transition-time) ease;
        z-index: 50;
    }

    .footer-tag:hover {
        opacity: 1;
        color: var(--primary-hover);
    }

    .footer-tag-sub {
        font-weight: 500;
    }
</style>
