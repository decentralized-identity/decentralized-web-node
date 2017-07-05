const proccess = require('process');
const app = require('./api');
const appConfig = require('./config/app');

app.listen(appConfig.port, () => {
  console.log(`Your app is running at ${appConfig.baseURL}`);
});
