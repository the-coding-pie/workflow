FROM node:17-alpine

WORKDIR /client

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

# run time
CMD ["npm", "run", "dev"]