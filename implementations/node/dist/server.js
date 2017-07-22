"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const app_1 = require("./config/app");
api_1.default.listen(app_1.default.port, () => {
    console.log(`Your app is running at ${app_1.default.baseURL}`);
});
//# sourceMappingURL=server.js.map