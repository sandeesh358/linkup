const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const convertSvgToPng = async (inputPath, outputPath) => {
  try {
    const svgBuffer = fs.readFileSync(inputPath);
    await sharp(svgBuffer)
      .resize(500, 500)
      .png()
      .toFile(outputPath);
    
    console.log(`Converted ${inputPath} to ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error);
  }
};

// Convert the background SVGs to PNGs
const convert = async () => {
  await convertSvgToPng(
    path.join(__dirname, '../public/chat-bg-light.svg'),
    path.join(__dirname, '../public/chat-bg-light.png')
  );
  
  await convertSvgToPng(
    path.join(__dirname, '../public/chat-bg-dark.svg'),
    path.join(__dirname, '../public/chat-bg-dark.png')
  );
};

convert(); 