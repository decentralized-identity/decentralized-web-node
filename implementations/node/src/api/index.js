"use strict";
exports.__esModule = true;
var Koa = require("koa");
var app = new Koa();
var controllers_1 = require("./controllers");
app
    .use(controllers_1.indexRouter.routes())
    .use(controllers_1.indexRouter.allowedMethods())
    .use(controllers_1.extensionsRouter.routes())
    .use(controllers_1.extensionsRouter.allowedMethods());
exports["default"] = app;
