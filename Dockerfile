FROM node:alpine

WORKDIR /app
COPY ./server/package.json ./
COPY ./server/package-lock.json ./

RUN npm install

COPY . .

CMD ["node", "./server/index.js"]

