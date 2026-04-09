export const typograhyStylestring = `
    
    body, p, div {
        font-weight: 400;
        line-height: 1.55;
    }

    h1 {

        font-size: 2.8rem;
        font-family: "Cormorant Garamond";
        font-style: normal;
        font-weight: 700;
        color: var(--color-too-dark);

        span {
            font-size: 2.4rem;
            font-family: "Cormorant Garamond";
            font-style: normal;
            font-weight: 700;
            color: white;
        }
    }

    h2 {

        font-family: "Monaspace Neon";
        font-optical-sizing: auto;
        font-weight: 600;
        font-style: normal;

        font-size: 1.8rem;
        line-height: 1.3;
        color: var(--color-too-dark);
    }

    h2.bordered-header {
        color: var(--color-too-dark);
        border-bottom: 2px solid var(--color-too-dark);
    }

    *, p {
        font-family: "Monaspace Neon";
        font-style: normal;
        font-weight: 400;
        font-size: 1rem;
        line-height: 1.55;
    }
`

export const typograhyStyles = new CSSStyleSheet();
typograhyStyles.replaceSync(typograhyStylestring);