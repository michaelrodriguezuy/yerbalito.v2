# Usar Node.js 18 como imagen base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Crear directorio para uploads
RUN mkdir -p uploads

# Exponer el puerto
EXPOSE 5001

# Comando para iniciar la aplicación
CMD ["npm", "start"]






