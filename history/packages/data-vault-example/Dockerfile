FROM node:14

# It is a best practise to not run as root
USER node
WORKDIR /home/node

# By default COPY runs as root so we have to use the chown flag
COPY --chown=node:node ./tsconfig.json ./tsconfig.json
COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./run.js ./run.js

# Install project
RUN ["npm", "install"]
RUN ["npm", "run", "build"]

# Run the server
EXPOSE 8080

CMD [ "node", "./run.js" ]