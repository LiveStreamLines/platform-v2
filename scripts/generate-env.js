const fs = require('fs');
const path = require('path');
require('dotenv').config();

const envContent = `export const environment = {
    backend: '${process.env.DATA_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000'}',
    images: '${process.env.IMAGES_BACKEND_URL || 'https://lsl-platform.com/backend'}',
    hik: '${process.env.HIK_URL || 'https://lsl-platform.com/hik'}',
    proxy: '${process.env.PROXY_URL || 'https://lsl-platform.com/proxy/'}'
};
`;

const outputPath = path.join(__dirname, '..', 'src', 'environment', 'environments.ts');
const outputDir = path.dirname(outputPath);

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, envContent, 'utf8');
console.log('Environment file generated successfully from .env');
