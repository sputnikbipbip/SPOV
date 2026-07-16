FROM node:22-alpine AS build
WORKDIR /app
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ .
RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/spov-angular /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
