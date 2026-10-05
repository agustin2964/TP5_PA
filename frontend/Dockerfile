# Imagen del frontend. Se construye en DOS etapas.
#
# Etapa 1: instalar dependencias y compilar (necesita Node).
# Etapa 2: servir los archivos (no necesita Node, solo Nginx).
#
# ¿Por qué dos etapas? Porque la imagen final no arrastra Node ni el
# node_modules: solo Nginx y los archivos estáticos. Queda chica y sin
# superficie de ataque.

# ── Etapa 1: construir ──────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build        # genera /app/dist

# ── Etapa 2: servir ─────────────────────────────────────────────
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]