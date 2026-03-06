// shared/src/assets/icons.ts
import logoRaw from "./icons/owl.svg?raw";
import caretRaw from "./icons/caret.svg?raw";

export const icons = {
  logo: logoRaw,
  caret: caretRaw,
} as const;

export type IconName = keyof typeof icons;

export function renderIcon(name: IconName, className?: string): string {
  const svg = icons[name];
  if (className) {
    return svg.replace('<svg', `<svg class="${className}"`);
  }
  return svg;
}