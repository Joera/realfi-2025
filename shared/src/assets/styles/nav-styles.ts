export const navStylesString = `

    nav { 

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        ul {

            list-style: none;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 0;

        }

        a { 
       
            color: var(--color-too-dark);
            font-style: normal;
            font-weight: 400;
            font-size: 1rem;
            text-transform: lowercase;
        }

    }`;

export const navStyles = new CSSStyleSheet();
navStyles.replaceSync(navStylesString)
