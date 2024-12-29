FROM node:22 AS builder
WORKDIR /src

COPY ./package.json ./package-lock.json /src

RUN npm install

COPY . /src

RUN npm run build

FROM nginx:1

COPY ./nginx.default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /src/dist /usr/share/nginx/html
