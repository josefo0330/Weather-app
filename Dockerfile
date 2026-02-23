# ----------- Stage 1: Build -----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json primero (mejor cache)
COPY package*.json ./

RUN npm install

# Copiar el resto del proyecto
COPY . .

# Construir la app
RUN npm run build
