import { join } from 'path';
import { createWriteStream, readFileSync, readdirSync } from 'fs';
import { extractColors } from './getDominantColor.js';
import ora from 'ora';

// Look for images ending with the following extensions
const EXTS = ['.png'];
const OUTPUT_FILE = 'bg-colors.json';

const main = async (rootDir: string) => {
  const files = readdirSync(rootDir, { withFileTypes: true });

  const resultStream = createWriteStream(OUTPUT_FILE);
  resultStream.write('{');

  const spinner = ora('Starting extraction').start();

  for (const [index, file] of files.entries()) {
    // Check if file ends with one of the permitted extensions
    if (file.isFile() && EXTS.some((ext) => file.name.endsWith(ext))) {
      const imgPath = join(rootDir, file.name);
      const img = readFileSync(imgPath);

      try {
        const extractedColors = await extractColors(img);
        let chunk = `"${file.name}": "${extractedColors[0]}"`;
        index === files.length - 1 ? (chunk += '}') : (chunk += ',');
        resultStream.write(chunk);
      } catch (error) {
        console.error(`Could not extract colors for '${file.name}'`, error);
      }
    }

    spinner.text = `Extracting colors from image ${index} of ${files.length}`;
  }

  resultStream.close();

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
