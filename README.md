# Club Yerbalito - Sistema de Gestión de Baby Fútbol

## Descripción
Sistema web completo para la gestión del Club Yerbalito de Baby Fútbol, desarrollado con React en el frontend y Node.js en el backend, utilizando MySQL como base de datos. Incluye gestión de jugadores, categorías, pagos, blog/noticias y administración del club.

## Tecnologías Principales

### Frontend (yerbalito/)
- React 18
- Vite
- Material-UI (MUI)
- Tailwind CSS
- React Router DOM
- Formik & Yup para validación de formularios
- Axios para peticiones HTTP
- SweetAlert2 para notificaciones
- Tremor para visualización de datos

### Backend (backend/)
- Node.js 18
- Express.js
- MySQL 8.0
- bcryptjs para encriptación de contraseñas
- Multer para manejo de archivos
- Nodemailer para envío de correos
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
├── yerbalito/           # Frontend React
│   ├── src/            # Código fuente
│   ├── public/         # Archivos estáticos
│   ├── Dockerfile      # Configuración Docker para frontend
│   ├── nginx.conf      # Configuración Nginx
│   └── ...
├── backend/            # Backend Node.js
│   ├── index.js       # Punto de entrada
│   ├── uploads/       # Directorio para archivos subidos
│   ├── Dockerfile      # Configuración Docker para backend
│   └── ...
├── mysql/             # Configuración y scripts de base de datos
└── docker-compose.yml # Configuración de contenedores
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
- Frontend: http://localhost:8080
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
- Gestión de hermanos con tabla relacional separada
- Campos opcionales para datos adicionales
- Carga opcional de imágenes (con valor por defecto)
- Gestión completa de información familiar (padre, madre, contacto)

### Sistema de Pagos
- Registro de cuotas mensuales (selección múltiple de meses)
- Pago acumulado por múltiples meses
- Fondo común (FC) por categoría
- Reportes de pagos anuales con gráficos Tremor
- Búsqueda de recibos en tiempo real
- Gestión de recibos con fecha/hora y observaciones

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
- Tema personalizado del club (verde #1E8732 y blanco)
- Animaciones slide-up para contenido del dashboard
- Notificaciones de cumpleaños con icono animado
- Modal flotante de fixture arrastrable
- Navegación intuitiva con rutas protegidas
- Notificaciones toast con Sonner

## Validaciones y Seguridad

### Validaciones de Formularios
- Validación de cédula uruguaya (7-8 dígitos con dígito verificador)
- Campos numéricos: cédula, contacto, número de jugador
- Validación condicional de hermanos (requerido solo si checkbox marcado)
- Campos opcionales: imagen, ciudadanía, padre, madre, observaciones
- Fechas en formato DD/MM/YYYY
- Validación de email para usuarios

### Seguridad
- Encriptación de contraseñas con bcryptjs
- Autenticación JWT para rutas protegidas
- Middleware de autenticación en backend
- Validación de roles (Admin, Supervisor, Usuario)
- Rutas protegidas en frontend según rol de usuario

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
- Verificación automática de cumpleaños del día
- Solo muestra jugadores de categorías públicas/activas (`visible = 1`)
- Icono animado cuando hay cumpleaños
- Tooltip informativo con nombre, categoría y edad

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

# Restaurar base de datos
docker-compose exec -T db mysql -u wwwolima -p wwwolima_yerbalito < backup.sql
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
- **Frontend**: 8080 (http://localhost:8080)
- **Backend**: 5001 (http://localhost:5001)
- **MySQL**: 3308 (localhost:3308)

## Solución de problemas

### Problemas comunes
1. **Error de conexión a la base de datos**: Verificar que el contenedor MySQL esté ejecutándose (`docker-compose ps`)
2. **Frontend no carga**: Verificar que el backend esté ejecutándose en el puerto 5001
3. **Error 401 en login**: Verificar credenciales o reiniciar backend
4. **Error 500 al guardar jugador**: Verificar que los campos opcionales no sean null cuando no están permitidos
5. **Modal de fixture no aparece**: Verificar localStorage o limpiar caché del navegador
6. **Blog/Noticias vacío**: Verificar que la tabla `blog` tenga datos y `visible = 1`
7. **Cumpleaños no aparecen**: Verificar que los jugadores pertenezcan a categorías con `visible = 1`
8. **Búsqueda no funciona**: Verificar que el frontend esté conectado al backend correctamente

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

### Credenciales de prueba
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

## Licencia
Este proyecto está bajo la Licencia ISC. 