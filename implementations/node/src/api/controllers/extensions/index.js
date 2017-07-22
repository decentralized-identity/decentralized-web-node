"use strict";
exports.__esModule = true;
var Router = require("koa-router");
var extensionsRouter = new Router({
    prefix: '/extensions'
});
extensionsRouter.get('extensions', '/', function (ctx) {
    ctx.body = 'List of all extensions';
});
extensionsRouter.get('extension', '/:id', function (ctx) {
    var id = ctx.params.id;
    ctx.body = "extension with id: " + id;
});
exports["default"] = extensionsRouter;
