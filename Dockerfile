FROM node:18-alpine as base

WORKDIR /src
ADD package*.json ./
RUN npm install
RUN npm install nodemon socket.io express 
ADD . .

FROM node:18-alpine
COPY --from=base /src .
EXPOSE 3002
CMD ["node", "index.js"]

