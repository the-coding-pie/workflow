FROM node:16-alpine

WORKDIR /server

COPY package.json .

RUN npm install -g typescript

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]