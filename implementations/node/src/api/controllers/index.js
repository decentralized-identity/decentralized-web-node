"use strict";
exports.__esModule = true;
var Router = require("koa-router");
var indexRouter = new Router();
exports.indexRouter = indexRouter;
var appConfig = require('../../config/app');
indexRouter.get('/', function (ctx) {
    ctx.body = JSON.stringify({
        routes: {
            extensions: {
                extensions: {
                    rel: 'extension',
                    href: appConfig.baseURL + '/extensions',
                    action: 'GET'
                },
                extension: {
                    rel: 'extension',
                    href: appConfig.baseURL + '/extension/:id',
                    action: 'GET'
                }
            }
        }
    });
});
var extensions_1 = require("./extensions");
exports.extensionsRouter = extensions_1["default"];
