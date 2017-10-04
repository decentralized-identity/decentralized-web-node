"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const resolver_1 = require("../../resolver");
const indexRouter = new Router();
exports.indexRouter = indexRouter;
const appConfig = require('../../config/app');
const nano = require('nano')(appConfig.dbURL);
// consider a default ID token that directs to a designated identity's Hub data
indexRouter.post('/:id', function (ctx) {
    // DID or dan.id
    // Prove You Own It call. Where?
    resolver_1.default
        .resolve(this.params.id)
        .then(response => {
        // Auth it
        resolver_1.default
            .auth(response.did, ctx)
            .then(function () { })
            .catch(function (error) {
            ctx.body = error;
        });
    })
        .catch(error => { });
    nano.db.get(this.params.id, function (err, body) {
        if (!err) {
            console.log(body);
        }
    });
});
indexRouter.get('/:id', function (ctx) {
    // Ensure that there is an ID passed to the Hub
    resolver_1.default.resolve(this.params.id).then(response => { });
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