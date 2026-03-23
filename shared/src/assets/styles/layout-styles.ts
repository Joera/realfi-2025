import { breakpoints } from "./breakpoints";

export const layoutStylesString = `

    body {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

   .container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        width: calc(100vw - 1.5rem);

        @media (min-width: ${breakpoints.lg}px) {
            width: 100%; 
        }
    }
        
    .container-small {
        
        max-width: 600px;
    } 
    
    .container-large {
        max-width: 1000px;
    } 

    .container-full {

        width: 100vw;
    }

    .centered {
        justify-content: center;
        align-items: center;
    }

    .flex-row {
        flex-direction: row;
    }
`

export const layoutStyles = new CSSStyleSheet();
layoutStyles.replaceSync(layoutStylesString)