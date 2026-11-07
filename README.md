# Bhagavad Gita As It Is — Official Website & APK Distribution Server

A responsive, authentic landing page and high-performance distribution server for the **Bhagavad Gita As It Is** application.

- **🌐 Live Production Website**: **[https://gita-flax.vercel.app/](https://gita-flax.vercel.app/)**
- **📱 Direct Android APK**: [https://gita-flax.vercel.app/download/android](https://gita-flax.vercel.app/download/android)
- **🍎 Direct iOS Package**: [https://gita-flax.vercel.app/download/ios](https://gita-flax.vercel.app/download/ios)

---

## 🌟 Highlights & Features

- **Devotional Aesthetic Matching the App**: Styled with sacred warm parchment (`#F7F4EB`), sacred crimson accents (`#8B1E1E`), Sanskrit gold (`#B8860B`), and Georgia serif typography.
- **Light & Dark Theme Toggle**: Built-in support for light parchment and night dark modes, respecting user system preferences with instant manual override.
- **Interactive Screenshot Showcase**: Interactive gallery with device mockups and tabs showcasing all 5 primary app screens:
  1. **Sacred Verse Reader** (`screen_reader.png`) — Devanagari Sanskrit, diacritics, word-by-word synonyms, translation & purports.
  2. **Chapters Hub & Progress** (`screen_home.png`) — All 18 chapters with 700 slokas and instant progress resume.
  3. **Aesthetic Customization** (`screen_settings.png`) — Text size scaler and 4 background themes (Parchment, Sepia, Paper, Dark).
  4. **Sacred Dedication** (`screen_about.png`) — Homage to Founder-Acharya A.C. Bhaktivedanta Swami Srila Prabhupada.
  5. **Intelligent Scripture Search** (`screen_search.png`) — Coordinate search (e.g. `1.1`), Devanagari, and phonetic Roman transliteration.
- **Direct APK Distribution**:
  - One-click download button (`/download`) with dynamic file size, versioning, and download counter.
  - Supports HTTP Range requests for resumable downloads on mobile networks.
  - Automatic SHA-256 integrity calculation and display.
  - QR Code generator for direct smartphone camera scanning.
- **Zero External Dependencies Required**:
  - Built with native Node.js (`http`, `fs`, `path`, `crypto`).
  - No `npm install` needed to start — run directly with `node server.js`!

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v16+ recommended, works on v18, v20, v22, v24)

### Quick Start (Zero-Install)
From this directory:

```bash
# 1. Navigate to the website directory
cd "Gita_website"

# 2. Start the server
node server.js
```

Or using `npm`:

```bash
npm start
```

For live development auto-reloading:

```bash
npm run dev
```

### Accessing the Web Page
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📦 Directory Structure

```
Gita_website/
├── package.json                   # Project metadata and start scripts
├── server.js                      # High-performance Node.js distribution server
├── README.md                      # Documentation & deployment guide
├── stats.json                     # Persistent visitor & download analytics
└── public/                        # Static assets served to visitors
    ├── index.html                 # Semantic, responsive landing page
    ├── css/
    │   └── style.css              # Custom parchment/dark aesthetic stylesheet
    ├── js/
    │   └── app.js                 # Screenshot switcher, theme toggle & API client
    ├── images/
    │   ├── app_logo.png           # High-resolution official scripture emblem
    │   ├── screen_reader.png      # Verse reader view screenshot
    │   ├── screen_home.png        # Chapters hub view screenshot
    │   ├── screen_settings.png    # Reading preferences view screenshot
    │   ├── screen_about.png       # Dedication & about view screenshot
    │   └── screen_search.png      # Scripture search view screenshot
    └── downloads/
        └── bhagavad-gita-as-it-is.apk  # Compiled Android release APK (~52.1 MB)
```

---

## 📡 Backend Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/` | `GET` | Serves the landing page (`index.html`) |
| `/download/android` | `GET` | Downloads Android release package (`Bhagavad-Gita-As-It-Is-Android-v1.0.0.apk`) |
| `/download/ios` | `GET` | Downloads Apple iOS package (`Bhagavad-Gita-As-It-Is-iOS-v1.0.0.ipa`) |
| `/download` | `GET` | Auto-detects visitor device OS or accepts `?os=android` / `?os=ios` |
| `/api/info` | `GET` | Returns app details, file sizes, SHA256 checksums for both Android & iOS |
| `/api/stats` | `GET` | Returns visitor and download metrics |
| `/api/download-click` | `POST` | Non-blocking telemetry tracking download clicks |

---

## 🌐 Deploying to Production (Server / VPS)

### Option 1: Using PM2 (Recommended for Ubuntu/Debian/CentOS)
```bash
# Install PM2 process manager
npm install -g pm2

# Start Gita Website with auto-restart
PORT=80 pm2 start server.js --name "gita-website"

# Save configuration across server reboots
pm2 save
pm2 startup
```

### Option 2: Running with Nginx as Reverse Proxy
In `/etc/nginx/sites-available/gita-website`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 3: Systemd Service
Create `/etc/systemd/system/gita-website.service`:
```ini
[Unit]
Description=Bhagavad Gita As It Is Website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/Gita_website
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=PORT=3000 NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

---

## 🙏 Dedication
*This application and web distribution are dedicated to His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada, founder of ISKCON and BBT.*

