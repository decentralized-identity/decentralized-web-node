"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const app = new Koa();
const controllers_1 = require("./controllers");
app
    .use(controllers_1.indexRouter.routes())
    .use(controllers_1.indexRouter.allowedMethods())
    .use(controllers_1.extensionsRouter.routes())
    .use(controllers_1.extensionsRouter.allowedMethods());
exports.default = app;
//# sourceMappingURL=index.js.map