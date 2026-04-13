import { breakpoints } from "./breakpoints";

export const headerStylesString = `

   header {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 9rem;

        .container {

            flex-direction: row;
            justify-content: center;
            align-items: center;
        }

        h1 {
          
            margin: 0;
            margin-left: 1.5rem;
            margin-top: -0.75rem;
        }


        svg {

            margin: auto 0 auto 0 ;
            width: 6.4rem;
            height: auto;
            align-self: center;
            transition: all 0.3s ease;
        

            path {
                fill: var(--color-too-dark);
            }
        }
    }

    `

export const headerStyles = new CSSStyleSheet();
headerStyles.replaceSync(headerStylesString)

