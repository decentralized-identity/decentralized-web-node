"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const send = require("koa-send");
const devRouter = new Router();
devRouter.use((ctx) => __awaiter(this, void 0, void 0, function* () {
    console.log(ctx.request);
    var playground = ctx.path.match(/^\/playground/);
    if (playground)
        yield send(ctx, '/test' + ctx.path + (ctx.path === '/playground' ? '/index.html' : ''));
}));
exports.default = devRouter;
//# sourceMappingURL=index.js.map