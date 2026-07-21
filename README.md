# MiTienda — Ecommerce

Proyecto de ecommerce full-stack, dividido en dos partes independientes dentro de este monorepo.

## 📁 Estructura

```
ecommerce/
├── frontend/    # Nuxt 3 (Vue 3, TypeScript)
└── backend/     # Node.js + Express
```

## 🖥️ Frontend

**Stack:**
- Nuxt 3 (Vue 3, TypeScript)
- Pinia — estado global (carrito, autenticación)
- Tailwind CSS
- @nuxt/image
- @nuxtjs/color-mode — tema oscuro/claro

**Estado actual:** Interfaz completa construida con datos mock (sin conexión al backend todavía). Incluye:
- Catálogo de productos con filtro por categoría
- Carrito de compras
- Checkout con formulario de envío
- Login / registro (simulados)
- Página de cuenta con historial de pedidos
- Rutas protegidas, estados de carga/error, página 404 personalizada

**Correr en desarrollo:**
```bash
cd frontend
npm install
npm run dev
```

Disponible en `http://localhost:3000`.

## ⚙️ Backend

**Stack:**
- Node.js + Express
- PostgreSQL + Supabase
- Prisma (ORM)
- Cloudinary — almacenamiento de imágenes
- Stripe / MercadoPago — pagos
- Zod — validación
- JWT / cookies — sesión

**Correr en desarrollo:**
```bash
cd backend
npm install
npm run dev
```

## 🚧 Estado del proyecto

El frontend y el backend se desarrollan por separado. El frontend usa datos simulados (mock) y se conectará al backend real como última fase del desarrollo.

## 📝 Variables de entorno

Cada carpeta (`frontend/`, `backend/`) requiere su propio archivo `.env` (no incluido en el repositorio por seguridad). Ver `.env.example` en cada carpeta.
