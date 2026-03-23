import { breakpoints } from "./breakpoints";

export const footerStylesString = `

    footer {
        min-height: 5rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        background: var(--color-too-dark);
        color: white;

        > .container {
         
            flex-direction: column;

            @media(min-width: ${breakpoints.lg}px) {
                flex-direction: row;
            }
         
            > * {
                padding: 1.5rem;
                flex: 1;
                position: relative;

                @media(min-width: ${breakpoints.lg}px) {
                    flex: 1;
                }
            }   
        }

        h1 {
            color: var(--color-bg);
            font-size: 2.8rem;
            margin: 0;
                > span {
                    font-size 2.8rem;
                }
        }

        nav {
            width: 100%;

            ul {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: flex-start;

                a {
                    color: white;
                }
            }
        }
    }`

export const footerStyles = new CSSStyleSheet();
footerStyles.replaceSync(footerStylesString)

