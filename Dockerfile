FROM node:18-alpine as base

WORKDIR /src
ADD package*.json ./
RUN npm install
ADD . .

FROM node:18-alpine
COPY --from=base /src .
EXPOSE 3000
CMD ["node", "index.js"]

