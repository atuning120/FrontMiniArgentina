# Etapa de construcción
FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Si es producción, se ejecuta el build, si es dev se usa como base
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine as production

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
# Copiamos index.html a 404.html para que Nginx lo sirva en errores 404
RUN cp /usr/share/nginx/html/index.html /usr/share/nginx/html/404.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
