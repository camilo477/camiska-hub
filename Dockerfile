FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080

RUN mkdir -p /app/data && chown node:node /app/data
COPY --chown=node:node server.mjs ./server.mjs
COPY --chown=node:node --from=build /app/dist ./dist

USER node

EXPOSE 8080

CMD ["node", "server.mjs"]
