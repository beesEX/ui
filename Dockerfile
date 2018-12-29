FROM node:10.15.0

WORKDIR /starter

COPY package.json /starter/package.json

RUN npm i --quiet

COPY .env.example /starter/.env.example
COPY . /starter
RUN npm run webpack

CMD ["npm","start"]

EXPOSE 8080
