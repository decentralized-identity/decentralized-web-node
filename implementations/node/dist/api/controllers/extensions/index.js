"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const extensionsRouter = new Router({
    prefix: '/extensions'
});
extensionsRouter.get('extensions', '/', ctx => {
    ctx.body = 'List of all extensions';
});
extensionsRouter.get('extension', '/:id', ctx => {
    const { id } = ctx.params;
    ctx.body = `extension with id: ${id}`;
});
exports.default = extensionsRouter;
//# sourceMappingURL=index.js.map