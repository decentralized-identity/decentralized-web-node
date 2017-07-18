import app from '../src/api';
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000'
});

function integrationTestSetup() {
  let server;
  beforeAll(done => {
    server = app.listen(3000, () => done());
  });

  afterAll(done => {
    server.close();
    done();
  });
}

export { axiosInstance as axios, integrationTestSetup };
