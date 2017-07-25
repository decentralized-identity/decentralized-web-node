import app from './api';
import appConfig from './config/app';

const nano = require('nano')(appConfig.dbURL);

app.listen(appConfig.port, () => {
  console.log(`Your app is running at ${appConfig.baseURL}`);
});
