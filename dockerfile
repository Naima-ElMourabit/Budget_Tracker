FROM node:latest
WORKDIR  /budget-tracker
COPY package*.json ./
RUN npm install
EXPOSE 3000

CMD ["node","server.js"]
