// Have to import like this because `canvas` is a CommonJS module
import canvas from 'canvas';
import { rgbToHex } from './utils/rgbToHex.js';
import { rgbToHsl } from './utils/rgbToHsl.js';

const { createCanvas, loadImage } = canvas;

type CountMap = {
  [key: string]: {
    color: {
      hex: string;
      rgb: { r: number; g: number; b: number };
      hsl: { h: number; s: number; l: number };
    };
    count: number;
  };
};

export interface ExtractColorOptions {
  /**
   * List of colors to ignore. Please provide the colors in hex.
   *
   * @defaultValue `["#000000", "#ffffff"]` Ignores black and white by default.
   */
  ignore: string[];

  /**
   * Factor by which the image should be scaled.
   *
   * @remarks
   * Value should be greater than 0 but less than equal to 1. Lower the value, faster the extraction.
   *
   * @defaultValue `0.3`
   */
  scale: number;
}

const getContext = (width: number, height: number) => {
  const canvas = createCanvas(width, height);
  return canvas.getContext('2d');
};

const getImageData = async (src: string | Buffer, scale: number) => {
  if (scale === void 0) scale = 1;

  const img = await loadImage(src);

  const width = img.width * scale;
  const height = img.height * scale;

  const context = getContext(width, height);
  context.drawImage(img, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  return data;
};

const getColors = (data: Uint8ClampedArray, ignore: string[]) => {
  const countMap: CountMap = {};

  // Create a map of colors and their count
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) {
      continue;
    }
    const [r, g, b] = Array.from(data.subarray(i, i + 3)) as [number, number, number];
    if ([r, g, b].some((c) => c === undefined)) {
      continue;
    }
    const hexCode = rgbToHex(r, g, b);
    const [h, s, l] = rgbToHsl(r, g, b);

    if (ignore.includes(hexCode)) {
      continue;
    }

    if (countMap[hexCode]) {
      countMap[hexCode].count++;
    } else {
      countMap[hexCode] = {
        color: {
          hex: hexCode,
          rgb: { r, g, b },
          hsl: { h, s, l },
        },
        count: 1,
      };
    }
  }

  // Sort the colors by count and return them
  return Object.values(countMap)
    .sort((a, b) => b.count - a.count)
    .map((v) => v.color);
};

const defaultOptions: ExtractColorOptions = {
  // Ignore black and white
  ignore: ['#000000', '#ffffff'],
  scale: 0.3,
};

/**
 * Extracts colors from an image
 *
 * @remarks
 * The returned array of colors is sorted in descending order w.r.t. their counts.
 * So the most dominant color being the first item in the array and so on.
 *
 * @param src - Image Source
 * @param options - {@link ExtractColorOptions}
 * @returns A list of colors
 *
 * @example
 * ```
 * import { readFile } from 'fs/promises';
 * import { extractColors } from 'get-dominant-colors';
 *
 * const img = await readFile('myImage.png');
 * const extractedColors = await extractColors(img, {quality: 0.5});
 *
 * console.log('The most dominant color in the image is', extractedColors[0].hex);
 * // The most dominant color in the image is #2fd3f2;
 * ```
 */
export const extractColors = async (
  src: string | Buffer,
  options: Partial<ExtractColorOptions> = defaultOptions
) => {
  const finalOptions = Object.assign({}, defaultOptions, options);
  const { ignore, scale } = finalOptions;

  if (scale > 1 || scale <= 0) {
    console.warn(
      `You have set scale to ${scale}, which isn't between 0-1. This is either pointless (> 1) or a no-op (≤ 0)`
    );
  }

  const data = await getImageData(src, scale);
  return getColors(data, ignore);
};
