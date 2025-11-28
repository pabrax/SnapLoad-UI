# SnapLoad UI 🎵🎬

> **Interfaz de usuario moderna y reactiva para descarga de audio y video de múltiples plataformas**

SnapLoad UI es una aplicación web construida con Next.js 15 y TypeScript que proporciona una interfaz intuitiva y profesional para descargar contenido multimedia de YouTube, YouTube Music y Spotify. Ofrece seguimiento de progreso en tiempo real, validaciones robustas de URLs, y una experiencia de usuario optimizada tanto para móviles como escritorio.

---

## 📋 Tabla de Contenidos

- [Propósito del Proyecto](#-propósito-del-proyecto)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Validaciones de URLs](#-validaciones-de-urls)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Componentes Clave](#-componentes-clave)
- [Custom Hooks](#-custom-hooks)
- [API Routes](#-api-routes)
- [Tipos TypeScript](#-tipos-typescript)
- [Buenas Prácticas](#-buenas-prácticas)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Propósito del Proyecto

SnapLoad UI actúa como la capa de presentación de un sistema de descarga multimedia completo. Su objetivo principal es:

1. **Proporcionar una interfaz intuitiva** para que usuarios puedan descargar audio y video sin conocimientos técnicos
2. **Validar y sanitizar URLs** antes de enviarlas al backend, evitando descargas no deseadas
3. **Mostrar progreso en tiempo real** mediante polling al backend y actualización reactiva del UI
4. **Gestionar estados complejos** como descargas de playlists completas con múltiples archivos
5. **Ofrecer feedback visual** sobre el estado del backend, errores y éxito de operaciones

El frontend se comunica con un backend FastAPI que maneja la lógica de descarga real usando `yt-dlp` y `spotdl`.

---

## ✨ Características Principales

### **Descarga de Audio**
- Soporte para **Spotify** (tracks, albums, playlists)
- Soporte para **YouTube** y **YouTube Music** (videos individuales y playlists)
- **Selección de calidad**: 96kbps, 128kbps, 192kbps (por defecto), 320kbps
- **Vista previa de información**: título, artista, álbum, duración antes de descargar
- **Progreso en tiempo real** con porcentaje y estado actual

### **Descarga de Video**
- Soporte para **YouTube** (videos individuales y playlists)
- **Formatos disponibles**: MP4, WebM (por defecto)
- **Polling de estado** hasta completar la descarga
- **Lista de archivos producidos** con tamaños y botones de descarga

### **Validaciones Inteligentes**
- **Detección automática** de plataforma (Spotify, YouTube)
- **Sanitización de URLs de YouTube**: remueve playlists automáticas de radio (`RD*`, `RDAM*`)
- **Advertencias al usuario** cuando se modifican URLs problemáticas
- **Validación de formato** de URLs antes de enviar al backend

### **Experiencia de Usuario**
- **Indicador de estado del backend** (conectado/desconectado)
- **Diseño responsive** optimizado para móviles y escritorio
- **Dark mode** con gradientes y efectos visuales modernos
- **Toasts informativos** para feedback instantáneo
- **Cancelación de descargas** en progreso

---

## 🛠 Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 15.2.4 | Framework React con App Router y API Routes |
| **React** | 19 | Library para UI reactiva |
| **TypeScript** | 5+ | Tipado estático y mejor DX |
| **Tailwind CSS** | 4.1.9 | Styling utility-first |
| **Radix UI** | 1.x | Componentes accesibles y customizables |
| **Lucide React** | 0.454+ | Iconos modernos |
| **React Hook Form** | 7.60+ | Gestión de formularios |
| **Zod** | 3.25+ | Validación de schemas |
| **Sonner** | 1.7+ | Sistema de toasts |

### **Dependencias Clave**
- `class-variance-authority`: Gestión de variantes de componentes
- `clsx` + `tailwind-merge`: Utilidades para clases CSS
- `date-fns`: Manipulación de fechas
- `@vercel/analytics`: Analíticas integradas

---

## 📦 Requisitos Previos

Antes de instalar el frontend, asegúrate de tener:

- **Node.js**: versión 18 o superior
- **pnpm**: gestor de paquetes recomendado
  ```bash
  npm install -g pnpm
  ```
- **Backend de SnapLoad**: debe estar corriendo en `http://127.0.0.1:8000` (o configurar variable de entorno)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/pabrax/SnapLoad.git
cd SnapLoad/snapLoad-UI
```

### 2. Instalar dependencias

```bash
pnpm install
```

Esto instalará todas las dependencias listadas en `package.json`, incluyendo Next.js, React, Tailwind, Radix UI y todas las utilidades.

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto `snapLoad-UI/`:

```env
# URL del backend FastAPI
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000

# Puerto de desarrollo del frontend (opcional, por defecto en script)
PORT=9023
```

### Configuración de Backend

El frontend se comunica con el backend mediante API Routes que funcionan como proxy. La URL del backend se obtiene de:

1. `process.env.NEXT_PUBLIC_BACKEND_URL` (preferido)
2. `process.env.BACKEND_URL` (fallback)
3. `http://127.0.0.1:8000` (por defecto)

Esta configuración está centralizada en `/src/lib/backend.ts`:

```typescript
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"
```

### Configuración de Next.js

El archivo `next.config.mjs` incluye:

```javascript
{
  eslint: { ignoreDuringBuilds: true },      // Para builds rápidos
  typescript: { ignoreBuildErrors: true },   // Para desarrollo ágil
  images: { unoptimized: true }              // Imágenes sin optimización
}
```

---

## 🏃 Ejecución

### Modo Desarrollo

```bash
pnpm dev
```

Esto inicia el servidor de desarrollo en **http://localhost:9023** (puerto configurado en `package.json`).

### Modo Producción

```bash
# Build
pnpm build

# Start
pnpm start
```

El build generará archivos optimizados en `.next/` para despliegue.

### Verificación de Linting

```bash
pnpm lint
```

---

## 📁 Estructura del Proyecto

```
snapLoad-UI/
├── app/                          # App Router de Next.js 15
│   ├── layout.tsx               # Layout principal con metadata
│   ├── page.tsx                 # Página principal con tabs audio/video
│   ├── globals.css              # Estilos globales
│   ├── not-found.tsx            # Página 404 personalizada
│   ├── api/                     # API Routes (proxy al backend)
│   │   ├── download/            # POST para descargar audio
│   │   ├── download-video/      # POST para descargar video
│   │   ├── download-with-progress/  # POST con polling
│   │   ├── files/               # GET archivos producidos
│   │   ├── health/              # GET estado del backend
│   │   ├── info/                # GET información de URL
│   │   └── status/              # GET estado de job
│   └── video/                   # Página dedicada a video (legacy)
│
├── src/
│   ├── components/
│   │   ├── features/           # Componentes de funcionalidades
│   │   │   ├── audio/          # AudioDownloadForm, QualitySelector, etc.
│   │   │   ├── video/          # VideoDownloadForm, VideoList, etc.
│   │   │   ├── video-downloader.tsx  # Componente principal de video
│   │   │   └── shared/         # BackendStatus, TabSelector, etc.
│   │   └── ui/                 # Componentes base de Radix UI
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       └── ...
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── use-audio-download.ts      # Lógica de descarga de audio
│   │   ├── use-video-download.ts      # Lógica de descarga de video
│   │   ├── use-download-progress.ts   # SSE/polling de progreso
│   │   ├── use-backend-health.ts      # Monitoreo del backend
│   │   ├── use-playlist-polling.ts    # Polling para playlists
│   │   ├── use-download.ts            # Fetch de info antes de descargar
│   │   └── use-toast.ts               # Toast notifications
│   │
│   ├── lib/                    # Utilidades y helpers
│   │   ├── backend.ts          # Configuración de URL del backend
│   │   ├── validators.ts       # Validación y sanitización de URLs
│   │   ├── utils.ts            # Utilidad cn() para clases
│   │   └── utils/
│   │       └── download-helpers.ts  # Helpers de descarga
│   │
│   ├── constants/              # Constantes de la aplicación
│   │   ├── audio.ts            # Calidades de audio, intervalos
│   │   └── video.ts            # Formatos de video
│   │
│   ├── types/                  # Tipos TypeScript
│   │   └── api.ts              # Tipos alineados con backend API
│   │
│   └── styles/
│       └── globals.css         # Estilos globales adicionales
│
├── public/                     # Archivos estáticos
├── Docs/                       # Documentación e imágenes
├── package.json                # Dependencias y scripts
├── tsconfig.json               # Configuración TypeScript
├── tailwind.config.ts          # Configuración Tailwind
├── next.config.mjs             # Configuración Next.js
└── README.md                   # Este archivo
```

---

## 🔐 Validaciones de URLs

El sistema de validación está implementado en `/src/lib/validators.ts` y proporciona tres capas de seguridad:

### **1. Detección de Plataforma**

```typescript
// Detecta URLs de Spotify
isSpotifyUrl(url: string): boolean

// Detecta URLs de YouTube
isYouTubeUrl(url: string): boolean

// Valida que sea URL soportada
isValidContentUrl(url: string): boolean
```

### **2. URLs de Spotify Soportadas**

✅ **Formatos válidos:**
```
https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
https://open.spotify.com/intl-es/album/1DFixLWuPkv3KT3TnV35m3
https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
spotify:track:3n3Ppam7vgaVa1iaRUc9Lp
spotify:album:1DFixLWuPkv3KT3TnV35m3
spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
```

❌ **Formatos NO válidos:**
```
https://open.spotify.com/artist/...  (no soportado)
https://open.spotify.com/show/...    (no soportado)
spotify.com/track/...                (falta protocolo)
```

### **3. URLs de YouTube Soportadas**

✅ **Formatos válidos:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://music.youtube.com/watch?v=dQw4w9WgXcQ
https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
```

❌ **Formatos NO válidos (automáticamente sanitizados):**
```
# Playlists de radio automáticas (se remueven)
https://www.youtube.com/watch?v=abc&list=RDabc
https://www.youtube.com/watch?v=abc&list=RDAMVMabc

# Parámetros de radio (se remueven)
https://www.youtube.com/watch?v=abc&start_radio=1
```

### **4. Sanitización Automática**

La función `sanitizeYouTubeUrl()` limpia URLs problemáticas:

```typescript
const { sanitized, wasModified, warning } = sanitizeYouTubeUrl(url)

if (wasModified) {
  // Mostrar warning al usuario
  toast.warning(warning)
}
```

**Ejemplo de sanitización:**

```
Input:  https://www.youtube.com/watch?v=abc&list=RDabc
Output: https://www.youtube.com/watch?v=abc
Warning: "Se removió una playlist automática de radio..."
```

### **5. URLs de Playlists**

Para descargar playlists completas, usa el formato explícito:

```
https://www.youtube.com/playlist?list=PLxxxxxxxxxxx
https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
```

**Nota importante:** URLs de `/watch?v=xxx&list=yyy` se convierten automáticamente a videos individuales para evitar descargas masivas accidentales.

---

## 🎨 Funcionalidades Principales

### **1. Descarga de Audio**

El componente `AudioDownloadForm` maneja todo el flujo de descarga de audio:

**Flujo:**
1. Usuario ingresa URL y selecciona calidad
2. URL se valida con `isValidContentUrl()`
3. Si es YouTube, se sanitiza con `sanitizeYouTubeUrl()`
4. Se muestra preview con información del track
5. Usuario confirma descarga
6. Se detecta si es playlist con `isPlaylistUrl()`
7. Para playlists: polling hasta completar todos los archivos
8. Para tracks individuales: progreso en tiempo real
9. Al completar: botones de descarga para cada archivo


**Calidades disponibles:**
- **96 kbps**: Baja calidad (menor tamaño)
- **128 kbps**: Calidad estándar
- **192 kbps**: Alta calidad (por defecto)
- **320 kbps**: Máxima calidad

### **2. Descarga de Video**

El componente `VideoDownloader` maneja las descargas de video:

**Flujo:**
1. Usuario ingresa URL de YouTube y selecciona formato
2. URL se valida y sanitiza
3. Se encola el job en el backend
4. Polling cada 4 segundos hasta completar
5. Al completar: lista de archivos con botones de descarga

**Formatos disponibles:**
- **WebM**: Por defecto, menor tamaño
- **MP4**: Mayor compatibilidad

### **3. Monitoreo del Backend**

El hook `useBackendHealth` verifica cada 5 segundos el estado del backend:

```typescript
const { backendStatus } = useBackendHealth()
// backendStatus: 'connected' | 'disconnected' | 'checking'
```

Se muestra un badge visual que indica:
- 🟢 **Conectado**: Backend operativo
- 🔴 **Desconectado**: Backend no responde
- 🟡 **Verificando**: Comprobando estado

### **4. Progreso en Tiempo Real**

El hook `useDownloadProgress` implementa polling al endpoint `/api/status/{jobId}`:

```typescript
const {
  isLoading,        // true mientras descarga
  progress,         // 0-100
  status,           // 'queued' | 'running' | 'completed' | 'failed'
  message,          // Mensaje descriptivo
  producedFiles,    // Array de archivos producidos
  startDownload,    // Función para iniciar
  cancelDownload    // Función para cancelar
} = useDownloadProgress()
```

**Estados del progreso:**
- `starting`: Iniciando descarga
- `queued`: En cola de procesamiento
- `running`: Descargando/convirtiendo
- `completed`: Finalizado exitosamente
- `failed`: Error en la descarga
- `cancelled`: Cancelado por el usuario

---

## 🧩 Componentes Clave

### **Componentes de UI Base** (`/src/components/ui/`)

Todos los componentes UI están construidos sobre **Radix UI** y estilizados con **Tailwind CSS**:

- `Button`: Botón con variantes (default, destructive, outline, ghost, link)
- `Card`: Contenedor con header, content, footer
- `Input`: Campo de texto estilizado
- `Select`: Dropdown select accesible
- `Progress`: Barra de progreso
- `Toast`: Notificaciones temporales
- `Dialog`: Modales accesibles
- `Accordion`, `Tabs`, `Tooltip`, etc.

### **Componentes de Features Audio** (`/src/components/features/audio/`)

- **AudioDownloadForm**: Formulario principal de descarga de audio
- **AudioInfoPreview**: Vista previa de información del track
- **QualitySelector**: Selector de calidad de audio
- **DownloadProgress**: Visualización de progreso con barra y estado
- **DownloadSuccess**: Card de éxito con lista de archivos descargados
- **DownloadError**: Card de error con mensaje y acción de retry

### **Componentes de Features Video** (`/src/components/features/video/`)

- **VideoDownloadForm**: Formulario de descarga de video
- **VideoList**: Lista de videos descargados con botones
- **VideoError**: Manejo de errores específicos de video

### **Componentes Compartidos** (`/src/components/features/shared/`)

- **BackendStatusBadge**: Indicador visual del estado del backend
- **TabSelector**: Selector de tabs Audio/Video
- **AudioHeader**: Header con título y descripción
- **FeatureBadges**: Badges informativos de características
- **BackgroundEffects**: Efectos visuales de fondo

---

## 🪝 Custom Hooks

### **1. useDownload** (`/src/hooks/use-download.ts`)

Obtiene información de una URL antes de descargar (preview):

```typescript
const { isLoading, error, getAudioInfo, clearError } = useDownload()

const info = await getAudioInfo(url)
// info: { title, artist, album, duration, thumbnail, ... }
```

### **2. useDownloadProgress** (`/src/hooks/use-download-progress.ts`)

Maneja el progreso de descargas individuales con polling:

```typescript
const {
  isLoading,
  progress,
  status,
  producedFiles,
  startDownload,
  cancelDownload
} = useDownloadProgress()

await startDownload(url, quality)
```

### **3. useAudioDownload** (`/src/hooks/use-audio-download.ts`)

Especializado en descargas de audio con soporte para playlists:

```typescript
const {
  isPlaylistPolling,
  overrideFiles,
  handlePlaylistDownload,
  resetPlaylistState
} = useAudioDownload()

const success = await handlePlaylistDownload(url, quality)
```

### **4. useVideoDownload** (`/src/hooks/use-video-download.ts`)

Maneja descargas de video con polling hasta completar:

```typescript
const {
  status,
  files,
  errorMsg,
  handleVideoDownload,
  resetVideoState
} = useVideoDownload()

await handleVideoDownload(url, format)
```

### **5. useBackendHealth** (`/src/hooks/use-backend-health.ts`)

Monitorea la disponibilidad del backend cada 5 segundos:

```typescript
const { backendStatus } = useBackendHealth()
// 'connected' | 'disconnected' | 'checking'
```

### **6. usePlaylistPolling** (`/src/hooks/use-playlist-polling.ts`)

Polling especializado para playlists con progreso global:

```typescript
const {
  isPolling,
  progress,
  currentFile,
  totalFiles,
  startPolling
} = usePlaylistPolling()
```

---

## 🔌 API Routes

Todas las API Routes actúan como **proxy** al backend FastAPI para evitar problemas de CORS y manejar errores:

### **POST /api/download-with-progress**

Encola una descarga de audio y devuelve `job_id`:

```typescript
// Request
{
  url: string
  quality?: string  // "96" | "128" | "192" | "320"
  output_format?: string  // "mp3"
}

// Response
{
  message: string
  job_id: string
  url: string
  source?: string
}
```

### **POST /api/download-video**

Encola una descarga de video:

```typescript
// Request
{
  url: string
  format?: string  // "mp4" | "webm"
}

// Response
{
  message: string
  job_id: string
  url: string
}
```

### **GET /api/status/[jobId]**

Obtiene el estado actual de un job:

```typescript
// Response
{
  job_id: string
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  meta?: {
    error?: string
    progress?: number
    current_file?: string
    // ... más metadata
  }
}
```

### **GET /api/files/[jobId]**

Lista los archivos producidos por un job:

```typescript
// Response
{
  job_id: string
  files: Array<{
    name: string
    size_bytes?: number
    download_url?: string
  }>
}
```

### **GET /api/health**

Verifica el estado del backend:

```typescript
// Response
{
  status: "healthy" | "error"
  spotify_auth: boolean
  youtube_available: boolean
  output_directory: boolean
  message?: string
}
```

### **POST /api/info**

Obtiene información de una URL (preview):

```typescript
// Request
{
  url: string
}

// Response
{
  title: string
  artist?: string
  album?: string
  duration?: number
  thumbnail?: string
  source: "spotify" | "youtube"
}
```

---

## 📘 Tipos TypeScript

Todos los tipos están centralizados en `/src/types/api.ts` y están alineados con las respuestas del backend:

### **Tipos de Request**

```typescript
interface DownloadRequest {
  url: string
  quality?: string
}

interface VideoDownloadRequest {
  url: string
  format?: string
}
```

### **Tipos de Response**

```typescript
interface DownloadEnqueueResponse {
  message: string
  job_id: string
  url: string
  source?: string
}

type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled"

interface StatusResponse {
  job_id: string
  status: JobStatus
  meta?: Record<string, any>
}

interface FileListItem {
  name: string
  size_bytes?: number
  download_url?: string
}
```

### **Tipos de UI**

```typescript
type TabType = 'audio' | 'video'

type BackendStatus = 'connected' | 'disconnected' | 'checking'

type DownloadStatus = 'idle' | 'loading' | 'success' | 'error'

type VideoJobStatus = 'idle' | 'loading' | 'polling' | 'success' | 'error'
```

---

## ✅ Buenas Prácticas

### **1. Validación de URLs**

Siempre valida y sanitiza URLs antes de enviarlas al backend:

```typescript
import { isValidContentUrl, sanitizeYouTubeUrl } from '@/src/lib/validators'

const { sanitized, wasModified, warning } = sanitizeYouTubeUrl(url)

if (!isValidContentUrl(sanitized)) {
  toast.error('URL no válida')
  return
}

if (wasModified && warning) {
  toast.warning(warning)
}
```

### **2. Manejo de Errores**

Usa try-catch y muestra mensajes descriptivos al usuario:

```typescript
try {
  await startDownload(url, quality)
} catch (error) {
  const message = error instanceof Error 
    ? error.message 
    : 'Error desconocido'
  toast.error(message)
}
```

### **3. Cancelación de Descargas**

Implementa AbortController para permitir cancelación:

```typescript
const abortController = useRef<AbortController | null>(null)

const startDownload = async () => {
  abortController.current = new AbortController()
  
  await fetch('/api/download', {
    signal: abortController.current.signal
  })
}

const cancelDownload = () => {
  abortController.current?.abort()
}
```

### **4. Polling Eficiente**

Usa intervalos razonables y limita errores consecutivos:

```typescript
const POLLING_INTERVAL = 4000  // 4 segundos
const MAX_CONSECUTIVE_ERRORS = 3

let consecutiveErrors = 0

while (!finished) {
  await new Promise(r => setTimeout(r, POLLING_INTERVAL))
  
  try {
    const response = await fetch(`/api/status/${jobId}`)
    consecutiveErrors = 0  // Reset on success
    // ... process response
  } catch (error) {
    consecutiveErrors++
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      throw new Error('Backend no disponible')
    }
  }
}
```

### **5. Feedback Visual**

Proporciona feedback constante al usuario:

```typescript
// Estados de carga
{isLoading && <Loader2 className="animate-spin" />}

// Progreso visual
<Progress value={progress} />

// Mensajes descriptivos
<p>{status === 'running' ? 'Descargando...' : 'Preparando...'}</p>

// Toasts para acciones
toast.success('Descarga completada')
toast.error('Error al descargar')
toast.warning('URL modificada')
```

### **6. Responsive Design**

Usa clases de Tailwind para adaptar a diferentes pantallas:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards adaptables */}
</div>

<Button className="w-full md:w-auto">
  Descargar
</Button>
```

---

## 🐛 Troubleshooting

### **Backend no conecta**

**Problema:** Badge muestra "Backend desconectado"

**Solución:**
1. Verifica que el backend esté corriendo: `http://127.0.0.1:8000/health`
2. Revisa la variable de entorno `NEXT_PUBLIC_BACKEND_URL`
3. Verifica que no haya firewall bloqueando el puerto 8000

```bash
# Terminal 1: Inicia el backend
cd CCAPI
uv run python main.py

# Verifica que responda
curl http://127.0.0.1:8000/health
```

### **Error de CORS**

**Problema:** Errores de CORS en el navegador

**Solución:**
- Todas las peticiones deben ir a través de las API Routes del frontend (`/api/*`)
- NO hagas fetch directo al backend desde componentes cliente
- El backend debe permitir el origen del frontend en sus headers CORS

### **Descargas no inician**

**Problema:** La descarga se queda en "Preparando..."

**Solución:**
1. Abre DevTools → Network y verifica las peticiones
2. Revisa que el `job_id` se devuelva correctamente
3. Verifica los logs del backend para ver si hay errores

```bash
# Ver logs del backend
tail -f CCAPI/logs/yt/*.log
tail -f CCAPI/logs/spotify/*.log
```

### **URLs no se validan correctamente**

**Problema:** URLs válidas son rechazadas

**Solución:**
- Revisa `/src/lib/validators.ts` y ajusta las regex si es necesario
- Usa la consola del navegador para debuggear:

```typescript
import { isValidContentUrl, sanitizeYouTubeUrl } from '@/src/lib/validators'

console.log(isValidContentUrl('https://youtu.be/abc'))
console.log(sanitizeYouTubeUrl('https://youtube.com/watch?v=abc&list=RDabc'))
```

### **Build falla en producción**

**Problema:** `pnpm build` falla con errores TypeScript

**Solución:**
- El proyecto tiene `ignoreBuildErrors: true` por defecto
- Si quieres builds estrictos, cambia en `next.config.mjs`:

```javascript
{
  typescript: {
    ignoreBuildErrors: false  // Cambia a false
  }
}
```

### **Playlists no descargan todos los archivos**

**Problema:** Solo descarga algunos tracks de una playlist

**Solución:**
1. Verifica que la URL sea del formato `/playlist?list=...`
2. Revisa los logs del backend para ver si hay errores por track
3. Aumenta el timeout si es una playlist muy grande

### **Progreso se queda bloqueado**

**Problema:** La barra de progreso no avanza

**Solución:**
- Verifica que el polling esté funcionando (DevTools → Network)
- El backend debe actualizar el estado del job correctamente
- Revisa que `POLLING_INTERVAL` no sea demasiado largo

---

## 📚 Recursos Adicionales

### **Documentación Oficial**

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [TypeScript](https://www.typescriptlang.org/docs/)

### **Herramientas de Desarrollo**

- **VS Code Extensions:**
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier
  - TypeScript React code snippets

### **Testing**

Para agregar tests en el futuro:

```bash
pnpm add -D @testing-library/react @testing-library/jest-dom vitest
```

---

## 🤝 Contribuciones

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

### **Convenciones de Código**

- Usa **TypeScript** para todo el código nuevo
- Sigue las convenciones de **ESLint**
- Usa **Prettier** para formateo
- Componentes en **PascalCase**
- Funciones y variables en **camelCase**
- Constantes en **UPPER_SNAKE_CASE**

---

## 📄 Licencia

Este proyecto está bajo la licencia especificada en el archivo `LICENSE`.

---

## 👨‍💻 Autor

**pabrax**

- GitHub: [@pabrax](https://github.com/pabrax)
- Repositorio: [SnapLoad](https://github.com/pabrax/SnapLoad)

---

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Abre un [Issue](https://github.com/pabrax/SnapLoad/issues) en GitHub
2. Revisa la sección de [Troubleshooting](#-troubleshooting)
3. Consulta la documentación del backend en `CCAPI/README.md`

---

**¡Gracias por usar SnapLoad UI! 🎵🎬**