FROM node:16-alpine

WORKDIR /server

COPY package.json .

RUN npm install -g typescript

RUN yarn install

COPY . .

EXPOSE 8000

CMD ["yarn", "dev"]