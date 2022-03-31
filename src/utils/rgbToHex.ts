// Convert rgba color value to hex value
export const rgbToHex = (r: number, g: number, b: number) => {
  const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  return hex;
};
