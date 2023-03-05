FROM node:alpine

WORKDIR /app
COPY ./server/package.json ./
COPY ./server/package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "./server/index.js"]

