FROM node:16-slim

WORKDIR /app

ENV NODE_PATH ./dist

# EXPOSE 4000

COPY package*.json ./

RUN npm install --production=false

COPY . ./

RUN npm run build

CMD [ "npm", "start" ]
