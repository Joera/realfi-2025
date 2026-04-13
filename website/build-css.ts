import { buttonStylesString } from '../shared/src/assets/styles/button-styles';
import { layoutStylesString } from '../shared/src/assets/styles/layout-styles';
import { typograhyStylestring } from '../shared/src/assets/styles/typography-styles';

import { navStylesString } from '../shared/src/assets/styles/nav-styles';
import { footerStylesString } from '../shared/src/assets/styles/footer-styles';
import { tabStylesString } from '../shared/src/assets/styles/tab-styles';

import { writeFileSync } from 'fs';

const css = `
/* base reset + global */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; min-height: 100vh; }
/* ... your global rules ... */

${typograhyStylestring}
${buttonStylesString}
${layoutStylesString}
${navStylesString}
${footerStylesString}
${tabStylesString}
/* ... rest ... */
`;

writeFileSync('assets/styles/shared.css', css);