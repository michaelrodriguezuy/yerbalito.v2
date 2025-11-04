# Club Yerbalito - Sistema de Gestión de Baby Fútbol

## Descripción
Sistema web completo para la gestión del Club Yerbalito de Baby Fútbol, desarrollado con React en el frontend y Node.js en el backend, utilizando MySQL como base de datos. Incluye gestión de jugadores, categorías, pagos, blog/noticias y administración del club.

## Tecnologías Principales

### Frontend (yerbalito/)
- React 18
- Vite
- Material-UI (MUI) con componentes de DataGrid y DatePickers
- Tailwind CSS
- React Router DOM
- Formik & Yup para validación de formularios
- Axios para peticiones HTTP
- Sonner para notificaciones toast (principal)
- SweetAlert2 para diálogos de confirmación
- Tremor y Recharts para visualización de datos
- Day.js y Moment.js para manejo de fechas
- React Icons y Remix Icon para iconografía
- React Canvas Confetti para animaciones

### Backend (backend/)
- Node.js 18
- Express.js
- MySQL 8.0
- bcryptjs para encriptación de contraseñas
- Multer para manejo de archivos
- PDFKit para generación de comprobantes PDF
- Nodemailer para envío de correos
- basic-ftp para transferencia de archivos
- CORS para manejo de peticiones cross-origin
- MySQL2 para conexión a base de datos
- node-cron para tareas programadas (actualización automática de estados)

### Infraestructura
- Docker & Docker Compose
- MySQL 8.0
- Nginx (para el frontend)
- Node.js 18

## Estructura del Proyecto
```
├── yerbalito/                    # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── layout/          # Componentes de layout (Navbar, Footer, etc.)
│   │   │   │   ├── navbar/
│   │   │   │   ├── footer/
│   │   │   │   ├── player/
│   │   │   │   ├── categories/
│   │   │   │   ├── reports/
│   │   │   │   ├── calendar/
│   │   │   │   ├── BirthdayNotification.jsx
│   │   │   │   └── MatchResultsModal.jsx
│   │   │   └── pages/           # Páginas principales
│   │   │       ├── home/
│   │   │       ├── login/
│   │   │       ├── dashboard/
│   │   │       ├── payments/
│   │   │       ├── squads/
│   │   │       ├── reports/
│   │   │       ├── blog/
│   │   │       ├── category/
│   │   │       ├── contact/
│   │   │       ├── about/
│   │   │       └── ...
│   │   ├── router/              # Configuración de rutas
│   │   ├── context/             # Context API (AuthContext)
│   │   ├── config/              # Configuración (API endpoints)
│   │   ├── theme/               # Tema de Material-UI
│   │   ├── styles/              # Estilos globales
│   │   ├── utils/               # Utilidades
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/                  # Archivos estáticos
│   ├── Dockerfile               # Configuración Docker para frontend
│   ├── nginx.conf               # Configuración Nginx
│   └── package.json
├── backend/                     # Backend Node.js
│   ├── index.js                 # Punto de entrada (todos los endpoints)
│   ├── sendEmail.js             # Configuración de envío de emails
│   ├── uploads/                 # Directorio para archivos subidos
│   ├── Dockerfile               # Configuración Docker para backend
│   └── package.json
├── mysql/                       # Scripts de base de datos
│   └── *.sql                    # Dumps y scripts SQL
├── nginx/                       # Configuración Nginx (producción)
├── docker-compose.yml           # Configuración desarrollo
├── docker-compose.prod.yml      # Configuración producción
└── README.md
```

## Requisitos Previos
- Docker
- Docker Compose
- Git

## Instalación con Docker

### Opción 1: Ejecutar todo el stack con Docker Compose (Recomendado)

1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd yerbalito.v2
```

2. **Configurar variables de entorno:**
```bash
# Crear archivos .env (opcional, ya están configurados por defecto)
# Los valores por defecto funcionan para desarrollo local
```

3. **Ejecutar con Docker Compose:**
```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# O ejecutar en segundo plano
docker-compose up -d --build
```

4. **Acceder a la aplicación:**
- Frontend: http://localhost:8082 (desarrollo) o http://localhost:8080 (producción)
- Backend API: http://localhost:5001
- Base de datos MySQL: localhost:3308

### Opción 2: Desarrollo local (sin Docker)

#### Frontend
```bash
cd yerbalito
npm install
npm run dev
```

#### Backend
```bash
cd backend
npm install
npm start
```

#### Base de Datos
1. Asegúrate de tener MySQL instalado y corriendo
2. Configura las variables de entorno necesarias

## Variables de Entorno

### Backend (backend/.env)
```env
MYSQL_HOST=mysql_container
MYSQL_USER=wwwolima
MYSQL_PASSWORD=rjW63u0I6n
MYSQL_DATABASE=wwwolima_yerbalito
MYSQL_PORT=3306
PORT=5001
NODE_ENV=production
```

### Frontend (yerbalito/.env)
```env
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=Club Yerbalito
VITE_APP_VERSION=2.0.0
```

## Estructura de Base de Datos

### Tablas Principales
- `usuario`: Usuarios del sistema (admin, supervisor, usuario) con email y roles
- `jugador`: Información de jugadores (nombre, apellido, cédula, categoría, etc.)
- `categoria`: Categorías deportivas con campo `visible` para categorías públicas/activas
- `hermanos`: Tabla relacional para gestionar relaciones entre hermanos
- `recibo`: Pagos y cuotas con mes, año y monto
- `fondo_campeonato`: Pagos de fondo común por categoría
- `valores`: Configuración anual de montos de cuotas y fondo de campeonato
- `fixture`: Partidos pasados y próximos por categoría
- `blog`: Publicaciones de blog y noticias con visibilidad
- `estados`: Estados de pagos y categorías

### Categorías del Club
- **Masculino**: ABEJAS (2019), GRILLOS (2018), CHATAS (2017), CHURRINCHES (2016), GORRIONES (2015), SEMILLAS (2014), CEBOLLAS (2013), BABYS (2012)
- **Femenino**: SUB9 (2016-2018), SUB11 (2014-2015), SUB13 (2012-2013)

## Características Principales

### Gestión de Jugadores
- Registro y edición de jugadores por categoría
- Asignación automática de categorías según edad y sexo
- Validación de cédula uruguaya con dígito verificador
- Búsqueda en tiempo real por nombre o apellido
- Búsqueda por cédula de identidad (CI)
- Gestión de hermanos con tabla relacional separada
- Campos opcionales para datos adicionales
- Carga opcional de imágenes (con valor por defecto)
- Gestión completa de información familiar (padre, madre, contacto)
- Vista detallada de jugador individual con historial de pagos

### Sistema de Pagos
- Registro de cuotas mensuales (selección múltiple de meses)
- Pago acumulado por múltiples meses
- Fondo común (FC) por categoría
- Generación de comprobantes PDF para recibos y fondo de campeonato
- Compartir comprobantes por WhatsApp o Email
- Reportes de pagos anuales con gráficos Tremor y Recharts
- Búsqueda de recibos en tiempo real
- Gestión de recibos con fecha/hora y observaciones
- Registro de método de entrega de comprobante (email, whatsapp, impreso)

### Administración
- Dashboard con animaciones slide-up y estadísticas
- Gestión de categorías con visibilidad pública/privada
- Gestión de valores anuales (cuotas y fondo de campeonato)
- Gestión de usuarios con roles (Admin, Supervisor, Usuario)
- Sistema de autenticación seguro con JWT
- Fixture de partidos con resultados históricos y próximos encuentros

### Blog y Noticias
- Publicaciones de noticias del club
- Artículos de blog sobre deportes infantiles
- Categorización de contenido
- Interfaz moderna inspirada en alexandergarcia.me

### Fixture de Partidos
- Modal flotante con resultados anteriores
- Próximos partidos por categoría
- Edición para usuarios logueados
- Posicionamiento personalizable

### Interfaz de Usuario
- Diseño responsivo con Material-UI y Tailwind CSS
- Optimizado para dispositivos móviles (breakpoints: xs, sm, md, lg)
- Tema personalizado del club (verde #1E8732 y blanco)
- Animaciones slide-up para contenido del dashboard
- Notificaciones de cumpleaños con icono animado
- Modal flotante de fixture arrastrable
- Navegación intuitiva con rutas protegidas por rol
- Notificaciones toast con Sonner (principal)
- Diálogos de confirmación con SweetAlert2
- Tablas con scroll horizontal en dispositivos móviles
- DataGrid de Material-UI para gestión de datos

## Validaciones y Seguridad

### Validaciones de Formularios
- Validación de cédula uruguaya (7-8 dígitos con dígito verificador)
- Campos numéricos: cédula, contacto, número de jugador
- Validación condicional de hermanos (requerido solo si checkbox marcado)
- Campos opcionales: imagen, ciudadanía, padre, madre, observaciones
- Fechas en formato DD/MM/YYYY
- Validación de email para usuarios

### Seguridad

#### Autenticación y Sesión
- **Almacenamiento**: La información del usuario se guarda en `localStorage` del navegador
- **No hay expiración automática**: La sesión permanece activa hasta que el usuario cierre sesión manualmente o limpie el `localStorage`
- **Sin tokens JWT**: El sistema no utiliza tokens de autenticación ni sesiones del servidor
- **Protección solo en frontend**: Las rutas están protegidas mediante componentes React (`ProtectedUsers`, `ProtectedAdmin`) que verifican el estado de `localStorage`
- **Sin validación en backend**: El backend NO tiene middleware de autenticación; todas las rutas son accesibles sin validación de sesión del lado del servidor

#### Encriptación de Contraseñas
- Encriptación de contraseñas con bcryptjs (10 rounds)
- Compatibilidad con contraseñas legacy (MD5 y texto plano) para migración gradual
- Las contraseñas nuevas se hashean automáticamente con bcrypt

#### Validación de Roles
- Validación de roles en frontend (Admin, Supervisor, Usuario)
- Rutas protegidas según rol de usuario mediante componentes React
- El rol se almacena en `localStorage` junto con la información del usuario

#### Seguridad de Datos
- Consultas SQL parametrizadas para prevenir inyección SQL
- Validación de datos en backend y frontend (Formik + Yup)
- CORS configurado para permitir peticiones cross-origin

#### ⚠️ Limitaciones de Seguridad Actuales
- **No hay validación de sesión en el backend**: Cualquier usuario con acceso a la API puede hacer peticiones sin autenticación
- **No hay expiración de sesión**: La sesión permanece activa indefinidamente hasta logout manual
- **Datos sensibles en localStorage**: La información del usuario (incluyendo rol) se almacena en el navegador, lo cual es vulnerable a XSS
- **Sin HTTPS obligatorio**: En desarrollo, las credenciales pueden viajar sin encriptación

#### Recomendaciones de Mejora
1. Implementar middleware de autenticación en el backend con JWT o sesiones del servidor
2. Agregar expiración automática de sesión (timeout de inactividad)
3. Validar tokens/sesiones en cada request del backend
4. Implementar refresh tokens para renovar sesiones
5. Usar HTTP-only cookies en lugar de localStorage para tokens
6. Agregar rate limiting para prevenir ataques de fuerza bruta
7. Implementar HTTPS obligatorio en producción

## Manejo de Usuarios Logueados

### Flujo de Autenticación

1. **Login**:
   - Usuario ingresa email y contraseña en `/login`
   - Frontend envía credenciales a `POST /login`
   - Backend valida contraseña (bcrypt, MD5 legacy, o texto plano)
   - Si es válido, backend devuelve información del usuario
   - Frontend guarda en `localStorage`:
     - `userInfo`: `{ id, name, email, rol }`
     - `isLogged`: `true`
   - Redirección a `/dashboard` si es admin, o a la página principal

2. **Estado de Sesión**:
   - La sesión se mantiene mientras exista `localStorage`
   - Al recargar la página, el `AuthContext` lee `localStorage` y restaura el estado
   - No hay validación del lado del servidor en cada request

3. **Logout**:
   - Usuario hace clic en "Cerrar Sesión" en el menú
   - Se ejecuta `logoutContext()` que:
     - Limpia `localStorage` completamente
     - Resetea el estado de `user` e `isLogged`
     - Redirige a la página principal `/`

### Protección de Rutas

#### Frontend (React Router)
- **Rutas públicas**: Accesibles sin login (`/`, `/home`, `/about`, `/categories`, `/blogs`, `/contact`)
- **Rutas protegidas (usuario logueado)**: Requieren `isLogged === true`
  - `/squads`, `/payments`, `/fc`, `/reports`, `/player/:id`
  - Protegidas por componente `ProtectedUsers`
- **Rutas protegidas (admin)**: Requieren `isLogged === true` Y `rol === 'admin'`
  - `/dashboard`, `/valores`, `/fixture`
  - Protegidas por componente `ProtectedAdmin`

#### Backend
- **⚠️ NO hay protección**: Todas las rutas del backend son accesibles sin autenticación
- Cualquier cliente puede hacer peticiones a cualquier endpoint
- La validación de permisos solo existe en el frontend

### Expiración de Sesión

**No hay expiración automática**. La sesión permanece activa hasta que:
- El usuario cierra sesión manualmente
- El usuario limpia el `localStorage` del navegador
- El usuario cierra el navegador y limpia datos al cerrar (si está configurado)

### Vulnerabilidades Conocidas

1. **Sin validación del servidor**: Un usuario puede modificar `localStorage` y cambiar su rol a `admin`
2. **API completamente abierta**: Cualquier persona con acceso a la URL del backend puede hacer peticiones
3. **Sin tokens**: No hay forma de revocar una sesión desde el servidor
4. **XSS**: Si hay vulnerabilidades XSS, pueden robar el `localStorage` con la información del usuario

## Funcionalidades Específicas del Club

### Sistema de Hermanos
- Los jugadores pueden tener hermanos registrados en tabla relacional `hermanos`
- Relaciones bidireccionales (si A es hermano de B, entonces B es hermano de A)
- Validación condicional: solo requiere hermanos si el checkbox está marcado
- Al pagar una cuota, se aplica automáticamente a todos los hermanos vinculados
- Gestión de pagos compartidos en transacciones

### Asignación Automática de Categorías
- Cálculo automático de categoría según fecha de nacimiento y sexo
- Categorías masculinas: ABEJAS (2019) hasta BABYS (2012)
- Categorías femeninas: SUB9 (2016-2018), SUB11 (2014-2015), SUB13 (2012-2013)
- Sistema de categorías públicas/activas con campo `visible`
- Solo jugadores de categorías visibles aparecen en listados públicos y cumpleaños

### Modal de Fixture
- Modal flotante y arrastrable con resultados de partidos
- Próximos partidos por categoría
- Resultados históricos por categoría
- Edición solo para usuarios logueados
- Posición guardada en localStorage
- Creación masiva de partidos

### Blog y Noticias
- Sección dividida entre "Blog" y "Noticias"
- Categorización automática del contenido
- Interfaz moderna con filtros
- Publicaciones sobre deportes infantiles y eventos sociales
- Gestión de visibilidad de publicaciones

### Notificaciones de Cumpleaños
- Verificación automática de cumpleaños del día usando `MONTH(CURDATE())` y `DAY(CURDATE())` de MySQL
- Solo muestra jugadores de categorías públicas/activas (`visible = 1`)
- Icono animado cuando hay cumpleaños
- Tooltip informativo con nombre, categoría y edad
- Endpoint: `/cumples` (GET)

## Comandos Docker

### Gestión de contenedores
```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener todos los servicios
docker-compose down

# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs frontend
docker-compose logs backend
docker-compose logs db

# Reconstruir y reiniciar servicios
docker-compose up --build

# Ejecutar comandos en contenedores
docker-compose exec backend npm install
docker-compose exec frontend npm install
```

### Gestión de base de datos
```bash
# Acceder a la base de datos MySQL
docker-compose exec db mysql -u wwwolima -p wwwolima_yerbalito

# Hacer backup de la base de datos
docker-compose exec db mysqldump -u wwwolima -p wwwolima_yerbalito > backup.sql

# Restaurar base de datos (usuario normal)
docker-compose exec -T db mysql -u wwwolima -p wwwolima_yerbalito < backup.sql

# Restaurar base de datos (usuario root - para triggers y funciones)
docker-compose exec -T db mysql -u root -prootpassword wwwolima_yerbalito < backup.sql
```

## Scripts Disponibles

### Frontend (yerbalito/)
- `npm run dev`: Inicia el servidor de desarrollo (Vite)
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Vista previa de la build de producción

### Backend (backend/)
- `npm start`: Inicia el servidor backend (Node.js/Express)
- `npm run dev`: Modo desarrollo con nodemon (si está configurado)

## Puertos utilizados
- **Frontend (desarrollo)**: 8082 (http://localhost:8082)
- **Frontend (producción)**: 8080 (http://localhost:8080)
- **Backend**: 5001 (http://localhost:5001)
- **MySQL**: 3308 (localhost:3308)

## Funcionalidades Adicionales

### Generación de Comprobantes PDF
- Comprobantes de recibo de cuotas con logo del club
- Comprobantes de fondo de campeonato
- Soporte para múltiples recibos en un solo PDF (IDs separados por coma)
- Footer con enlace a olimarteam.uy
- Información completa: jugador, categoría, período, monto, número de recibo

### Compartir por WhatsApp
- Modal para ingresar número de WhatsApp
- Generación de URL de WhatsApp con mensaje pre-llenado
- Enlace directo al PDF del comprobante
- Registro del método de entrega en base de datos

### Rutas del Frontend
- **Públicas**: `/`, `/home`, `/about`, `/categories`, `/blogs`, `/contact`, `/login`, `/register`, `/forgot-password`
- **Protegidas (usuario logueado)**: `/squads`, `/payments`, `/fc`, `/reports`, `/player/:id`
- **Protegidas (admin)**: `/dashboard`, `/valores`, `/fixture`
- **Dinámicas**: `/blog/:id`, `/noticia/:id`, `/category/:id`

## Solución de problemas

### Problemas comunes
1. **Error de conexión a la base de datos**: Verificar que el contenedor MySQL esté ejecutándose (`docker-compose ps`)
2. **Frontend no carga**: Verificar que el backend esté ejecutándose en el puerto 5001
3. **Error 401 en login**: Verificar credenciales o reiniciar backend
4. **Error 500 al guardar jugador**: Verificar que los campos opcionales no sean null cuando no están permitidos
5. **Modal de fixture no aparece**: Verificar localStorage o limpiar caché del navegador
6. **Blog/Noticias vacío**: Verificar que la tabla `blog` tenga datos y `visible = 1`
7. **Cumpleaños no aparecen**: Verificar que los jugadores pertenezcan a categorías con `visible = 1` y reiniciar backend
8. **Búsqueda no funciona**: Verificar que el frontend esté conectado al backend correctamente
9. **Error al generar PDF**: Verificar que el logo exista en `/uploads/logo_chico.png` o en las rutas configuradas
10. **Error 400 en valores históricos**: Verificar que la ruta `/valores/all` esté antes de `/valores/:ano` en el backend
11. **Categoría incorrecta en jugador**: Verificar que los `useEffect` en `PlayerForm.jsx` no estén sobrescribiendo la categoría del backend
12. **Error de importación en build**: Verificar que las rutas de importación sean case-sensitive (Linux vs macOS/Windows)

### Comandos de diagnóstico
```bash
# Verificar estado de contenedores
docker-compose ps

# Verificar logs de errores
docker-compose logs --tail=50

# Reiniciar un servicio específico
docker-compose restart backend

# Reconstruir frontend si hay problemas de UI
docker-compose build --no-cache frontend
```

## Sistema de Actualización Automática de Estados

El sistema incluye un **cron job** que se ejecuta automáticamente el **día 11 de cada mes a las 00:05 (hora Uruguay)** para actualizar los estados de jugadores y categorías.

### Funcionamiento

1. **Actualización automática de jugadores:**
   - Verifica si cada jugador tiene pagado el **mes anterior (mes vencido)**
   - Si NO lo tiene pagado y ya pasó el día 10 del mes actual → `estado = 1` (Deshabilitado)
   - Si lo tiene pagado → `estado = 2` (Habilitado)
   - Los jugadores con `estado = 3` (Exonerado) NO se modifican

2. **Actualización automática de categorías:**
   - Si hay al menos 1 jugador deshabilitado → `categoria.idestado = 5`
   - Si todos los jugadores están habilitados → `categoria.idestado = 6`

3. **Actualización manual:**
   ```bash
   # También puedes actualizar manualmente en cualquier momento:
   curl http://localhost:5001/update-player-states
   ```

### Lógica de Estados (Cuota a Mes Vencido)

**Ejemplo:**
- Hoy es 15 de Noviembre
- Mes vencido: Octubre
- Jugador debe: Agosto, Septiembre, Octubre
- Jugador paga: Agosto

**Resultado:** Como NO pagó Octubre (mes vencido), queda en `estado = 1` (Deshabilitado)

**Importante:** El sistema solo verifica el **mes anterior**, no todos los meses adeudados. Un jugador puede deber varios meses anteriores, pero si tiene pagado el mes vencido, estará habilitado.

### Estados de Jugadores

- **Estado 1 (Deshabilitado):** No tiene el mes anterior pagado
- **Estado 2 (Habilitado):** Tiene el mes anterior pagado
- **Estado 3 (Exonerado):** No paga cuota del club (manual, solo vía Dashboard)

### Estados de Categorías

- **Estado 5:** Hay jugadores deshabilitados en la categoría
- **Estado 6:** No hay jugadores deshabilitados en la categoría

## Endpoints Principales del Backend

### Autenticación
- `POST /login` - Inicio de sesión
- `GET /user` - Obtener usuario actual
- `GET /user/all` - Listar todos los usuarios
- `POST /user` - Crear usuario
- `PUT /user/:id` - Actualizar usuario
- `DELETE /user/:id` - Eliminar usuario

### Jugadores
- `GET /squad` - Listar jugadores (con filtros)
- `GET /squad/all` - Listar todos los jugadores
- `GET /squad/:id` - Obtener jugador por ID
- `GET /squad/search/:ci` - Buscar jugador por CI
- `POST /squad` - Crear jugador (con imagen)
- `PUT /squad/:id` - Actualizar jugador (con imagen)
- `DELETE /squad/:id` - Eliminar jugador

### Pagos
- `GET /payments` - Listar recibos
- `GET /paymentsAnual` - Pagos anuales
- `GET /paymentsMesActual` - Pagos del mes actual
- `GET /ultimoPago/:id` - Último pago de un jugador
- `POST /payments` - Crear recibo (múltiples meses)
- `PUT /payments/:id` - Actualizar recibo
- `DELETE /payments/:id` - Eliminar recibo

### Fondo de Campeonato
- `GET /fc` - Listar pagos de FC
- `GET /fcAnual` - FC anuales
- `GET /fcAnualesXcat` - FC anuales por categoría
- `GET /fcMesActualXcat` - FC del mes actual por categoría
- `POST /fc` - Crear pago de FC
- `POST /fc/multiple` - Crear múltiples pagos de FC
- `PUT /fc/:id` - Actualizar pago de FC
- `DELETE /fc/:id` - Eliminar pago de FC

### Comprobantes PDF
- `GET /comprobante/recibo/:idrecibo` - Generar PDF de recibo (acepta múltiples IDs separados por coma)
- `GET /comprobante/fc/:id_fondo` - Generar PDF de fondo de campeonato
- `PUT /comprobante/recibo/:idrecibo` - Actualizar método de comprobante (email, whatsapp, impreso)
- `PUT /comprobante/fc/:id_fondo` - Actualizar método de comprobante FC

### Reportes
- `GET /cuotasXcat` - Cuotas por categoría
- `GET /cuotasMesActualXcat` - Cuotas del mes actual por categoría
- `GET /cuotasAnualesXcat` - Cuotas anuales por categoría
- `GET /fcXcuotas` - FC por cuotas

### Categorías
- `GET /categories` - Listar categorías
- `GET /categories/all` - Listar todas las categorías
- `GET /categories/:id` - Obtener categoría por ID
- `POST /categories` - Crear categoría
- `PUT /categories/:id` - Actualizar categoría
- `DELETE /categories/:id` - Eliminar categoría

### Valores (Configuración anual)
- `GET /valores` - Listar valores
- `GET /valores/all` - Obtener todos los valores históricos
- `GET /valores/:ano` - Obtener valores por año
- `POST /valores` - Crear configuración de valores

### Fixture
- `GET /fixture` - Listar partidos
- `GET /fixture/categorias` - Obtener categorías con fixture
- `POST /fixture` - Crear partido
- `POST /fixture/bulk` - Crear múltiples partidos

### Blog y Noticias
- `GET /blogs` - Listar blogs
- `GET /blog/:id` - Obtener blog por ID
- `POST /blogs` - Crear blog
- `PUT /blogs/:id` - Actualizar blog
- `DELETE /blogs/:id` - Eliminar blog
- `GET /noticias` - Listar noticias
- `GET /noticias/all` - Listar todas las noticias
- `GET /noticias/:id` - Obtener noticia por ID
- `POST /noticias/create` - Crear noticia
- `PUT /noticias/update/:id` - Actualizar noticia
- `DELETE /noticias/delete/:id` - Eliminar noticia

### Otros
- `GET /cumples` - Obtener cumpleaños del día
- `GET /estados` - Listar estados
- `GET /update-player-states` - Actualizar estados de jugadores (manual)
- `POST /contact` - Enviar mensaje de contacto
- `POST /send-email` - Enviar email

## Credenciales de prueba
- **Admin**: admin@gmail.com / yago4356
- **Test**: test@test.com / password

## Contribución
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AhoraSiSomosGardel`)
3. Commit tus cambios (`git commit -m 'Add some AhoraSiSomosGardel'`)
4. Push a la rama (`git push origin feature/AhoraSiSomosGardel`)
5. Abre un Pull Request

## Despliegue en Producción

### Requisitos del servidor
- Ubuntu 22.04 LTS o superior
- Mínimo 2GB RAM, 20GB espacio en disco
- Docker y Docker Compose instalados

### Despliegue rápido
```bash
# 1. Clonar repositorio
git clone <url-del-repositorio>
cd yerbalito.v2

# 2. Configurar puertos (opcional)
# Editar docker-compose.yml si necesitas cambiar puertos

# 3. Ejecutar en producción
docker-compose up -d --build

# 4. Verificar estado
docker-compose ps
```

### Configuración de dominio
Para usar un dominio personalizado, configura un proxy reverso con nginx o usa un servicio como Cloudflare.

**Nota importante**: En producción, el frontend usa `VITE_API_URL=http://api.yerbalito.uy` según `docker-compose.prod.yml`. Asegúrate de que el dominio esté configurado correctamente en tu servidor.

### Configuración Git en VPS
Si encuentras el error "fatal: detected dubious ownership", ejecuta:
```bash
git config --global --add safe.directory /var/www/yerbalito
```

## Licencia
Este proyecto está bajo la Licencia ISC. 