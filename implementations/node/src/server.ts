import app from './api';
import appConfig from './config/app';
import storage from './config/storage';

app.listen(appConfig.port, () => {
  console.log(`Your app is running at ${appConfig.baseURL}`);
});
