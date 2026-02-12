import { bgDarkest, bgTooDark } from "./shared-colour-styles";

export const layoutStyles = new CSSStyleSheet();
layoutStyles.replaceSync(`

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

  .container-full {
    

  } 
`)