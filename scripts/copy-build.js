import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting build copy process...\n');

const source = path.join(__dirname, '../dist');
const destination = path.join(__dirname, '../../backend/public/app');
const viewDestination = path.join(__dirname, '../../backend/resources/views/app.blade.php');

// Check if build exists
if (!fs.existsSync(source)) {
    console.error('❌ Error: dist folder not found!');
    console.error('   Run "npm run build" first.\n');
    process.exit(1);
}

console.log('📂 Source:', source);
console.log('📂 Destination:', destination);
console.log('');

// Remove old build
if (fs.existsSync(destination)) {
    console.log('🗑️  Removing old build...');
    fs.removeSync(destination);
}

// Copy new build
console.log('📦 Copying build files...');
fs.copySync(source, destination);
console.log('✅ Build files copied!\n');

// Read index.html
const indexPath = path.join(destination, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('❌ Error: index.html not found in build!');
    process.exit(1);
}

let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Fix asset paths - make them absolute
indexHtml = indexHtml.replace(/src="\/assets\//g, 'src="/app/assets/');
indexHtml = indexHtml.replace(/href="\/assets\//g, 'href="/app/assets/');
indexHtml = indexHtml.replace(/from '\/assets\//g, "from '/app/assets/");
indexHtml = indexHtml.replace(/from "\/assets\//g, 'from "/app/assets/');

// Create Blade template with dynamic asset loading
console.log('📝 Creating Laravel view with dynamic asset loading...');
fs.ensureDirSync(path.dirname(viewDestination));

// Replace hardcoded asset includes with dynamic Blade code
const jsMatch = indexHtml.match(/src="\/app\/assets\/(index-[^"]+\.js)"/);
const cssMatch = indexHtml.match(/href="\/app\/assets\/(index-[^"]+\.css)"/);

if (jsMatch || cssMatch) {
  // Build the dynamic Blade snippet
  const dynamicAssets = `
  @php
    // Read the actual built index.html to get current asset filenames
    $indexPath = public_path('app/index.html');
    $jsFile = '';
    $cssFile = '';

    if (file_exists($indexPath)) {
        $content = file_get_contents($indexPath);
        // Extract JS filename
        preg_match('/src="\\/app\\/assets\\/(index-[^"]+\\.js)"/', $content, $jsMatch);
        if (!empty($jsMatch[1])) {
            $jsFile = $jsMatch[1];
        }
        // Extract CSS filename
        preg_match('/href="\\/app\\/assets\\/(index-[^"]+\\.css)"/', $content, $cssMatch);
        if (!empty($cssMatch[1])) {
            $cssFile = $cssMatch[1];
        }
    }
  @endphp

  @if($jsFile)
    <script type="module" crossorigin src="/app/assets/{{ $jsFile }}"></script>
  @endif

  @if($cssFile)
    <link rel="stylesheet" crossorigin href="/app/assets/{{ $cssFile }}">
  @endif`;

  // Remove the hardcoded script and link tags
  if (jsMatch) {
    indexHtml = indexHtml.replace(/<script[^>]*src="\/app\/assets\/index-[^"]+\.js"[^>]*><\/script>/g, '');
  }
  if (cssMatch) {
    indexHtml = indexHtml.replace(/<link[^>]*href="\/app\/assets\/index-[^"]+\.css"[^>]*>/g, '');
  }

  // Insert dynamic assets before closing </head> tag
  indexHtml = indexHtml.replace('</head>', `${dynamicAssets}\n</head>`);
}

fs.writeFileSync(viewDestination, indexHtml);
console.log('✅ Laravel view created with dynamic asset loading at:', viewDestination);

console.log('\n🎉 Done! Your frontend is now integrated with Laravel.');
console.log('\n📌 Next steps:');
console.log('   1. Make sure Laravel route is set up (see MERGE_FRONTEND_BACKEND.md)');
console.log('   2. Visit your Laravel server to test!');
console.log('');
