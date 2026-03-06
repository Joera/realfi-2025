
import MonaspaceNeonRegular from "./fonts/monaspace-neon-latin-400-normal.ttf?url";
import MonaspaceNeonMedium from "./fonts/monaspace-neon-latin-500-normal.ttf?url";
import MonaspaceNeonSemiBold from "./fonts/monaspace-neon-latin-600-normal.ttf?url";
import MonaspaceNeonBold from "./fonts/monaspace-neon-latin-700-normal.ttf?url";
// import MonaspaceNeonItalicRegular from "./fonts/MonaspaceNeonItalic-Regular.ttf?url";
// import MonaspaceNeonItalicMedium from "./fonts/MonaspaceNeonItalic-Medium.ttf?url";
// import MonaspaceNeonItalicSemiBold from "./fonts/MonaspaceNeonItalic-SemiBold.ttf?url";
// import MonaspaceNeonItalicBold from "./fonts/MonaspaceNeonItalic-Bold.ttf?url";

import CormorantGaramondBold from "./fonts/CormorantGaramond-Bold.ttf?url";

import OswaldBold from "./fonts/Oswald-Bold.ttf?url";
import OswaldSemiBold from "./fonts/Oswald-SemiBold.ttf?url";
import OswaldRegular from "./fonts/Oswald-Regular.ttf";

const fontStyles = `
 

  @font-face {
    font-family: "Monaspace Neon";
    font-style: normal;
    font-weight: 400;
    src: url(${MonaspaceNeonRegular}) format("truetype");
  }

  @font-face {
    font-family: "Monaspace Neon";
    font-style: italic;
    font-weight: 400;
    src: url(${MonaspaceNeonRegular}) format("truetype");
  }

  @font-face {
    font-family: "Monaspace Neon";
    font-style: normal;
    font-weight: 500;
    src: url(${MonaspaceNeonMedium}) format("truetype");
  }

  @font-face {
    font-family: "Monaspace Neon";
    font-style: italic;
    font-weight: 500;
    src: url(${MonaspaceNeonMedium}) format("truetype");
  }

  @font-face {
    font-family: "Monaspace Neon";
    font-style: normal;
    font-weight: 600;
    src: url(${MonaspaceNeonSemiBold}) format("truetype");
  }

  @font-face {
    font-family: "Monaspace Neon";
    font-style: italic;
    font-weight: 600;
    src: url(${MonaspaceNeonSemiBold}) format("truetype");
  }

  @font-face {
    font-family: "Monaspace Neon";
    font-style: normal;
    font-weight: 700;
    src: url(${MonaspaceNeonBold}) format("truetype");
  }

  @font-face {
    font-family: "Monaspace Neon";
    font-style: italic;
    font-weight: 700;
    src: url(${MonaspaceNeonBold}) format("truetype");
  }

  @font-face {
    font-family: "Cormorant Garamond";
    font-weight: 700;
    src: url(${CormorantGaramondBold}) format("truetype");
  }

  @font-face {
    font-family: "Oswald";
    font-weight: 700;
    src: url(${OswaldBold}) format("truetype");
  }

  @font-face {
    font-family: "Oswald";
    font-weight: 600;
    src: url(${OswaldSemiBold}) format("truetype");
  }

  @font-face {
    font-family: "Oswald";
    font-weight: 500;
    src: url(${OswaldRegular}) format("truetype");
  }

`;


export const injectFonts = () => {
  if (document.getElementById("app-fonts")) return; // idempotent
  const style = document.createElement("style");
  style.id = "app-fonts";
  style.textContent = fontStyles;
  document.head.appendChild(style);
}