FROM node

WORKDIR /shortify

COPY . .

CMD ["node", "app.js"]