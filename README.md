# UniSabana MarketPlace 🛍️

**Juan José Penagos Marín**  
Ingeniería Informática — Universidad de La Sabana  
🔗 [https://unisabana-marketplace.vercel.app](https://unisabana-marketplace.vercel.app)

---

## ¿Qué es esto?

Es un marketplace web hecho para estudiantes de La Sabana, donde pueden comprar y vender cosas entre ellos. La idea es que sea como un Mercado Libre pero solo para la universidad, donde te puedes registrar con tu correo institucional y publicar lo que quieras vender.

## ¿Con qué está hecho?

**Frontend:** React + Vite + Tailwind CSS  
**Backend:** Node.js + Express  
**Base de datos:** MongoDB Atlas  
**Imágenes:** Cloudinary  
**Deploy:** Vercel (frontend y backend)

## ¿Qué se puede hacer?

- Registrarse solo con correo @unisabana.edu.co
- Publicar productos con fotos, precio, categoría y cantidad disponible
- Buscar y filtrar productos por categoría, precio y estado
- Agregar productos al carrito y hacer pedidos
- Chatear con el vendedor directamente desde el producto
- Calificar al vendedor después de recibir un pedido
- Ver el perfil público de cada vendedor con sus productos y reseñas
- Recibir notificaciones dentro de la app cuando llega un mensaje o una venta
- Reportar productos o vendedores sospechosos

## Panel de administrador

Hay un panel en `/admin` al que solo puede entrar el administrador. Desde ahí se puede ver métricas de la plataforma con gráficas, gestionar usuarios, revisar y moderar productos, y atender reportes de la comunidad.

## ¿Cómo correrlo localmente?

**Backend:**
```bash
cd Backend
npm install
# crear .env y llenar con tus datos
npm run dev
```

**Frontend:**
```bash
cd Frontend
npm install
# crear .env.local con VITE_API_URL=http://localhost:3000/api
npm run dev
```

## Variables de entorno necesarias

**Backend (.env):**
```
PORT=3000
MONGODB_URI=tu_uri_de_mongodb_atlas
JWT_SECRET=tu_secreto
NODE_ENV=development
```

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:3000/api
VITE_CLOUDINARY_NAME=tu_cloud_name
VITE_CLOUDINARY_PRESET=tu_preset
```