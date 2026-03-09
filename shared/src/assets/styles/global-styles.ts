import { buttonStylesString } from './button-styles';

export function injectGlobalStyles() {
  if (document.getElementById("app-global")) return;
  const style = document.createElement("style");
  style.id = "app-global";
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100vh; }
    * { font-family: "Monaspace Neon"; font-weight: 400; font-size: 1rem; line-height: 1.55; }

    body {
      background: var(--color-bg);
    }


    html {
        position: relative;
        min-height: 100vh;
    }

    body {
        position: relative;
        background: var(--color-bg);
        margin: 0;
        padding: 0;
        background: linear-gradient(0deg, var(--color-bg) 75%, var(--color-light) 100%);
        min-height: 100vh;
    }

    main {
        display: flex;
        position: relative;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        min-height: calc(100vh - 6rem - 3rem);
    }

    footer {
        height: 3rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    #splash {
    
        position: fixed;
        height: 100vh;
        width: 100vw;
        top:0;
        left:0;
        display: flex;
        justify-content: center;
        align-items: center;

        svg {
            width: 240px;
            height: auto;
            transition: all 0.3s ease;

            path {
                fill: var(--color-too-dark);
            }
        }
    }

    #app  {

        justify-content: flex-start;
        align-items: center;
    }

    #landing-content { 

        position: relative;
        width: 100%;
        height: 100%;
    }

    .onboarding-message {

        margin: 0 1.5rem 1.5rem 1.5rem;

        h2 {
            margin: 1.5rem 0 .75rem 0;
            font-family: "Oswald";
            text-transform: uppercase;
            letter-spacing: .4px;
            color: var(--color-too-dark);
            font-size: 2rem;
            font-weight: 600;
        }


        p { 
            margin: 0;
            font-family: "Monaspace Neon";
            color: var(--color-too-dark);
        }
    }

    .container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        width: 100%; 
    }
        
    .container-small {
        
        max-width: 600px;
    } 
    
    .container-large {
        max-width: 1000px;
    } 

    .centered {
        justify-content: center;
        align-items: center;
    }

    header {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 9rem;
        margin-bottom: 3rem;

        .container {

            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }

        h1 {
          
            margin: 0;
            margin-left: 1.5rem;
            margin-top: -0.75rem;
        }


        svg {

            margin: auto 1.5rem auto 0 ;
            width: 4.8rem;
            height: auto;
            align-self: center;
            transition: all 0.3s ease;
        

            path {
                fill: var(--color-too-dark);
            }
        }
    }

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
            margin: 0 1.5rem;
            color: var(--color-too-dark);
        
            font-style: normal;
            font-weight: 400;
            font-size: 1rem;
            text-transform: lowercase;
        }

    }

    h1 {

        font-size: 2.8rem;
        font-family: "Cormorant Garamond";
        font-style: normal;
        font-weight: 700;
        color: var(--color-too-dark);

        @media(min-width: 1000px) {
            font-size: 3.6rem;
        }

        span {
            font-size: 2.4rem;
            font-family: "Cormorant Garamond";
            font-style: normal;
            font-weight: 700;
            color: white;

            @media(min-width: 1000px) {
                font-size: 3.6rem;
            }
        }
    }

    h2 {

        // font-family: "Oswald", sans-serif;
        font-family: "Monaspace Neon";
        font-optical-sizing: auto;
        font-weight: 600;
        font-style: normal;

        font-size: 1.8rem;
        // text-transform: uppercase;
        // letter-spacing: 1px;
        color: var(--color-too-dark);
        // margin: 0 auto 5rem auto;
    }

    *, p {
        font-family: "Monaspace Neon";
        font-style: normal;
        font-weight: 400;
        font-size: 1rem;
        line-height: 1.55;
    }


    ${buttonStylesString}
    
    `;
  document.head.appendChild(style);

}