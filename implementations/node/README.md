# Hub Node.js Implementation

## System Dependencies:
- [Node.js v8](https://docs.npmjs.com/getting-started/installing-node) (Use [nvm](https://github.com/creationix/nvm) for managing node versions)
- npm v5 or greater
- [Docker](https://docs.docker.com/engine/installation/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started
1. Install system dependencies from above
2. Install application dependencies

       npm install

### Run the hub in docker compose
The docker compose scripts are configured to run the hub along with a couchdb instance, which is a runtime dependency:

    docker-compose up

There is also a docker configuration for running two hubs, each with their own couchdb instance:

    docker-compose up -f docker-compose-two-hubs.yml

### Run the hub server locally
Note: This requires that you have configured a couchdb instance, see [Configuration](#Configuration) for details.

    npm run dev

## Configuration
TODO

## Testing
    npm run test

