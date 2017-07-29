FROM node:boron
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV ENVIRONMENT=dev
CMD ["sh", "-c" "npm start $ENVIRONMENT"]
