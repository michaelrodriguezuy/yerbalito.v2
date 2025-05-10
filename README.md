# Yerbalito - Sistema de Gestión

## Descripción
Yerbalito es una aplicación web moderna para la gestión de negocios, desarrollada con React en el frontend y Node.js en el backend, utilizando MySQL como base de datos.

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
- Node.js
- Express.js
- MySQL
- Multer para manejo de archivos
- Nodemailer para envío de correos
- bcrypt para encriptación
- CORS para manejo de peticiones cross-origin

## Estructura del Proyecto
```
├── yerbalito/           # Frontend React
│   ├── src/            # Código fuente
│   ├── public/         # Archivos estáticos
│   └── ...
├── backend/            # Backend Node.js
│   ├── index.js       # Punto de entrada
│   ├── uploads/       # Directorio para archivos subidos
│   └── ...
└── mysql/             # Configuración y scripts de base de datos
```

## Requisitos Previos
- Node.js (versión recomendada: 18 o superior)
- MySQL
- npm o yarn

## Instalación

### Frontend
```bash
cd yerbalito
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```

### Base de Datos
1. Asegúrate de tener MySQL instalado y corriendo
2. Configura las variables de entorno necesarias

## Variables de Entorno
Crea un archivo `.env` en el directorio backend con las siguientes variables:
```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=yerbalito
```

## Características Principales
- Sistema de autenticación y autorización
- Gestión de usuarios
- Manejo de archivos y subida de imágenes
- Envío de correos electrónicos
- Interfaz responsiva y moderna
- Validación de formularios
- Notificaciones en tiempo real

## Scripts Disponibles

### Frontend
- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Vista previa de la build de producción

### Backend
- `npm start`: Inicia el servidor backend

## Contribución
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AhoraSiSomosGardel`)
3. Commit tus cambios (`git commit -m 'Add some AhoraSiSomosGardel'`)
4. Push a la rama (`git push origin feature/AhoraSiSomosGardel`)
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia ISC. 