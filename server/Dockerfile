FROM node:17-alpine

WORKDIR /server

COPY package.json .

RUN yarn install

COPY . .

EXPOSE 8000

CMD ["yarn", "start"]