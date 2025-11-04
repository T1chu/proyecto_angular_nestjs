# Red Social - Full Stack (NestJS + Angular)

## 📋 Descripción
Aplicación de red social con backend en NestJS y frontend en Angular.

## 🚀 Configuración e Instalación

### Requisitos Previos
- Node.js (v18 o superior)
- MongoDB Atlas (o MongoDB local)
- npm

### Instalación

```bash
# Instalar dependencias
npm install
```

### Configuración de Variables de Entorno

El archivo `.env` ya está configurado en la raíz del proyecto backend con:

```env
MONGODB_URI=mongodb+srv://tizianomedina:tiziano123@cluster0.zeyvyey.mongodb.net/?appName=Cluster0
JWT_SECRET=tu_secreto_super_seguro_cambialo_en_produccion
PORT=3000
```

## 🏃‍♂️ Ejecutar el Proyecto

### Opción 1: Ejecutar Backend y Frontend Simultáneamente (Recomendado)

```bash
npm run start:both
```

Esto iniciará:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:4200

### Opción 2: Ejecutar por Separado

#### Backend (NestJS)
```bash
npm run start:dev
```
El servidor estará disponible en http://localhost:3000

#### Frontend (Angular)
```bash
npm run start:frontend
```
La aplicación estará disponible en http://localhost:4200

## 📁 Estructura del Proyecto

```
social-network-backend/
├── src/                      # Backend NestJS
│   ├── auth/                 # Módulo de autenticación
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts     # Guard JWT personalizado
│   │   └── dto/
│   ├── users/                # Módulo de usuarios
│   ├── publications/         # Módulo de publicaciones
│   └── main.ts
├── frontend/                 # Frontend Angular
│   └── src/
│       ├── app/
│       │   ├── components/   # Componentes Angular
│       │   │   ├── login/
│       │   │   ├── registro/
│       │   │   ├── publicaciones/
│       │   │   ├── mi-perfil/
│       │   │   └── modal-crear-publicacion/
│       │   ├── services/     # Servicios
│       │   │   ├── auth.service.ts
│       │   │   └── publications.service.ts
│       │   └── guards/       # Guards de Angular
│       └── environments/     # Configuración de entornos
└── uploads/                  # Archivos subidos (imágenes)
```

## 🔑 API Endpoints

### Autenticación
- `POST /auth/registro` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/autorizar` - Validar token
- `POST /auth/refrescar` - Refrescar token

### Usuarios
- `GET /usuarios/perfil` - Obtener perfil del usuario actual
- `GET /usuarios/:id` - Obtener perfil por ID

### Publicaciones
- `POST /publicaciones` - Crear publicación
- `GET /publicaciones` - Listar publicaciones
- `DELETE /publicaciones/:id` - Eliminar publicación
- `POST /publicaciones/:id/megusta` - Dar me gusta
- `DELETE /publicaciones/:id/megusta` - Quitar me gusta

## 🛠️ Comandos Útiles

```bash
# Compilar backend
npm run build

# Compilar frontend
npm run build:frontend

# Formatear código
npm run format:all

# Linter
npm run lint

# Tests
npm run test
```

## 🔒 Autenticación

El sistema usa JWT (JSON Web Tokens) con:
- **Access Token**: 15 minutos
- **Refresh Token**: 7 días

El frontend guarda los tokens en localStorage y los envía automáticamente en las peticiones.

## 📝 Notas Importantes

1. **CORS**: El backend está configurado para aceptar peticiones desde `http://localhost:4200`
2. **Uploads**: Las imágenes se guardan en `./uploads/` (perfiles y publicaciones)
3. **Validación**: El backend usa `class-validator` para validar DTOs
4. **Base de datos**: Configurada con MongoDB Atlas

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
Verifica que la URI en `.env` sea correcta y que tu IP esté en la lista blanca de MongoDB Atlas.

### Puerto ya en uso
Si el puerto 3000 o 4200 está ocupado, puedes cambiarlos:
- Backend: Modificar `PORT` en `.env` y `main.ts`
- Frontend: Modificar `port` en `angular.json`

### Errores de TypeScript en el frontend
Los archivos del frontend pueden mostrar errores de parsing en VS Code porque están excluidos del `tsconfig.json` del backend. Esto es normal y no afecta la ejecución.

## 📦 Dependencias Principales

### Backend
- NestJS
- Mongoose
- JWT
- Bcrypt
- Multer (upload de archivos)
- class-validator

### Frontend
- Angular 20
- RxJS
- HttpClient

## 👥 Funcionalidades

✅ Registro e inicio de sesión
✅ Autenticación con JWT
✅ Perfiles de usuario con imagen
✅ Crear publicaciones con imágenes
✅ Dar "me gusta" a publicaciones
✅ Listar publicaciones con paginación
✅ Eliminar publicaciones (propias o admin)
✅ CORS configurado
✅ Validación de datos

## 🚧 Próximas Mejoras

- [ ] Comentarios en publicaciones
- [ ] Seguir usuarios
- [ ] Notificaciones en tiempo real
- [ ] Búsqueda de usuarios
- [ ] Editar perfil
- [ ] Cambiar contraseña
