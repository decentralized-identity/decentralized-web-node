"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const indexRouter = new Router();
exports.indexRouter = indexRouter;
const appConfig = require('../../config/app');
indexRouter.get('/', ctx => {
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
const extensions_1 = require("./extensions");
exports.extensionsRouter = extensions_1.default;
//# sourceMappingURL=index.js.map