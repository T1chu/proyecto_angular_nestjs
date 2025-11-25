# Imagen base de Node.js
FROM node:18

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto donde corre tu app
EXPOSE 8080

# Comando para iniciar el servidor
CMD ["npm", "start"]
