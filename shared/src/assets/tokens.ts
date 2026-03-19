export interface BrandTokens {
    color: string;
    colorTooLight: string;
    colorLight:  string;
    colorDark:   string;
    colorTooDark:  string;
}

export function adjustLightness(hex: string, amount: number): string {
  // parse rgb(r g b) or #hex → hsl → adjust → back
  const el = document.createElement("div");
  el.style.color = hex;
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color; // always rgb(r, g, b)
  document.body.removeChild(el);

  const [r, g, b] = computed.match(/\d+/g)!.map(Number);
  // rgb to hsl
  const rn = r/255, gn = g/255, bn = b/255;
  const max = Math.max(rn,gn,bn), min = Math.min(rn,gn,bn);
  let h = 0, s = 0, l = (max+min)/2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    if (max === rn) h = ((gn-bn)/d + (gn < bn ? 6 : 0))/6;
    else if (max === gn) h = ((bn-rn)/d + 2)/6;
    else h = ((rn-gn)/d + 4)/6;
  }
  l = Math.max(0, Math.min(1, l + amount));
  return `hsl(${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%)`;
}

export function buildTokens(brand: string): BrandTokens {
  return {
    color: brand,
    colorTooLight: adjustLightness(brand, 0.10),
    colorLight:  adjustLightness(brand, 0.03),
    colorDark:   adjustLightness(brand, -0.10),
    colorTooDark:  adjustLightness(brand, -0.42),
  };
}

export function injectTokens(color: string) {

  if (document.getElementById("app-tokens")) return;
  const style = document.createElement("style");
  style.id = "app-tokens";
  style.textContent = `
    :root {

    --color-bg: ${color};
    --color-too-light: ${adjustLightness(color, 0.10)};
    --color-light:  ${adjustLightness(color, 0.03)};
    --color-dark:   ${adjustLightness(color, -0.10)};
    --color-too-dark: ${adjustLightness(color, -0.42)};

    --breakpoint-xs: 480px;
    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
    --breakpoint-xl: 1280px;
    --breakpoint-xxl: 1536px;


    }
  `;
  document.head.insertBefore(style, document.head.firstChild);
}
