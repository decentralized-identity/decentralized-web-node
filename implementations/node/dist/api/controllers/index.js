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
const resolver_1 = require("../../resolver");
// THIS NEEDS TO BE A SEPARATE NPM MODULE
const auth_1 = require("../../lib/auth");
const indexRouter = new Router();
exports.indexRouter = indexRouter;
const appConfig = require('../../config/app');
const nano = require('nano')(appConfig.dbURL);
// consider a default ID token that directs to a designated identity's Hub data
indexRouter.post('/:id', function (ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        // DID or dan.id
        // Prove You Own It call. Where?
        yield resolver_1.default
            .resolve(this.params.id)
            .then((response) => __awaiter(this, void 0, void 0, function* () {
            // Locate a key to validate the request. Which one? Does the user specify, or is this standardized?
            var pubkey;
            var did = response.did;
            var ddo = response.ddo;
            ddo.owner.some(item => {
                if (item.type[1] == 'EdDsaPublicKey') {
                    pubkey = item.publicKeyBase64;
                    return true;
                }
            });
            // Validate it with a lib we use or create;
            yield auth_1.default
                .validate(pubkey, ctx.sig)
                .then(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // Check to see if the user already has a DB in Couch - if so exit, if not, sync existing remote or create one
                    if (!nano.use(did)) {
                        var hubs = ddo.service && ddo.service.hubs;
                        if (hubs) {
                            for (hub of hubs) {
                                yield new Promise(function (resolve, reject) {
                                    nano.db.replicate(hubs[hub], did, { create_target: true }, function (error, body) {
                                        if (error)
                                            reject(error);
                                        else
                                            resolve(body);
                                    });
                                });
                            }
                        }
                        else {
                            nano.db.create(did, (error) => {
                                if (!error) {
                                    ctx.body = 'DB created for user';
                                }
                            });
                        }
                    }
                    else {
                        ctx.body = 'User already exists';
                    }
                });
            })
                .catch(function () {
                ctx.body = 'Request could not be validated';
            });
        }))
            .catch(error => {
            ctx.body = 'Could not resolve';
        });
    });
});
indexRouter.get('/:id', function (ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure that there is an ID passed to the Hub
        yield resolver_1.default.resolve(this.params.id).then(response => {
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
    });
});
const extensions_1 = require("./extensions");
exports.extensionsRouter = extensions_1.default;
//# sourceMappingURL=index.js.map