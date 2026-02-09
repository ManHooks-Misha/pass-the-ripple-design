import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting smart build copy process...\n');

const source = path.join(__dirname, '../dist');
const destination = path.join(__dirname, '../../backend/public/app');
const viewDestination = path.join(__dirname, '../../backend/resources/views/app.blade.php');

// Check if build exists on startup
if (!fs.existsSync(source)) {
  console.error('❌ Error: dist folder not found!');
  console.error('   Run "npm run build:dev" first or wait for initial build.\n');
  // Don't exit - just wait for build to happen
}

// Function to copy build files
async function copyBuild() {
  console.log('\n🔄 Copying build to Laravel...');
  
  try {
    // Remove old build
    if (fs.existsSync(destination)) {
      console.log('🗑️  Removing old build...');
      await fs.remove(destination);
    }

    // Copy new build
    console.log('📦 Copying build files...');
    await fs.copy(source, destination);
    console.log('✅ Build files copied!');

    // Process index.html
    await updateLaravelView();
    
  } catch (error) {
    console.error('❌ Error copying build:', error.message);
  }
}

// Function to update Laravel view
async function updateLaravelView() {
  try {
    const indexPath = path.join(destination, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      console.log('⏳ Waiting for index.html...');
      return;
    }

    let indexHtml = await fs.readFile(indexPath, 'utf8');

    // Fix asset paths
    indexHtml = indexHtml.replace(/src="\/assets\//g, 'src="/app/assets/');
    indexHtml = indexHtml.replace(/href="\/assets\//g, 'href="/app/assets/');
    indexHtml = indexHtml.replace(/from '\/assets\//g, "from '/app/assets/");
    indexHtml = indexHtml.replace(/from "\/assets\//g, 'from "/app/assets/');

    // Create Blade template with dynamic asset loading
    console.log('📝 Creating Laravel view with dynamic asset loading...');
    await fs.ensureDir(path.dirname(viewDestination));

    // Extract current asset filenames
    const jsMatch = indexHtml.match(/src="\/app\/assets\/(index-[^"]+\.js)"/);
    const cssMatch = indexHtml.match(/href="\/app\/assets\/(index-[^"]+\.css)"/);

    if (jsMatch || cssMatch) {
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

      // Insert dynamic assets
      indexHtml = indexHtml.replace('</head>', `${dynamicAssets}\n</head>`);
    }

    await fs.writeFile(viewDestination, indexHtml);
    console.log('✅ Laravel view updated at:', viewDestination);
    
  } catch (error) {
    console.error('❌ Error updating Laravel view:', error.message);
  }
}

// Watch for changes in dist folder
async function startWatching() {
  console.log('👀 Watching for changes in dist folder...');
  
  const watcher = chokidar.watch(source, {
    ignoreInitial: false,
    persistent: true,
    depth: 2,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  });

  // Copy on initial build
  watcher.on('ready', async () => {
    if (fs.existsSync(source)) {
      await copyBuild();
    }
  });

  // Copy when files change
  watcher.on('change', async (filePath) => {
    console.log(`\n📄 File changed: ${path.relative(source, filePath)}`);
    await copyBuild();
  });

  watcher.on('add', async (filePath) => {
    console.log(`\n📄 File added: ${path.relative(source, filePath)}`);
    await copyBuild();
  });

  watcher.on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

  console.log('✅ Watcher started. Waiting for changes...');
}

// Start watching
startWatching();

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n👋 Stopping watcher...');
  process.exit(0);
});