FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY angular.json tsconfig*.json ./
COPY src ./src
COPY public ./public
EXPOSE 4200
CMD ["npm", "run", "dev"]
