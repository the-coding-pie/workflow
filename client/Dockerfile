FROM node:17-alpine

WORKDIR /client

COPY package.json .

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]