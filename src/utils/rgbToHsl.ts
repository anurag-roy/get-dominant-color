// Adapted from https://stackoverflow.com/a/9493060

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes red, green, and blue are contained in the set [0, 255] and
 * returns hue, saturation, and lightness in the set [0, 100].
 *
 * @param red The red color value
 * @param green The green color value
 * @param blue The blue color value
 * @returns [hue, saturation, lightness] The HSL representation
 */
export const rgbToHsl = (red: number, green: number, blue: number): [number, number, number] => {
  red = red / 255;
  green = green / 255;
  blue = blue / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  let hue = (max + min) / 2;
  let saturation = (max + min) / 2;
  let lightness = (max + min) / 2;

  if (max === min) {
    hue = saturation = 0; // achromatic
  } else {
    const deviation = max - min;
    saturation = lightness > 0.5 ? deviation / (2 - max - min) : deviation / (max + min);

    switch (max) {
      case red:
        hue = (green - blue) / deviation + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / deviation + 2;
        break;
      case blue:
        hue = (red - green) / deviation + 4;
        break;
    }
    hue = hue / 6;
  }

  return [Math.round(hue * 100), Math.round(saturation * 100), Math.round(lightness * 100)];
};
