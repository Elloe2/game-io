const sharp = require('sharp');
const png2icons = require('png2icons');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'client', 'assets', 'Microba Alga.png');
const outputDir = path.join(__dirname, '..', 'electron');
const pngOutput = path.join(outputDir, 'icon.png');
const icoOutput = path.join(outputDir, 'icon.ico');

async function createIcons() {
  try {
    // Create 256x256 PNG first
    await sharp(inputPath)
      .resize(256, 256)
      .png()
      .toFile(pngOutput);
    console.log('PNG icon created:', pngOutput);

    // Read the PNG and convert to ICO
    const pngBuffer = fs.readFileSync(pngOutput);
    const icoBuffer = png2icons.createICO(pngBuffer, png2icons.BILINEAR, 0, true, true);
    
    if (icoBuffer) {
      fs.writeFileSync(icoOutput, icoBuffer);
      console.log('ICO icon created:', icoOutput);
    } else {
      console.error('Failed to create ICO');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

createIcons();
