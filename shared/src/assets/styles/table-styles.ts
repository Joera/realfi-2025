import { breakpoints } from "./breakpoints";

export const tableStylesString = `

    .table {
        display: grid;
        gap: 0;
        overflow: hidden;
        width: 100%;
    }

    .table-header {
        padding: .75rem;
        border-bottom: 1px solid var(--color-too-dark);
    }

    .table-header:first-child {
        padding: .75rem  .75rem .75rem 0;
    }

    .table-cell {
        padding: .75rem;
        border-bottom: 1px solid var(--color-too-dark);
        color: var(--color-too-dark);
    }
    
    .table-cell:first-child {
        padding: .75rem  .75rem .75rem 0;
    }

    .table-row {
        display: contents;
        cursor: pointer;

        &:last-of-type .table-cell {
            border-bottom: none
        }
    }

    .caret {

        display: flex;
        align-items: center;
        color: var(--color-too-dark);
        opacity: 0;
        transition: opacity 0.2s ease;
        margin-top: -.5rem;

        svg {
            width: .75rem;
            height: auto;
            fill: var(--color-too-dark);
        }
    }

    .table-row:hover .caret {
        opacity: 1;
    }

    .table-row:hover .table-cell {
        color: var(--color-too-dark);
        --copy-hash-color: var(--color-too-dark);
    }

    .hide-sm { display: none; }

    @container (min-width: ${breakpoints.md}px) {
                
        .hide-sm { display: block; }

    }

`;

export const tableStyles = new CSSStyleSheet();
tableStyles.replaceSync(tableStylesString)


