FROM node:20.18.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js ./

USER node
EXPOSE 3000
CMD ["node", "server.js"]
