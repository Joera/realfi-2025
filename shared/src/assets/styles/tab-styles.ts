export const tabStylesString = `

    .tabs-container {
        margin-bottom: 2rem;
        width: 100%;
    }

    .tabs {
        display: flex;
        gap: 0;
        margin: 0 auto -1px auto;
        padding: 0 1.5rem;
    }

    .tab {
        padding: 1rem 1.5rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 400;
        color: var(--color-too-dark);
        transition: all 0.2s;
        border-bottom: 2px solid var(--color-too-dark);
        border-radius: 0;
    }

    .tab:hover {
        color: black;
    }

    .tab.active {
        color: var(--color-too-dark);
        border-bottom-color: white;
        border-left: 2px solid var(--color-too-dark);
        border-top: 2px solid var(--color-too-dark);
        border-right: 2px solid var(--color-too-dark);
        border-bottom: 2px solid var(--color-bg);
    }

    .tab:last-of-type {
    
        flex: 1;
        text-align: left;
    }
    `
export const tabStyles = new CSSStyleSheet();
tabStyles.replaceSync(tabStylesString)