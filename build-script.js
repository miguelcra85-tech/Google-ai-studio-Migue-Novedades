import fs from 'fs';
import path from 'path';

// Helper: copy file or recursively copy directory
function copyItem(src, dest) {
  try {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      // Ensure destination directory exists
      fs.mkdirSync(dest, { recursive: true });
      // Recursively copy all items
      fs.readdirSync(src).forEach(item => {
        copyItem(path.join(src, item), path.join(dest, item));
      });
    } else {
      // Copy file
      fs.copyFileSync(src, dest);
    }
  } catch (e) {
    // File might not exist, skip
    //console.error(`Error copying ${src} to ${dest}:`, e.message);
  }
}

console.log('Starting build process...');

// Create dist directories
fs.mkdirSync('dist/app/browser/assets', { recursive: true });
fs.mkdirSync('dist/app/browser/images', { recursive: true });

// Copy index.html to dist/
if (fs.existsSync('index.html')) {
  fs.copyFileSync('index.html', 'dist/index.html');
  console.log('Copied index.html to dist/');
}

// Copy public/ contents to dist/ and dist/app/browser/
if (fs.existsSync('public')) {
  copyItem('public', 'dist');
  copyItem('public', 'dist/app/browser');
  console.log('Copied public/ contents');
}

// Copy src/assets/ to dist/app/browser/assets/
if (fs.existsSync('src/assets')) {
  copyItem('src/assets', 'dist/app/browser/assets');
  console.log('Copied src/assets/ to dist/app/browser/assets/');
}

// Copy index.html to dist/app/browser/
if (fs.existsSync('index.html')) {
  fs.copyFileSync('index.html', 'dist/app/browser/index.html');
  console.log('Copied index.html to dist/app/browser/');
}

// Also copy main CSS file
if (fs.existsSync('src/styles.css')) {
  fs.copyFileSync('src/styles.css', 'dist/app/browser/styles.css');
  console.log('Copied src/styles.css');
}

console.log('Build completed successfully!');