import { join } from 'path';
import { readFile, readdir, writeFile } from 'fs/promises';
import { extractColors } from './getDominantColor.js';
import ora from 'ora';

// Look for images ending with the following extensions
const EXTS = ['.png'];
const OUTPUT_FILE = 'bg-colors.json';

const main = async (rootDir: string) => {
  const spinner = ora('Starting extraction').start();

  const files = await readdir(rootDir, { withFileTypes: true });

  const output: any = {};

  for (const [index, file] of files.entries()) {
    // Check if file ends with one of the permitted extensions
    if (file.isFile() && EXTS.some((ext) => file.name.endsWith(ext))) {
      const imgPath = join(rootDir, file.name);
      const img = await readFile(imgPath);

      try {
        const [dominantColor] = await extractColors(img);
        output[file.name] = dominantColor.hex;
      } catch (error) {
        console.error(`Could not extract colors for '${file.name}'`, error);
      }
    }

    spinner.text = `Extracting colors from image ${index} of ${files.length}`;
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));

  spinner.stopAndPersist({
    text: `Extracted colors from ${files.length} images`,
  });
};

// Process command line arguments
const arg = process.argv.find((arg) => arg.startsWith('--rootDir'));
if (!arg) {
  throw new Error(
    'Please specify the root directory of the images e.g. npm start -- --rootDir=~/dev/images'
  );
}
const rootDir = arg.split('=')[1];
main(rootDir);
