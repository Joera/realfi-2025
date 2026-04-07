export const compactAction = (code: string): string => {
  return code
    .replace(/\s+/g, ' ')  // collapse whitespace
    .replace(/\s*([{}();,])\s*/g, '$1')  // remove space around syntax
    .trim();
}