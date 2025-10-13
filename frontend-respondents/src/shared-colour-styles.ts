function adjustLightness(hex: string, lightnessChange: number): string {
  // Convert hex to RGB
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  // Adjust lightness
  l = Math.max(0, Math.min(1, l + lightnessChange / 100));

  // Convert HSL back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let newR, newG, newB;
  if (s === 0) {
    newR = newG = newB = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    newR = hue2rgb(p, q, h + 1/3);
    newG = hue2rgb(p, q, h);
    newB = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}
const bg =  "#7ccdbc";
const bgLightest =  (adjustLightness(bg, 15));
const bgLighter =  (adjustLightness(bg, 5));
const bgDarker =  (adjustLightness(bg, -10));
const bgDarkest =  (adjustLightness(bg, -15));
const bgTooDark =  (adjustLightness(bg, -37));

export const colourStyles = new CSSStyleSheet();
colourStyles.replaceSync(`
  :host, :root {
    --bg: ${bg};
    --bg-lightest: ${bgLightest};
    --bg-lighter: ${bgLighter};
    --bg-darker: ${bgDarker};
    --bg-darkest: ${bgDarkest};
    --bg-too-dark: ${bgTooDark};
  }
`);

export { bg, bgLightest, bgLighter, bgDarker, bgDarkest, bgTooDark }