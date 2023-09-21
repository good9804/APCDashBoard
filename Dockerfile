# build stage
FROM node:18.16.0

WORKDIR /app
COPY . .

WORKDIR /app/front
RUN npm install

RUN npm run build

WORKDIR /app/back
RUN npm install

EXPOSE 3001

CMD ["npm","start"]
