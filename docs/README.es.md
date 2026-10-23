<div align="center">

# 🎵 SnapLoad UI

**Interfaz web moderna para descargar contenido de YouTube y Spotify**

[![Next.js](https://img.shields.io/badge/Next.js-15.2+-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*Interfaz hermosa y responsiva con seguimiento de progreso en tiempo real y validación inteligente de URLs*

[API Backend](https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API) | [Demo en Vivo](#) | [Reportar Problemas](https://github.com/pabrax/SnapLoad/issues)

[🇬🇧 English](../README.md) | **🇪🇸 Español**

</div>

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características](#-características)
- [Inicio Rápido](#-inicio-rápido)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Despliegue con Docker](#-despliegue-con-docker)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Desarrollo](#-desarrollo)
- [Construcción para Producción](#-construcción-para-producción)
- [Solución de Problemas](#-solución-de-problemas)
- [Licencia](#-licencia)

---

## 🌟 Descripción General

![Vista Previa de SnapLoad UI](SnapLoad_preview.png)

**SnapLoad UI** es una aplicación web basada en Next.js que proporciona una interfaz intuitiva para descargar contenido de YouTube y Spotify. Construida con patrones modernos de React, TypeScript y Tailwind CSS, ofrece una experiencia fluida con actualizaciones de progreso en tiempo real y manejo inteligente de URLs.

### Características Principales

- 🎯 **Validación Inteligente de URLs**: Detección automática de plataforma y sanitización
- 📊 **Progreso en Tiempo Real**: Actualizaciones de estado en vivo con polling
- 🎵 **Soporte Multi-Plataforma**: YouTube (video/audio), Spotify (tracks/álbumes/playlists)
- 📦 **Descargas Masivas**: Maneja playlists y álbumes con múltiples archivos
- 🎧 **Biblioteca y Reproductor**: Una pestaña *Biblioteca* lista las canciones descargadas (`/api/library`) y una barra de reproducción persistente sigue sonando al cambiar de pestaña. El audio se sirve por `/api/library/{id}/stream`, que reenvía `Range` para poder hacer seek. Atajos: `espacio` reproducir/pausar, `n` siguiente, `p` anterior, `m` silenciar (se ignoran al escribir). Opus/Ogg puede no reproducirse en Safari
- 🎨 **UI Moderna**: Modo oscuro, diseño responsivo, animaciones suaves
- 🔔 **Feedback al Usuario**: Notificaciones toast y manejo de errores
- 📱 **Mobile-First**: Optimizado para todos los tamaños de pantalla
- 🚀 **Listo para Producción**: Health checks, monitoreo de conexión, error boundaries

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- pnpm (recomendado) o npm
- **API Backend** en ejecución (ver [snapLoad-API](https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API))

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/pabrax/SnapLoad.git
cd SnapLoad/snapLoad-UI

# Instalar dependencias
pnpm install

# Configurar URL del backend
cp .env.local.example .env.local
# Editar NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Ejecutar servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📦 Instalación

### Usando pnpm (Recomendado)

```bash
# Instalar pnpm si no está instalado
npm install -g pnpm

# Instalar dependencias
pnpm install
```

### Usando npm

```bash
npm install
```

### Usando yarn

```bash
yarn install
```

---

## ⚙️ Configuración

### Conexión al Backend

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
# URL de la API Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Opcional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=tu_id_de_analytics
```

### Opciones de URL del Backend

**Desarrollo Local:**
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Producción/VPS:**
```bash
NEXT_PUBLIC_BACKEND_URL=https://tu-dominio.com
```

**Red Local (Acceso desde Dispositivos en la Red):**
```bash
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.100:8000
```

---

## 🐳 Despliegue con Docker

### Opción 1: Solo Frontend (Recomendado para Producción)

Conectar a un backend desplegado por separado:

```bash
# Construir imagen del frontend
docker build -t snapload-ui:latest \
  --build-arg NEXT_PUBLIC_API_URL=https://tu-dominio-api.com .

# Ejecutar contenedor
docker run -d \
  --name snapload-ui \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://tu-dominio-api.com \
  snapload-ui:latest
```

### Opción 2: Full Stack (Desarrollo Local/Pruebas)

El `docker-compose.yml` incluido ejecuta tanto frontend como backend juntos.

**Prerequisitos**: Clonar ambos repositorios como hermanos:
```
carpeta-padre/
├── snapLoad-API/    # Repositorio del backend
└── snapLoad-UI/     # Repositorio del frontend (estás aquí)
```

**Ejecutar full stack:**
```bash
# Desde el directorio snapLoad-UI
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener todos los servicios
docker-compose down
```

Esto iniciará:
- Frontend en `http://localhost:3000`
- Backend en `http://localhost:8000`

### Variables de Entorno

**Telemetría opcional (build-time):** Vercel Analytics está **desactivado por defecto** (es telemetría de terceros y solo funciona en Vercel). Se activa con `NEXT_PUBLIC_ENABLE_ANALYTICS=true`.

**Pruebas:** `npm test` ejecuta los tests unitarios de lógica pura (`node --test`: opciones de medios, teclado de pestañas ARIA, calendario de recomprobación de salud).

**Build-time (--build-arg):**
```bash
NEXT_PUBLIC_API_URL=http://url-de-tu-backend:8000
```

**Runtime (-e o docker-compose.yml):**
```bash
# URL del Backend (requerida)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Configuración del servidor
NODE_ENV=production
PORT=3000
```

### Detalles de Configuración Docker

**Dockerfile Multi-Etapa:**
- **Etapa 1**: Instalar dependencias con pnpm
- **Etapa 2**: Construir app Next.js con salida standalone
- **Etapa 3**: Runtime mínimo (node:20-alpine, imagen final ~150MB)

**Características Clave:**
- Usuario sin privilegios de root (`nextjs`) para seguridad
- Health check en `/api/health`
- Caché de capas optimizado para rebuilds rápidos
- Salida standalone para despliegue autocontenido

**Nota sobre Repositorios:** 
El backend ([snapLoad-API](https://github.com/pabrax/SnapLoad-API)) es un repositorio separado. El `docker-compose.yml` full-stack lo espera como directorio hermano. Para producción, despliega cada servicio independientemente y configura `NEXT_PUBLIC_API_URL` para apuntar a tu backend.

---

## 🗂️ Estructura del Proyecto

```
snapLoad-UI/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Página principal (Descargas de audio)
│   ├── video/page.tsx         # Página de descargas de video
│   ├── layout.tsx             # Layout raíz
│   ├── globals.css            # Estilos globales
│   └── api/                   # Rutas API (proxies al backend)
├── src/
│   ├── components/
│   │   ├── features/          # Componentes específicos de características
│   │   │   ├── audio/        # Componentes de descarga de audio
│   │   │   └── video/        # Componentes de descarga de video
│   │   └── ui/               # Componentes UI reutilizables (shadcn/ui)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilidades y helpers
│   ├── types/                # Definiciones TypeScript
│   ├── config/               # Configuración
│   └── constants/            # Constantes de la aplicación
├── public/                   # Assets estáticos
├── components.json           # Configuración de shadcn/ui
├── tailwind.config.ts        # Configuración de Tailwind
├── tsconfig.json             # Configuración de TypeScript
├── next.config.mjs           # Configuración de Next.js
└── package.json
```

---

## 🛠️ Desarrollo

### Ejecutar Servidor de Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev

# El servidor se ejecuta en http://localhost:3000
```

### Scripts Disponibles

```bash
pnpm dev          # Iniciar servidor de desarrollo
pnpm build        # Construir para producción
pnpm start        # Iniciar servidor de producción
pnpm lint         # Ejecutar ESLint
pnpm type-check   # Ejecutar verificación del compilador TypeScript
```

### Flujo de Trabajo de Desarrollo

1. **Iniciar Backend**: Asegúrate de que la API backend esté ejecutándose en el puerto 8000
2. **Iniciar Frontend**: Ejecuta `pnpm dev`
3. **Verificar Conexión**: Deberías ver un indicador verde "Backend: Conectado"
4. **Hacer Cambios**: Hot reload está habilitado para feedback instantáneo

### Agregar Nuevos Componentes

```bash
# Agregar un componente de shadcn/ui
pnpx shadcn@latest add button
pnpx shadcn@latest add dialog
pnpx shadcn@latest add dropdown-menu
```

---

## 🏗️ Construcción para Producción

### Construir

```bash
# Crear construcción de producción
pnpm build

# La salida estará en el directorio .next/
```

### Ejecutar Construcción de Producción Localmente

```bash
# Iniciar servidor de producción
pnpm start

# El servidor se ejecuta en http://localhost:3000
```

### Variables de Entorno para Producción

Crea `.env.production`:

```bash
NEXT_PUBLIC_BACKEND_URL=https://tu-dominio-api.com
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=tu_id_de_analytics
```

### Desplegar

**Vercel (Recomendado):**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# O conecta el repositorio de GitHub a Vercel para despliegues automáticos
```

**Docker:**
```bash
# Construir imagen Docker
docker build -t snapload-ui .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BACKEND_URL=http://tu-backend:8000 \
  snapload-ui
```

---

## 🎨 Características y Uso

### Descargas de Audio

1. **Navegar a** `http://localhost:3000`
2. **Ingresar URL**: Pegar URL de YouTube o Spotify
3. **Seleccionar Formato**: MP3, M4A, Opus, OGG, FLAC o WAV
4. **Seleccionar Calidad**: Elegir bitrate (64-320 kbps o mejor). Se desactiva para Opus (se copia el stream original) y FLAC/WAV (sin pérdida)
5. **Vista Previa de Info** (opcional): Hacer clic en el ícono de info para previsualizar metadatos
6. **Descargar**: Hacer clic en "Descargar Ahora"
7. **Seguir Progreso**: Ver actualizaciones de progreso en tiempo real
8. **Descargar Archivos**: Una vez completado, descargar archivos individuales o archivo ZIP

**URLs Soportadas:**
- Video de YouTube: `https://www.youtube.com/watch?v=...`
- Playlist de YouTube: `https://www.youtube.com/playlist?list=...`
- Track de Spotify: `https://open.spotify.com/track/...`
- Álbum de Spotify: `https://open.spotify.com/album/...`
- Playlist de Spotify: `https://open.spotify.com/playlist/...`

### Descargas de Video

1. **Navegar a** la página `/video`
2. **Ingresar URL**: Pegar URL de video de YouTube
3. **Seleccionar Formato**: WebM, MP4, MKV, MOV o AVI
4. **Seleccionar Resolución**: Mejor, 2160p ... 360p (MOV y AVI se limitan a 1080p)
5. **Descargar**: Hacer clic en "Descargar Ahora"
6. **Seguir Progreso**: Ver actualizaciones de estado
7. **Descargar Archivo**: Descargar cuando esté listo

### Sanitización de URLs

La aplicación automáticamente:
- Elimina playlists de Radio de YouTube (`&list=RD...`)
- Extrae el ID del video de varios formatos de URL de YouTube
- Valida URLs de Spotify
- Muestra advertencias cuando las URLs son modificadas

---

## 🔧 Solución de Problemas

### Problemas de Conexión al Backend

**Problema**: Indicador "Backend: Desconectado"

**Soluciones:**
1. Verificar que el backend esté ejecutándose: `curl http://localhost:8000/health`
2. Verificar `NEXT_PUBLIC_BACKEND_URL` en `.env.local`
3. Verificar problemas de CORS (el backend debe permitir el origen del frontend)
4. Asegurar que no haya firewall bloqueando el puerto 8000

### Las Descargas Fallan

**Problema**: Las descargas fallan inmediatamente

**Soluciones:**
1. Verificar los logs del backend para errores
2. Verificar que la URL sea válida y accesible
3. Asegurar que el backend tenga `yt-dlp` y `spotdl` instalados
4. Actualizar `yt-dlp`: `pip install --upgrade yt-dlp`

### El Progreso No Se Actualiza

**Problema**: El progreso se queda en "Procesando..."

**Soluciones:**
1. Verificar la consola del navegador para errores de polling
2. Verificar que el endpoint `/api/status/{job_id}` esté funcionando
3. Verificar la pestaña de red para peticiones fallidas
4. Limpiar caché del navegador y recargar

### Errores de Construcción

**Problema**: `pnpm build` falla

**Soluciones:**
1. Limpiar directorio `.next`: `rm -rf .next`
2. Reinstalar dependencias: `rm -rf node_modules && pnpm install`
3. Verificar errores de TypeScript: `pnpm type-check`
4. Verificar que todas las variables de entorno estén configuradas

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](../LICENSE) para más detalles.

---

## 🔗 Proyectos Relacionados

- **[SnapLoad API](https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API)** - API REST Backend (Python/FastAPI)
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** - Descargador de YouTube
- **[spotdl](https://github.com/spotDL/spotify-downloader)** - Descargador de Spotify

---

## 📞 Soporte

- 🐛 [Reportar Problemas](https://github.com/pabrax/SnapLoad/issues)
- 💬 [Discusiones](https://github.com/pabrax/SnapLoad/discussions)
- 📧 Problemas del Backend: Ver [Documentación del Backend](https://github.com/pabrax/SnapLoad/tree/main/snapLoad-API)

---

<div align="center">

Hecho con ❤️ por [pabrax](https://github.com/pabrax)

⭐ Dale una estrella si te resulta útil!

</div>
