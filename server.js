const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DOWNLOADS_DIR = path.join(PUBLIC_DIR, 'downloads');
const STATS_FILE = path.join(__dirname, 'stats.json');

// Package filenames
const ANDROID_FILE = 'bhagavad-gita-as-it-is.apk';
const ANDROID_PUBLIC_NAME = 'Bhagavad-Gita-As-It-Is-Android-v1.0.0.apk';

const IOS_FILE = 'bhagavad-gita-as-it-is.ipa';
const IOS_PUBLIC_NAME = 'Bhagavad-Gita-As-It-Is-iOS-v1.0.0.ipa';

// Initialize stats store
let stats = {
  downloads: 0,
  downloadsAndroid: 0,
  downloadsIos: 0,
  pageViews: 0,
  lastDownloadAt: null,
  firstStartedAt: new Date().toISOString()
};

if (fs.existsSync(STATS_FILE)) {
  try {
    const raw = fs.readFileSync(STATS_FILE, 'utf8');
    stats = Object.assign(stats, JSON.parse(raw));
  } catch (e) {
    console.error('Error reading stats.json, initializing fresh store:', e.message);
  }
}

function saveStats() {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save stats.json:', e.message);
  }
}

// Metadata Caches
let androidMeta = { sizeBytes: 0, sizeFormatted: '0 MB', sha256: '', lastModified: null };
let iosMeta = { sizeBytes: 0, sizeFormatted: '0 KB', sha256: '', lastModified: null };

function refreshPackageMeta() {
  // Android APK
  const apkPath = path.join(DOWNLOADS_DIR, ANDROID_FILE);
  if (fs.existsSync(apkPath)) {
    const stat = fs.statSync(apkPath);
    androidMeta.sizeBytes = stat.size;
    androidMeta.sizeFormatted = `${(stat.size / (1024 * 1024)).toFixed(1)} MB`;
    androidMeta.lastModified = stat.mtime.toISOString();
    try {
      const hash = crypto.createHash('sha256');
      hash.update(fs.readFileSync(apkPath));
      androidMeta.sha256 = hash.digest('hex');
    } catch (e) { }
  }

  // iOS IPA
  const ipaPath = path.join(DOWNLOADS_DIR, IOS_FILE);
  if (fs.existsSync(ipaPath)) {
    const stat = fs.statSync(ipaPath);
    iosMeta.sizeBytes = stat.size;
    iosMeta.sizeFormatted = stat.size >= 1024 * 1024
      ? `${(stat.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(stat.size / 1024).toFixed(0)} KB`;
    iosMeta.lastModified = stat.mtime.toISOString();
    try {
      const hash = crypto.createHash('sha256');
      hash.update(fs.readFileSync(ipaPath));
      iosMeta.sha256 = hash.digest('hex');
    } catch (e) { }
  }
}

refreshPackageMeta();

// MIME Types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.apk': 'application/vnd.android.package-archive',
  '.ipa': 'application/octet-stream',
  '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Route: /api/info
  if (pathname === '/api/info' && req.method === 'GET') {
    refreshPackageMeta();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      appName: 'Bhagavad Gita As It Is',
      author: 'His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada',
      version: '1.0.0',
      buildNumber: 1,
      totalChapters: 18,
      totalVerses: 700,
      android: {
        platform: 'Android',
        requirement: 'Android 8.0 (Oreo) or higher',
        fileName: ANDROID_PUBLIC_NAME,
        size: androidMeta.sizeFormatted,
        sizeBytes: androidMeta.sizeBytes,
        sha256: androidMeta.sha256,
        downloadUrl: '/download/android',
        downloads: stats.downloadsAndroid || 0
      },
      ios: {
        platform: 'iOS (iPhone / iPad)',
        requirement: 'iOS 14.0 or higher',
        fileName: IOS_PUBLIC_NAME,
        size: iosMeta.sizeFormatted,
        sizeBytes: iosMeta.sizeBytes,
        sha256: iosMeta.sha256,
        downloadUrl: '/download/ios',
        downloads: stats.downloadsIos || 0
      },
      totalDownloads: stats.downloads,
      releaseDate: 'November 2026'
    }, null, 2));
  }

  // Route: /api/stats
  if (pathname === '/api/stats' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(stats, null, 2));
  }

  // Route: /api/download-click (POST)
  if (pathname === '/api/download-click' && req.method === 'POST') {
    const platform = parsedUrl.searchParams.get('platform') || 'android';
    stats.downloads += 1;
    if (platform === 'ios') {
      stats.downloadsIos = (stats.downloadsIos || 0) + 1;
    } else {
      stats.downloadsAndroid = (stats.downloadsAndroid || 0) + 1;
    }
    stats.lastDownloadAt = new Date().toISOString();
    saveStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, downloads: stats.downloads }));
  }

  // Route: Download handler for Android & iOS
  const isAndroidDownload = pathname === '/download/android' ||
    pathname === '/download/apk' ||
    pathname === `/downloads/${ANDROID_FILE}`;

  const isIosDownload = pathname === '/download/ios' ||
    pathname === '/download/ipa' ||
    pathname === '/download/ios-apk' ||
    pathname === `/downloads/${IOS_FILE}`;

  let targetPlatform = null;
  if (isAndroidDownload) {
    targetPlatform = 'android';
  } else if (isIosDownload) {
    targetPlatform = 'ios';
  } else if (pathname === '/download') {
    // If generic /download, check query param or User-Agent
    const queryPlat = parsedUrl.searchParams.get('os') || parsedUrl.searchParams.get('platform');
    if (queryPlat === 'ios') {
      targetPlatform = 'ios';
    } else if (queryPlat === 'android') {
      targetPlatform = 'android';
    } else {
      const ua = req.headers['user-agent'] || '';
      targetPlatform = /iPhone|iPad|iPod/i.test(ua) ? 'ios' : 'android';
    }
  }

  if (targetPlatform) {
    const isIos = targetPlatform === 'ios';
    const fileName = isIos ? IOS_FILE : ANDROID_FILE;
    const publicName = isIos ? IOS_PUBLIC_NAME : ANDROID_PUBLIC_NAME;
    const contentType = isIos ? 'application/octet-stream' : 'application/vnd.android.package-archive';
    const filePath = path.join(DOWNLOADS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end(`Package file (${fileName}) is not available yet.`);
    }

    const stat = fs.statSync(filePath);
    stats.downloads += 1;
    if (isIos) {
      stats.downloadsIos = (stats.downloadsIos || 0) + 1;
    } else {
      stats.downloadsAndroid = (stats.downloadsAndroid || 0) + 1;
    }
    stats.lastDownloadAt = new Date().toISOString();
    saveStats();

    // Check for Range request (resumable downloads on mobile)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${publicName}"`,
        'Cache-Control': 'no-cache'
      });
      return fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${publicName}"`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache'
      });
      const fileStream = fs.createReadStream(filePath);
      return fileStream.pipe(res);
    }
  }

  // Static File Serving
  let relativePath = pathname === '/' ? 'index.html' : pathname;
  const safePath = path.normalize(path.join(PUBLIC_DIR, relativePath));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(safePath, (err, fileStat) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Page Not Found - Bhagavad Gita As It Is</title>
          <style>
            body { font-family: Georgia, serif; background: #F7F4EB; color: #2B2118; text-align: center; padding: 60px 20px; }
            h1 { color: #8B1E1E; font-size: 32px; }
            a { color: #8B1E1E; font-weight: bold; text-decoration: none; border-bottom: 1px dotted #8B1E1E; }
          </style>
        </head>
        <body>
          <h1>404 - Page Not Found</h1>
          <p>The sacred page you are looking for does not exist.</p>
          <p><a href="/">Return to Home & Download Packages</a></p>
        </body>
        </html>
      `);
    }

    if (fileStat.isDirectory()) {
      const indexFile = path.join(safePath, 'index.html');
      if (fs.existsSync(indexFile)) {
        return serveFile(indexFile, res);
      } else {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end('Directory listing forbidden');
      }
    }

    if (pathname === '/' || pathname === '/index.html') {
      stats.pageViews += 1;
      saveStats();
    }

    serveFile(safePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  if (ext === '.html') {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  } else if (['.css', '.js', '.png', '.jpg', '.svg', '.webp'].includes(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }

  res.writeHead(200, { 'Content-Type': mime });
  const stream = fs.createReadStream(filePath);
  stream.on('error', (e) => {
    console.error('File stream error:', e.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error reading file');
    }
  });
  stream.pipe(res);
}

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Bhagavad Gita As It Is - Multi-Platform Distribution Server`);
  console.log(`=======================================================`);
  console.log(`  Server running at:   http://localhost:${PORT}`);
  console.log(`  Android Download:    http://localhost:${PORT}/download/android`);
  console.log(`  iOS Download:        http://localhost:${PORT}/download/ios`);
  console.log(`  API Info:            http://localhost:${PORT}/api/info`);
  console.log(`=======================================================`);
});
