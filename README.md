<div align="center">
  <h1>🐾 Guander</h1>
  <p><strong>La plataforma que conecta dueños de mascotas con locales y profesionales pet-friendly</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss" alt="Tailwind" />
    <img src="https://img.shields.io/badge/MUI-7-007FFF?logo=mui" alt="MUI" />
    <img src="https://img.shields.io/badge/Cloudflare_D1-SQLite-orange?logo=cloudflare" alt="Cloudflare D1" />
  </p>
</div>

---

## 📖 ¿Qué es Guander?

**Guander** es una plataforma web full-stack orientada al mundo de las mascotas en Argentina. Permite a dueños de mascotas descubrir locales pet-friendly (veterinarias, pet shops, cafeterías, grooming, resorts) y profesionales independientes cerca de su ubicación, acumular puntos por compras, canjear cupones y acceder a ofertas exclusivas.

Los comercios y profesionales pueden registrarse, suscribirse a un plan mensual y gestionar su presencia en la plataforma desde un dashboard completo.

---

## ✨ Funcionalidades principales

| Para dueños de mascotas | Para comercios y profesionales | Para administradores |
|---|---|---|
| Buscar locales por categoría y zona | Dashboard de gestión completo | Panel admin con estadísticas |
| Ver reseñas y calificaciones | Publicar servicios y horarios | CRUD de usuarios y locales |
| Acumular puntos por compras | Crear cupones y promociones | Gestión de planes y suscripciones |
| Canjear cupones exclusivos | Subir fotos del local | Procesamiento de pagos |
| Descargar la app móvil Android | Gestionar reseñas de clientes | Reportes y analytics |
| Formulario de contacto | Suscripción vía MercadoPago | Moderación de contenido |

---

## 🛠️ Stack tecnológico

### Core
- **[Next.js 16](https://nextjs.org/)** — Framework full-stack con App Router
- **[React 19](https://react.dev/)** — Biblioteca UI
- **[TypeScript 5](https://www.typescriptlang.org/)** — Tipado estático

### UI & Estilos
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utilidades CSS
- **[Material-UI (MUI) 7](https://mui.com/)** — Componentes de interfaz
- **[Lucide React](https://lucide.dev/)** — Iconografía

### Base de datos
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** — SQLite en la nube con acceso vía API REST

### Autenticación & Seguridad
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** — JWT para sesiones
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** — Hash de contraseñas

### Pagos
- **[MercadoPago](https://www.mercadopago.com.ar/)** — Procesamiento de pagos

### Servicios externos
- **[Cloudinary](https://cloudinary.com/)** — Almacenamiento y optimización de imágenes
- **[Resend](https://resend.com/)** — Email transaccional (recuperación de contraseña, contacto)
- **[Leaflet / React Leaflet](https://react-leaflet.js.org/)** — Mapas interactivos
- **[Google Maps API](https://developers.google.com/maps)** — Geolocalización

### Herramientas
- **[pnpm](https://pnpm.io/)** — Gestor de paquetes
- **[ESLint](https://eslint.org/)** — Linter

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                    # Landing page principal
│   ├── layout.tsx                  # Layout raíz con metadata
│   ├── globals.css
│   ├── HomeLandingScreen.tsx       # Composición de la home
│   │
│   ├── components/                 # Secciones de la landing
│   │   ├── HeroBanner.tsx          # Hero con video de fondo
│   │   ├── Navbar.tsx              # Navegación principal
│   │   ├── StatsBar.tsx            # Estadísticas en vivo
│   │   ├── LocationsFilterSection.tsx  # Filtro de locales
│   │   ├── ExclusiveOffersSection.tsx  # Cupones y ofertas
│   │   ├── SubscriptionPlans.tsx   # Cards de planes
│   │   ├── DownloadsSection.tsx    # Descarga APK Android
│   │   ├── ContactSection.tsx      # Formulario de contacto
│   │   └── Footer.tsx
│   │
│   ├── api/                        # Route Handlers (API REST)
│   │   ├── auth/                   # Login, registro, reset de contraseña
│   │   ├── admin/                  # Endpoints del panel admin
│   │   ├── store/                  # Endpoints del dashboard de comercios
│   │   ├── messages/               # Sistema de mensajería
│   │   ├── stats/                  # Estadísticas públicas
│   │   └── contact/                # Formulario de contacto
│   │
│   ├── dashboard/
│   │   ├── admin/                  # Panel de administración
│   │   │   ├── usuarios/
│   │   │   ├── locales/
│   │   │   ├── profesionales/
│   │   │   ├── suscripciones/
│   │   │   ├── pagos/
│   │   │   ├── planes/
│   │   │   ├── cupones/
│   │   │   ├── mensajes/
│   │   │   ├── solicitudes/
│   │   │   ├── servicios/
│   │   │   ├── estadisticas/
│   │   │   └── configuracion/
│   │   │
│   │   └── store/                  # Dashboard de comercios
│   │       ├── profile/
│   │       ├── services/
│   │       ├── coupons/
│   │       ├── promotions/
│   │       ├── reviews/
│   │       ├── payments/
│   │       ├── subscribe/
│   │       ├── notifications/
│   │       └── recommendation/
│   │
│   ├── login/                      # Página de login
│   ├── register/                   # Registro de usuarios
│   ├── forgot-password/
│   ├── reset-password/
│   ├── como-adherirse/             # Guía para comercios
│   ├── ayuda/                      # Centro de ayuda
│   ├── faq/                        # Preguntas frecuentes
│   ├── privacidad/
│   └── terminos/
│
├── lib/
│   ├── cloudflare-d1.ts            # Cliente de Cloudflare D1
│   ├── auth.ts                     # Lógica de autenticación
│   ├── admin-auth.ts               # Autenticación de admin
│   ├── plan-limits.ts              # Límites por plan
│   ├── subscription-benefits.ts   # Beneficios de suscripción
│   └── ...
│
public/
├── guander.apk                     # App Android
└── ...
```

---

## 🗃️ Base de datos

El esquema completo está en [`schema.sql`](./schema.sql). Principales entidades:

| Tabla | Descripción |
|---|---|
| `users` / `user_data` | Cuentas de usuario y datos personales |
| `stores` | Comercios pet-friendly (nombre, GPS, rating, categoría) |
| `professionals` | Profesionales independientes |
| `subscription` | Planes de suscripción disponibles |
| `store_sub` | Suscripción activa de cada comercio |
| `coupon_store` / `coupon_prof` | Cupones emitidos por comercios |
| `comments_store` / `comments_prof` | Reseñas y calificaciones |
| `customer` | Perfil de cliente con puntos acumulados |
| `benefit_store` | Beneficios automáticos por puntos |

---

## 🚀 Instalación y desarrollo local

### Requisitos previos
- Node.js 20+
- pnpm (`npm install -g pnpm`)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Tgonzdv/guanderv2.git
cd guanderv2

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Completar los valores en .env.local

# 4. Ejecutar en desarrollo
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## ⚙️ Variables de entorno

Crear un archivo `.env.local` en la raíz con las siguientes variables:

```env
# JWT - Secreto para firmar tokens (requerido)
JWT_SECRET=un_secreto_muy_largo_y_aleatorio

# Cloudflare D1 - Base de datos
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_D1_DATABASE_ID=
CLOUDFLARE_API_TOKEN=

# Cloudinary - Almacenamiento de imágenes
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# MercadoPago - Pagos
MP_ACCESS_TOKEN=

# Resend - Emails transaccionales
RESEND_API_KEY=

# URL pública del sitio (para emails y callbacks)
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

> ⚠️ **Nunca commitees el archivo `.env.local`**. Está incluido en `.gitignore`.

---

## 📱 App móvil Android

La app Android está disponible para descarga directa desde la landing page. El archivo APK se sirve desde `/public/guander.apk`.

---

## 🔐 Autenticación

El sistema usa dos capas de auth:

1. **Usuarios / Comercios** — JWT en cookie `token` (httpOnly, sameSite=strict)
2. **Administradores** — JWT en cookie `admin_session` (httpOnly, sameSite=strict)

Las contraseñas de usuarios se hashean con **bcryptjs**. La contraseña mínima es de **8 caracteres**.

---

## 💳 Flujo de suscripción

```
Comercio elige plan → Sistema crea preferencia MercadoPago
  → Redirección a MercadoPago → Pago aprobado
  → Callback confirma pago → store_sub activada en DB
  → Acceso a beneficios del plan habilitado
```

---

## 📦 Scripts disponibles

```bash
pnpm dev        # Servidor de desarrollo (http://localhost:3000)
pnpm build      # Build de producción
pnpm start      # Servidor de producción
pnpm lint       # Ejecutar ESLint
```

---

## 🌐 Deploy

El proyecto está configurado para deployar en **[Vercel](https://vercel.com)**. Cada push a `main` dispara un deploy automático.

1. Conectar el repositorio en Vercel
2. Configurar todas las variables de entorno en el panel de Vercel
3. Deploy automático en cada push

---

## 📄 Licencia

Todos los derechos reservados © 2026 Guander.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
