FROM node:17-alpine

WORKDIR /server

RUN npm install -g typescript

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]