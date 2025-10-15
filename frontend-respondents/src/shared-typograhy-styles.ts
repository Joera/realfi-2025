export const typograhyStyles = new CSSStyleSheet();
typograhyStyles.replaceSync(`
    
    * {

        font-family: "Operator Mono A", "Operator Mono B";
        font-style: normal;
        

    body, p, div {
        font-weight: 500;
        line-height: 1.55;
    }

`)