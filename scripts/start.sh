#!/bin/bash

# Script de inicio para Yerbalito v2
# Este script configura y ejecuta el proyecto completo con Docker

echo "🚀 Iniciando Yerbalito v2..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivos .env si no existen
echo "📝 Configurando archivos de entorno..."

if [ ! -f "backend/.env" ]; then
    echo "Creando archivo .env para backend..."
    cat > backend/.env << EOF
MYSQL_HOST=mysql_container
MYSQL_USER=wwwolima
MYSQL_PASSWORD=rjW63u0I6n
MYSQL_DATABASE=wwwolima_yerbalito
MYSQL_PORT=3306
PORT=5001
NODE_ENV=production
EOF
fi

if [ ! -f "yerbalito/.env" ]; then
    echo "Creando archivo .env para frontend..."
    cat > yerbalito/.env << EOF
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=Yerbalito
VITE_APP_VERSION=2.0.0
EOF
fi

# Crear directorio uploads si no existe
mkdir -p backend/uploads

echo "🐳 Construyendo y ejecutando contenedores..."

# Detener contenedores existentes si están ejecutándose
docker-compose down

# Construir y ejecutar todos los servicios
docker-compose up --build -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 10

# Verificar estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose ps

echo ""
echo "✅ Yerbalito v2 está ejecutándose!"
echo ""
echo "🌐 Accesos:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:5001"
echo "   Base de datos MySQL: localhost:3308"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: docker-compose logs"
echo "   Detener: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo ""
echo "🎉 ¡Disfruta usando Yerbalito!"



# Script de inicio para Yerbalito v2
# Este script configura y ejecuta el proyecto completo con Docker

echo "🚀 Iniciando Yerbalito v2..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivos .env si no existen
echo "📝 Configurando archivos de entorno..."

if [ ! -f "backend/.env" ]; then
    echo "Creando archivo .env para backend..."
    cat > backend/.env << EOF
MYSQL_HOST=mysql_container
MYSQL_USER=wwwolima
MYSQL_PASSWORD=rjW63u0I6n
MYSQL_DATABASE=wwwolima_yerbalito
MYSQL_PORT=3306
PORT=5001
NODE_ENV=production
EOF
fi

if [ ! -f "yerbalito/.env" ]; then
    echo "Creando archivo .env para frontend..."
    cat > yerbalito/.env << EOF
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=Yerbalito
VITE_APP_VERSION=2.0.0
EOF
fi

# Crear directorio uploads si no existe
mkdir -p backend/uploads

echo "🐳 Construyendo y ejecutando contenedores..."

# Detener contenedores existentes si están ejecutándose
docker-compose down

# Construir y ejecutar todos los servicios
docker-compose up --build -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 10

# Verificar estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose ps

echo ""
echo "✅ Yerbalito v2 está ejecutándose!"
echo ""
echo "🌐 Accesos:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:5001"
echo "   Base de datos MySQL: localhost:3308"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: docker-compose logs"
echo "   Detener: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo ""
echo "🎉 ¡Disfruta usando Yerbalito!"

