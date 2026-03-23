import { buttonStylesString } from './button-styles';
import { layoutStylesString } from './layout-styles';
import { typograhyStylestring } from './typography-styles';
import { navStylesString } from './nav-styles';
import { headerStylesString } from './header-styles';
import { footerStylesString } from './footer-styles';
import { tabStylesString } from './tab-styles';

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
        min-height: calc(100vh - 7rem - 12rem);
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

    #completed-content {

        display: flex;
        flex-direction: column;
        align-items: center;

        > div {
         
            display: flex;
            flex-direction: column;
            align-items: center;
        
        }

        .completed-container {
            margin-bottom: 1.5rem;
        
        }

        .score {

            display: flex;
            flex-direction: column;
            align-items: center;

            div {
                margin: .75rem
            }

            div:first-of-type {
                border-bottom: 2px solid var(--color-too-dark);
                
            }
        
            .large {
            
                font-size: 8rem;
                line-height: 1;
                font-family: "Oswald", sans-serif;
                font-weight: 600;
                color: var(--color-too-dark);

            }
        }
    }

    ${typograhyStylestring}

    ${buttonStylesString}

    ${layoutStylesString}

    ${navStylesString}

    ${footerStylesString}

    ${headerStylesString}

    ${tabStylesString}

    `;
  document.head.appendChild(style);

}