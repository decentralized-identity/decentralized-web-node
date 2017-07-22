"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const storesRouter = new Router({
    prefix: '/stores'
});
storesRouter.get('stores', '/', ctx => {
    ctx.body = 'List of all stores';
});
storesRouter.get('stores', '/:id', ctx => {
    const { id } = ctx.params;
    ctx.body = `GET the Store assigned to the DID: ${id}`;
});
exports.default = storesRouter;
//# sourceMappingURL=index.js.map