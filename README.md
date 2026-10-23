<div align="center">

# 🎵 SnapLoad UI

**Modern web interface for downloading media from YouTube and Spotify**

[![Next.js](https://img.shields.io/badge/Next.js-15.2+-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*Beautiful, responsive interface with real-time progress tracking and smart URL validation*

[Backend API](https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API) | [Live Demo](#) | [Report Issues](https://github.com/pabrax/SnapLoad/issues)

**🇬🇧 English** | [🇪🇸 Español](docs/README.es.md)

</div>

---

## 🚀 Quick Start (Full Stack)

**Want to run the complete application (Frontend + Backend)?** Use the monorepo:

```bash
curl -fsSL https://raw.githubusercontent.com/pabrax/SnapLoad/main/install.sh | bash
```

This will install and run both the web interface and the API together. **[See full documentation](https://github.com/pabrax/SnapLoad)**

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Docker Deployment](#-docker-deployment)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Building for Production](#-building-for-production)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🌟 Overview

![SnapLoad UI Preview](docs/SnapLoad_preview.png)

**SnapLoad UI** is a Next.js-based web application that provides an intuitive interface for downloading media from YouTube and Spotify. Built with modern React patterns, TypeScript, and Tailwind CSS, it offers a seamless experience with real-time progress updates and intelligent URL handling.

### Key Features

- 🎯 **Smart URL Validation**: Automatic platform detection and sanitization
- 📊 **Real-Time Progress**: Live status updates with polling
- 🎵 **Multi-Platform Support**: YouTube (video/audio), Spotify (tracks/albums/playlists)
- 📦 **Bulk Downloads**: Handle playlists and albums with multiple files
- 🎧 **Library & Player**: A *Library* tab lists downloaded songs (`/api/library`), and a persistent player bar keeps playing across tabs. Audio streams through `/api/library/{id}/stream`, which forwards `Range` so seeking works. Shortcuts: `space` play/pause, `n` next, `p` previous, `m` mute (ignored while typing). Opus/Ogg may not play on Safari
- 🎨 **Modern UI**: Dark mode, responsive design, smooth animations
- 🔔 **User Feedback**: Toast notifications and error handling
- 📱 **Mobile-First**: Optimized for all screen sizes
- 🚀 **Production Ready**: Health checks, connection monitoring, error boundaries

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- **Backend API** running (see [snapLoad-API](https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API))

### Installation

```bash
# Clone repository
git clone https://github.com/pabrax/SnapLoad.git
cd SnapLoad/snapLoad-UI

# Install dependencies
pnpm install

# Configure backend URL
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Installation

### Using pnpm (Recommended)

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install
```

### Using npm

```bash
npm install
```

### Using yarn

```bash
yarn install
```

---

## ⚙️ Configuration

### Backend Connection

Create `.env.local` file in project root:

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### Backend URL Options

**Local Development:**
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Production/VPS:**
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-domain.com
```

**Network (Local Network Access):**
```bash
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.100:8000
```

---

## 🐳 Docker Deployment

### Option 1: Frontend Only (Recommended for Production)

Connect to a separately deployed backend:

```bash
# Build frontend image
docker build -t snapload-ui:latest \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api-domain.com .

# Run container
docker run -d \
  --name snapload-ui \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-api-domain.com \
  snapload-ui:latest
```

### Option 2: Full Stack (Local Development/Testing)

The included `docker-compose.yml` runs both frontend and backend together.

**Prerequisites**: Clone both repositories as siblings:
```
parent-folder/
├── snapLoad-API/    # Backend repository
└── snapLoad-UI/     # Frontend repository (you are here)
```

**Run full stack:**
```bash
# From snapLoad-UI directory
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

This will start:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:8000`

### Environment Variables

**Optional telemetry (build-time):** Vercel Analytics is **off by default** (it is third-party telemetry and only works on Vercel). Enable it with `NEXT_PUBLIC_ENABLE_ANALYTICS=true`.

**Tests:** `npm test` runs the pure-logic unit tests (`node --test`: media options, ARIA tab keyboard, health re-check schedule).

**Build-time (--build-arg):**
```bash
NEXT_PUBLIC_API_URL=http://your-backend-url:8000
```

**Runtime (-e or docker-compose.yml):**
```bash
# Backend URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Server config
NODE_ENV=production
PORT=3000
```

### Docker Configuration Details

**Multi-stage Dockerfile:**
- **Stage 1**: Install dependencies with pnpm
- **Stage 2**: Build Next.js app with standalone output
- **Stage 3**: Minimal runtime (node:20-alpine, ~150MB final image)

**Key Features:**
- Non-root user (`nextjs`) for security
- Health check on `/api/health`
- Optimized layer caching for fast rebuilds
- Standalone output for self-contained deployment

**Note on Repos:** 
The backend ([snapLoad-API](https://github.com/pabrax/SnapLoad-API)) is a separate repository. The full-stack `docker-compose.yml` expects it as a sibling directory. For production, deploy each service independently and configure `NEXT_PUBLIC_API_URL` to point to your backend.

---

## 🗂️ Project Structure

```
snapLoad-UI/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Home page (Audio downloads)
│   ├── video/page.tsx         # Video downloads page
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   └── api/                   # API routes (backend proxies)
│       ├── download-with-progress/
│       ├── download-video/
│       ├── status/
│       ├── files/
│       ├── cancel/
│       ├── health/
│       └── info/
├── src/
│   ├── components/
│   │   ├── features/          # Feature-specific components
│   │   │   ├── audio/        # Audio download components
│   │   │   └── video/        # Video download components
│   │   └── ui/               # Reusable UI components (shadcn/ui)
│   ├── hooks/                # Custom React hooks
│   │   ├── use-audio-download.ts
│   │   ├── use-download-progress.ts
│   │   ├── use-playlist-polling.ts
│   │   ├── use-backend-health.ts
│   │   └── use-error-handler.ts
│   ├── lib/                  # Utilities and helpers
│   │   ├── utils.ts          # General utilities
│   │   └── validators.ts     # URL validation
│   ├── types/                # TypeScript definitions
│   │   └── api.ts
│   ├── config/               # Configuration
│   │   ├── backend.ts        # Backend URL config
│   │   └── index.ts
│   └── constants/            # App constants
│       ├── audio.ts
│       ├── video.ts
│       └── messages.ts
├── public/                   # Static assets
├── components.json           # shadcn/ui configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── next.config.mjs           # Next.js configuration
├── package.json
└── pnpm-lock.yaml
```

### Key Directories

- **`app/`**: Next.js 15 App Router pages and API routes
- **`src/components/features/`**: Feature-specific components (Audio/Video forms, progress, results)
- **`src/hooks/`**: Custom hooks for state management and API communication
- **`src/lib/`**: Utilities, validators, and helper functions
- **`src/types/`**: TypeScript type definitions
- **`src/components/ui/`**: Reusable UI components from shadcn/ui

---

## 🛠️ Development

### Running Development Server

```bash
# Start dev server
pnpm dev

# Server runs on http://localhost:3000
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler check
```

### Development Workflow

1. **Start Backend**: Ensure the backend API is running on port 8000
2. **Start Frontend**: Run `pnpm dev` 
3. **Check Connection**: You should see a green "Backend: Connected" indicator
4. **Make Changes**: Hot reload is enabled for instant feedback

### Adding New Components

```bash
# Add a shadcn/ui component
pnpx shadcn@latest add button
pnpx shadcn@latest add dialog
pnpx shadcn@latest add dropdown-menu
```

---

## 🏗️ Building for Production

### Build

```bash
# Create production build
pnpm build

# Output will be in .next/ directory
```

### Run Production Build Locally

```bash
# Start production server
pnpm start

# Server runs on http://localhost:3000
```

### Environment Variables for Production

Create `.env.production`:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### Deploy

**Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo to Vercel for automatic deployments
```

**Docker:**
```bash
# Build Docker image
docker build -t snapload-ui .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BACKEND_URL=http://your-backend:8000 \
  snapload-ui
```

**Static Export** (if not using API routes):
```bash
# Add to next.config.mjs:
# output: 'export'

pnpm build
# Static files will be in out/ directory
```

---

## 🎨 Features & Usage

### Audio Downloads

1. **Navigate to** `http://localhost:3000`
2. **Enter URL**: Paste YouTube or Spotify URL
3. **Select Format**: MP3, M4A, Opus, OGG, FLAC or WAV
4. **Select Quality**: Choose bitrate (64-320 kbps or best). It is disabled for Opus (original stream copied) and FLAC/WAV (lossless)
5. **Preview Info** (optional): Click info icon to preview metadata
6. **Download**: Click "Descargar Ahora"
7. **Track Progress**: Watch real-time progress updates
8. **Download Files**: Once complete, download individual files or ZIP archive

**Supported URLs:**
- YouTube video: `https://www.youtube.com/watch?v=...`
- YouTube playlist: `https://www.youtube.com/playlist?list=...`
- Spotify track: `https://open.spotify.com/track/...`
- Spotify album: `https://open.spotify.com/album/...`
- Spotify playlist: `https://open.spotify.com/playlist/...`

### Video Downloads

1. **Navigate to** `/video` page
2. **Enter URL**: Paste YouTube video URL
3. **Select Format**: WebM, MP4, MKV, MOV or AVI
4. **Select Resolution**: Best, 2160p ... 360p (MOV and AVI are limited to 1080p)
5. **Download**: Click "Descargar Ahora"
6. **Track Progress**: Watch status updates
7. **Download File**: Download when ready

### URL Sanitization

The app automatically:
- Removes YouTube Radio playlists (`&list=RD...`)
- Extracts video ID from various YouTube URL formats
- Validates Spotify URLs
- Shows warnings when URLs are modified

---

## 🔧 Troubleshooting

### Backend Connection Issues

**Problem**: "Backend: Disconnected" indicator

**Solutions:**
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
3. Check for CORS issues (backend should allow frontend origin)
4. Ensure no firewall blocking port 8000

### Download Fails

**Problem**: Downloads fail immediately

**Solutions:**
1. Check backend logs for errors
2. Verify URL is valid and accessible
3. Ensure backend has `yt-dlp` and `spotdl` installed
4. Update `yt-dlp`: `pip install --upgrade yt-dlp`

### Progress Not Updating

**Problem**: Progress stuck at "Procesando..."

**Solutions:**
1. Check browser console for polling errors
2. Verify `/api/status/{job_id}` endpoint is working
3. Check network tab for failed requests
4. Clear browser cache and reload

### Build Errors

**Problem**: `pnpm build` fails

**Solutions:**
1. Clear `.next` directory: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && pnpm install`
3. Check TypeScript errors: `pnpm type-check`
4. Verify all environment variables are set

### Localhost Not Accessible on Network

**Problem**: Can't access from mobile/other devices

**Solutions:**
```bash
# Run dev server with network access
pnpm dev --hostname 0.0.0.0

# Update backend URL to use your local IP
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.xxx:8000
```

---

## 🧪 Testing

### Manual Testing

```bash
# 1. Start backend (in snapLoad-API directory)
cd ../snapLoad-API
uv run python main.py

# 2. Start frontend (in snapLoad-UI directory)
cd ../snapLoad-UI
pnpm dev

# 3. Test scenarios:
# - Audio download (YouTube video)
# - Audio download (Spotify track)
# - Playlist download (YouTube)
# - Album download (Spotify)
# - Video download
# - Cancel download
# - Error handling (invalid URL)
# - Backend disconnection
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (ESLint + Prettier)
- Add TypeScript types for all new code
- Test on mobile and desktop
- Update documentation for new features
- Keep components small and focused

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.

### Third-Party Libraries

This project uses:
- [Next.js](https://nextjs.org/) - MIT License
- [React](https://reactjs.org/) - MIT License
- [Tailwind CSS](https://tailwindcss.com/) - MIT License
- [shadcn/ui](https://ui.shadcn.com/) - MIT License
- [Radix UI](https://www.radix-ui.com/) - MIT License

---

## 🔗 Related Projects

- **[SnapLoad API](https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API)** - Backend REST API (Python/FastAPI)
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** - YouTube downloader
- **[spotdl](https://github.com/spotDL/spotify-downloader)** - Spotify downloader

---

## 📞 Support

- 🐛 [Report Issues](https://github.com/pabrax/SnapLoad/issues)
- 💬 [Discussions](https://github.com/pabrax/SnapLoad/discussions)
- 📧 Backend Issues: See [Backend Documentation](https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API)

### Common Questions

**Q: Can I use this without the backend?**
A: No, the frontend requires the backend API to function. See [Backend Setup](https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API).

**Q: Can I self-host this?**
A: Yes! Both frontend and backend can be self-hosted. See deployment sections.

**Q: Is this legal?**
A: See the Legal Disclaimer in the [Backend README](https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API#%EF%B8%8F-legal-disclaimer). Only download content you have rights to.

**Q: How do I change the theme?**
A: The app uses Tailwind CSS. Modify `tailwind.config.ts` and `app/globals.css` for theme customization.

---

<div align="center">

Made with ❤️ by [pabrax](https://github.com/pabrax)

⭐ Star this repo if you find it useful!

</div>
