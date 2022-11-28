# get-dominant-color

Get dominant color from an image.

## Usage

```
pnpm start --rootDir=path/to/image/folder
```

## Sample output

```json
{
  "image1.png": "#3f4d22",
  "image2.jpeg": "#66a524"
}
```

## Tip

[For generating a lighter background color from the dominant color](https://stackoverflow.com/a/3585775) :

```javascript
const [r, g, b] = await extractColors(img);

// Let's say the LIGHTNESS_FACTOR is 0.4
const bgR = r * 0.4 + 255 * (1 - 0.4);
const bgG = g * 0.4 + 255 * (1 - 0.4);
const bgB = b * 0.4 + 255 * (1 - 0.4);

// This would return a color the same as if
// you were to apply an opacity of 0.4 to
// the original color and view it over a
// white background
return [bgR, bgG, bgB];
```
