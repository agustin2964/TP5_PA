# Imagen del backend (Node + Express)
#
# node:22-alpine es Node 22 sobre Alpine, un Linux mínimo.
# "alpine" pesa mucho menos que la imagen oficial de Node.

FROM node:22-alpine

WORKDIR /app

# Primero SOLO los archivos que describen las dependencias.
# Docker guarda esta capa aparte, así que npm ci no se vuelve a ejecutar
# cada vez que cambiás una línea de código.
COPY package*.json ./
RUN npm ci --omit=dev

# Ahora sí, el código.
COPY src ./src

EXPOSE 3000

# CMD es el comando que corre cuando el contenedor arranca.
CMD ["node", "src/index.js"]